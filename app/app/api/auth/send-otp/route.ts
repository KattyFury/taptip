import { NextRequest, NextResponse } from "next/server";
import { sendOtp } from "@/lib/auth/otp";

export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };

  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await sendOtp(email);

  return NextResponse.json({ ok: true });
}
