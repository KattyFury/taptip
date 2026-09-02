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
import { useRouter } from 'next/navigation';
import {
    WebAuthnMode,
    toPasskeyTransport,
    toWebAuthnCredential,
} from '@circle-fin/modular-wallets-core';
import { Screen, BackAction, PrimaryButton, TextLink } from "@/components/screen";
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
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Bo qua passkey de test giao dien - ghi wallet_address gia (placeholder,
    // khong phai vi Circle that) de dashboard/page.tsx khong day nguoc ve day.
    const skipPasskey = async () => {
        setIsSkipping(true);
        try {
            await fetch('/api/setup-wallets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential: '{}',
                    circleAddress: '0x0000000000000000000000000000000000dead',
                }),
            });
        } catch (err) {
            console.warn("Could not skip wallet setup:", err);
        }
        router.push('/dashboard');
    };

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
                const errorData = (await response.json()) as { error?: string };
                throw new Error(errorData.error || 'Failed to set up wallet');
            }

            // Force a small delay to ensure all database writes complete
            await new Promise(resolve => setTimeout(resolve, 1000));

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
        <Screen
            title="Set up a passkey"
            action={
                <BackAction onBack={() => router.push("/sign-in")}>
                    <PrimaryButton onClick={setupPasskey} disabled={isCreating}>
                        {isCreating ? 'Setting up...' : 'Set up passkey'}
                    </PrimaryButton>
                </BackAction>
            }
            foot={
                error ? (
                    <p className="text-danger text-small font-extrabold text-center px-4">
                        {error}
                    </p>
                ) : (
                    <TextLink onClick={skipPasskey} disabled={isSkipping}>
                        {isSkipping ? 'Skipping...' : 'Skip for now'}
                    </TextLink>
                )
            }
        >
            <p className="text-body text-accent text-center">
                Sign in with Face ID or your fingerprint instead of a password.
                Next time you open TapTip, this is all you need.
            </p>
        </Screen>
    );
}
