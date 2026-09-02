import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/users";
// Ghi lich su do POST /api/tip lo - route nay chi con doc.
import { getTransactionsForAddress } from "@/lib/db/transactions";

export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user?.wallet_address) {
    return NextResponse.json({ transactions: [] });
  }

  const rows = await getTransactionsForAddress(user.wallet_address);
  const transactions = rows.map((row) => ({
    direction: row.from_address === user.wallet_address ? ("out" as const) : ("in" as const),
    counterparty: row.from_address === user.wallet_address ? row.to_address : row.from_address,
    amount: row.amount,
    createdAt: row.created_at,
  }));

  return NextResponse.json({ transactions });
}
