/**
 * Wordmark "TapTip" (public/logo-full.svg, mau #155EEF).
 *
 * Kich thuoc lay DUNG khung Figma ve, khong tu chon:
 *   Splash (frame 1, node 18:78) : 189.926 x 57.514 @ x=100.11 y=166.13
 *   Home   (frame 5, node 29:8)  :  75.951 x 23     @ x=25    y=16
 *
 * Figma dat anh fill kin khung (inset-0 + size-full) nen o day cung set CA
 * width lan height tuyet doi - khong dung width:auto.
 */

export const LOGO_SPLASH = { width: 189.926, height: 57.514 };
export const LOGO_HOME = { width: 75.951, height: 23 };

interface TapTipLogoProps {
  width: number;
  height: number;
  className?: string;
}

export function TapTipLogo({ width, height, className = "" }: TapTipLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-full.svg"
      alt="TapTip"
      width={width}
      height={height}
      className={className}
      style={{ width, height }}
    />
  );
}
