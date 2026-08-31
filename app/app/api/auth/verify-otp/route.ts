import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { getUserByEmail, createUser } from "@/lib/db/users";

export async function POST(request: NextRequest) {
  const { email, code } = (await request.json()) as {
    email?: string;
    code?: string;
  };

  if (!email || !code) {
    return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
  }

  const valid = await verifyOtp(email, code);
  if (!valid) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  let user = await getUserByEmail(email);
  const isNewUser = !user;
  if (!user) {
    user = await createUser(email);
  }

  await createSession(user.id);

  return NextResponse.json({
    ok: true,
    needsOnboarding: isNewUser || !user.wallet_address,
  });
}
