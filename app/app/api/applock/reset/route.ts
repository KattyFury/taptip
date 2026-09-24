import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteApplockCredentialsByUserId } from "@/lib/db/applock";
import { clearSessionUnlocked, lockWalletFor24h } from "@/lib/auth/applock";

/**
 * "Switched devices? Reset passkey" o popup mo khoa that bai (09-24b, user
 * chot): nguoi mo khoa that bai co the la chinh chu (doi may/mat passkey)
 * HOAC ke trom. Cho reset (xoa passkey, vao duoc app xem/nhan tip) nhung
 * KHOA GUI/RUT 24H - trom khong kip rut tien, chu that van dung tiep.
 */
export async function POST() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteApplockCredentialsByUserId(userId);
  await clearSessionUnlocked();
  const walletLockedUntil = await lockWalletFor24h(userId);
  return NextResponse.json({ walletLockedUntil });
}
