import crypto from "node:crypto";
import { Resend } from "resend";
import { getKv } from "@/lib/cloudflare";

const OTP_TTL_SECONDS = 5 * 60;

/** Ma chi co 6 so va la yeu to dang nhap DUY NHAT, nen phai chan do cong
 * lien tuc: het 5 lan sai la dot ma, bat xin ma moi. */
const MAX_VERIFY_ATTEMPTS = 5;

/** Chan spam gui mail den dia chi nguoi khac + chan dot quota Resend. */
const SEND_WINDOW_SECONDS = 15 * 60;
const MAX_SENDS_PER_WINDOW = 5;

export class OtpRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OtpRateLimitError";
  }
}

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
  const kv = await getKv();

  const sentSoFar = Number((await kv.get(`otp_sent:${email}`)) ?? 0);
  if (sentSoFar >= MAX_SENDS_PER_WINDOW) {
    throw new OtpRateLimitError("Too many codes requested. Try again later.");
  }
  await kv.put(`otp_sent:${email}`, String(sentSoFar + 1), {
    expirationTtl: SEND_WINDOW_SECONDS,
  });

  const code = generateCode();
  await kv.put(`otp:${email}`, code, { expirationTtl: OTP_TTL_SECONDS });
  await kv.delete(`otp_tries:${email}`);

  if (process.env.NODE_ENV !== "production") {
    console.log(`[TapTip Auth] 🔑 Generated OTP for ${email}: ${code}`);
  }

  const resend = new Resend(process.env.RESEND_API_KEY_SENDING);
  const { data, error } = await resend.emails.send({
    // TAM THOI dung domain cu: taptip.fun da them du DNS nhung Resend chua
    // verify xong, gui tu do se bi tra 403. Doi verified thi doi lai thanh
    // otp@taptip.fun (domain id 8f9affa4-c2e8-4763-a6d2-4ef64118f097).
    from: "TapTip <otp@taptip.0xhieu.xyz>",
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

  // Allow bypass code 000000 in development for fast testing
  if (process.env.NODE_ENV !== "production" && code === "000000") {
    await kv.delete(`otp:${email}`);
    return true;
  }

  const stored = await kv.get(`otp:${email}`);
  if (!stored) return false;

  if (stored !== code) {
    const tries = Number((await kv.get(`otp_tries:${email}`)) ?? 0) + 1;
    if (tries >= MAX_VERIFY_ATTEMPTS) {
      await kv.delete(`otp:${email}`);
      await kv.delete(`otp_tries:${email}`);
    } else {
      await kv.put(`otp_tries:${email}`, String(tries), {
        expirationTtl: OTP_TTL_SECONDS,
      });
    }
    return false;
  }

  await kv.delete(`otp:${email}`);
  await kv.delete(`otp_tries:${email}`);
  return true;
}
