import type { NextRequest } from "next/server";
import { getKv } from "@/lib/cloudflare";

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
