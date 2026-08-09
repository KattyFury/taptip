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

'use client';

import { useState } from 'react';
import {
    WebAuthnMode,
    toPasskeyTransport,
    toWebAuthnCredential,
} from '@circle-fin/modular-wallets-core';
import { Button } from "@/components/ui/button";
import { ScanFace } from "lucide-react";
import { createPublicClient } from 'viem';
import {
    toWebAuthnAccount,
} from 'viem/account-abstraction';
import {
    toCircleSmartAccount,
    toModularTransport,
} from '@circle-fin/modular-wallets-core';
import { arcTestnet } from '@/components/web3-provider';

interface PasskeySetupProps {
    username: string;
}

// This component handles the wallet setup after user registration
export function PasskeySetup({ username }: PasskeySetupProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clientKey = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY;
    const clientUrl = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL;

    // Create Circle transports - only in browser
    const passkeyTransport = typeof window !== 'undefined'
        ? toPasskeyTransport(clientUrl, clientKey)
        : null;

    const setupPasskey = async () => {
        if (!passkeyTransport) {
            setError("Browser environment not available");
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // Create passkey credential
            const credential = await toWebAuthnCredential({
                transport: passkeyTransport,
                mode: WebAuthnMode.Register,
                username,
            });

            // Get the real Circle address
            let circleAddress;
            try {
                const webAuthnAccount = toWebAuthnAccount({
                    credential
                });

                // Create modular transport for Arc
                const modularTransport = toModularTransport(
                    `${clientUrl}/arcTestnet`,
                    clientKey
                );

                const publicClient = createPublicClient({
                    chain: arcTestnet,
                    transport: modularTransport,
                });

                const circleAccount = await toCircleSmartAccount({
                    client: publicClient,
                    owner: webAuthnAccount,
                });

                circleAddress = circleAccount.address.toLowerCase();
            } catch (e) {
                console.warn("Could not get Circle address:", e);
            }

            // Call API to set up wallet with the passkey
            const response = await fetch('/api/setup-wallets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: JSON.stringify(credential),
                    circleAddress
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to set up wallet');
            }

            // Force a small delay to ensure all database writes complete
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                const responseData = await response.json();
            } catch (e) {
                console.warn("Could not parse response JSON", e);
            }

            // Force redirect to dashboard
            window.location.href = '/dashboard';
        } catch (err) {
            console.error("Passkey creation failed:", err);
            setError(err instanceof Error ? err.message : 'Failed to create passkey');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col w-full h-full">
            {/* He luoi 10 hang: 1 (dem) + 5 (noi dung, tam ~hang 3.5) + 3 (dem) + 1 (nut) */}
            <div style={{ flex: "1 1 0" }} />

            <div style={{ flex: "5 1 0", minHeight: 0 }} className="flex flex-col items-center justify-center gap-4 w-full max-w-xs mx-auto">
                <ScanFace className="h-[8vh] w-[8vh] text-primary" />
                <h2 className="text-xl font-semibold text-center">Set Up Passkey</h2>
                <p className="text-muted-foreground text-center">
                    Sign in with Face ID / fingerprint instead of a password. Next
                    time you open the app, this is all you need, nothing to remember.
                </p>

                {error && (
                    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm text-center">
                        {error}
                    </div>
                )}
            </div>

            <div style={{ flex: "3 1 0" }} />

            {/* Hang 9-10: nut hanh dong, cao 4/5 hang, rong 2/3 man can giua */}
            <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex items-center">
                <Button
                    onClick={setupPasskey}
                    disabled={isCreating}
                    className="w-2/3 mx-auto h-[80%] rounded-full text-lg font-semibold"
                >
                    {isCreating ? 'Setting up...' : 'Enable passkey'}
                </Button>
            </div>
        </div>
    );
}
