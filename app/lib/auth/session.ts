import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getKv } from "@/lib/cloudflare";

// 30 ngay. Ban cu de 15 PHUT va khong gia han: mo lai app sau do la moi API
// tra 401 - so du im lang tut ve 0 (dung ca bug "40 USDC hien $0" 09-02),
// trong khi nguoi dung khong he thay man dang nhap vi trang da mount san.
// Session chi cho phep DOC (so du, lich su); gui tien van phai ky rieng.
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
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
