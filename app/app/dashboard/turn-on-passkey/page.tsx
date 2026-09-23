"use client";

/**
 * Man "Turn on Passkey" - Figma frame "21" (node 37:224), buoc onboarding
 * MOI xen giua OTP va "You're all set" (redesign 09-24, user chot: "cai
 * nay da bo nay mang len lai lam bao mat NHE"). Day la KHOA CUA APP cuc bo
 * (WebAuthn platform authenticator) - TACH BIET HOAN TOAN voi vi Circle
 * Developer-Controlled Wallets, khong ky giao dich gi ca (xem
 * lib/auth/applock.ts, khoi phuc tu commit truoc khi bi go 09-11:
 * bd495d3^). "Nhe" o day nghia la 1 lop khoa tien loi cuc bo, khong bat
 * buoc - bam Back de bo qua van tao vi binh thuong.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startRegistration, type PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/browser";
import { Screen, BackAction } from "@/components/screen";
import { SlantButton } from "@/components/ui";

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong");
  }
  return data as T;
}

export default function TurnOnPasskey() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skip = () => router.push("/dashboard/setup-wallet");

  const turnOn = async () => {
    setLoading(true);
    setError(null);
    try {
      const options = await postJson<PublicKeyCredentialCreationOptionsJSON>(
        "/api/applock/register-options",
      );
      const response = await startRegistration({ optionsJSON: options });
      await postJson("/api/applock/register-verify", { response });
      router.push("/dashboard/setup-wallet");
    } catch (err) {
      console.warn("Turn on passkey failed:", err);
      // Nguoi dung tu huy prompt (Face ID/Touch ID/Windows Hello) - khong
      // phai loi that, cho ho thu lai hoac bam Back de bo qua, khong ep.
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Cancelled. Try again or skip for now."
          : err instanceof Error
            ? err.message
            : "Could not turn on, try again.",
      );
      setLoading(false);
    }
  };

  return (
    <Screen
      title="Turn on Passkey"
      action={
        <BackAction onBack={skip} backLabel="Skip">
          <SlantButton onClick={turnOn} disabled={loading}>
            {loading ? "Setting up..." : "Continue"}
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
      <p className="font-display text-body font-medium text-foreground text-left w-full leading-[40px]">
        So only you can access the app.
      </p>
    </Screen>
  );
}
