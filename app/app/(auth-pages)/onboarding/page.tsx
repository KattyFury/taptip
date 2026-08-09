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
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import { Input } from "@/components/ui/input";

export default function Onboarding() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')

  const isProfileInvalid = useMemo(() => !name, [name])

  const handleOnboarding = async () => {
    setLoading(true)

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
        return
      }
    } catch (error: any) {
      console.error("Could not create user:", error.message);
      alert("Could not create user")
      return
    }

    router.push('/dashboard');
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* He luoi 10 hang: 1 (dem) + 5 (noi dung, tam ~hang 3.5) + 3 (dem) + 1 (nut) */}
      <div style={{ flex: "1 1 0" }} />

      <div style={{ flex: "5 1 0", minHeight: 0 }} className="flex flex-col items-center justify-center gap-4 w-full max-w-xs mx-auto">
        <h1 className="text-2xl font-bold text-center">
          Create your profile
        </h1>
        <Input
          placeholder="Your name"
          value={name}
          onChange={event => setName(event.target.value)}
          className="text-center"
        />
      </div>

      <div style={{ flex: "3 1 0" }} />

      {/* Hang 9-10: nut hanh dong, cao 4/5 hang, rong 2/3 man can giua */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex items-center">
        <Button
          disabled={isProfileInvalid || loading}
          className="w-2/3 mx-auto h-[80%] rounded-full text-lg font-semibold"
          onClick={handleOnboarding}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}