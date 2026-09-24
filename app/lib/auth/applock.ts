import type { NextRequest } from "next/server";
import { getKv } from "@/lib/cloudflare";
import { getSessionToken } from "@/lib/auth/session";
import { getApplockCredentialsByUserId } from "@/lib/db/applock";

/** TTL cho challenge tam thoi trong KV - mot le WebAuthn (create/get) chi
 * mat vai giay, 2 phut la du du de khong het han giua chung nhung khong
 * treo lau neu user bo do. */
const CHALLENGE_TTL_SECONDS = 120;

function challengeKey(userId: string, kind: "register" | "auth") {
  return `applock_challenge:${kind}:${userId}`;
}

export async function saveApplockChallenge(
  userId: string,
  kind: "register" | "auth",
  challenge: string,
) {
  const kv = await getKv();
  await kv.put(challengeKey(userId, kind), challenge, {
    expirationTtl: CHALLENGE_TTL_SECONDS,
  });
}

/** Doc VA xoa - challenge chi dung duoc dung 1 lan (chong replay), giong
 * cach OTP dang dung o lib/auth/otp.ts (khong doc lai o day, module rieng). */
export async function consumeApplockChallenge(
  userId: string,
  kind: "register" | "auth",
): Promise<string | null> {
  const kv = await getKv();
  const key = challengeKey(userId, kind);
  const value = await kv.get(key);
  if (value) await kv.delete(key);
  return value;
}

/**
 * RP ID + origin lay THANG tu request thay vi hardcode/them bien moi trong
 * .env - tu dung tren ca localhost (dev) lan taptip.kattyfury1403.workers.dev
 * (production) khong can cau hinh gi them. RP ID la hostname KHONG co port
 * (dung chuan WebAuthn), origin la scheme+host(:port) day du.
 */
export function getRpIdAndOrigin(req: NextRequest): { rpID: string; origin: string } {
  const url = req.nextUrl;
  return { rpID: url.hostname, origin: url.origin };
}

export const APPLOCK_RP_NAME = "TapTip";

/* ======================================================================
 * Mo khoa phia SERVER + khoa vi 24h (09-24b)
 *
 * Truoc day khoa Passkey chi nam o giao dien - ai co phien dang nhap goi
 * thang /api/tip (hoac mo thang /dashboard/withdraw) la gui duoc tien du
 * chua mo khoa. Gio:
 *   - auth-verify / register-verify thanh cong -> danh dau PHIEN nay "da mo
 *     khoa" trong KV (30 phut, tu gia han khi con < 10 phut va co dung).
 *   - User CO passkey ma phien chua mo khoa -> /api/tip, /api/applock/disable
 *     tu choi (423 APPLOCK_REQUIRED).
 *   - Mo khoa that bai, chon "Reset passkey" (user chot: co the la chinh chu
 *     doi may, hoac ke trom) -> xoa passkey + KHOA GUI/RUT 24H. Van xem va
 *     NHAN tip binh thuong.
 * ====================================================================== */


const UNLOCK_TTL_SECONDS = 30 * 60;
const UNLOCK_REFRESH_BELOW_MS = 10 * 60 * 1000;
export const WALLET_LOCK_SECONDS = 24 * 60 * 60;

export async function markSessionUnlocked() {
  const token = await getSessionToken();
  if (!token) return;
  const kv = await getKv();
  await kv.put(`applock_unlocked:${token}`, String(Date.now() + UNLOCK_TTL_SECONDS * 1000), {
    expirationTtl: UNLOCK_TTL_SECONDS,
  });
}

export async function clearSessionUnlocked() {
  const token = await getSessionToken();
  if (!token) return;
  const kv = await getKv();
  await kv.delete(`applock_unlocked:${token}`);
}

/** Phien nay da mo khoa chua (tu gia han neu sap het - ghi KV toi da ~20 phut/lan). */
export async function isSessionUnlocked(): Promise<boolean> {
  const token = await getSessionToken();
  if (!token) return false;
  const kv = await getKv();
  const until = Number(await kv.get(`applock_unlocked:${token}`));
  if (!until || until < Date.now()) return false;
  if (until - Date.now() < UNLOCK_REFRESH_BELOW_MS) await markSessionUnlocked();
  return true;
}

/** true = duoc phep hanh dong nhay cam (gui tien, tat khoa...). User chua bat
 * Passkey thi luon duoc phep - Passkey la tuy chon. */
export async function passesAppLock(userId: string): Promise<boolean> {
  const credentials = await getApplockCredentialsByUserId(userId);
  if (credentials.length === 0) return true;
  return isSessionUnlocked();
}

export async function lockWalletFor24h(userId: string): Promise<number> {
  const until = Date.now() + WALLET_LOCK_SECONDS * 1000;
  const kv = await getKv();
  await kv.put(`wallet_lock:${userId}`, String(until), { expirationTtl: WALLET_LOCK_SECONDS });
  return until;
}

/** Moc het khoa gui/rut (ms) hoac null neu khong bi khoa. */
export async function walletLockedUntil(userId: string): Promise<number | null> {
  const kv = await getKv();
  const until = Number(await kv.get(`wallet_lock:${userId}`));
  return until && until > Date.now() ? until : null;
}
