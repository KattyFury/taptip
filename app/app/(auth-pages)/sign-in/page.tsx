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

import { Screen, BackAction, PrimaryButton, Field } from "@/components/screen";
import { GlobalContext } from "@/contexts/global-context";
import { useRouter } from "next/navigation";
import { ChangeEventHandler, useContext, useEffect, useMemo, useState } from "react";

const EMAIL_DOMAIN_SUGGESTIONS = ["@gmail.com", "@icloud.com"];
const LAST_EMAIL_KEY = "taptip:last-email";

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateState } = useContext(GlobalContext)

  // Nho email dang nhap lan truoc lam hint, tranh nguoi dung go lai tu dau.
  useEffect(() => {
    const lastEmail = window.localStorage.getItem(LAST_EMAIL_KEY);
    if (lastEmail) setEmail(lastEmail);
  }, []);

  const isEmailInvalid = useMemo(() => !/^\S+@\S+\.\S+$/.test(email), [email])

  const localPart = email.split('@')[0]
  const showEmailSuggestions = localPart.trim().length > 0 && isEmailInvalid

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = event => {
    setEmail(event.target.value)
    setError(null)
  }

  const applyEmailSuggestion = (domain: string) => {
    setEmail(`${localPart}${domain}`)
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

    window.localStorage.setItem(LAST_EMAIL_KEY, email)
    updateState({ email })

    router.push('/code-confirmation')
  }

  return (
    <Screen
      title="Enter your email to get started"
      tightContent
      action={
        <BackAction onBack={() => router.push("/")}>
          <PrimaryButton disabled={isEmailInvalid || loading} onClick={signInWithEmail}>
            {loading ? "Sending..." : "Send OTP"}
          </PrimaryButton>
        </BackAction>
      }
      foot={
        error && (
          <p className="text-danger text-small font-extrabold text-center">
            {error}
          </p>
        )
      }
    >
      <Field
        type="email"
        placeholder="Email"
        value={email}
        onChange={handleEmailChange}
        autoComplete="email"
      />

      {showEmailSuggestions && (
        <div className="flex flex-wrap gap-2 justify-center">
          {EMAIL_DOMAIN_SUGGESTIONS.map(domain => (
            <button
              key={domain}
              type="button"
              onClick={() => applyEmailSuggestion(domain)}
              className="text-small px-[14px] py-[5px] bg-surface rounded-full text-foreground"
            >
              {localPart}{domain}
            </button>
          ))}
        </div>
      )}
    </Screen>
  );
}
