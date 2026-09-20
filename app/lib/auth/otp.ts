import crypto from "node:crypto";
import { Resend } from "resend";
import { getKv } from "@/lib/cloudflare";

const OTP_TTL_SECONDS = 5 * 60;

function generateCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function otpEmailHtml(code: string) {
  return `<!doctype html>
<html lang="vi">
  <body style="margin:0;padding:24px;background:#FFFDF5;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1A1A;">
    <div style="max-width:420px;margin:0 auto;">
      <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#155EEF;">TapTip</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:24px;">Đây là mã đăng nhập của bạn:</p>
      <p style="margin:0 0 16px;padding:16px 0;background:#F5B800;border-radius:8px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#155EEF;">${code}</p>
      <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#5A6472;">Mã có hiệu lực trong 5 phút. Nếu bạn không yêu cầu đăng nhập, hãy bỏ qua email này.</p>
      <p style="margin:0;font-size:13px;line-height:20px;color:#A4AFC3;">Bạn nhận được email này vì có người dùng địa chỉ này để đăng nhập tại taptip.fun.</p>
    </div>
  </body>
</html>`;
}

export async function sendOtp(email: string) {
  const code = generateCode();
  const kv = await getKv();
  await kv.put(`otp:${email}`, code, { expirationTtl: OTP_TTL_SECONDS });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[TapTip Auth] 🔑 Generated OTP for ${email}: ${code}`);
  }

  const resend = new Resend(process.env.RESEND_API_KEY_SENDING);
  const { data, error } = await resend.emails.send({
    from: "TapTip <otp@taptip.fun>",
    to: email,
    subject: `${code} là mã đăng nhập TapTip`,
    text: `Mã đăng nhập TapTip của bạn: ${code}\n\nMã có hiệu lực trong 5 phút. Nếu bạn không yêu cầu đăng nhập, hãy bỏ qua email này.`,
    html: otpEmailHtml(code),
  });

  if (error) {
    console.error("[TapTip Auth] ⚠️ Resend email sending error:", error);
    throw new Error(error.message || "Could not send the login code");
  }

  console.log("[TapTip Auth] ✉️ Resend email sent successfully:", data?.id);
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
