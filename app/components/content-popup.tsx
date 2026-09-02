"use client";

import type { ReactNode } from "react";
import * as Icon from "@/components/icons";

/**
 * 2 khuon popup dung chung theo ban ve Figma 09-02 - thay the ContentPopup
 * cu (card 3/4 man, center dung tam 50%).
 */

/**
 * CenteredCard - dung cho Scan to tip / Lich su / Nap / Rut: card trang,
 * vien den 1px, bo goc 10px (--radius-card), giu le 20px 2 ben cho thoang
 * (KHONG full-bleed) - khop voi le cua cac hang noi dung Home. Le nay da
 * co san tu px-5 cua dashboard/layout.tsx (home-root nam ben trong do),
 * nen o day chi can left-0/right-0, KHONG tu them le rieng nua keo bi le
 * kep 40px. Neo gan dinh khung (KHONG center dung 50% nhu ban cu), noi
 * dung cuon rieng neu dai hon khung.
 */
export function CenteredCard({
  open,
  onClose,
  title,
  children,
  maxHeightCqh = 68,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Chieu cao toi da cua card, don vi cqh. Tang len khi noi dung can nhieu
   * spacing hon (vd Scan to tip co them nut Custom + input). */
  maxHeightCqh?: number;
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
        style={{ top: "10.5cqh", maxHeight: `${maxHeightCqh}cqh` }}
        className="absolute left-0 right-0 z-50 flex flex-col rounded-card border border-border bg-background shadow-modal overflow-hidden"
      >
        <div className="relative shrink-0 flex items-center justify-center px-[18px] py-[14px]">
          <h2 className="text-title font-semibold text-center">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-[14px] top-1/2 -translate-y-1/2 text-danger w-6 h-6 flex items-center justify-center"
          >
            <Icon.X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

/**
 * AnchoredCard - dung cho Tip Setting: card nho, cung style vien/bo goc,
 * KHONG tu dinh vi - noi goi phai boc trong 1 the `relative` va dat class
 * dinh vi (vd `absolute bottom-full left-0 mb-2`) qua prop `className`.
 * Khong co scrim toi (Figma khong lam mo Home phia sau popup nho nay), chi
 * co lop trong suot de bam ra ngoai la dong.
 */
export function AnchoredCard({
  open,
  onClose,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={
          "absolute z-50 rounded-card border border-border bg-background shadow-modal overflow-hidden " +
          className
        }
      >
        {children}
      </div>
    </>
  );
}
