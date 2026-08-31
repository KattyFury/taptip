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

import { useRouter } from 'next/navigation';
import { PasskeySetup } from '@/components/passkey-setup';
import { useEffect, useState } from 'react';

export default function SetupWalletPage() {
  const router = useRouter();
  const [username] = useState(() => crypto.randomUUID());
  const [walletSetupComplete, setWalletSetupComplete] = useState<boolean>()

  const checkWallet = async () => {
    const response = await fetch('/api/auth-status')
    const { authenticated, hasWallet } = (await response.json()) as {
      authenticated: boolean
      hasWallet: boolean
    }

    if (!authenticated) {
      router.push('/sign-in')
      return
    }

    if (hasWallet) {
      router.push('/dashboard')
      return
    }

    setWalletSetupComplete(false)
  }

  useEffect(() => {
    checkWallet()
  }, [router])

  if (walletSetupComplete === undefined) return null

  return (
    <div className="flex flex-col w-full h-full">
      <PasskeySetup username={username} />
    </div>
  );
}