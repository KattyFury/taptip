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
import * as Icon from "@/components/icons";
import { createClient } from "@/lib/utils/supabase/client";
import { GlobalContext } from "@/contexts/global-context";
import { useRouter } from "next/navigation";
import { ChangeEventHandler, useContext, useMemo, useState } from "react";

const EMAIL_DOMAIN_SUGGESTIONS = ["@gmail.com", "@icloud.com"];

export default function SignIn() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateState } = useContext(GlobalContext)

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

    const { error: otpError } = await supabase.auth.signInWithOtp({ email })

    setLoading(false)

    if (otpError) {
      setError(otpError.message)
      return
    }

    updateState({ email })

    router.push('/code-confirmation')
  }

  return (
    <Screen
      icon={<Icon.SignIn className="w-full h-full" />}
      title="Enter your email to get started"
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
              className="text-body px-[14px] py-[5px] border border-border rounded-full text-hint"
            >
              {localPart}{domain}
            </button>
          ))}
        </div>
      )}
    </Screen>
  );
}
