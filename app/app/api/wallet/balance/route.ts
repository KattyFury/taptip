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
import { createPublicClient, formatUnits, http, isAddress } from "viem";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { arcTestnet, USDC_ADDRESS, USDC_BALANCE_ABI, USDC_DECIMALS } from "@/lib/chain";

/**
 * So du USDC doc THANG tu Arc RPC.
 *
 * Truoc day goi API vi cua Circle bang CIRCLE_API_KEY - them mot mat xich co
 * the hong (key, quota, vi phai duoc dang ky trong wallet set cua key do)
 * trong khi chinh chain moi la nguon su that. Doc balanceOf cua ERC-20
 * 0x3600... vi day dung la tai san ma sendUSDC chuyen di.
 *
 * Loi thi tra ve 502, KHONG tra ve "0" - "0" gia lam nguoi dung tuong het
 * tien (dung cai bay im lang da tung giau bug passkey).
 */

const WalletIdSchema = z.object({
  walletId: z.string(),
  blockchain: z.literal("arc"),
});

export async function POST(req: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parseResult = WalletIdSchema.safeParse(await req.json().catch(() => null));
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid walletId format" }, { status: 400 });
  }

  const walletAddress = parseResult.data.walletId.toLowerCase();
  if (!isAddress(walletAddress)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  try {
    const client = createPublicClient({ chain: arcTestnet, transport: http() });

    const raw = await client.readContract({
      address: USDC_ADDRESS,
      abi: USDC_BALANCE_ABI,
      functionName: "balanceOf",
      args: [walletAddress],
    });

    return NextResponse.json({ balance: formatUnits(raw, USDC_DECIMALS) });
  } catch (error) {
    console.error("Could not read USDC balance from Arc:", error);
    return NextResponse.json({ error: "Could not read balance" }, { status: 502 });
  }
}
