import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteApplockCredentialsByUserId } from "@/lib/db/applock";

/** Tat khoa cua app (xem components/passkey-menu-item.tsx). Chi xoa
 * credential cua khoa cua app - KHONG dinh gi den vi Circle. */
export async function POST() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteApplockCredentialsByUserId(userId);
  return NextResponse.json({ disabled: true });
}
