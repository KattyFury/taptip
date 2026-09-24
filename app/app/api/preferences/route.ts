import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getPrefs, savePrefs, type UserPrefs } from "@/lib/prefs";

/** Cai dat user (man Setting): gioi han tip/ngay + don vi tien. Luu KV. */
export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ prefs: await getPrefs(userId) });
}

export async function PATCH(req: NextRequest) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Partial<UserPrefs> | null;
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const patch: Partial<UserPrefs> = {};
  if ("dailyTipLimit" in body) {
    const v = body.dailyTipLimit;
    if (v !== null && (typeof v !== "number" || !isFinite(v) || v <= 0)) {
      return NextResponse.json({ error: "Limit must be greater than 0" }, { status: 400 });
    }
    patch.dailyTipLimit = v === null ? null : Math.round(v * 100) / 100;
  }
  if ("currency" in body) {
    if (body.currency !== "USD" && body.currency !== "USDC") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }
    patch.currency = body.currency;
  }
  if (typeof body.tzOffsetMinutes === "number" && Math.abs(body.tzOffsetMinutes) <= 14 * 60) {
    patch.tzOffsetMinutes = Math.round(body.tzOffsetMinutes);
  }

  return NextResponse.json({ prefs: await savePrefs(userId, patch) });
}
