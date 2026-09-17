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

"use client"

import { Screen, BackAction, ROW_H } from "@/components/screen";
import { SlantButton, TextField } from "@/components/ui";
import { GlobalContext } from "@/contexts/global-context";
import { useRouter } from "next/navigation";
import { ChangeEventHandler, useContext, useMemo, useState } from "react";

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateState } = useContext(GlobalContext)

  const isEmailInvalid = useMemo(() => !/^\S+@\S+\.\S+$/.test(email), [email])

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = event => {
    setEmail(event.target.value)
    setError(null)
  }

  const signInWithEmail = async () => {
    if (isEmailInvalid) {
      setError('Enter a valid email address')
      return
    }

    setLoading(true)
    setError(null)

    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)

    if (!response.ok) {
      const { error: otpError } = (await response.json().catch(() => ({ error: 'Could not send code' }))) as { error: string }
      setError(otpError)
      return
    }

    updateState({ email })

    router.push('/code-confirmation')
  }

  return (
    <Screen
      title="Enter your email to get started"
      action={
        <BackAction onBack={() => router.push("/")}>
          <SlantButton disabled={isEmailInvalid || loading} onClick={signInWithEmail}>
            {loading ? "Sending..." : "Send OTP"}
          </SlantButton>
        </BackAction>
      }
      foot={
        error && (
          <p className="font-body text-small font-medium text-danger text-center leading-[20px]">
            {error}
          </p>
        )
      }
    >
      {/* Figma node 24:8: o nhap cao dung 1 hang luoi, rong het 340 */}
      <div style={{ height: ROW_H }}>
        <TextField
          type="email"
          placeholder="Type here"
          value={email}
          onChange={handleEmailChange}
          autoComplete="off"
        />
      </div>
    </Screen>
  );
}
