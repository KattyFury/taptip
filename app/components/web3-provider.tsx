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

/**
 * Web3Provider - dung lai Circle Smart Account tu passkey da dang ky, de ky
 * giao dich gui USDC tren Arc. App chi can dung 2 thu tu day: `account.address`
 * va `sendUSDC` - moi thu khac (sendTransaction/signMessage/signTypedData/
 * registerPasskey/loginWithPasskey...) da bo vi khong noi nao goi, trong do 2
 * ham passkey con tro toi route khong ton tai.
 *
 * Luong khoi tao:
 *   1. GET /api/credential -> {id, publicKey} da luu luc tao vi.
 *   2. Chua co (user tao vi truoc khi D1 co cot passkey_credential) -> lan dau
 *      bam Tip se hoi WebAuthn Login mot lan, roi POST luu lai cho cac lan sau.
 *   3. Dung credential -> toCircleSmartAccount -> bundler client.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPublicClient, defineChain, parseGwei } from 'viem';
import {
    type P256Credential,
    type SmartAccount,
    toWebAuthnAccount,
    createBundlerClient,
} from 'viem/account-abstraction';
import {
    WebAuthnMode,
    toCircleSmartAccount,
    toModularTransport,
    toPasskeyTransport,
    toWebAuthnCredential,
    encodeTransfer,
} from '@circle-fin/modular-wallets-core';

// Arc Testnet chain definition
export const arcTestnet = defineChain({
    id: 5042002,
    name: 'Arc Testnet',
    nativeCurrency: {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.testnet.arc.network'],
        },
    },
    blockExplorers: {
        default: {
            name: 'ArcScan',
            url: 'https://testnet.arcscan.app',
        },
    },
    testnet: true,
});

// USDC on Arc Testnet (native gas token with ERC-20 interface)
const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const USDC_DECIMALS = 6;

/** Chi 2 truong nay duoc luu/doc - xem lib/auth/passkey.ts */
type StoredCredential = Pick<P256Credential, 'id' | 'publicKey'>;

interface ReadyAccount {
    smartAccount: SmartAccount;
    address: string;
    bundlerClient: {
        sendUserOperation: (args: unknown) => Promise<`0x${string}`>;
        waitForUserOperationReceipt: (args: {
            hash: `0x${string}`;
        }) => Promise<{ receipt: { transactionHash: string } }>;
    };
}

interface Web3ContextType {
    /** Dia chi smart account khi da khoi tao xong (Home van co dia chi tu
     * server nen khong phu thuoc gia tri nay). */
    account: { address: string | null };
    /** Tra ve tx hash, hoac null neu that bai (da log ly do ra console). */
    sendUSDC: (to: string, amount: string) => Promise<string | null>;
}

