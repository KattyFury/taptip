import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { getUserByEmail, createUser } from "@/lib/db/users";
import { getApplockCredentialsByUserId } from "@/lib/db/applock";

export async function POST(request: NextRequest) {
  try {
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

    const hasWallet = !!user.wallet_address;

    // Da co vi (khong phai lan dau) nhung chua bat khoa Passkey - vd tung
    // bam "Skip" o /dashboard/turn-on-passkey, hoac dang nhap tu truoc khi
    // tinh nang nay ton tai. KHONG bat buoc, chi NHAC LAI moi lan dang
    // nhap (theo yeu cau that 09-24: "ai bo qua thi lan sau nhac lai") -
    // man turn-on-passkey van co nut Skip, khong chan duong ai ca.
    const promptPasskey =
      hasWallet && (await getApplockCredentialsByUserId(user.id)).length === 0;

    return NextResponse.json({
      ok: true,
      needsOnboarding: isNewUser || !hasWallet,
      promptPasskey,
    });
  } catch (err: any) {
    console.error("[verify-otp] Server error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
