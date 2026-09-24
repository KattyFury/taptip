import { getKv } from "@/lib/cloudflare";

/**
 * Cai dat cua user (man Setting, 09-24b) - luu KV `prefs:<userId>` thay vi
 * them cot D1: user ngai dung toi database, KV khong can migration.
 */
export interface UserPrefs {
  /** Gioi han tong tien TIP moi ngay (USDC). null = khong gioi han. */
  dailyTipLimit: number | null;
  /** Don vi hien so tien trong app: "$12" hay "12 USDC" */
  currency: "USD" | "USDC";
  /** Mui gio cua may (phut, nhu Date#getTimezoneOffset) - de tinh "hom nay" */
  tzOffsetMinutes: number;
}

export const DEFAULT_PREFS: UserPrefs = {
  dailyTipLimit: null,
  currency: "USD",
  tzOffsetMinutes: -420, // Viet Nam (UTC+7) cho toi khi may user gui len
};

export async function getPrefs(userId: string): Promise<UserPrefs> {
  const kv = await getKv();
  const raw = await kv.get(`prefs:${userId}`);
  if (!raw) return DEFAULT_PREFS;
  try {
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<UserPrefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function savePrefs(userId: string, patch: Partial<UserPrefs>): Promise<UserPrefs> {
  const next = { ...(await getPrefs(userId)), ...patch };
  const kv = await getKv();
  await kv.put(`prefs:${userId}`, JSON.stringify(next));
  return next;
}

/** Moc 0h "hom nay" theo gio may user, doi ra UTC dang SQLite "YYYY-MM-DD HH:MM:SS" */
export function startOfUserDaySql(tzOffsetMinutes: number): string {
  const localNow = new Date(Date.now() - tzOffsetMinutes * 60000);
  localNow.setUTCHours(0, 0, 0, 0);
  const utcStart = new Date(localNow.getTime() + tzOffsetMinutes * 60000);
  return utcStart.toISOString().slice(0, 19).replace("T", " ");
}
