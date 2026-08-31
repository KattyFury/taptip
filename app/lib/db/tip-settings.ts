import { getDb } from "@/lib/cloudflare";

export interface TipSettings {
  user_id: string;
  slot1: number;
  slot2: number;
  slot3: number;
  slot4: number | null;
  default_slot: number;
}

export async function getTipSettings(userId: string): Promise<TipSettings | null> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT * FROM tip_settings WHERE user_id = ?")
    .bind(userId)
    .first<TipSettings>();
  return row ?? null;
}

const SLOT_COLUMNS = ["slot1", "slot2", "slot3", "slot4"] as const;

export async function updateTipSlot(userId: string, slot: number, value: number) {
  if (slot < 1 || slot > 4) throw new Error("slot must be 1-4");
  const db = await getDb();
  const column = SLOT_COLUMNS[slot - 1];
  await db
    .prepare(`UPDATE tip_settings SET ${column} = ? WHERE user_id = ?`)
    .bind(value, userId)
    .run();
}

export async function setDefaultSlot(userId: string, slot: number) {
  if (slot < 1 || slot > 4) throw new Error("slot must be 1-4");
  const current = await getTipSettings(userId);
  const column = SLOT_COLUMNS[slot - 1];
  if (!current || current[column] == null) {
    throw new Error("Ô chưa có số tiền, không thể chọn làm mặc định");
  }
  const db = await getDb();
  await db
    .prepare("UPDATE tip_settings SET default_slot = ? WHERE user_id = ?")
    .bind(slot, userId)
    .run();
}
