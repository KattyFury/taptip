"use client";

/**
 * Khoa cua app bang passkey - xac thuc lai MOI LAN mo app hoac quay lai tu
 * nen (docs/03-planning-v2.md Nhom 5, ghi no trong HANDOFF 09-02, lam theo
 * yeu cau 09-03).
 *
 * TACH BIET HOAN TOAN voi vi Circle Developer-Controlled Wallets o
 * components/send-flow.tsx: cai nay KHONG ky giao dich gi ca, Circle van tu
 * ky gui tien phia server y nguyen (toc do gui tip khong doi). Day chi la
 * mot man hinh chan dat truoc Home - giong Face ID mo lai app cua nhieu vi
 * khac, muc dich la chan nguoi khac cam dien thoai da mo san lien xem duoc
 * so du/lich su, KHONG phai co che uy quyen giao dich (giao dich von da
 * khong co buoc xac nhan nao, xem send-flow.tsx).
 *
 * Trang thai KHONG luu server (khong dat cookie "da mo khoa") - unlocked
 * chi la React state cuc bo, tu mat khi tab an di (visibilitychange) hoac
 * app tai lai. Dung the moi dam bao "MOI LAN" thay vi chi 1 lan roi nho
 * trong bao lau.
 *
 * LUOI + CHU DUNG DUNG BAN "Passkey setup" trong
 * design_handoff_taptip/TapTip Design Recreation.dc.html (icon FaceID +
 * tieu de "Set up a passkey" hang 1-6, hang 9 = Back (1/3) + "Set up
 * passkey" (2/3), hang 10 = "Skip for now") - KHONG tu bia layout/chu rieng.
 * Nut Back trong ban goc la buoc lui cua wizard dang nhap (passkey tung LA
 * co che dang nhap); o day khong con "buoc truoc" nao de lui ve nen dung lai
 * dung vi tri/icon do cho hanh dong gan nghia nhat: dang xuat.
 * `TextLink` (screen.tsx) von co san dung cho "Skip for now" nay.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  startAuthentication,
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import { Screen, BackAction, PrimaryButton, TextLink } from "@/components/screen";
import * as Icon from "@/components/icons";
import { signOutAction } from "@/app/actions";

type GateState =
  | "checking"
  | "unsupported"
  | "need-register"
  | "registering"
  | "need-auth"
  | "authenticating"
  | "unlocked"
  // Bam "Skip for now": cho vao Home LAN NAY, khong huy passkey/khong luu gi
  // ca - visibilitychange van khoa lai binh thuong nhu da mo khoa that.
  | "skipped";

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

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>("checking");
  const [error, setError] = useState<string | null>(null);
  // Da tung xac dinh la CO passkey - dung de quyet dinh re-lock ve
  // "need-auth" (co the unlock lai) hay bo qua (chua tung setup thi khong
  // co gi de doi passkey khi quay lai tu nen).
  const hasCredentialRef = useRef(false);

  const authenticate = useCallback(async () => {
    setState("authenticating");
    setError(null);
    try {
      const options = await postJson<PublicKeyCredentialRequestOptionsJSON>(
        "/api/applock/auth-options",
      );
      const response = await startAuthentication({ optionsJSON: options });
      await postJson("/api/applock/auth-verify", { response });
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

  const register = useCallback(async () => {
    setState("registering");
    setError(null);
    try {
      const options = await postJson<PublicKeyCredentialCreationOptionsJSON>(
        "/api/applock/register-options",
      );
      const response = await startRegistration({ optionsJSON: options });
      await postJson("/api/applock/register-verify", { response });
      hasCredentialRef.current = true;
      setState("unlocked");
    } catch (err) {
      console.warn("App-lock registration failed:", err);
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Cancelled. Try again when you're ready."
          : err instanceof Error
            ? err.message
            : "Could not set up, try again.",
      );
      setState("need-register");
    }
  }, []);

  // Kiem tra 1 lan luc mount: thiet bi co ho tro khong, user da co passkey
  // chua. Khong co sinh trac (may ban khong Face ID/Touch ID/Windows Hello)
  // thi BO QUA khoa nay hoan toan thay vi khoa cung nguoi dung ngoai - day
  // chi la lop bao ve rieng tu (xem session van la lop bao ve chinh qua
  // httpOnly cookie o lib/auth/session.ts), khong phai bat buoc tuyet doi.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!browserSupportsWebAuthn() || !(await platformAuthenticatorIsAvailable())) {
        if (!cancelled) setState("unsupported");
        return;
      }

      const status = await fetch("/api/applock/status")
        .then((r) => (r.ok ? (r.json() as Promise<{ hasCredential: boolean }>) : null))
        .catch(() => null);

      if (cancelled) return;

      if (!status) {
        // Khong hoi duoc trang thai (mat mang...) - an toan hon la coi nhu
        // chua co passkey, van cho vao thay vi khoa cung nguoi dung that.
        setState("unsupported");
        return;
      }

      hasCredentialRef.current = status.hasCredential;
      setState(status.hasCredential ? "need-auth" : "need-register");
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Da co passkey + dang o man "need-auth" thi tu mo prompt luon, khong bat
  // nguoi dung bam them 1 nhip - trinh duyet co the chan (khong co user
  // gesture) nhung khi do chi roi ve nut bam thu cong, khong loi gi ca.
  useEffect(() => {
    if (state === "need-auth" && hasCredentialRef.current) {
      authenticate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state === "need-auth"]);

  // "quay lai tu nen": tab/app an di roi hien lai thi khoa lai NGAY - ke ca
  // luc dang o trang thai "skipped" (bam Skip chi bo qua LAN NAY, khong tat
  // han co che nay). Khong dong khi dang o man cho dang ky/xac thuc do dang
  // giua chung mot le WebAuthn, dong luc do se lam gian doan ceremony.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      setState((prev) => {
        if (prev !== "unlocked" && prev !== "skipped") return prev;
        return hasCredentialRef.current ? "need-auth" : "need-register";
      });
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  if (state === "unsupported" || state === "unlocked" || state === "skipped") {
    return <>{children}</>;
  }

  if (state === "checking") {
    return null;
  }

  const isRegister = state === "need-register" || state === "registering";
  const busy = state === "registering" || state === "authenticating";

  return (
    <Screen
      title={isRegister ? "Set up a passkey" : "Welcome back"}
      action={
        <BackAction onBack={() => void signOutAction()} backLabel="Log out">
          <PrimaryButton
            onClick={isRegister ? register : authenticate}
            disabled={busy}
          >
            {busy ? "Waiting..." : isRegister ? "Set up passkey" : "Unlock"}
          </PrimaryButton>
        </BackAction>
      }
      foot={
        error ? (
          <p className="text-danger text-small font-extrabold text-center px-4">
            {error}
          </p>
        ) : (
          <TextLink onClick={() => setState("skipped")}>Skip for now</TextLink>
        )
      }
    >
      <Icon.FaceId className="w-[14cqh] h-[14cqh] min-w-[72px] min-h-[72px] text-foreground" />
      <p className="text-body text-accent text-center">
        {isRegister
          ? "Use Face ID or Touch ID to keep TapTip locked to only you."
          : "Confirm it's you before we show your balance and history."}
      </p>
    </Screen>
  );
}
