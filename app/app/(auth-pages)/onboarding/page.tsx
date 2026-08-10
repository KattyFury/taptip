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
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";

export default function Onboarding() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isProfileInvalid = useMemo(() => !name.trim(), [name])

  const handleOnboarding = async () => {
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Create initial profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          auth_user_id: user?.id,
          name,
        })

      if (profileError) {
        console.error("Error while attempting to create user:", profileError);
        setError("Could not create your profile, try again.")
        setLoading(false)
        return
      }
    } catch (error: any) {
      console.error("Could not create user:", error.message);
      setError("Could not create your profile, try again.")
      setLoading(false)
      return
    }

    router.push('/dashboard');
  }

  return (
    <Screen
      icon={<Icon.Person className="w-full h-full" />}
      title="Create your username"
      action={
        <BackAction onBack={() => router.push("/sign-in")}>
          <PrimaryButton disabled={isProfileInvalid || loading} onClick={handleOnboarding}>
            {loading ? "Saving..." : "Continue"}
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
        placeholder="Your name"
        value={name}
        onChange={event => {
          setName(event.target.value)
          setError(null)
        }}
        autoComplete="name"
      />
    </Screen>
  );
}
