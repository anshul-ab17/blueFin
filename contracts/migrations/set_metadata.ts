// Writes program metadata (name + logo URI) to a devnet account.
// Creates a new keypair account owned by the bluefin program, storing
// a compact JSON blob. The account address is logged for explorer links.
//
// Run once after deploying the program:
//   cd contracts
//   ANCHOR_WALLET=~/.config/solana/id.json \
//   ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
//   npx ts-node migrations/set_metadata.ts

import * as anchor from "@anchor-lang/core";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const PROGRAM_ID = new PublicKey("BbeCFPpsNTi5sqBNWjeXPtAitzqnDhYEMVxkLQodNH3B");

const METADATA = {
  name: "Bluefin",
  description: "Decentralized prediction market for World Cup 2026. Trade YES/NO shares on real match outcomes — settled on-chain via TxODDS-verified proofs.",
  image: "https://blue-fin.vercel.app/assets/logos/bluefin_dark.png",
  website: "https://blue-fin.vercel.app",
  programId: PROGRAM_ID.toBase58(),
  network: "devnet",
};

async function main() {
  const rpc = process.env.ANCHOR_PROVIDER_URL ?? "https://api.devnet.solana.com";
  const walletPath = process.env.ANCHOR_WALLET ?? path.join(os.homedir(), ".config/solana/id.json");

  const connection = new Connection(rpc, "confirmed");
  const raw = JSON.parse(fs.readFileSync(walletPath, "utf8")) as number[];
  const payer = Keypair.fromSecretKey(Uint8Array.from(raw));

  console.log("Payer    :", payer.publicKey.toBase58());
  console.log("Program  :", PROGRAM_ID.toBase58());
  console.log("RPC      :", rpc);

  const metaJson = JSON.stringify(METADATA);
  const dataBytes = Buffer.from(metaJson, "utf8");

  // 8-byte discriminator prefix ("bluefin_") + JSON
  const discriminator = Buffer.from("bluefin_", "utf8");
  const payload = Buffer.concat([discriminator, dataBytes]);

  const metaKeypair = Keypair.generate();
  const lamports = await connection.getMinimumBalanceForRentExemption(payload.length);

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: metaKeypair.publicKey,
      lamports,
      space: payload.length,
      programId: PROGRAM_ID,
    })
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [payer, metaKeypair]);

  console.log("\nMetadata account :", metaKeypair.publicKey.toBase58());
  console.log("Tx               :", sig);
  console.log("Logo URI         :", METADATA.image);
  console.log("\nExplorer: https://explorer.solana.com/address/" + metaKeypair.publicKey.toBase58() + "?cluster=devnet");

  // Save the address locally so you can reference it later
  const out = { metadataAccount: metaKeypair.publicKey.toBase58(), programId: PROGRAM_ID.toBase58(), tx: sig };
  fs.writeFileSync(path.join(__dirname, "../.metadata-account.json"), JSON.stringify(out, null, 2));
  console.log("\nSaved to contracts/.metadata-account.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
