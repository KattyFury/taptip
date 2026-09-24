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

/** Moc thoi gian phuc hoi tinh nang (commit 1559bd5, 09-24) - bat ky
 * credential nao TRUOC moc nay la rac cua lan dung dau tien (bat 09-03, go
 * 09-11), KHONG phai user chu dong bat trong ban hien tai. Bang D1 chua bao
 * gio bi xoa khi go tinh nang lan truoc, nen nhung user tung bat passkey hoi
 * do van con row - restore lai code 09-24 vo tinh khien ho bi khoa cua app
 * ma chua he bam "bat" o ban nay, co ca nguoi dang giu tien test khong vao
 * duoc vi (bao that 09-24). Loc thang o day thay vi migration xoa du lieu -
 * an toan hon (khong dong vao production DB) va la 1 cho duy nhat, ca
 * /api/applock/status lan /api/applock/auth-options deu goi ham nay nen tu
 * dong nhat quan (status bao "off", auth-options tu choi tao challenge). */
const APPLOCK_RESTORE_CUTOFF = "2026-09-20 00:00:00";

export async function getApplockCredentialsByUserId(
  userId: string,
): Promise<ApplockCredential[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(
      "SELECT * FROM applock_credentials WHERE user_id = ? AND created_at >= ?",
    )
    .bind(userId, APPLOCK_RESTORE_CUTOFF)
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
