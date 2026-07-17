// bun scripts/init_market.ts <market-id>   (e.g. esp-arg)
// Creates the market PDA + TxL escrow on devnet. Prints JSON {market, escrow, sig|existing}.

import {
  Connection,
  SystemProgram,
  TransactionInstruction,
  RPC,
  PROGRAM_ID,
  TXL_MINT,
  TOKEN_2022,
  loadWallet,
  discriminator,
  marketIdBytes,
  marketPda,
  escrowPda,
  send,
} from "./chain";

async function main() {
  const id = process.argv[2];
  if (!id) throw new Error("usage: bun init_market.ts <market-id>");
  const wallet = loadWallet();
  const conn = new Connection(RPC, "confirmed");

  const idBytes = marketIdBytes(id);
  const market = marketPda(idBytes);
  const escrow = escrowPda(idBytes);

  if (await conn.getAccountInfo(market)) {
    console.log(JSON.stringify({ market: market.toBase58(), escrow: escrow.toBase58(), existing: true }));
    return;
  }

  const data = Buffer.concat([discriminator("init_market"), idBytes]);
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: market, isSigner: false, isWritable: true },
      { pubkey: TXL_MINT, isSigner: false, isWritable: false },
      { pubkey: escrow, isSigner: false, isWritable: true },
      { pubkey: TOKEN_2022, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
  const sig = await send(conn, wallet, ix);
  console.log(JSON.stringify({ market: market.toBase58(), escrow: escrow.toBase58(), sig }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
