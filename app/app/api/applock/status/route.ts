import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getApplockCredentialsByUserId } from "@/lib/db/applock";

/** AppLockGate goi ngay khi mo Home de biet hien man "Set up" hay man
 * "Unlock" - KHONG lien quan gi den session/vi, chi hoi "user nay da co
 * passkey khoa cua app chua". */
export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const credentials = await getApplockCredentialsByUserId(userId);
  return NextResponse.json({ hasCredential: credentials.length > 0 });
}
