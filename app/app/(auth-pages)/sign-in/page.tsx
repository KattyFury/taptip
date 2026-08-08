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

export default function SignIn() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { updateState } = useContext(GlobalContext)

  const isEmailInvalid = useMemo(() => !/^\S+@\S+\.\S+$/.test(email), [email])

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = event => {
    setEmail(event.target.value)
  }

  const signInWithEmail = async () => {
    if (isEmailInvalid) {
      alert('Nhập đúng định dạng email')
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
      {/* Hang 1-6: noi dung can giua */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full max-w-xs mx-auto">
        <h1 className="text-2xl font-bold text-center">
          Nhập email để bắt đầu
        </h1>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          className="text-center"
        />
      </div>

      {/* Hang 9: nut hanh dong */}
      <div className="pb-4">
        <Button
          disabled={isEmailInvalid || loading}
          className="w-full py-6 rounded-full text-lg font-semibold"
          onClick={signInWithEmail}
        >
          {loading ? "Đang gửi..." : "Gửi mã OTP"}
        </Button>
      </div>
    </div>
  );
}
