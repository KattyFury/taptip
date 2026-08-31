"use client";

import type { ReactNode } from "react";

/**
 * Khuon dung chung cho MOI popup noi dung (Tip Setting, Lich su giao dich,
 * Nap, Rut...) - khac Dialog cua shadcn: khong can giua toan man hinh, ma
 * rong co dinh = 3/4 chieu ngang khung, cao tu co theo noi dung, va TAM luon
 * thang hang voi tam hang 4 cua luoi 10 hang (top: 35% cua khung .tt-frame
 * chua no - phai la con truc tiep cua mot the co position:relative + h-full
 * bao het 10 hang, KHONG portal ra ngoai nhu Dialog).
 */
export function ContentPopup({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="absolute inset-0 z-40 bg-scrim"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{ top: "35%" }}
        className="absolute left-1/2 z-50 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background shadow-modal overflow-hidden"
      >
        {children}
      </div>
    </>
  );
}
