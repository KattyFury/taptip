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

"use client";

import { Screen, BackAction, ROW_H } from "@/components/screen";
import { SlantButton } from "@/components/ui";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { GlobalContext } from "@/contexts/global-context";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function CodeConfirmation() {
  const router = useRouter();
  const { email } = useContext(GlobalContext);

  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      console.warn("Email not specified, redirecting back to /sign-in");
      router.push("/sign-in");
    }
  }, [email, router]);

  const isConfirmationCodeInvalid = useMemo(
    () => confirmationCode.length !== 6,
    [confirmationCode],
  );

  if (!email) {
    return null;
  }

  const handleCodeValidation = async () => {
    if (isConfirmationCodeInvalid) {
      setError("The confirmation code must have exactly 6 digits.");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: confirmationCode }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error || "Invalid code, try again.");
      setConfirmationCode("");
      return;
    }

    const { needsOnboarding, promptPasskey } = (await response.json()) as {
      needsOnboarding: boolean;
      promptPasskey?: boolean;
    };

    if (needsOnboarding) {
      // Redesign 09-24: xen them buoc "Turn on Passkey" (Figma frame 21)
      // truoc man tao vi - xem app/dashboard/turn-on-passkey/page.tsx.
      router.push("/dashboard/turn-on-passkey");
      return;
    }

    if (promptPasskey) {
      // Da co vi tu truoc nhung chua bat Passkey (tung bam Skip, hoac dang
      // nhap tu truoc khi tinh nang nay ton tai) - nhac lai o day, van co
      // the Skip thang ve /dashboard, khong ep buoc gi ca.
      router.push("/dashboard/turn-on-passkey?next=/dashboard");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <Screen
      // Figma frame 19 (37:190) ve dung 1 dong tinh "Enter the code sent to
      // your email" - KHONG chen dia chi email that vao tieu de nhu ban
      // truoc suy ra (Figma khong ve dong nay).
      title="Enter the code sent to your email"
      action={
        <BackAction onBack={() => router.push("/sign-in")}>
          <SlantButton
            disabled={isConfirmationCodeInvalid || loading}
            onClick={handleCodeValidation}
          >
            {loading ? "Verifying..." : "Continue"}
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
      {/* Hang o nhap dat o hang 4 nhu o nhap email ben Sign in, cao dung 1
          hang luoi, can giua trong 324px. 6 o DEU NHAU, khong chia nhom -
          dung Figma frame 19 (37:190), khac ban truoc tung suy ra 2 nhom 3. */}
      <div className="flex items-center justify-center" style={{ height: ROW_H }}>
        <InputOTP
          autoFocus
          maxLength={6}
          value={confirmationCode}
          onChange={(value) => {
            setConfirmationCode(value);
            setError(null);
          }}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </Screen>
  );
}
