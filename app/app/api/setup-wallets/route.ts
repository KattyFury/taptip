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

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserById, setUserCircleWallet } from "@/lib/db/users";
import { createWalletForUser } from "@/lib/circle/wallets";

/**
 * Tao vi Circle Developer-Controlled cho user dang dang nhap.
 *
 * Ban cu nhan passkey credential tu client roi tu suy ra dia chi - trong do co
 * ca nhanh `publicKey.slice(0, 42)` tao ra dia chi KHONG AI DIEU KHIEN DUOC
 * (tien gui vao la mat vinh vien). Gio dia chi do Circle cap, khong doan nua.
 */
export async function POST() {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Da co vi Circle roi thi khong tao them - tranh bo roi vi cu dang giu tien.
    if (user.circle_wallet_id && user.wallet_address) {
      return NextResponse.json({
        walletAddress: user.wallet_address,
        alreadyExists: true,
      });
    }

    const wallet = await createWalletForUser(userId);
    await setUserCircleWallet(userId, wallet.address, wallet.walletId);

    return NextResponse.json(
      { walletAddress: wallet.address, success: true },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error setting up wallet:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to set up wallet: ${message}` },
      { status: 500 },
    );
  }
}
