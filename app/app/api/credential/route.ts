/**
 * GET  /api/credential - tra passkey credential ({id, publicKey}) cua user
 *                        dang dang nhap, de client dung lai smart account.
 * POST /api/credential - luu lai credential vua lay duoc qua WebAuthn Login
 *                        (duong cuu ho cho user tao vi TRUOC khi co cot
 *                        passkey_credential trong D1).
 *
 * Route nay thay cho /api/get-credential (ban Supabase) bi xoa nham o commit
 * 8de281d - xoa xong lam sendUSDC im lang tra ve null mai mai.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserById, setUserPasskeyCredential } from "@/lib/db/users";
import { normalizePasskeyCredential } from "@/lib/auth/passkey";

export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(userId);

  return NextResponse.json({ credential: user?.passkey_credential ?? null });
}

export async function POST(req: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { credential?: unknown };
    const credential = normalizePasskeyCredential(body.credential);

    await setUserPasskeyCredential(userId, JSON.stringify(credential));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving passkey credential:", error);
    return NextResponse.json(
      { error: "Invalid passkey credential" },
      { status: 400 },
    );
  }
}
