import { NextRequest, NextResponse } from "next/server";
import { sendOtp, OtpRateLimitError } from "@/lib/auth/otp";

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await sendOtp(email);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[send-otp] Error:", err);
    if (err instanceof OtpRateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    return NextResponse.json(
      { error: "Could not send the login code. Please try again." },
      { status: 500 }
    );
  }
}
