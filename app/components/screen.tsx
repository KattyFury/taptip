/**
 * Khung man hinh dung chung cho MOI man toan khung cua TapTip.
 *
 * ======================= LUOI 10 HANG (dinh nghia duy nhat) =================
 * Chieu doc chia 10 hang bang nhau, dinh = 0, day = 10:
 *
 *   0.0 -> 1.0    dem tren                     flex "1 1 0"
 *   1.0 -> 2.5    icon + tieu de (bam dinh)    flex "1.5 1 0"
 *   2.5 -> 8.0    vung noi dung (flex "5.5 1 0")
 *   8.0 -> 9.0    hang nut hanh dong           flex "1 1 0"
 *   9.0 -> 10.0   hang phu (link Skip / loi)   flex "1 1 0"
 *
 * Icon va tieu de bat dau dung tai vach 1.0. Vung noi dung co dem 0.5 hang
 * (3.2cqh spacer + 1.8cqh gap co san = 5cqh) truoc children, nen noi dung
 * that su bat dau dung tai vach 3.0 - ca hai khoi deu `justify-start`, KHONG
 * can giua.
 *
 * ======================= 3 LUAT KY THUAT BAT BUOC ===========================
 * 1. Neo theo ty le, khong hardcode pixel. Chu/icon dung `cqh` (1cqh = 1%
 *    chieu cao khung dien thoai, xem `.tt-frame` trong globals.css).
 * 2. Chia hang bang style={{ flex: "N 1 0" }}, KHONG dung class flex-[N]:
 *    Tailwind v4 trong repo nay khong build class do ra CSS. So 0 cuoi
 *    (flexBasis) bat buoc - neu chi dat flexGrow thi trinh duyet chia phan
 *    DU sau khi tru noi dung, hang co noi dung to se an sang phan hang khac.
 * 3. Khong dat padding tren phan tu hang. Padding la kich thuoc toi thieu
 *    khong co duoc -> cong them ngoai phan chia ty le, lech ca luoi. Muon
 *    khoang tho thi cho con cao theo % (nut h-[66.6%] + hang items-center).
 *
 * Hang chua nhieu nut can minWidth: 0 tren ca hang lan tung nut: mac dinh
 * flex item co min-width:auto khien hang khong co ngang duoc va tran le.
 * ============================================================================
 */

import type { ReactNode } from "react";

interface ScreenProps {
  /** Icon dau man, to 56px (6cqh), mau xanh accent */
  icon?: ReactNode;
  /** Tieu de man. Nhan ReactNode de man OTP ghep them dong email mau xanh */
  title?: ReactNode;
  /** Noi dung chinh, bat dau tu vach 3.0 */
  children?: ReactNode;
  /** Hang 8-9: nut hanh dong. Dung <SingleAction> hoac <BackAction> */
  action?: ReactNode;
  /** Hang 9-10: link phu (Skip) hoac dong bao loi */
  foot?: ReactNode;
}

export function Screen({ icon, title, children, action, foot }: ScreenProps) {
  return (
    <div data-screen-root className="flex flex-col w-full h-full">
      {/* 0.0 -> 1.0 */}
      <div style={{ flex: "1 1 0" }} />

      {/* 1.0 -> 2.5 : icon + tieu de, bam dinh vach 1.0 */}
      <div
        style={{ flex: "1.5 1 0", minHeight: 0 }}
        className="flex flex-col items-center justify-start gap-[1.2cqh] w-full max-w-[320px] mx-auto"
      >
        {icon && (
          <span className="inline-flex w-[6cqh] h-[6cqh] text-accent shrink-0">
            {icon}
          </span>
        )}
        {title && (
          <h1 className="text-title font-extrabold text-center leading-tight">
            {title}
          </h1>
        )}
      </div>

      {/* 2.5 -> 8.0 : noi dung, bam dinh vach 3.0 (dem 0.5 hang truoc noi dung) */}
      <div
        style={{ flex: "5.5 1 0", minHeight: 0 }}
        className="flex flex-col items-center justify-start gap-[1.8cqh] w-full max-w-[320px] mx-auto"
      >
        <div style={{ flexShrink: 0, height: "3.2cqh" }} />
        {children}
      </div>

      {/* 8.0 -> 9.0 : hang nut hanh dong */}
      <div
        style={{ flex: "1 1 0", minHeight: 0, minWidth: 0 }}
        className="flex items-center gap-2"
      >
        {action}
      </div>

      {/* 9.0 -> 10.0 : hang phu */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="flex items-center justify-center"
      >
        {foot}
      </div>
    </div>
  );
}

/* ========================= Cac manh dung chung ============================ */

/** Nut chinh mau vang. Cao 66.6% hang theo ban thiet ke. */
export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        "h-[66.6%] rounded-full bg-primary text-primary-foreground shadow-btn " +
        "flex items-center justify-center gap-2 text-lead font-extrabold " +
        "disabled:opacity-50 disabled:pointer-events-none " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}

/** Nut vien chi co icon - dung cho nut Quay lai o hang hanh dong. */
export function IconButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        "h-[66.6%] rounded-full border border-border shadow-btn " +
        "flex items-center justify-center " +
        "disabled:opacity-50 disabled:pointer-events-none " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}

/** Hang hanh dong chi 1 nut: rong 66.6% khung, can giua. */
export function SingleAction({ children }: { children: ReactNode }) {
  return <div className="w-2/3 mx-auto h-full flex items-center justify-center [&>button]:w-full">{children}</div>;
}

/** Hang hanh dong: nut Quay lai (1 phan) + nut chinh (2 phan). */
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
      <IconButton
        style={{ flex: "1 1 0", minWidth: 0 }}
        onClick={onBack}
        aria-label={backLabel}
      >
        <BackIcon />
      </IconButton>
      <div style={{ flex: "2 1 0", minWidth: 0 }} className="h-full flex items-center [&>button]:w-full">
        {children}
      </div>
    </>
  );
}

/** Link chu mau xanh o hang 9-10 (Skip, Skip for now). */
export function TextLink({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={"text-accent text-body font-extrabold text-center " + className}
      {...props}
    >
      {children}
    </button>
  );
}

/** O nhap lieu kieu chim (khong vien, nen xam, bong long vao trong). */
export function Field({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={
        "w-full h-[4.3cqh] min-h-[36px] rounded-xl border-0 bg-surface shadow-field " +
        "px-3 text-body text-center text-foreground placeholder:text-hint " +
        "outline-none focus:ring-2 focus:ring-primary " +
        className
      }
      {...props}
    />
  );
}

// Icon Back dung noi bo cho BackAction (tranh vong import voi icons.tsx)
function BackIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className="w-[2cqh] h-[2cqh] text-foreground"
    >
      <path
        d="M30 50L10 70L30 90M10 70H50C60 70.1428 80 66.9235 80 40.5336C80 14.1437 50 10 50 10"
        stroke="currentColor"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
