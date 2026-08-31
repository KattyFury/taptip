import crypto from "node:crypto";
import { Resend } from "resend";
import { getKv } from "@/lib/cloudflare";

const OTP_TTL_SECONDS = 5 * 60;

function generateCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function sendOtp(email: string) {
  const code = generateCode();
  const kv = await getKv();
  await kv.put(`otp:${email}`, code, { expirationTtl: OTP_TTL_SECONDS });

  const resend = new Resend(process.env.RESEND_API_KEY_SENDING);
  await resend.emails.send({
    from: "TapTip <otp@taptip.0xhieu.xyz>",
    to: email,
    subject: `${code} là mã đăng nhập TapTip`,
    text: `Mã đăng nhập TapTip của bạn: ${code}\n\nMã có hiệu lực trong 5 phút.`,
  });
}

export async function verifyOtp(email: string, code: string) {
  const kv = await getKv();
  const stored = await kv.get(`otp:${email}`);
  if (!stored || stored !== code) {
    return false;
  }
  await kv.delete(`otp:${email}`);
  return true;
}
