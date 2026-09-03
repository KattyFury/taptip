"use client";

/**
 * Khoa cua app bang passkey - xac thuc lai MOI LAN mo app hoac quay lai tu
 * nen, NHUNG CHI KHI nguoi dung DA TU BAT no (xem components/passkey-menu-
 * item.tsx trong menu Home). Mac dinh KHONG khoa gi ca - khong ep bat buoc
 * cai passkey, khong popup chan Home o lan mo dau tien. "Hoi" nguoi dung
 * bang cach dat lua chon co san trong menu, khong bang popup chan duong.
 *
 * Lich su sua trong ngay 09-03 (nhieu vong phan hoi):
 * - Ban dau: popup "Set up a passkey" ep bat buoc moi lan mo app chua co
 *   passkey. BO HAN theo phan hoi: "lua chon them hay khong la cua nguoi
 *   dung, chuyen cua app la hoi nguoi dung khi ho chua dung" - tuc la dat
 *   san lua chon (menu), khong tu y bat/chan.
 * - Con lai o day: SAU KHI da bat (co credential), Home moi thuc su bi
 *   khoa - xac thuc tu dong khi mo/quay lai tu nen, that bai that (huy/loi)
 *   moi hien popup "Try again" (CenteredCard, khong the bam ra ngoai de
 *   lach, chi con Unlock hoac Log out).
 *
 * TACH BIET HOAN TOAN voi vi Circle Developer-Controlled Wallets o
 * components/send-flow.tsx: cai nay KHONG ky giao dich gi ca, Circle van tu
 * ky gui tien phia server y nguyen (toc do gui tip khong doi).
 *
 * Trang thai KHONG luu server (khong dat cookie "da mo khoa") - unlocked
 * chi la React state cuc bo, tu mat khi tab an di (visibilitychange) hoac
 * app tai lai. Dung the moi dam bao "MOI LAN" thay vi chi 1 lan roi nho
 * trong bao lau.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { startAuthentication, type PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";
import { CenteredCard } from "@/components/content-popup";
import { signOutAction } from "@/app/actions";

type GateState =
  | "checking"
  // Chua bat khoa (khong co credential nao) - Home mo binh thuong, khong
  // popup, khong chan gi ca.
  | "off"
  | "need-auth"
  | "authenticating"
  | "unlocked";

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

  // Kiem tra 1 lan luc mount: user co bat khoa nay chua (co credential
  // khong). KHONG co thi "off" thang - khong hoi gi ca, khong popup nao.
  useEffect(() => {
    let cancelled = false;

    fetch("/api/applock/status")
      .then((r) => (r.ok ? (r.json() as Promise<{ hasCredential: boolean }>) : null))
      .catch(() => null)
      .then((status) => {
        if (cancelled) return;
        // Khong hoi duoc trang thai (mat mang...) - khong khoa cung nguoi
        // dung, coi nhu "off" cho lan nay, se thu lai o lan mo ke tiep.
        setState(status?.hasCredential ? "need-auth" : "off");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Da bat khoa + dang o trang thai "need-auth" thi tu mo prompt luon,
  // khong bat nguoi dung bam them 1 nhip - trinh duyet co the chan (khong
  // co user gesture) nhung khi do chi roi ve popup "Try again" ben duoi,
  // khong loi gi ca.
  useEffect(() => {
    if (state === "need-auth" && !error) {
      authenticate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state === "need-auth"]);

  // "quay lai tu nen": tab/app an di roi hien lai thi khoa lai NGAY - chi
  // ap dung khi da tung mo khoa that su (khong dong khi dang giua chung
  // xac thuc, se lam gian doan ceremony WebAuthn). Khong dinh gi den
  // trang thai "off" - chua bat khoa thi khong co gi de khoa lai.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      setState((prev) => (prev === "unlocked" ? "need-auth" : prev));
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Popup "Try again" chi hien khi xac thuc TU DONG da that bai that su
  // (huy/loi) - luc dang tu dong thu (chua co loi) thi KHONG popup, prompt
  // cua trinh duyet la du, Home chi mo (scrim) phia sau.
  const showCard = state === "need-auth" && !!error;
  const showScrim = state === "need-auth" || state === "authenticating";

  if (state === "checking" || state === "off" || state === "unlocked") {
    return <>{children}</>;
  }

  return (
    // Boc trong 1 lop `relative` rieng, KHONG padding - dung y het cach
    // data-home-root (home-screen.tsx) dang lam de popup cua no tu nhien co
    // le 20px 2 ben (xem ghi chu dai hon trong lich su sua doi cua file
    // nay o git log neu can, tom tat: AppLockGate boc HomeScreen NGANG
    // HANG voi px-5 cua dashboard/layout.tsx, khong phai BEN TRONG data-
    // home-root, nen left-0/right-0 tran cua CenteredCard se bo qua
    // padding neu khong co lop boc nay).
    <div className="relative flex flex-col h-full">
      {children}

      {showScrim && !showCard && (
        <div className="absolute inset-0 -mx-5 z-40 bg-scrim" aria-hidden="true" />
      )}

      <CenteredCard
        open={showCard}
        // Da bat khoa roi thi KHONG the bam X/ra ngoai de lach qua - chi
        // con 2 duong: xac thuc lai thanh cong, hoac dang xuat han.
        dismissible={false}
        onClose={() => {}}
        title="Try again"
        // Popup ngan (tieu de + 1 nut) - can giua hang 3, khong neo dinh.
        small
      >
        <div className="flex flex-col gap-3 p-[18px]">
          <button
            className="h-11 rounded-full bg-primary text-primary-foreground font-bold"
            onClick={authenticate}
          >
            Unlock
          </button>
          {error && (
            <p className="text-danger text-small font-extrabold text-center">{error}</p>
          )}
          <button
            className="text-danger text-small font-semibold text-center"
            onClick={() => void signOutAction()}
          >
            Log out
          </button>
        </div>
      </CenteredCard>
    </div>
  );
}
