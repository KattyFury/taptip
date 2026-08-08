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

import { Button } from "@/components/ui/button";
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
import { ArrowLeft } from "lucide-react";

export default function CodeConfirmation() {
  const supabase = createClient();
  const router = useRouter();
  const { email } = useContext(GlobalContext);

  useEffect(() => {
    if (!email) {
      console.warn("Email not specified, redirecting back to /sign-in");
      router.push("/sign-in");
    }
  }, [email, router]);

  if (!email) {
    return null;
  }

  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isConfirmationCodeInvalid = useMemo(
    () => confirmationCode.length !== 6,
    [confirmationCode],
  );

  const handleCodeValidation = async () => {
    if (isConfirmationCodeInvalid) {
      const warningMessage = "The confirmation code must have exactly 6 digits";
      console.warn(warningMessage);
      alert(warningMessage);
      return;
    }

    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      email,
      token: confirmationCode,
      type: "email",
    });

    if (error) {
      setError(error.message);
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
    <div className="flex flex-col w-full h-full">
      {/* Hang 1-6: noi dung can giua */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full max-w-xs mx-auto">
        <h1 className="text-2xl font-bold text-center">
          Nhập mã đã gửi tới
        </h1>
        <p className="text-muted-foreground text-center">{email}</p>

        <InputOTP
          autoFocus
          maxLength={6}
          value={confirmationCode}
          onChange={setConfirmationCode}
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

        {error && (
          <small className="text-sm text-red-600 font-medium leading-none text-center">
            {error}
          </small>
        )}
      </div>

      {/* Hang 9: Quay lai (1/3) + Tiep tuc (2/3) */}
      <div className="flex gap-2 pb-4">
        <Button
          variant="outline"
          className="flex-1 py-6 rounded-full"
          onClick={() => router.push("/sign-in")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          disabled={isConfirmationCodeInvalid || loading}
          className="flex-[2] py-6 rounded-full text-lg font-semibold"
          onClick={handleCodeValidation}
        >
          {loading ? "Đang xác nhận..." : "Tiếp tục"}
        </Button>
      </div>
    </div>
  );
}
