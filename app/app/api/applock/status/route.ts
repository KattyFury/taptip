import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getApplockCredentialsByUserId } from "@/lib/db/applock";
import { isSessionUnlocked, walletLockedUntil } from "@/lib/auth/applock";

/** AppLockGate goi ngay khi mo Home de biet hien man "Set up" hay man
 * "Unlock" - KHONG lien quan gi den session/vi, chi hoi "user nay da co
 * passkey khoa cua app chua". */
export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const credentials = await getApplockCredentialsByUserId(userId);
  const hasCredential = credentials.length > 0;
  return NextResponse.json({
    hasCredential,
    /** Phien nay da mo khoa phia server chua (chi co nghia khi hasCredential) */
    unlocked: hasCredential ? await isSessionUnlocked() : true,
    /** ms - dang bi khoa gui/rut 24h sau khi reset passkey, null neu khong */
    walletLockedUntil: await walletLockedUntil(userId),
  });
}
