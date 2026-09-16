/**
 * Khung man hinh dung chung cho MOI man toan khung cua TapTip.
 *
 * ======================= LUOI 15 HANG (v2, 09-16) ===========================
 * Khung dien thoai co dinh 390x844 (app/layout.tsx). Chia doc = 15 hang
 * ~48.8px, cach nhau 8px (48.8*15 + 8*14 = 844px = dung chieu cao khung).
 * Doi tu luoi 10 hang/70px/gap16 (ban cu) theo ban ve lai moi tu Figma:
 *
 *   Hang 1        : logo + icon Menu (chi dung o Home, cac man khac de trong)
 *   Hang 2        : tieu de man
 *   Hang 3 -> 13  : vung noi dung (11 hang - truoc chi co 5, gio rong hon
 *                   han cho man nhieu thanh phan nhu Tap to tip/Tipping)
 *   Hang 14       : hang nut hanh dong
 *   Hang 15       : hang phu (link Skip / thong bao loi) - la hang CUOI,
 *                   sat day khung, khong con hang dem rieng nhu ban cu.
 *
 * Chieu cao 1 hang lay tu token --grid-row-h (globals.css), fluid theo dvh
 * chu khong con hardcode px - dung chung 1 nguon voi phan CSS con lai.
 * ============================================================================
 */

import type { ReactNode } from "react";
import * as Icon from "@/components/icons";

interface ScreenProps {
  /** Tieu de man. Nhan ReactNode de man OTP ghep them dong email mau xanh */
  title?: ReactNode;
  /** Noi dung chinh, hang 3 -> 7 */
  children?: ReactNode;
  /** Hang 8: nut hanh dong. Dung <SingleAction> hoac <BackAction> */
  action?: ReactNode;
  /** Hang 9: link phu (Skip) hoac dong bao loi */
  foot?: ReactNode;
  /** true: noi dung bam len hang 3 sat tieu de (bo khoang dem tren) */
  tightContent?: boolean;
  /** true: bo tran 340px cua vung noi dung, cho no rong het le an toan 25px */
  wideContent?: boolean;
}

export function Screen({
  title,
  children,
  action,
  foot,
  tightContent = false,
  wideContent = false,
}: ScreenProps) {
  return (
    <div
      data-screen-root
      className="flex flex-col justify-between w-full h-full min-h-0 px-[var(--grid-margin)] pt-3 pb-3 sm:pt-4 sm:pb-4"
    >
      {/* Top : tieu de (chi render khi co title) */}
      {title ? (
        <div className="flex flex-col items-center justify-center w-full max-w-[340px] mx-auto shrink-0 min-h-[48px] py-1">
          <h1 className="font-display text-title font-bold text-brand text-center leading-tight">
            {title}
          </h1>
        </div>
      ) : null}

      {/* Giua : vung noi dung cuon neu man nho / ban phim bat len */}
      <div
        className={
          "flex-1 flex flex-col items-center gap-4 w-full mx-auto min-h-0 overflow-y-auto py-2 " +
          (tightContent ? "justify-start pt-2" : "justify-center") +
          " " +
          (wideContent ? "w-full" : "max-w-[340px]")
        }
      >
        {children}
      </div>

      {/* Day : nut hanh dong (hang 14) + hang phu (hang 15, sat day khung) -
          DONG BO 100% VI TRI VA CHIEU CAO TREN MOI VIEW, ca 2 deu cao dung
          1 hang luoi (--grid-row-h) dung theo Figma (nut + link deu 49px). */}
      <div className="w-full max-w-[340px] mx-auto shrink-0 flex flex-col items-center">
        <div className="w-full h-[var(--grid-row-h)] flex items-center">
          {action}
        </div>
        <div className="w-full h-[var(--grid-row-h)] flex items-center justify-center mt-[var(--grid-row-gap)]">
          {foot}
        </div>
      </div>
    </div>
  );
}

/* ========================= Cac manh dung chung ============================ */

/** Hinh dang dac trung TapTip: chu nhat nghieng (skewX) bo goc. Dung lam nen
 * cho MOI nut + o nhap - goc nghieng lay tu Figma (atan(20.5/70) ~ 16.3deg).
 * Ky thuat: skew CA button, roi counter-skew 1 lop con ben trong de chu/icon
 * dung thang. KHONG dung rounded-full/rounded-xl thuong cho nut nua. */
export const SLANT_SHAPE = "[transform:skewX(var(--skew-angle))] rounded-[var(--radius-slant)]";
export const SLANT_CONTENT = "[transform:skewX(calc(-1*var(--skew-angle)))]";

