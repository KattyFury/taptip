/**
 * TapTip Logo Component
 * Dựa trên Figma Frame 1:10 (slash) & Frame 1:25 (home)
 * - Chữ "TapTip" font Sora Bold màu xanh thương hiệu (#155EEF)
 * - Ellipse vàng (#F5B800) đặt dưới chân chữ "pT" khi ở màn Splash
 */

interface TapTipLogoProps {
  size?: "sm" | "md" | "lg";
  withEllipse?: boolean;
  className?: string;
}

export function TapTipLogo({
  size = "sm",
  withEllipse = false,
  className = "",
}: TapTipLogoProps) {
  if (size === "lg") {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        {withEllipse && (
          <div
            className="absolute left-1/2 -translate-x-[28%] bottom-1 w-[48px] h-[13px] bg-primary rounded-[50%]"
            style={{ zIndex: 0 }}
          />
        )}
        <span
          className="relative font-display text-[48px] font-bold text-brand leading-none tracking-tight"
          style={{ zIndex: 1 }}
        >
          TapTip
        </span>
      </div>
    );
  }

  if (size === "md") {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        {withEllipse && (
          <div
            className="absolute left-1/2 -translate-x-[28%] bottom-0.5 w-[36px] h-[10px] bg-primary rounded-[50%]"
            style={{ zIndex: 0 }}
          />
        )}
        <span
          className="relative font-display text-[36px] font-bold text-brand leading-none tracking-tight"
          style={{ zIndex: 1 }}
        >
          TapTip
        </span>
      </div>
    );
  }

  return (
    <span
      className={`font-display text-[28px] font-bold text-brand leading-none tracking-tight ${className}`}
    >
      TapTip
    </span>
  );
}
