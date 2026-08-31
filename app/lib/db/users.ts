import crypto from "node:crypto";
import { getDb } from "@/lib/cloudflare";

export interface User {
  id: string;
  email: string;
  wallet_address: string | null;
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

export async function setUserWalletAddress(userId: string, walletAddress: string) {
  const db = await getDb();
  await db
    .prepare("UPDATE users SET wallet_address = ? WHERE id = ?")
    .bind(walletAddress, userId)
    .run();
}
