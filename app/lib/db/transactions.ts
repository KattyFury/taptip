import crypto from "node:crypto";
import { getDb } from "@/lib/cloudflare";

export interface Transaction {
  id: string;
  from_address: string;
  to_address: string;
  amount: number;
  tx_hash: string | null;
  status: string;
  created_at: string;
}

export async function createTransaction(params: {
  fromAddress: string;
  toAddress: string;
  amount: number;
  txHash: string;
  status: string;
}): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      "INSERT INTO transactions (id, from_address, to_address, amount, tx_hash, status) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(
      crypto.randomUUID(),
      params.fromAddress,
      params.toAddress,
      params.amount,
      params.txHash,
      params.status,
    )
    .run();
}

export async function getTransactionsForAddress(
  address: string,
  limit = 50,
): Promise<Transaction[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(
      "SELECT * FROM transactions WHERE from_address = ? OR to_address = ? ORDER BY created_at DESC LIMIT ?",
    )
    .bind(address, address, limit)
    .all<Transaction>();
  return results ?? [];
}
