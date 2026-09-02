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
import { Screen, SingleAction, PrimaryButton } from "@/components/screen";

/**
 * Tao vi cho user.
 *
 * Vi do Circle giu khoa (Developer-Controlled) nen buoc nay KHONG con hoi
 * passkey nua - chi mot lenh goi server. Truoc day man nay bat user tao
 * passkey vi khoa nam tren may ho; doi lai la moi lan tip deu phai Face ID,
 * dung cai lam cham giao dich ma docs/01-ideation.md da gat bo.
 */
export function CreateWallet() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createWallet = async () => {
        setIsCreating(true);
        setError(null);

        try {
            const response = await fetch('/api/setup-wallets', { method: 'POST' });

            if (!response.ok) {
                const data = (await response.json().catch(() => null)) as { error?: string } | null;
                throw new Error(data?.error || 'Could not create your wallet');
            }

            router.push('/dashboard');
        } catch (err) {
            console.error('Wallet creation failed:', err);
            setError(err instanceof Error ? err.message : 'Could not create your wallet');
            setIsCreating(false);
        }
    };

    return (
        <Screen
            title="You're all set"
            tightContent
            action={
                <SingleAction>
                    <PrimaryButton onClick={createWallet} disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create my wallet'}
                    </PrimaryButton>
                </SingleAction>
            }
            foot={
                error ? (
                    <p className="text-danger text-small font-extrabold text-center px-4">
                        {error}
                    </p>
                ) : null
            }
        >
            <p className="text-body text-accent text-center">
                We&apos;ll set up your USDC wallet on Arc. Nothing to install, no
                seed phrase to write down — tipping works the moment it&apos;s ready.
            </p>
        </Screen>
    );
}
