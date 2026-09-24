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

import { Screen, BackAction } from "@/components/screen";
import { SlantButton } from "@/components/ui";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { GlobalContext } from "@/contexts/global-context";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Cho giua 2 lan "Resend code" (server con gioi han 5 ma / 15 phut / email) */
const RESEND_COOLDOWN_S = 60;

/**
 * Man nhap OTP - Figma "enter-otp" (37:190). User chot 09-24b:
 *   - du 6 so la TU GUI (khong can bam Continue - nut van de do)
 *   - co "Resend code" ngay duoi 6 o (cho 60s giua 2 lan)
 *   - dien thoai tu goi y ma (autoComplete="one-time-code": iOS lay ma tu
 *     Mail/Tin nhan, Android tu ban phim)
 *   - loi hien o dong duoi cung (y=795) nhu moi man
 */
export default function CodeConfirmation() {
  const router = useRouter();
  const { email } = useContext(GlobalContext);

  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const [resending, setResending] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!email) {
      console.warn("Email not specified, redirecting back to /sign-in");
      router.push("/sign-in");
    }
  }, [email, router]);

  // Dem nguoc cho nut Resend (ma vua gui luc vao man nay)
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) {
    return null;
  }

  const verify = async (code: string) => {
    if (code.length !== 6 || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    }).catch(() => null);

    setLoading(false);
    submittingRef.current = false;

    if (!response?.ok) {
      const data = response
        ? ((await response.json().catch(() => null)) as { error?: string } | null)
        : null;
      setError(data?.error || "Invalid code, try again.");
      setConfirmationCode("");
      return;
    }

    const { needsOnboarding, promptPasskey } = (await response.json()) as {
      needsOnboarding: boolean;
      promptPasskey?: boolean;
    };

    if (needsOnboarding) {
      router.push("/dashboard/turn-on-passkey");
      return;
    }
    if (promptPasskey) {
      // Da co vi nhung chua bat Passkey - nhac lai, van Skip duoc.
      router.push("/dashboard/turn-on-passkey?next=/dashboard");
      return;
    }
    router.push("/dashboard");
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setResending(false);
    if (!res?.ok) {
      const data = res ? ((await res.json().catch(() => null)) as { error?: string } | null) : null;
      setError(data?.error || "Could not send a new code.");
      return;
    }
    setConfirmationCode("");
    setCooldown(RESEND_COOLDOWN_S);
  };

  return (
    <Screen
      title="Enter the code sent to your email"
      action={
        <BackAction fallback="/sign-in">
          <SlantButton
            disabled={confirmationCode.length !== 6 || loading}
            onClick={() => verify(confirmationCode)}
          >
            {loading ? "Verifying..." : "Continue"}
          </SlantButton>
        </BackAction>
      }
      foot={
        error && (
          <p className="font-body text-small font-medium text-danger text-center leading-[20px] px-[25px]">
            {error}
          </p>
        )
      }
    >
      {/* Figma Group 27: 6 o 48.18x49 khe 10, y=170 */}
      <div className="flex items-center justify-center" style={{ height: 49 }}>
        <InputOTP
          autoFocus
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="^[0-9]*$"
          value={confirmationCode}
          disabled={loading}
          onChange={(value) => {
            setConfirmationCode(value);
            setError(null);
          }}
          onComplete={(value: string) => verify(value)}
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

      {/* Figma khong ve - them theo yeu cau 09-24b, chu 16px ngay duoi 6 o */}
      <div className="flex justify-center" style={{ marginTop: 16 }}>
        {cooldown > 0 ? (
          <span className="font-body text-small font-medium text-hint">
            Resend code in {cooldown}s
          </span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="font-body text-small font-bold text-foreground underline disabled:opacity-[0.33]"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        )}
      </div>
    </Screen>
  );
}
