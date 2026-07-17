// One-time TxLINE devnet free-tier activation.
//
//   bun apps/api/scripts/activate.ts <wallet.json>
//
// Flow (per https://txline.txodds.com/documentation/programs/devnet):
//   1. POST /auth/guest/start                       -> guest JWT (30d)
//   2. ensure Token-2022 ATA for TxL mint
//   3. subscribe(serviceLevelId=1, weeks=4) on-chain (free World Cup tier, 0 TxL)
//   4. sign `${txSig}::${jwt}` with wallet key (detached ed25519, base64)
//   5. POST /api/token/activate                     -> long-lived API token
// Prints TXLINE_JWT / TXLINE_API_TOKEN lines to append to apps/api/.env.

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import * as fs from "fs";

const TXLINE = "https://txline-dev.txodds.com";
const RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const TXODDS_PROGRAM = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const TXL_MINT = new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG");
const TOKEN_2022 = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const ATA_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const SERVICE_LEVEL_FREE = 1;
const WEEKS = 4;

function ata(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_2022.toBuffer(), mint.toBuffer()],
    ATA_PROGRAM,
  )[0];
}

async function main() {
  const walletPath = process.argv[2];
  if (!walletPath) throw new Error("usage: bun activate.ts <wallet.json>");
  const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf8"))));
  console.log("wallet:", wallet.publicKey.toBase58());

  // 1. guest JWT
  const jwtRes = await fetch(`${TXLINE}/auth/guest/start`, { method: "POST" });
  if (!jwtRes.ok) throw new Error(`guest/start ${jwtRes.status}: ${await jwtRes.text()}`);
  const jwt: string = (await jwtRes.json()).token;
  console.log("guest jwt acquired");

  const conn = new Connection(RPC, "confirmed");

  // 2. ensure TxL Token-2022 ATA
  const userAta = ata(wallet.publicKey, TXL_MINT);
  const tx = new Transaction();
  if (!(await conn.getAccountInfo(userAta))) {
    console.log("creating TxL ATA", userAta.toBase58());
    tx.add(
      new TransactionInstruction({
        programId: ATA_PROGRAM,
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: userAta, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
          { pubkey: TXL_MINT, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022, isSigner: false, isWritable: false },
        ],
        data: Buffer.from([1]), // CreateIdempotent
      }),
    );
  }

  // 3. subscribe instruction (anchor discriminator + u16 + u8, little-endian)
  const [pricingMatrix] = PublicKey.findProgramAddressSync([Buffer.from("pricing_matrix")], TXODDS_PROGRAM);
  const [treasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("token_treasury_v2")], TXODDS_PROGRAM);
  const treasuryVault = ata(treasuryPda, TXL_MINT);
  const data = Buffer.alloc(8 + 2 + 1);
  Buffer.from([254, 28, 191, 138, 156, 179, 183, 53]).copy(data, 0);
  data.writeUInt16LE(SERVICE_LEVEL_FREE, 8);
  data.writeUInt8(WEEKS, 10);
  tx.add(
    new TransactionInstruction({
      programId: TXODDS_PROGRAM,
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: pricingMatrix, isSigner: false, isWritable: false },
        { pubkey: TXL_MINT, isSigner: false, isWritable: false },
        { pubkey: userAta, isSigner: false, isWritable: true },
        { pubkey: treasuryVault, isSigner: false, isWritable: true },
        { pubkey: treasuryPda, isSigner: false, isWritable: false },
        { pubkey: TOKEN_2022, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: ATA_PROGRAM, isSigner: false, isWritable: false },
      ],
      data,
    }),
  );

  const txSig = await sendAndConfirmTransaction(conn, tx, [wallet], { commitment: "confirmed" });
  console.log("subscribe confirmed:", txSig);

  // 4. sign activation preimage (free bundle: empty leagues)
  const message = `${txSig}::${jwt}`;
  const sig = nacl.sign.detached(new TextEncoder().encode(message), wallet.secretKey);
  const walletSignature = Buffer.from(sig).toString("base64");

  // 5. activate
  const actRes = await fetch(`${TXLINE}/api/token/activate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      // bun's fetch chokes on their zstd responses
      "Accept-Encoding": "identity",
    },
    body: JSON.stringify({ txSig, walletSignature, leagues: [] }),
  });
  const body = await actRes.text();
  if (!actRes.ok) throw new Error(`activate ${actRes.status}: ${body}`);
  let apiToken = body;
  try {
    const parsed = JSON.parse(body);
    apiToken = parsed.token ?? body;
  } catch {}

  console.log("\nappend to apps/api/.env:");
  console.log(`TXLINE_JWT=${jwt}`);
  console.log(`TXLINE_API_TOKEN=${apiToken}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
