/**
 * TapTip Logo Component
 * Dựa trên Figma Frame 1:10 (slash) & Frame 1:25 (home)
 * - Wordmark SVG "TapTip" màu xanh thương hiệu (#155EEF) - public/logo-full.svg
 */

interface TapTipLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const HEIGHT_BY_SIZE = { sm: 28, md: 36, lg: 48 } as const;
const LOGO_ASPECT_RATIO = 512 / 156;

export function TapTipLogo({ size = "sm", className = "" }: TapTipLogoProps) {
  const height = HEIGHT_BY_SIZE[size];
  const width = height * LOGO_ASPECT_RATIO;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-full.svg"
      alt="TapTip"
      width={width}
      height={height}
      className={className}
    />
  );
}
