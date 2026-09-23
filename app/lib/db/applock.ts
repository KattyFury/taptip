import crypto from "node:crypto";
import { getDb } from "@/lib/cloudflare";

/** Mot ban ghi WebAuthn credential dung cho khoa cua app - xem migration
 * 0004 va lib/auth/applock.ts de biet vi sao TACH RIENG voi vi Circle. */
export interface ApplockCredential {
  id: string;
  user_id: string;
  /** Base64URL, tra ve nguyen trang tu trinh duyet - id cua credential. */
  credential_id: string;
  /** Base64 (KHONG phai base64url) cua public key COSE tho - luu de xac
   * minh chu ky lan xac thuc sau, khong phai bi mat (public key). */
  public_key: string;
  /** Chong replay: tang dan sau moi lan xac thuc, kiem tra > gia tri cu. */
  counter: number;
  /** JSON string[] hoac null - goi y transport (internal, hybrid...). */
  transports: string | null;
  created_at: string;
}

export async function getApplockCredentialsByUserId(
  userId: string,
): Promise<ApplockCredential[]> {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT * FROM applock_credentials WHERE user_id = ?")
    .bind(userId)
    .all<ApplockCredential>();
  return results;
}

export async function getApplockCredentialByCredentialId(
  credentialId: string,
): Promise<ApplockCredential | null> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT * FROM applock_credentials WHERE credential_id = ?")
    .bind(credentialId)
    .first<ApplockCredential>();
  return row ?? null;
}

export async function createApplockCredential(params: {
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[] | null;
}): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO applock_credentials
         (id, user_id, credential_id, public_key, counter, transports)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      params.userId,
      params.credentialId,
      params.publicKey,
      params.counter,
      params.transports ? JSON.stringify(params.transports) : null,
    )
    .run();
}

export async function updateApplockCredentialCounter(
  credentialId: string,
  counter: number,
): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE applock_credentials SET counter = ? WHERE credential_id = ?")
    .bind(counter, credentialId)
    .run();
}

/** Tat khoa cua app: xoa het credential cua user - dung khi bam "Turn off"
 * trong menu Home. Xoa het (khong chi 1 thiet bi) vi day la cong tat/bat
 * mot tinh nang, khong phai quan ly tung thiet bi rieng le. */
export async function deleteApplockCredentialsByUserId(userId: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("DELETE FROM applock_credentials WHERE user_id = ?")
    .bind(userId)
    .run();
}
