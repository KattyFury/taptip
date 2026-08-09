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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { updateState } = useContext(GlobalContext)

  const isEmailInvalid = useMemo(() => !/^\S+@\S+\.\S+$/.test(email), [email])

  const localPart = email.split('@')[0]
  const showEmailSuggestions = localPart.trim().length > 0 && isEmailInvalid

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = event => {
    setEmail(event.target.value)
  }

  const applyEmailSuggestion = (domain: string) => {
    setEmail(`${localPart}${domain}`)
  }

  const signInWithEmail = async () => {
    if (isEmailInvalid) {
      alert('Enter a valid email address')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({ email })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    updateState({ email })

    router.push('/code-confirmation')
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* He luoi 10 hang: 1 (dem) + 5 (noi dung, tam ~hang 3.5) + 3 (dem) + 1 (nut) */}
      <div style={{ flex: "1 1 0" }} />

      <div style={{ flex: "5 1 0", minHeight: 0 }} className="flex flex-col items-center justify-center gap-4 w-full max-w-xs mx-auto">
        <h1 className="text-2xl font-bold text-center">
          Enter your email to get started
        </h1>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          className="text-center"
        />
        {showEmailSuggestions && (
          <div className="flex flex-wrap gap-2 justify-center">
            {EMAIL_DOMAIN_SUGGESTIONS.map(domain => (
              <button
                key={domain}
                type="button"
                onClick={() => applyEmailSuggestion(domain)}
                className="text-sm px-3 py-1 border rounded-full text-muted-foreground hover:bg-accent"
              >
                {localPart}{domain}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: "3 1 0" }} />

      {/* Hang 9-10: nut hanh dong, cao 4/5 hang, rong 2/3 man can giua */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex items-center">
        <Button
          disabled={isEmailInvalid || loading}
          className="w-2/3 mx-auto h-[80%] rounded-full text-lg font-semibold"
          onClick={signInWithEmail}
        >
          {loading ? "Sending..." : "Send OTP"}
        </Button>
      </div>
    </div>
  );
}