/** Nut nghieng dung tu do (khong bat buoc chiem het 1 hang cua <Screen>) -
 * dung cho nut ben trong popup/card (Deposit, Withdraw, Tip Setting...). */
export function SlantButton({
  children,
  className = "",
  variant = "solid",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" }) {
  const base =
    variant === "solid"
      ? "bg-primary text-primary-foreground"
      : "bg-background border-2 border-brand text-brand";
  return (
    <button
      className={`shadow-btn disabled:opacity-50 disabled:pointer-events-none ${base} ${SLANT_SHAPE} ${className}`}
      {...props}
    >
      <span className={`flex items-center justify-center gap-2 w-full h-full font-display font-bold ${SLANT_CONTENT}`}>
        {children}
      </span>
    </button>
  );
}

/** Nut chinh: nen vang (--primary) + chu xanh (--primary-foreground), Sora Bold. */
export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        `h-full w-full bg-primary shadow-btn disabled:opacity-50 disabled:pointer-events-none ${SLANT_SHAPE} ${className}`
      }
      {...props}
    >
      <span
        className={`flex items-center justify-center gap-2 w-full h-full font-display text-title font-bold text-primary-foreground ${SLANT_CONTENT}`}
      >
        {children}
      </span>
    </button>
  );
}

/** Nut vien xanh, nen trong suot - dung cho nut phu (Quay lai). */
export function IconButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        `h-full w-full bg-background border-2 border-brand disabled:opacity-50 disabled:pointer-events-none ${SLANT_SHAPE} ${className}`
      }
      {...props}
    >
      <span className={`flex items-center justify-center w-full h-full text-brand ${SLANT_CONTENT}`}>
        {children}
      </span>
    </button>
  );
}

/** Hang hanh dong chi 1 nut: rong 2/3 khung, can giua. */
export function SingleAction({ children }: { children: ReactNode }) {
  return <div className="w-full h-full flex items-center justify-center [&>button]:h-full">{children}</div>;
}

import { BackButton } from "@/components/ui/back-button";

/** Hang hanh dong: nut Quay lai (1 phan) + nut chinh (2 phan), cach nhau 16px.
 * Dung nut Back nghieng kem Polygon 1 tam giac dac mau xanh dung Figma. */
export function BackAction({
  onBack,
  backLabel = "Go back",
  children,
}: {
  onBack: () => void;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 w-full h-full">
      <div style={{ flex: "1 1 0", minWidth: 0 }} className="h-full">
        <BackButton onBack={onBack} ariaLabel={backLabel} />
      </div>
      <div style={{ flex: "2 1 0", minWidth: 0 }} className="h-full [&>button]:h-full">
        {children}
      </div>
    </div>
  );
}

/** Link chu mau xanh o hang phu (Skip, Skip for now). */
export function TextLink({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`font-body text-lead font-medium text-brand text-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** O nhap lieu: nen xam-xanh (--surface), nghieng cung kieu voi nut.
 *
 * QUY TAC BAT BUOC khi dung SLANT_SHAPE/SLANT_CONTENT (dung 2 lan sai that
 * 09-13, ghi lai de khong lap): phan tu mang SLANT_CONTENT (counter-skew)
 * sau khi cong don voi SLANT_SHAPE cua cha se hien THANG (dung y), NHUNG
 * hinh CHU NHAT rieng cua no (bounding box) khong con trung khop voi hinh
 * BINH HANH nhin thay - 2 goc doi dien (vd tren-trai/duoi-phai) se LOI ra
 * ngoai net nghieng, nhin nhu 2 hinh chong nhau. KHONG BAO GIO dat nen/vien/
 * shadow rieng len chinh phan tu mang SLANT_CONTENT (tung sai 2 lan: focus
 * ring, roi mau nen autofill trinh duyet). Neu bat buoc phai co (nhu
 * autofill khong the dat noi khac), phai INSET no vao trong bang padding
 * cua CHA de o vuong con lai chac chan nam gon trong hinh binh hanh, KHONG
 * duoc phep to het canh - do la ly do co px-4 ben ngoai + px-1 ben trong
 * duoi day (tong khoang cach chu-den-canh giu nguyen 20px nhu truoc). */
export function Field({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`h-[52px] w-full px-4 ${SLANT_SHAPE} bg-surface`}>
      <input
        className={
          `w-full h-full px-1 font-body text-lead text-left text-foreground placeholder:text-accent ` +
          `outline-none bg-transparent ${SLANT_CONTENT} ${className}`
        }
        {...props}
      />
    </div>
  );
}
