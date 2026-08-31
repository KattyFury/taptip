import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getTipSettings, updateTipSlot, setDefaultSlot } from "@/lib/db/tip-settings";

export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getTipSettings(userId);
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slot, value, setDefault } = (await req.json()) as {
    slot?: number;
    value?: number;
    setDefault?: boolean;
  };

  if (!slot || slot < 1 || slot > 4) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  try {
    if (typeof value === "number") {
      if (isNaN(value) || value <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }
      await updateTipSlot(userId, slot, value);
    }
    if (setDefault) {
      await setDefaultSlot(userId, slot);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const settings = await getTipSettings(userId);
  return NextResponse.json({ settings });
}
