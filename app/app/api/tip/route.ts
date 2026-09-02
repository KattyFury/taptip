/**
 * POST /api/tip - gui tip.
 *
 * Toan bo viec ky nam o server (Circle giu khoa), nen tu luc quet QR den luc
 * tien di KHONG co buoc xac nhan nao cua user - dung yeu cau so 1 la toc do.
 *
 * Ban cu ky o client bang passkey: moi lan tip phai Face ID, cham hon va
 * dung cai ma docs/01-ideation.md da gat Privy vi no.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/users";
import { sendUsdc } from "@/lib/circle/wallets";
import { createTransaction } from "@/lib/db/transactions";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function POST(req: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    toAddress?: string;
    amount?: number;
  } | null;

  const toAddress = body?.toAddress;
  const amount = body?.amount;

  if (!toAddress || !ADDRESS_REGEX.test(toAddress)) {
    return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 });
  }
  if (typeof amount !== "number" || !isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const user = await getUserById(userId);
  if (!user?.circle_wallet_id || !user.wallet_address) {
    return NextResponse.json(
      { error: "Your wallet isn't ready yet" },
      { status: 409 },
    );
  }

  if (toAddress.toLowerCase() === user.wallet_address.toLowerCase()) {
    return NextResponse.json(
      { error: "That's your own QR code" },
      { status: 400 },
    );
  }

  try {
    const { transactionId, state } = await sendUsdc(
      user.wallet_address,
      toAddress,
      String(amount),
    );

    // Ghi lich su ngay - Circle dua len chain bat dong bo, doi xong moi ghi
    // thi man hinh phai cho vo ich.
    await createTransaction({
      fromAddress: user.wallet_address,
      toAddress,
      amount,
      txHash: transactionId,
      status: state,
    }).catch((error) => console.error("Could not record transaction:", error));

    return NextResponse.json({ transactionId, state });
  } catch (error) {
    console.error("Tip failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
