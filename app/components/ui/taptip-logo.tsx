/**
 * TapTip Logo Component
 * Dựa trên Figma Frame 1:10 (slash) & Frame 1:25 (home)
 * - Wordmark SVG "TapTip" màu xanh thương hiệu (#155EEF) - public/logo-full.svg
 * - Ellipse vàng (#F5B800) đặt dưới chân chữ "pT" khi ở màn Splash
 */

interface TapTipLogoProps {
  size?: "sm" | "md" | "lg";
  withEllipse?: boolean;
  className?: string;
}

const HEIGHT_BY_SIZE = { sm: 28, md: 36, lg: 48 } as const;
const LOGO_ASPECT_RATIO = 512 / 156;

export function TapTipLogo({
  size = "sm",
  withEllipse = false,
  className = "",
}: TapTipLogoProps) {
  const height = HEIGHT_BY_SIZE[size];
  const width = height * LOGO_ASPECT_RATIO;

  const ellipseBySize = {
    sm: null,
    md: { width: 36, height: 10, bottom: 2 },
    lg: { width: 48, height: 13, bottom: 4 },
  } as const;
  const ellipse = withEllipse ? ellipseBySize[size] : null;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {ellipse && (
        <div
          className="absolute left-1/2 -translate-x-[28%] bg-primary rounded-[50%]"
          style={{ width: ellipse.width, height: ellipse.height, bottom: ellipse.bottom, zIndex: 0 }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-full.svg"
        alt="TapTip"
        width={width}
        height={height}
        className="relative"
        style={{ zIndex: 1 }}
      />
    </div>
  );
}
