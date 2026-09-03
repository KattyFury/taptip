"use client";

import type { ReactNode } from "react";
import * as Icon from "@/components/icons";

/**
 * 2 khuon popup dung chung theo ban ve Figma 09-02 - thay the ContentPopup
 * cu (card 3/4 man, center dung tam 50%).
 */

/**
 * CenteredCard - dung cho Scan to tip / Lich su / Nap / Rut / Try again /
 * Set up a passkey.
 *
 * VI TRI DOC - QUY DINH CHUNG CHO MOI POPUP (09-03), CHI 2 CHE DO, khong tu
 * chinh tay tung popup mot nua (truoc day moi popup mot kieu top/maxHeight
 * rieng, lech nhau - day chinh la thu bi bat loi):
 * - `small` (mac dinh, noi dung ngan nhu Withdraw/Deposit/Try again/Set up
 *   a passkey): can GIUA vao hang 3 cua luoi 10 hang (25cqh, transform
 *   -50%), khong neo dinh.
 * - `small={false}` (noi dung DAI, can nhieu cho hon - Scan to tip/History):
 *   trai tu dinh hang 2 (20cqh) toi day hang 7 (70cqh) = cao 50cqh co dinh.
 *   Dai hon nua thi TU cuon rieng ben trong (overflow-y-auto), khong duoc
 *   phinh cao hon vach hang 7.
 *
 * HAI LOP CO LE KHAC NHAU, dung lan:
 * - Lop scrim (lam mo phia sau): PHU TRAN ca khung dien thoai. `home-root`
 *   nam trong px-5 cua dashboard/layout.tsx nen mac dinh scrim bi thut vao
 *   20px, de lo 2 vet TRANG o mep khung - phai -mx-5 de "tra lai" 20px do.
 * - Card trang: GIU le 20px 2 ben cho thoang (dung luon le san co cua
 *   layout cha, chi can left-0/right-0 - tu them le nua la thanh 40px).
 *
 * Card vien den 1px, bo goc 10px (--radius-card).
 */
export function CenteredCard({
  open,
  onClose,
  title,
  children,
  dismissible = true,
  small = true,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** false: an nut X, bam ra ngoai khong dong duoc - dung cho popup khoa
   * that su (vd xac thuc lai passkey sau khi da thiet lap: khong duoc bam
   * ra ngoai de "lach" qua khoa, chi con lai skip o LAN DAU thiet lap la
   * co the bo qua). Mac dinh true, giu nguyen hanh vi cu cho moi popup
   * khac (Scan/History/Deposit/Withdraw). */
  dismissible?: boolean;
  /** true (mac dinh): popup NGAN, can giua hang 3. false: popup DAI (can
   * cho scroll nhu Scan to tip/History), trai tu hang 2 toi hang 7. Xem
   * ghi chu vi tri o tren. */
  small?: boolean;
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="absolute inset-0 -mx-5 z-40 bg-scrim"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        style={
          small
            ? { top: "25cqh", transform: "translateY(-50%)", maxHeight: "50cqh" }
            : { top: "20cqh", maxHeight: "50cqh" }
        }
        className="absolute left-0 right-0 z-50 flex flex-col rounded-card border border-border bg-background shadow-modal overflow-hidden"
      >
        <div className="relative shrink-0 flex items-center justify-center px-[18px] py-[14px]">
          <h2 className="text-title font-semibold text-center">{title}</h2>
          {dismissible && (
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-danger w-6 h-6 flex items-center justify-center"
            >
              <Icon.X className="w-3.5 h-3.5" />
            </button>
          )}
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
