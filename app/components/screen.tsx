/**
 * Khung man hinh dung chung cho MOI man toan khung cua TapTip.
 *
 * Khung dien thoai CO DINH 390x844 (app/layout.tsx scale nguyen khung). Moi
 * con so o day do THANG tu Figma rLGoWK4AHhqov9CKHXJqqE (ban cap nhat
 * 09-24b, doc lai du 14 frame bang get_design_context) - KHONG suy dien:
 *
 *   Tieu de      y=49   cao 65  rong 274, can giua, chu CANH TREN (khong
 *                                can giua doc - 1 dong nam sat mep tren)
 *   Noi dung     y=170  x=25    rong 340
 *   Hang nut     y=738  cao 49.32
 *                 - co Back: Back 100 (x=25) + khe 8 + nut chinh 232 (x=133)
 *                 - nut don: rong 274, can giua (x=58)
 *   Hang phu     y=795  cao 49, rong CA KHUNG 390 ("Skip")
 *
 * Luoi 15 hang x 48.8 cu van giu (rowTop) cho vai man tu dat vi tri.
 */

import type { ReactNode } from "react";
import { BackButton } from "@/components/ui/back-button";

/* ===================== Hang so luoi (do tu Figma) ========================= */

export const FRAME_W = 390;
export const FRAME_H = 844;
export const ROW_H = 48.8;
export const ROW_GAP = 8;

/** Moc y cua hang n (n bat dau tu 1). rowTop(4) = 170.4 */
export const rowTop = (row: number) => (row - 1) * (ROW_H + ROW_GAP);
/** Chieu cao cua mot khoi chiem n hang lien tiep. rowSpan(9) = 503.2 */
export const rowSpan = (rows: number) => rows * ROW_H + (rows - 1) * ROW_GAP;

/** Vung noi dung: le 25px, rong 340 (x=25..365) */
export const CONTENT_X = 25;
export const CONTENT_W = 340;
export const CONTENT_TOP = 170;

/** Hang nut hanh dong */
export const SLANT_X = CONTENT_X;
export const SLANT_W = CONTENT_W;
export const SLANT_GAP = 8;
export const BACK_W = 100;
export const MAIN_W = 232;
export const MAIN_OFFSET = BACK_W + SLANT_GAP; // 108
export const SINGLE_W = 274;
export const ACTION_TOP = 738;
export const ACTION_H = 49.32;
export const FOOT_TOP = 795;

/** Tieu de man */
export const TITLE_TOP = 49;
export const TITLE_H = 65;
export const TITLE_W = 274;

/* ============================== Screen ==================================== */

interface ScreenProps {
  title?: ReactNode;
  children?: ReactNode;
  /** Hang nut: dung <BackAction> hoac <SingleAction> */
  action?: ReactNode;
  /** Hang phu (Skip) hoac dong bao loi - rong ca khung 390 */
  foot?: ReactNode;
  /** Moc y vung noi dung. Mac dinh 170 (Figma). */
  contentTop?: number;
}

export function Screen({
  title,
  children,
  action,
  foot,
  contentTop = CONTENT_TOP,
}: ScreenProps) {
  return (
    <div data-screen-root className="relative w-full h-full overflow-hidden">
      {title ? (
        <h1
          className="absolute left-1/2 -translate-x-1/2 font-display text-title font-bold text-foreground text-center leading-[normal]"
          style={{ top: TITLE_TOP, height: TITLE_H, width: TITLE_W }}
        >
          {title}
        </h1>
      ) : null}

      <div
        className="absolute"
        style={{
          left: CONTENT_X,
          width: CONTENT_W,
          top: contentTop,
          height: ACTION_TOP - 8 - contentTop,
        }}
      >
        {children}
      </div>

      {action ? (
        <div
          className="absolute"
          style={{ left: SLANT_X, width: SLANT_W, top: ACTION_TOP, height: ACTION_H }}
        >
          {action}
        </div>
      ) : null}

      {foot ? (
        <div
          className="absolute left-0 flex items-center justify-center"
          style={{ width: FRAME_W, top: FOOT_TOP, height: 49 }}
        >
          {foot}
        </div>
      ) : null}
    </div>
  );
}

/* ========================= Cac manh dung chung ============================ */

/** Hang nut co Back: Back 100 ben trai, nut chinh 232 ben phai, khe 8. */
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
    <div className="relative w-full h-full">
      <div className="absolute inset-y-0" style={{ left: 0, width: BACK_W }}>
        <BackButton onBack={onBack} ariaLabel={backLabel} />
      </div>
      <div className="absolute inset-y-0" style={{ left: MAIN_OFFSET, width: MAIN_W }}>
        {children}
      </div>
    </div>
  );
}

/** Nut don o hang nut: rong 274, can giua khung (x=58). */
export function SingleAction({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute inset-y-0"
      style={{ left: (CONTENT_W - SINGLE_W) / 2, width: SINGLE_W }}
    >
      {children}
    </div>
  );
}

/** Link chu o hang phu ("Skip") - Quicksand Medium 20/40, chu den. */
export function TextLink({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`font-body text-body font-medium text-foreground text-center leading-[40px] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Doan van ban noi dung - Quicksand Medium 20/40 (passkey, create-wallet, error). */
export function BodyText({ children }: { children: ReactNode }) {
  return (
    <p className="font-body text-body font-medium text-foreground leading-[40px]">
      {children}
    </p>
  );
}

/** Cham tron vang 25x25 danh so (add-home, deposit) - dung dung asset Figma. */
export function StepDot({ n }: { n: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: 25, height: 25 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/figma/step-dot.svg" alt="" width={25} height={25} className="absolute inset-0" />
      <span className="relative w-full h-full flex items-center justify-center font-display font-bold text-[19px] leading-none text-foreground">
        {n}
      </span>
    </span>
  );
}
