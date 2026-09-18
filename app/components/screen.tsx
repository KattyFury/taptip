/**
 * Khung man hinh dung chung cho MOI man toan khung cua TapTip.
 *
 * ============ LUOI 15 HANG - PX TUYET DOI (v3, 09-17) =======================
 * Khung dien thoai CO DINH 390x844 (app/layout.tsx scale nguyen khung).
 * 15 hang x DUNG 48.8px, gap 8px  ->  48.8*15 + 8*14 = 844.
 *
 *   Hang 1   y=0      : logo + nut Menu (chi Home dung)
 *   Hang 2   y=56.8   : tieu de man (Figma dat o y=49, cao 65, rong 274)
 *   Hang 3   y=113.6  : dau vung noi dung cho man CARD (History, Tipping)
 *   Hang 4   y=170.4  : dau vung noi dung cho man CHU (Sign in, Deposit...)
 *   ...
 *   Hang 14  y=738.4  : hang nut hanh dong (cao 49)
 *   Hang 15  y=795.2  : hang phu (Skip / bao loi), sat day khung
 *
 * KHAC BIET LON SO VOI BAN TRUOC: ban truoc dung flexbox flow
 * (justify-center/gap-4) nen phan tu roi vao cho flex quyet dinh, KHONG roi
 * dung hang Figma. Gio moi slot co dinh duoc dat TUYET DOI theo dung toa do
 * do tu Figma bang get_metadata/get_design_context.
 *
 * Moi con so trong file nay deu do that tu Figma rLGoWK4AHhqov9CKHXJqqE -
 * KHONG suy dien. Xem bang so lieu day du trong HANDOFF.md muc 09-17.
 * ============================================================================
 */

import type { ReactNode } from "react";
import { BackButton } from "@/components/ui/back-button";

export { SLANT_SHAPE, SLANT_CONTENT } from "@/components/ui/slant";

/* ===================== Hang so luoi (do tu Figma) ========================= */

export const FRAME_W = 390;
export const FRAME_H = 844;
export const ROW_H = 48.8;
export const ROW_GAP = 8;

/** Moc y cua hang n (n bat dau tu 1). rowTop(4) = 170.4 */
export const rowTop = (row: number) => (row - 1) * (ROW_H + ROW_GAP);
/** Chieu cao cua mot khoi chiem n hang lien tiep. rowSpan(9) = 503.2 */
export const rowSpan = (rows: number) => rows * ROW_H + (rows - 1) * ROW_GAP;

/** Vung noi dung: le an toan 25px hai ben -> rong 340 */
export const CONTENT_X = 25;
export const CONTENT_W = 340;

/**
 * QUY LUAT NUT NGHIENG (user chot 09-18) - moi so la HINH NHIN THAY, tinh ca
 * phan nghieng (xem --slant-overhang trong components/ui/slant.ts):
 *   - Dai nut = man hinh tru le 25px hai ben -> x=25..365, rong 340.
 *   - Co Back: Back = 1/3, nut chinh = 2/3 cua (340 - 8), cach nhau 8px.
 *   - Hang 3 preset: (340 - 2*8) / 3 = 108 moi nut, cach nhau 8px.
 * Ban 09-17 lay bounding box Figma (Back 113 @33, chinh 224 @133 - CHONG
 * nhau 13px) lam be rong TRUOC skew -> nut loi ra 8.4px moi ben, Back to hon
 * ban ve va de len nut ben canh. Dung GAP that, khong chong o.
 */
export const SLANT_X = CONTENT_X;
export const SLANT_W = CONTENT_W;
export const SLANT_GAP = 8;
export const BACK_W = (SLANT_W - SLANT_GAP) / 3; // 110.67
export const MAIN_W = ((SLANT_W - SLANT_GAP) * 2) / 3; // 221.33
export const MAIN_OFFSET = BACK_W + SLANT_GAP; // 118.67

/** Tieu de man: Figma dat tuyet doi o y=49, cao 65, rong 274, can giua */
export const TITLE_TOP = 49;
export const TITLE_H = 65;
export const TITLE_W = 274;

export const ACTION_TOP = rowTop(14); // 738.4
export const FOOT_TOP = rowTop(15); // 795.2

/* ============================== Screen ==================================== */

interface ScreenProps {
  /** Tieu de man. Nhan ReactNode de man OTP ghep them dong email mau xanh */
  title?: ReactNode;
  /** Noi dung chinh, bat dau tu contentTop */
  children?: ReactNode;
  /** Hang 14: nut hanh dong. Dung <BackAction> hoac mot <SlantButton> don */
  action?: ReactNode;
  /** Hang 15: link phu (Skip) hoac dong bao loi */
  foot?: ReactNode;
  /**
   * Moc y bat dau vung noi dung. Mac dinh hang 4 (170.4) - dung cho man co
   * doan van ban. Man dung CARD lon (History, Tipping) dat hang 3 (113.6).
   */
  contentTop?: number;
}

export function Screen({
  title,
  children,
  action,
  foot,
  contentTop = rowTop(4),
}: ScreenProps) {
  return (
    <div data-screen-root className="relative w-full h-full overflow-hidden">
      {title ? (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{ top: TITLE_TOP, height: TITLE_H, width: TITLE_W }}
        >
          <h1 className="font-display text-title font-bold text-brand text-center">
            {title}
          </h1>
        </div>
      ) : null}

      {/* Vung noi dung la khoi THUONG (relative) chu khong phai flex can giua:
          moi man tu dat con cua no theo dung toa do Figma. Ban truoc dung
          flex+gap nen phan tu khong bao gio roi dung hang. */}
      <div
        className="absolute"
        style={{
          left: CONTENT_X,
          width: CONTENT_W,
          top: contentTop,
          height: ACTION_TOP - ROW_GAP - contentTop,
        }}
      >
        {children}
      </div>

      {action ? (
        <div
          className="absolute"
          style={{ left: SLANT_X, width: SLANT_W, top: ACTION_TOP, height: ROW_H }}
        >
          {action}
        </div>
      ) : null}

      {foot ? (
        <div
          className="absolute flex items-center justify-center"
          style={{ left: CONTENT_X, width: CONTENT_W, top: FOOT_TOP, height: ROW_H }}
        >
          {foot}
        </div>
      ) : null}
    </div>
  );
}

/* ========================= Cac manh dung chung ============================ */

/**
 * Hang hanh dong co nut Quay lai: Back 1/3 ben trai, nut chinh 2/3 ben
 * phai, khe 8px giua 2 canh nghieng (xem quy luat o BACK_W/MAIN_W).
 */
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
      <div
        className="absolute inset-y-0 [&>button]:h-full"
        style={{ left: MAIN_OFFSET, width: MAIN_W }}
      >
        {children}
      </div>
    </div>
  );
}

/** Link chu o hang phu (Skip). Figma ve chu DEN, khong phai xanh. */
export function TextLink({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`font-body text-body font-medium text-foreground text-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
