"use client";

/**
 * Man Setting - Figma frame 28 co nhac muc "Setting" trong menu Home nhung
 * KHONG ve rieng man nay. Phan SUY RA: dung khuon Screen chung nhu Deposit/
 * History. Noi dung THAT (khong bia): bat/tat khoa cua app bang Passkey -
 * tinh nang DUY NHAT co san, hoat dong that (xem components/app-lock-gate.tsx,
 * lib/db/applock.ts). "name"/"daily_tip_limit" tung nhac trong HANDOFF 08-27
 * chua bao gio duoc port sang D1 (khong co cot nao trong migrations/) - KHONG
 * dua vao day de tranh bia field khong luu duoc gi ca.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/browser";
import { Screen, BackAction } from "@/components/screen";
import { SlantButton } from "@/components/ui";
import * as Icon from "@/components/icons";
import { markClientUnlocked } from "@/components/app-lock-gate";
import { usePrefs, type Currency } from "@/contexts/prefs-context";

type LockStatus = "loading" | "off" | "on" | "busy";

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

export default function SettingsPage() {
  const router = useRouter();
  const [lockStatus, setLockStatus] = useState<LockStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/applock/status")
      .then((r) => (r.ok ? (r.json() as Promise<{ hasCredential: boolean }>) : null))
      .catch(() => null)
      .then((data) => setLockStatus(data?.hasCredential ? "on" : "off"));
  }, []);

  const enableLock = async () => {
    setLockStatus("busy");
    setError(null);
    try {
      const options = await postJson<PublicKeyCredentialCreationOptionsJSON>(
        "/api/applock/register-options",
      );
      const response = await startRegistration({ optionsJSON: options });
      await postJson("/api/applock/register-verify", { response });
      markClientUnlocked();
      setLockStatus("on");
    } catch (err) {
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Cancelled."
          : err instanceof Error
            ? err.message
            : "Could not turn on, try again.",
      );
      setLockStatus("off");
    }
  };

  const disableLock = async () => {
    setLockStatus("busy");
    setError(null);
    try {
      await postJson("/api/applock/disable");
      setLockStatus("off");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not turn off, try again.");
      setLockStatus("on");
    }
  };

  const busy = lockStatus === "loading" || lockStatus === "busy";

  return (
    <Screen
      title="Setting"
      action={
        <BackAction>
          <SlantButton onClick={() => router.push("/dashboard")}>Done</SlantButton>
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
      {/* Figma chua ve man Setting - dung cung ngon ngu voi the xam o Home/
          History: the #E4E4DB bo 8, cao 65, pill 100x49 viền den (vang khi
          chua bat = hanh dong chinh, kem khi da bat). */}
      <div className="w-full bg-surface rounded-[8px] flex items-center justify-between" style={{ height: 65, paddingLeft: 10, paddingRight: 8 }}>
        <div className="flex items-center gap-2">
          <Icon.FaceId className="w-6 h-6 text-foreground shrink-0" />
          <span className="font-body text-body font-bold text-foreground">
            Passkey lock
          </span>
        </div>
        <button
          onClick={() => (lockStatus === "on" ? disableLock() : enableLock())}
          disabled={busy}
          className={`font-display text-small font-bold rounded-full text-foreground border border-foreground disabled:opacity-[0.33] ${
            lockStatus === "on" ? "bg-background" : "bg-primary"
          }`}
          style={{ width: 100, height: 49 }}
        >
          {lockStatus === "on" ? "Turn off" : busy ? "..." : "Turn on"}
        </button>
      </div>
      <p className="font-body text-small font-medium text-secondary-text leading-[24px] mt-2">
        Uses your device&apos;s Face ID / Touch ID / Windows Hello to lock the app -
        separate from your wallet, does not sign transactions.
      </p>

      <DailyLimitRow onError={setError} />
      <CurrencyRow onError={setError} />
    </Screen>
  );
}

/* ===================== Gioi han tip moi ngay (09-24b) ====================== */

/** Nhap so tien; de trong = khong gioi han. Luu khi roi o / bam Enter. Server
 * chan o /api/tip (chi tinh tip, khong tinh rut). */
function DailyLimitRow({ onError }: { onError: (e: string | null) => void }) {
  const { prefs, loaded, update, money } = usePrefs();
  const [draft, setDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const value = draft ?? (prefs.dailyTipLimit != null ? String(prefs.dailyTipLimit) : "");

  const save = async () => {
    if (draft == null) return;
    const trimmed = draft.trim().replace(",", ".");
    const next = trimmed === "" ? null : Number(trimmed);
    if (next !== null && (!isFinite(next) || next <= 0)) {
      onError("Daily limit must be greater than 0 (leave empty for no limit).");
      return;
    }
    try {
      await update({ dailyTipLimit: next });
      setDraft(null);
      onError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not save");
    }
  };

  return (
    <>
      <div
        className="w-full bg-surface rounded-[8px] flex items-center justify-between mt-4"
        style={{ height: 65, paddingLeft: 10, paddingRight: 8 }}
      >
        <span className="font-body text-body font-bold text-foreground">Daily tip limit</span>
        <input
          inputMode="decimal"
          placeholder="No limit"
          disabled={!loaded}
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
          className="bg-background border border-foreground rounded-full text-center font-display text-small font-bold text-foreground placeholder:text-hint outline-none"
          style={{ width: 120, height: 49 }}
        />
      </div>
      <p className="font-body text-small font-medium text-secondary-text leading-[24px] mt-2">
        {saved
          ? "Saved."
          : prefs.dailyTipLimit != null
            ? `You can tip up to ${money(prefs.dailyTipLimit)} per day. Withdrawals don't count.`
            : "No daily limit on tips. Withdrawals don't count."}
      </p>
    </>
  );
}

/* ========================= Don vi tien (09-24b) ============================ */

function CurrencyRow({ onError }: { onError: (e: string | null) => void }) {
  const { prefs, loaded, update } = usePrefs();
  const choose = async (currency: Currency) => {
    if (currency === prefs.currency) return;
    try {
      await update({ currency });
      onError(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not save");
    }
  };

  return (
    <>
      <div
        className="w-full bg-surface rounded-[8px] flex items-center justify-between mt-4"
        style={{ height: 65, paddingLeft: 10, paddingRight: 8 }}
      >
        <span className="font-body text-body font-bold text-foreground">Currency</span>
        {/* Cung kieu thanh tab Get/Send Tip: pill xam + pill vang cho muc dang chon */}
        <div className="relative flex bg-background border border-foreground rounded-full" style={{ width: 160, height: 49 }}>
          {(["USD", "USDC"] as const).map((c) => (
            <button
              key={c}
              type="button"
              disabled={!loaded}
              onClick={() => choose(c)}
              className={`flex-1 rounded-full font-display text-small font-bold ${
                prefs.currency === c ? "bg-primary text-foreground" : "text-hint"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <p className="font-body text-small font-medium text-secondary-text leading-[24px] mt-2">
        Show amounts as {prefs.currency === "USD" ? "$12" : "12 USDC"}. Your money is always USDC on Arc.
      </p>
    </>
  );
}
