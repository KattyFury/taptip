import { APPLOCK_REQUIRED_EVENT } from "@/components/app-lock-gate";

export interface SendErrorBody {
  error?: string;
  code?: "APPLOCK_REQUIRED" | "WALLET_LOCKED";
  until?: number;
}

/** Gio het khoa gui/rut, vd "Sep 25, 14:30" */
export function formatLockUntil(until: number): string {
  return new Date(until).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Doi loi tra ve tu /api/tip thanh cau hien cho nguoi dung. Phien chua mo
 * khoa Passkey -> bao AppLockGate khoa lai ngay (hien prompt Passkey).
 */
export function describeSendError(body: SendErrorBody | null, fallback: string): string {
  if (body?.code === "APPLOCK_REQUIRED") {
    window.dispatchEvent(new Event(APPLOCK_REQUIRED_EVENT));
    return "Unlock the app with your Passkey first.";
  }
  if (body?.code === "WALLET_LOCKED" && body.until) {
    return `Sending is paused until ${formatLockUntil(body.until)} (Passkey was reset).`;
  }
  return body?.error || fallback;
}
