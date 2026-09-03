"use client";

/**
 * Khoa cua app bang passkey - xac thuc lai MOI LAN mo app hoac quay lai tu
 * nen (docs/03-planning-v2.md Nhom 5, ghi no trong HANDOFF 09-02, lam theo
 * yeu cau 09-03).
 *
 * TACH BIET HOAN TOAN voi vi Circle Developer-Controlled Wallets o
 * components/send-flow.tsx: cai nay KHONG ky giao dich gi ca, Circle van tu
 * ky gui tien phia server y nguyen (toc do gui tip khong doi). Day chi la
 * mot buoc chan dat TREN Home - giong Face ID mo lai app cua nhieu vi
 * khac, muc dich la chan nguoi khac cam dien thoai da mo san lien xem duoc
 * so du/lich su, KHONG phai co che uy quyen giao dich (giao dich von da
 * khong co buoc xac nhan nao, xem send-flow.tsx).
 *
 * Trang thai KHONG luu server (khong dat cookie "da mo khoa") - unlocked
 * chi la React state cuc bo, tu mat khi tab an di (visibilitychange) hoac
 * app tai lai. Dung the moi dam bao "MOI LAN" thay vi chi 1 lan roi nho
 * trong bao lau.
 *
 * Sua theo phan hoi 09-03 (lan 3): day KHONG PHAI 1 man rieng thay the
 * Home - Home LUON duoc render (con o phia sau), khoa la 1 POPUP chan o
 * TREN dung khuon CenteredCard co san (Scan/History/Deposit/Withdraw deu
 * dung khuon nay) - lam mo Home phia sau bang scrim, dong bo voi moi popup
 * khac trong app thay vi tu dung Screen/BackAction rieng cho man nay.
 * - Luc dang tu dong thu xac thuc (prompt Face ID/Touch ID cua trinh
 *   duyet): Home van mo, KHONG hien popup rieng - trinh duyet da tu chan
 *   tuong tac roi nen khong can popup cua app chan them.
 * - That bai that (huy/loi) -> hien popup "Try again" (dung CenteredCard).
 * - Lan dau chua co passkey -> hien popup "Set up a passkey" (cung khuon).
 *
 * Sua tiep theo phan hoi 09-03 (lan 4) - phan biet ro 2 muc do "bo qua":
 * - Popup "Set up a passkey" (CHUA thiet lap gi ca): CO nut X + bam ra
 *   ngoai = "Skip for now" - bo qua LAN NAY, lan mo app ke tiep se hien
 *   lai popup nay tu dau (khong luu gi ca, khong tinh la da bo qua han).
 * - Popup "Try again" (DA thiet lap passkey - Home dang THAT SU bi khoa):
 *   KHONG the bam X/ra ngoai de lach qua (`dismissible={false}` tren
 *   CenteredCard) - chi con 2 duong: xac thuc lai thanh cong, hoac dang
 *   xuat han (nut rieng trong popup). Day moi dung nghia "khoa".
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
import { CenteredCard } from "@/components/content-popup";
import { signOutAction } from "@/app/actions";

type GateState =
  | "checking"
  | "unsupported"
  | "need-register"
  | "registering"
  | "need-auth"
  | "authenticating"
  | "unlocked"
  // Dong popup (X / bam ra ngoai): cho vao Home LAN NAY, khong huy passkey/
  // khong luu gi ca - visibilitychange van khoa lai binh thuong.
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

  // Da co passkey + dang o trang thai "need-auth" thi tu mo prompt luon,
  // khong bat nguoi dung bam them 1 nhip - trinh duyet co the chan (khong
  // co user gesture) nhung khi do chi roi ve popup "Try again" ben duoi,
  // khong loi gi ca.
  useEffect(() => {
    if (state === "need-auth" && hasCredentialRef.current && !error) {
      authenticate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state === "need-auth"]);

  // "quay lai tu nen": tab/app an di roi hien lai thi khoa lai NGAY - ke ca
  // luc dang o trang thai "skipped" (dong popup chi bo qua LAN NAY, khong
  // tat han co che nay). Khong dong khi dang o giua chung dang ky/xac thuc
  // vi se lam gian doan ceremony WebAuthn.
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

  const isRegister = state === "need-register" || state === "registering";
  // Popup chi hien khi CAN nguoi dung bam gi do: lan dau setup, hoac xac
  // thuc tu dong da that bai that su. Luc dang tu dong thu (khong loi) thi
  // KHONG popup - prompt cua trinh duyet la du, Home chi mo (xem duoi).
  const showCard = isRegister || (state === "need-auth" && !!error);
  // Home mo trong SUOT thoi gian con khoa (ke ca luc dang tu dong thu xac
  // thuc, chua bao loi) - dung y "man Home se bi lam mo" thay vi mot man
  // trang tach biet.
  const showScrim = state !== "unlocked" && state !== "skipped" && state !== "unsupported";

  return (
    <>
      {children}

      {showScrim && !showCard && (
        <div className="absolute inset-0 -mx-5 z-40 bg-scrim" aria-hidden="true" />
      )}

      <CenteredCard
        open={showCard}
        // Chi popup SETUP (lan dau) moi cho bam X/ra ngoai de bo qua - popup
        // Try again la khoa THAT SU sau khi da thiet lap passkey roi, khong
        // co duong lach qua ngoai xac thuc lai hoac dang xuat.
        dismissible={isRegister}
        onClose={() => setState("skipped")}
        title={isRegister ? "Set up a passkey" : "Try again"}
      >
        <div className="flex flex-col gap-3 p-[18px]">
          <button
            className="h-11 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50"
            onClick={isRegister ? register : authenticate}
            disabled={state === "registering"}
          >
            {isRegister ? (state === "registering" ? "Waiting..." : "Set up passkey") : "Unlock"}
          </button>
          {error && (
            <p className="text-danger text-small font-extrabold text-center">{error}</p>
          )}
          {!isRegister && (
            <button
              className="text-danger text-small font-semibold text-center"
              onClick={() => void signOutAction()}
            >
              Log out
            </button>
          )}
        </div>
      </CenteredCard>
    </>
  );
}
