"use client";

/**
 * Dong bat/tat khoa cua app trong menu Home - day la noi DUY NHAT nguoi
 * dung tu quyet dinh co dung passkey hay khong (xem app-lock-gate.tsx: mac
 * dinh KHONG khoa gi ca, khong ep, khong popup chan Home). Component nay
 * tu quan ly trang thai rieng (khong chia se voi AppLockGate) - ca 2 cung
 * goi /api/applock/status khi can, trung lap nho nhung doi lai 2 component
 * doc lap voi nhau, khong can context/props xuyen qua nhieu tang.
 */

import { useEffect, useState } from "react";
import {
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/browser";
import * as Icon from "@/components/icons";

type Status = "loading" | "off" | "on" | "busy";

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

export function PasskeyMenuItem() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/applock/status")
      .then((r) => (r.ok ? (r.json() as Promise<{ hasCredential: boolean }>) : null))
      .catch(() => null)
      .then((data) => setStatus(data?.hasCredential ? "on" : "off"));
  }, []);

  const enable = async () => {
    setStatus("busy");
    setError(null);
    try {
      const options = await postJson<PublicKeyCredentialCreationOptionsJSON>(
        "/api/applock/register-options",
      );
      const response = await startRegistration({ optionsJSON: options });
      await postJson("/api/applock/register-verify", { response });
      setStatus("on");
    } catch (err) {
      console.warn("Enable passkey lock failed:", err);
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Cancelled."
          : err instanceof Error
            ? err.message
            : "Could not turn on, try again.",
      );
      setStatus("off");
    }
  };

  const disable = async () => {
    setStatus("busy");
    setError(null);
    try {
      await postJson("/api/applock/disable");
      setStatus("off");
    } catch (err) {
      console.warn("Disable passkey lock failed:", err);
      setError(err instanceof Error ? err.message : "Could not turn off, try again.");
      setStatus("on");
    }
  };

  const busy = status === "loading" || status === "busy";

  return (
    <button
      className="w-full flex items-center gap-3 text-left px-4 py-3 text-body font-semibold border-b border-border disabled:opacity-50"
      onClick={status === "on" ? disable : enable}
      disabled={busy}
    >
      <Icon.FaceId className="w-4 h-4 shrink-0" />
      <span className="flex flex-col min-w-0">
        <span className="whitespace-nowrap">
          {status === "on"
            ? "Turn off Face ID lock"
            : status === "busy"
              ? "Please wait..."
              : "Turn on Face ID lock"}
        </span>
        {error && <span className="text-small text-danger font-normal">{error}</span>}
      </span>
    </button>
  );
}
