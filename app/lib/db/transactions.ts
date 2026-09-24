import crypto from "node:crypto";
import { getDb } from "@/lib/cloudflare";

export type TransactionKind = "tip" | "withdraw";

export interface Transaction {
  id: string;
  from_address: string;
  to_address: string;
  amount: number;
  tx_hash: string | null;
  status: string;
  created_at: string;
  /** migrations/0006 - thieu (DB chua migrate) thi coi la "tip" */
  kind?: TransactionKind;
}

function isMissingKindColumn(error: unknown): boolean {
  return error instanceof Error && /no (such )?column|has no column named kind/i.test(error.message);
}

export async function createTransaction(params: {
  fromAddress: string;
  toAddress: string;
  amount: number;
  txHash: string;
  status: string;
  kind?: TransactionKind;
}): Promise<void> {
  const db = await getDb();
  const id = crypto.randomUUID();
  try {
    await db
      .prepare(
        "INSERT INTO transactions (id, from_address, to_address, amount, tx_hash, status, kind) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(id, params.fromAddress, params.toAddress, params.amount, params.txHash, params.status, params.kind ?? "tip")
      .run();
  } catch (error) {
    if (!isMissingKindColumn(error)) throw error;
    // Production chua chay migration 0006 - van ghi duoc, chi mat loai giao dich
    await db
      .prepare(
        "INSERT INTO transactions (id, from_address, to_address, amount, tx_hash, status) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(id, params.fromAddress, params.toAddress, params.amount, params.txHash, params.status)
      .run();
  }
}

export async function getTransactionsForAddress(address: string, limit = 50): Promise<Transaction[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(
      "SELECT * FROM transactions WHERE from_address = ? OR to_address = ? ORDER BY created_at DESC LIMIT ?",
    )
    .bind(address, address, limit)
    .all<Transaction>();
  return results ?? [];
}

/** Tong so tien da TIP (khong tinh rut) tu 1 dia chi ke tu moc thoi gian - de
 * kiem gioi han tip moi ngay. `sinceSql` dang "YYYY-MM-DD HH:MM:SS" (UTC). */
export async function sumTipsSince(address: string, sinceSql: string): Promise<number> {
  const db = await getDb();
  try {
    const row = await db
      .prepare(
        "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE from_address = ? AND created_at >= ? AND kind = 'tip'",
      )
      .bind(address, sinceSql)
      .first<{ total: number }>();
    return row?.total ?? 0;
  } catch (error) {
    if (!isMissingKindColumn(error)) throw error;
    const row = await db
      .prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE from_address = ? AND created_at >= ?")
      .bind(address, sinceSql)
      .first<{ total: number }>();
    return row?.total ?? 0;
  }
}
