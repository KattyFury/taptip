import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getKv } from "@/lib/cloudflare";

const SESSION_TTL_SECONDS = 15 * 60;
const SESSION_COOKIE = "taptip_session";

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const kv = await getKv();
  await kv.put(`session:${token}`, userId, {
    expirationTtl: SESSION_TTL_SECONDS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const kv = await getKv();
  const userId = await kv.get(`session:${token}`);
  return userId ?? null;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const kv = await getKv();
    await kv.delete(`session:${token}`);
  }
  cookieStore.delete(SESSION_COOKIE);
}
