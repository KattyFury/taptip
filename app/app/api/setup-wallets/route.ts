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

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { setUserWalletAddress } from "@/lib/db/users";

export async function POST(req: NextRequest) {
  try {
    const { credential, circleAddress } = (await req.json()) as {
      credential?: string;
      circleAddress?: string;
    };

    if (!credential) {
      return NextResponse.json(
        { error: "Credential is required" },
        { status: 400 },
      );
    }

    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let walletAddress: string;

    if (circleAddress) {
      walletAddress = circleAddress;
    } else {
      const parsedCredential = JSON.parse(credential);
      const publicKey = parsedCredential.publicKey;

      const isValidPublicKey =
        publicKey &&
        publicKey.startsWith("0x") &&
        /^0x[0-9a-fA-F]{40,}$/.test(publicKey);

      if (!isValidPublicKey) {
        throw new Error(`Invalid public key format: ${publicKey}`);
      }

      walletAddress = publicKey.slice(0, 42).toLowerCase();
    }

    await setUserWalletAddress(userId, walletAddress);

    return NextResponse.json(
      {
        message: "Wallet created successfully",
        walletAddress,
        success: true,
        redirectUrl: "/dashboard",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error setting up wallets:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to set up wallet: ${message}` },
      { status: 500 },
    );
  }
}
