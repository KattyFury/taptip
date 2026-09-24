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
import { createTransaction, sumTipsSince } from "@/lib/db/transactions";
import { getPrefs, startOfUserDaySql } from "@/lib/prefs";
import { passesAppLock, walletLockedUntil } from "@/lib/auth/applock";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function POST(req: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Khoa 24h sau khi reset passkey (xem lib/auth/applock.ts) - van NHAN duoc
  const lockedUntil = await walletLockedUntil(userId);
  if (lockedUntil) {
    return NextResponse.json(
      {
        error: "Sending is paused for 24h after resetting your Passkey.",
        code: "WALLET_LOCKED",
        until: lockedUntil,
      },
      { status: 423 },
    );
  }
  if (!(await passesAppLock(userId))) {
    return NextResponse.json(
      { error: "Unlock the app with your Passkey first.", code: "APPLOCK_REQUIRED" },
      { status: 423 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    toAddress?: string;
    amount?: number;
    /** "withdraw" = rut ra vi ngoai tu man Withdraw (ghi dung loai o History,
     * khong tinh vao gioi han tip/ngay). Mac dinh "tip". */
    kind?: "tip" | "withdraw";
  } | null;
  const kind = body?.kind === "withdraw" ? "withdraw" : "tip";

  const toAddress = body?.toAddress;
  const amount = body?.amount;

  if (!toAddress || !ADDRESS_REGEX.test(toAddress)) {
    return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 });
  }
  if (typeof amount !== "number" || !isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Tip: khong qua 2 chu so thap phan (rut thi duoc le), tip thi so nguyen
  if (kind === "tip" && !Number.isInteger(amount)) {
    return NextResponse.json({ error: "Tips must be whole dollars" }, { status: 400 });
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

  // Gioi han tip moi ngay (man Setting, luu KV) - chi tinh TIP, khong tinh rut
  if (kind === "tip") {
    const prefs = await getPrefs(userId);
    if (prefs.dailyTipLimit != null) {
      const spent = await sumTipsSince(user.wallet_address, startOfUserDaySql(prefs.tzOffsetMinutes));
      const left = Math.max(0, prefs.dailyTipLimit - spent);
      if (amount > left + 1e-9) {
        return NextResponse.json(
          {
            error: left > 0
              ? `Daily tip limit reached - only $${left.toFixed(2).replace(/\.00$/, "")} left today.`
              : "Daily tip limit reached. Change it in Setting.",
            code: "DAILY_LIMIT",
          },
          { status: 403 },
        );
      }
    }
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
      kind,
    }).catch((error) => console.error("Could not record transaction:", error));

    return NextResponse.json({ transactionId, state });
  } catch (error) {
    console.error("Tip failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
