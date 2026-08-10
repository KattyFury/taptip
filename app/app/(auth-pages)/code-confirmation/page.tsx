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

import { Screen, BackAction, PrimaryButton } from "@/components/screen";
import * as Icon from "@/components/icons";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { GlobalContext } from "@/contexts/global-context";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";

export default function CodeConfirmation() {
  const supabase = createClient();
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

    const {
      data: { session },
      error: verifyError,
    } = await supabase.auth.verifyOtp({
      email,
      token: confirmationCode,
      type: "email",
    });

    if (verifyError) {
      setError("Invalid code, try again.");
      setConfirmationCode("");
      setLoading(false);
      return;
    }

    if (!session) {
      setError("Could not initialize session");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select()
      .eq("auth_user_id", session.user.id)
      .single();

    if (!profile) {
      router.push("/onboarding");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <Screen
      icon={<Icon.Mail className="w-full h-full" />}
      // Ca dia chi email cung la tieu de - chi khac mau xanh cho de doc,
      // khong phai dong chu phu.
      title={
        <>
          Enter the code sent to
          <br />
          <span className="text-accent break-all">{email}</span>
        </>
      }
      action={
        <BackAction onBack={() => router.push("/sign-in")}>
          <PrimaryButton
            disabled={isConfirmationCodeInvalid || loading}
            onClick={handleCodeValidation}
          >
            {loading ? "Verifying..." : "Continue"}
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
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </Screen>
  );
}
