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

  console.log(`[TapTip Auth] 🔑 Generated OTP for ${email}: ${code}`);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY_SENDING);
    const { data, error } = await resend.emails.send({
      from: "TapTip <otp@taptip.0xhieu.xyz>",
      to: email,
      subject: `${code} là mã đăng nhập TapTip`,
      text: `Mã đăng nhập TapTip của bạn: ${code}\n\nMã có hiệu lực trong 5 phút.`,
    });

    if (error) {
      console.error("[TapTip Auth] ⚠️ Resend email sending error:", error);
    } else {
      console.log("[TapTip Auth] ✉️ Resend email sent successfully:", data?.id);
    }
  } catch (err) {
    console.error("[TapTip Auth] ⚠️ Failed to call Resend API:", err);
  }
}

export async function verifyOtp(email: string, code: string) {
  const kv = await getKv();
  const stored = await kv.get(`otp:${email}`);
  console.log(`[TapTip Auth] 🔍 Verifying OTP for ${email}: entered="${code}", stored="${stored}"`);

  // Allow bypass code 000000 in development for fast testing
  if (process.env.NODE_ENV !== "production" && code === "000000") {
    console.log(`[TapTip Auth] ✅ Dev bypass OTP accepted for ${email}`);
    await kv.delete(`otp:${email}`);
    return true;
  }

  if (!stored || stored !== code) {
    return false;
  }
  await kv.delete(`otp:${email}`);
  return true;
}
