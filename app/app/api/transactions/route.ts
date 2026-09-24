import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/users";
// Ghi lich su do POST /api/tip lo - route nay chi con doc.
import { getTransactionsForAddress } from "@/lib/db/transactions";
import { getDeposits } from "@/lib/deposits";

/**
 * Lich su giao dich. kind:
 *   tip      - gui/nhan tip giua nguoi dung TapTip (bang transactions)
 *   withdraw - rut ra vi ngoai (bang transactions, cot kind - migration 0006)
 *   deposit  - nap tu ngoai vao (doc tu trinh duyet khoi, CHI khi
 *              ?include=deposits - History dung, Home poll 10s thi khong)
 */
interface HistoryRow {
  direction: "in" | "out";
  kind: "tip" | "withdraw" | "deposit";
  counterparty: string;
  amount: number;
  createdAt: string;
}

export async function GET(req: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user?.wallet_address) {
    return NextResponse.json({ transactions: [] });
  }
  const wallet = user.wallet_address;

  const rows = await getTransactionsForAddress(wallet);
  const transactions: HistoryRow[] = rows.map((row) => ({
    direction: row.from_address === wallet ? "out" : "in",
    kind: row.kind ?? "tip",
    counterparty: row.from_address === wallet ? row.to_address : row.from_address,
    amount: row.amount,
    createdAt: row.created_at,
  }));

  if (req.nextUrl.searchParams.get("include") === "deposits") {
    try {
      const deposits = await getDeposits(wallet);
      for (const d of deposits) {
        transactions.push({
          direction: "in",
          kind: "deposit",
          counterparty: d.from,
          amount: d.amount,
          // ISO -> cung dang "YYYY-MM-DD HH:MM:SS" (UTC) nhu D1 de sap xep chung
          createdAt: d.createdAt.slice(0, 19).replace("T", " "),
        });
      }
      transactions.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    } catch (error) {
      // Trinh duyet khoi loi -> van tra lich su trong app, khong vo ca man
      console.error("Could not load deposits:", error);
    }
  }

  return NextResponse.json({ transactions });
}