const Web3Context = createContext<Web3ContextType>({
    account: { address: null },
    sendUSDC: async () => null,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [address, setAddress] = useState<string | null>(null);
    const readyAccountRef = useRef<ReadyAccount | null>(null);

    const clientKey = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY as string;
    const clientUrl = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL as string;

    /** Dung lai smart account tu credential da co. */
    const buildAccount = useCallback(
        async (credential: StoredCredential): Promise<ReadyAccount> => {
            const modularTransport = toModularTransport(`${clientUrl}/arcTestnet`, clientKey);

            const publicClient = createPublicClient({
                chain: arcTestnet,
                transport: modularTransport,
            });

            const smartAccount = await toCircleSmartAccount({
                client: publicClient,
                owner: toWebAuthnAccount({ credential: credential as P256Credential }),
            });

            const bundlerClient = createBundlerClient({
                account: smartAccount,
                chain: arcTestnet,
                transport: modularTransport,
                userOperation: {
                    // Arc doi phi uu tien toi thieu 1 gwei - thap hon la bundler tu choi.
                    async estimateFeesPerGas({ bundlerClient }) {
                        const MIN_PRIORITY_FEE = parseGwei('1');

                        const fees = await bundlerClient
                            .request({ method: 'pimlico_getUserOperationGasPrice' as never })
                            .catch(() => null);

                        if (fees) {
                            const fast = (fees as { fast: { maxFeePerGas: string; maxPriorityFeePerGas: string } }).fast;
                            return {
                                maxFeePerGas: BigInt(fast.maxFeePerGas),
                                maxPriorityFeePerGas:
                                    BigInt(fast.maxPriorityFeePerGas) < MIN_PRIORITY_FEE
                                        ? MIN_PRIORITY_FEE
                                        : BigInt(fast.maxPriorityFeePerGas),
                            };
                        }

                        const block = await publicClient.getBlock();
                        const baseFee = block.baseFeePerGas ?? parseGwei('48');
                        return {
                            maxFeePerGas: baseFee * BigInt(2) + MIN_PRIORITY_FEE,
                            maxPriorityFeePerGas: MIN_PRIORITY_FEE,
                        };
                    },
                },
            });

            return {
                smartAccount,
                address: smartAccount.address,
                bundlerClient: bundlerClient as unknown as ReadyAccount['bundlerClient'],
            };
        },
        [clientKey, clientUrl],
    );

    /** Credential da luu trong D1, null neu chua co. */
    const loadStoredCredential = async (): Promise<StoredCredential | null> => {
        try {
            const response = await fetch('/api/credential', { credentials: 'include' });
            if (!response.ok) return null;

            const { credential } = (await response.json()) as { credential: string | null };
            return credential ? (JSON.parse(credential) as StoredCredential) : null;
        } catch (error) {
            console.error('Could not load passkey credential:', error);
            return null;
        }
    };

    /** Bao dam co account san sang ky - hoi passkey neu chua co credential luu. */
    const ensureAccount = useCallback(async (): Promise<ReadyAccount> => {
        if (readyAccountRef.current) return readyAccountRef.current;

        if (!clientKey || !clientUrl) {
            throw new Error('Missing Circle client key/url configuration');
        }

        let credential = await loadStoredCredential();

        if (!credential) {
            // Vi tao truoc khi D1 co cot passkey_credential: lay lai bang mot
            // lan dang nhap passkey, roi luu de lan sau khong phai hoi nua.
            const fresh = await toWebAuthnCredential({
                transport: toPasskeyTransport(clientUrl, clientKey),
                mode: WebAuthnMode.Login,
            });

            credential = { id: fresh.id, publicKey: fresh.publicKey };

            await fetch('/api/credential', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential }),
            }).catch((error) => console.error('Could not save passkey credential:', error));
        }

        const ready = await buildAccount(credential);
        readyAccountRef.current = ready;
        setAddress(ready.address);
        return ready;
    }, [buildAccount, clientKey, clientUrl]);

    // Khoi tao san khi da co credential luu - khong hoi passkey o buoc nay.
    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!clientKey || !clientUrl) {
                console.error('Missing Circle API configuration');
                return;
            }

            const credential = await loadStoredCredential();
            if (!credential || cancelled) return;

            try {
                const ready = await buildAccount(credential);
                if (cancelled) return;
                readyAccountRef.current = ready;
                setAddress(ready.address);
            } catch (error) {
                console.error('Could not restore smart account:', error);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [buildAccount, clientKey, clientUrl]);

    const sendUSDC = async (to: string, amount: string): Promise<string | null> => {
        try {
            const { bundlerClient } = await ensureAccount();

            const tokenAmount = BigInt(Math.round(parseFloat(amount) * 10 ** USDC_DECIMALS));

            const userOpHash = await bundlerClient.sendUserOperation({
                calls: [encodeTransfer(to as `0x${string}`, USDC_ADDRESS as `0x${string}`, tokenAmount)],
                paymaster: true,
            });

            const { receipt } = await bundlerClient.waitForUserOperationReceipt({ hash: userOpHash });

            return receipt.transactionHash;
        } catch (error) {
            console.error('Error sending USDC:', error);
            return null;
        }
    };

    return (
        <Web3Context.Provider value={{ account: { address }, sendUSDC }}>
            {children}
        </Web3Context.Provider>
    );
};
