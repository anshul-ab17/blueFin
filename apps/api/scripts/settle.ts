// bun scripts/settle.ts <market-id> <winning-side 0|1> <merkle-root-hex-64>
// Calls settle(winning_side, merkle_root) as the oracle authority. Prints JSON {sig}.

import {
  Connection,
  TransactionInstruction,
  RPC,
  PROGRAM_ID,
  loadWallet,
  discriminator,
  marketIdBytes,
  marketPda,
  send,
} from "./chain";

async function main() {
  const [id, sideArg, rootHex] = process.argv.slice(2);
  if (!id || !sideArg || !rootHex || rootHex.length !== 64) {
    throw new Error("usage: bun settle.ts <market-id> <0|1> <merkle-root-hex-64>");
  }
  const wallet = loadWallet();
  const conn = new Connection(RPC, "confirmed");
  const market = marketPda(marketIdBytes(id));

  const data = Buffer.concat([
    discriminator("settle"),
    Buffer.from([Number(sideArg) & 1]),
    Buffer.from(rootHex, "hex"),
  ]);
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      { pubkey: market, isSigner: false, isWritable: true },
    ],
    data,
  });
  const sig = await send(conn, wallet, ix);
  console.log(JSON.stringify({ sig }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
