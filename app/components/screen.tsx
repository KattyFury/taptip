/**
 * Khung man hinh dung chung cho MOI man toan khung cua TapTip.
 *
 * ======================= LUOI 10 HANG PX CO DINH (09-12) ====================
 * Khung dien thoai co dinh 390x844 (app/layout.tsx). Chia doc = CSS Grid
 * 10 hang 70px, cach nhau 16px (70*10 + 16*9 = 844px = dung chieu cao khung):
 *
 *   Hang 1        : logo + icon Menu (chi dung o Home, cac man khac de trong)
 *   Hang 2        : tieu de man
 *   Hang 3 -> 7   : vung noi dung (5 hang)
 *   Hang 8        : hang nut hanh dong
 *   Hang 9        : hang phu (link Skip / thong bao loi)
 *   Hang 10       : dem day
 *
 * Doi tu he flex ty le cqh (ban cu) sang CSS Grid px tuyet doi - dung quy
 * luat thiet ke moi: "chieu cao chia 10 hang 70px, cach nhau 16px", khong
 * con fluid theo kich thuoc man hinh (app chi chay trong khung 390x844).
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
      className="grid w-full h-full px-[25px]"
      style={{
        gridTemplateRows: "repeat(10, var(--grid-row-h))",
        rowGap: "var(--grid-row-gap)",
      }}
    >
      {/* Hang 1 trong - man toan khung khong dung logo/menu (rieng Home) */}
      <div />

      {/* Hang 2 : tieu de */}
      <div className="flex flex-col items-center justify-center w-full max-w-[340px] mx-auto">
        {title && (
          <h1 className="font-display text-title font-bold text-brand text-center leading-tight">
            {title}
          </h1>
        )}
      </div>

      {/* Hang 3 -> 7 : noi dung */}
      <div
        style={{ gridRow: "3 / 8" }}
        className={
          "flex flex-col items-center gap-6 w-full mx-auto " +
          (tightContent ? "justify-start" : "justify-start pt-2") +
          " " +
          (wideContent ? "" : "max-w-[340px]")
        }
      >
        {children}
      </div>

      {/* Hang 8 : nut hanh dong */}
      <div style={{ gridRow: "9" }} className="flex items-center gap-2 min-w-0">
        {action}
      </div>

      {/* Hang 9 : hang phu */}
      <div style={{ gridRow: "10" }} className="flex items-center justify-center">
        {foot}
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
  return <div className="w-2/3 mx-auto h-full flex items-center justify-center [&>button]:h-full">{children}</div>;
}

/** Hang hanh dong: nut Quay lai (1 phan) + nut chinh (2 phan), cach nhau 16px. */
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
    <>
      <div style={{ flex: "1 1 0", minWidth: 0 }} className="h-full">
        <IconButton onClick={onBack} aria-label={backLabel}>
          <Icon.Back className="w-6 h-6" />
        </IconButton>
      </div>
      <div style={{ flex: "2 1 0", minWidth: 0 }} className="h-full [&>button]:h-full">
        {children}
      </div>
    </>
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

/** O nhap lieu: nen xam-xanh (--surface), nghieng cung kieu voi nut. */
export function Field({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`h-[52px] w-full ${SLANT_SHAPE} bg-surface`}>
      <input
        className={
          `w-full h-full px-5 font-body text-lead text-left text-foreground placeholder:text-accent ` +
          `outline-none focus:ring-2 focus:ring-brand bg-transparent ${SLANT_CONTENT} ${className}`
        }
        {...props}
      />
    </div>
  );
}
