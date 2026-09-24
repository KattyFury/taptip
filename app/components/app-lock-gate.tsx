"use client";

/**
 * Khoa app bang Passkey - CHI khi nguoi dung da tu bat (co credential). Mac
 * dinh khong khoa gi, Passkey la tuy chon (xem turn-on-passkey, Setting).
 *
 * Quy tac user chot 09-24b:
 *   - Boc TOAN BO /dashboard/* (app/dashboard/layout.tsx) - truoc day chi boc
 *     Home, go thang /dashboard/withdraw la rut duoc tien khong can mo khoa.
 *   - Co Passkey: hien Splash + prompt Passkey TRUOC, chua render man nao.
 *   - An xuong nen DUOI 5 phut quay lai khong khoa; tu 5 phut tro len khoa lai.
 *   - Mo khoa that bai -> popup: Unlock / "Switched devices? Reset passkey" /
 *     Log out. Reset = xoa passkey + KHOA GUI/RUT 24H (van xem, van nhan tip)
 *     - co buoc xac nhan noi ro dieu nay.
 *   - Server cung kiem tra (lib/auth/applock.ts): phien chua mo khoa thi
 *     /api/tip tra 423 APPLOCK_REQUIRED -> ban su kien "taptip-applock-required"
 *     de gate khoa lai ngay.
 *
 * TACH BIET voi vi Circle: khong ky giao dich gi ca.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { startAuthentication, type PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";
import { signOutAction } from "@/app/actions";
import { FixedOverlay, SlantButton } from "@/components/ui";
import { SplashView } from "@/components/splash-view";

type GateState = "checking" | "off" | "need-auth" | "authenticating" | "unlocked";

/** An nen duoi moc nay quay lai khong phai mo khoa lai */
const RELOCK_AFTER_MS = 5 * 60 * 1000;
export const APPLOCK_REQUIRED_EVENT = "taptip-applock-required";

/**
 * Nho trong PHIEN (bien module, song qua cac lan chuyen trang client): di
 * Home -> Deposit -> Home khong bi hoi lai / khong nhay Splash. Mat khi tai
 * lai trang.
 */
let sessionUnlocked = false;
let knownOff = false;

/** Goi sau khi vua dang ky passkey thanh cong (vua chung minh chinh chu) -
 * khoi bat mo khoa lai ngay lap tuc. */
export function markClientUnlocked() {
  sessionUnlocked = true;
  knownOff = false;
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) throw new Error(data?.error || "Something went wrong");
  return data as T;
}

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>(() =>
    sessionUnlocked ? "unlocked" : knownOff ? "off" : "checking",
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const hiddenAtRef = useRef<number | null>(null);

  const lock = useCallback(() => {
    sessionUnlocked = false;
    setError(null);
    setState("need-auth");
  }, []);

  const authenticate = useCallback(async () => {
    setState("authenticating");
    setError(null);
    try {
      const options = await postJson<PublicKeyCredentialRequestOptionsJSON>("/api/applock/auth-options");
      const response = await startAuthentication({ optionsJSON: options });
      await postJson("/api/applock/auth-verify", { response });
      sessionUnlocked = true;
      setState("unlocked");
    } catch (err) {
      console.warn("App-lock authentication failed:", err);
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Cancelled. Try again when you're ready."
          : err instanceof Error
            ? err.message
            : "Could not unlock, try again.",
      );
      setState("need-auth");
    }
  }, []);

  // Hoi trang thai 1 lan luc mount
  useEffect(() => {
    let cancelled = false;
    fetch("/api/applock/status")
      .then((r) => (r.ok ? (r.json() as Promise<{ hasCredential: boolean; unlocked: boolean }>) : null))
      .catch(() => null)
      .then((status) => {
        if (cancelled) return;
        if (!status?.hasCredential) {
          // Khong hoi duoc (mat mang) cung coi nhu off - khong khoa oan nguoi dung
          knownOff = true;
          setState("off");
          return;
        }
        knownOff = false;
        // Client nho la da mo nhung server da het han -> khoa lai
        if (sessionUnlocked && status.unlocked) setState("unlocked");
        else lock();
      });
    return () => {
      cancelled = true;
    };
  }, [lock]);

  // Tu mo prompt ngay khi can (trinh duyet co the chan vi khong co thao tac
  // nguoi dung - khi do roi ve popup "Try again", khong loi gi)
  useEffect(() => {
    if (state === "need-auth" && !error) authenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state === "need-auth"]);

  // An nen >= 5 phut -> khoa lai (ca phia server)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }
      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (hiddenAt == null || Date.now() - hiddenAt < RELOCK_AFTER_MS) return;
      setState((prev) => {
        if (prev !== "unlocked") return prev;
        fetch("/api/applock/lock", { method: "POST" }).catch(() => {});
        sessionUnlocked = false;
        return "need-auth";
      });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Server bao phien chua mo khoa (vd het 30 phut) -> khoa ngay
  useEffect(() => {
    const onRequired = () => {
      if (!knownOff) lock();
    };
    window.addEventListener(APPLOCK_REQUIRED_EVENT, onRequired);
    return () => window.removeEventListener(APPLOCK_REQUIRED_EVENT, onRequired);
  }, [lock]);

  const reset = async () => {
    setResetting(true);
    try {
      await postJson("/api/applock/reset");
      knownOff = true;
      sessionUnlocked = false;
      setConfirmReset(false);
      setState("off");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset, try again.");
      setConfirmReset(false);
    } finally {
      setResetting(false);
    }
  };

  if (state === "off" || state === "unlocked") return <>{children}</>;

  const showCard = state === "need-auth" && !!error;

  return (
    // Chua mo khoa: chi Splash phia sau, KHONG render man nao cua dashboard
    <div className="relative flex flex-col h-full">
      <SplashView />

      {showCard && (
        <FixedOverlay>
          <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
            <div className="w-full max-w-[340px] bg-background border border-foreground rounded-[8px] px-6 py-8 flex flex-col items-center gap-4">
              {confirmReset ? (
                <>
                  <h2 className="font-display text-title font-bold text-foreground">Reset Passkey?</h2>
                  <p className="font-body text-small font-medium text-secondary-text text-center leading-[24px]">
                    For your safety, <span className="font-bold text-foreground">sending and withdrawing
                    will be paused for 24 hours</span>. You can still open the app and receive tips.
                  </p>
                  <div className="w-full" style={{ height: 49.32 }}>
                    <SlantButton onClick={reset} disabled={resetting}>
                      {resetting ? "Resetting..." : "Reset Passkey"}
                    </SlantButton>
                  </div>
                  <button
                    className="font-display text-small font-semibold text-foreground text-center underline"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h2 className="font-display text-title font-bold text-foreground">Try again</h2>
                  <div className="w-full" style={{ height: 49.32 }}>
                    <SlantButton onClick={authenticate}>Unlock</SlantButton>
                  </div>
                  {error && <p className="text-danger text-small font-bold text-center">{error}</p>}
                  <button
                    className="font-display text-small font-medium text-secondary-text text-center underline"
                    onClick={() => setConfirmReset(true)}
                  >
                    Switched devices? Reset passkey
                  </button>
                  <button
                    className="font-display text-small font-semibold text-danger text-center"
                    onClick={() => void signOutAction()}
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        </FixedOverlay>
      )}
    </div>
  );
}
