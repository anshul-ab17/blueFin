// Shared on-chain helpers for the bluefin escrow program (devnet).
// Used by init_market.ts / settle.ts, which apps/api shells out to.

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createHash } from "node:crypto";
import * as fs from "fs";

export const RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
export const PROGRAM_ID = new PublicKey(
  process.env.BLUEFIN_PROGRAM_ID ?? "BbeCFPpsNTi5sqBNWjeXPtAitzqnDhYEMVxkLQodNH3B",
);
export const TXL_MINT = new PublicKey(
  process.env.TXL_MINT ?? "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG",
);
export const TOKEN_2022 = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

export function loadWallet(): Keypair {
  const path = process.env.ORACLE_KEYPAIR_PATH ?? ".keys/devnet-wallet.json";
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path, "utf8"))));
}

export function discriminator(name: string): Buffer {
  return createHash("sha256").update(`global:${name}`).digest().subarray(0, 8);
}

/// market id string -> [u8;16] zero-padded
export function marketIdBytes(id: string): Buffer {
  const b = Buffer.alloc(16);
  Buffer.from(id, "utf8").copy(b, 0, 0, Math.min(16, id.length));
  return b;
}

export function marketPda(idBytes: Buffer): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("market"), idBytes], PROGRAM_ID)[0];
}

export function escrowPda(idBytes: Buffer): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("escrow"), idBytes], PROGRAM_ID)[0];
}

export async function send(conn: Connection, wallet: Keypair, ix: TransactionInstruction) {
  const tx = new Transaction().add(ix);
  return sendAndConfirmTransaction(conn, tx, [wallet], { commitment: "confirmed" });
}

export { Connection, PublicKey, SystemProgram, TransactionInstruction };
