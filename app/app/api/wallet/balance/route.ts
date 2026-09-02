/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";

// Schema validation
const WalletIdSchema = z.object({
  walletId: z.string(),
  blockchain: z.literal("arc"),
});

const ResponseSchema = z.object({
  balance: z.string().optional(),
  error: z.string().optional(),
});

type WalletBalanceResponse = z.infer<typeof ResponseSchema>;

export async function POST(
  req: NextRequest,
): Promise<NextResponse<WalletBalanceResponse>> {
  try {
    // Route nay xai CIRCLE_API_KEY cua app - bat buoc dang nhap, khong de
    // nguoi la dung lam proxy tra cuu so du mien phi bang key cua minh.
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = WalletIdSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid walletId format" },
        { status: 400 },
      );
    }

    const { walletId } = parseResult.data;
    const walletAddress = walletId.toLowerCase();

    try {
      // Use the blockchain + address endpoint to get balances
      const balanceResponse = await fetch(
        `https://api.circle.com/v1/w3s/buidl/wallets/ARC-TESTNET/${walletAddress}/balances`,
        {
          headers: {
            "X-Request-Id": crypto.randomUUID(),
            Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!balanceResponse.ok) {
        console.error("Circle balance API error:", {
          status: balanceResponse.status,
          body: await balanceResponse.text().catch(() => ""),
        });
        return NextResponse.json({ balance: "0" });
      }

      const payload = (await balanceResponse.json()) as {
        data?: { tokenBalances?: { token?: { symbol?: string }; amount?: string }[] };
      };

      const usdcBalance =
        payload.data?.tokenBalances?.find(
          (balance) => balance.token?.symbol === "USDC",
        )?.amount || "0";

      return NextResponse.json({ balance: usdcBalance });
    } catch (error) {
      console.error("Error fetching balance from Circle API:", error);

      // Return 0 balance instead of error for better UX
      return NextResponse.json({ balance: "0" });
    }
  } catch (error) {
    console.error("Error in wallet balance endpoint:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    // For any other errors, return 0 balance for better UX
    return NextResponse.json({ balance: "0" });
  }
}
