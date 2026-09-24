import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { clearSessionUnlocked } from "@/lib/auth/applock";

/** Client khoa lai app (an nen > 5 phut) -> xoa luon trang thai mo khoa
 * phia server, khong de phien con "mo" trong KV toi het 30 phut. */
export async function POST() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await clearSessionUnlocked();
  return NextResponse.json({ locked: true });
}
