import crypto from "node:crypto";
import { getDb } from "@/lib/cloudflare";

export interface User {
  id: string;
  email: string;
  wallet_address: string | null;
  /** ID vi ben Circle - CAN de goi createTransaction (dia chi khong du). */
  circle_wallet_id: string | null;
  created_at: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first<User>();
  return row ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(id)
    .first<User>();
  return row ?? null;
}

export async function createUser(email: string): Promise<User> {
  const db = await getDb();
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO users (id, email) VALUES (?, ?)")
    .bind(id, email)
    .run();
  await db
    .prepare("INSERT INTO tip_settings (user_id) VALUES (?)")
    .bind(id)
    .run();
  const user = await getUserById(id);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function setUserCircleWallet(
  userId: string,
  walletAddress: string,
  circleWalletId: string,
) {
  const db = await getDb();
  await db
    .prepare(
      "UPDATE users SET wallet_address = ?, circle_wallet_id = ? WHERE id = ?",
    )
    .bind(walletAddress, circleWalletId, userId)
    .run();
}

/** Trong danh sach dia chi, cai nao la vi cua user TapTip (tra ve chu thuong).
 * Dung de tach "tien nap tu ngoai" khoi "tip tu nguoi dung TapTip" o History. */
export async function getTapTipWalletsAmong(addresses: string[]): Promise<Set<string>> {
  const unique = Array.from(new Set(addresses.map((a) => a.toLowerCase())));
  if (unique.length === 0) return new Set();
  const db = await getDb();
  const placeholders = unique.map(() => "?").join(",");
  const { results } = await db
    .prepare(`SELECT lower(wallet_address) AS w FROM users WHERE lower(wallet_address) IN (${placeholders})`)
    .bind(...unique)
    .all<{ w: string }>();
  return new Set((results ?? []).map((r) => r.w));
}
