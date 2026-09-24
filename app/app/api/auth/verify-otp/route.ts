import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { getUserByEmail, createUser } from "@/lib/db/users";
import { getApplockCredentialsByUserId } from "@/lib/db/applock";
import { getKv } from "@/lib/cloudflare";

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

    // Da co vi nhung chua bat Passkey (tung Skip...) -> nhac lai, KHONG bat buoc
    // (man turn-on-passkey co Skip).
    let promptPasskey =
      hasWallet && (await getApplockCredentialsByUserId(user.id)).length === 0;
    // User chot 09-24b: nhac MOI NGAY 1 LAN (khong phai moi lan dang nhap)
    if (promptPasskey) {
      const kv = await getKv();
      const key = `passkey_prompted:${user.id}`;
      if (await kv.get(key)) promptPasskey = false;
      else await kv.put(key, "1", { expirationTtl: 24 * 60 * 60 });
    }

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
