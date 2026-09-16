/**
 * SlantButton Component
 * Dựa trên Figma Frame 1:20 (Create wallet), 1:25 (Tap to tip), 1:87 (Send OTP), 1:104 (Done / Circle Faucet)
 * - Hình dáng đặc trưng: [transform:skewX(-16deg)] rounded-[8px]
 * - Tránh méo chữ: Lớp con phản-nghiêng [transform:skewX(16deg)]
 * - Variant: "primary" (vàng chữ xanh), "outline" (trắng viền xanh), "preset" (chọn mức tip)
 */

import React from "react";

export interface SlantButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "preset";
  isActive?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SlantButton({
  variant = "primary",
  isActive = false,
  fullWidth = true,
  className = "",
  children,
  ...props
}: SlantButtonProps) {
  let styleClasses = "";

  if (variant === "primary") {
    styleClasses = "bg-primary text-primary-foreground shadow-btn border-0";
  } else if (variant === "outline") {
    styleClasses = "bg-background border-2 border-brand text-brand shadow-btn";
  } else if (variant === "preset") {
    styleClasses = isActive
      ? "bg-primary text-brand border-2 border-brand shadow-btn"
      : "bg-background border-2 border-brand text-brand shadow-btn";
  }

  return (
    <button
      className={
        `h-full ${fullWidth ? "w-full" : ""} [transform:skewX(var(--skew-angle))] ` +
        `rounded-[var(--radius-slant)] disabled:opacity-50 disabled:pointer-events-none ` +
        `transition-all active:scale-[0.98] ${styleClasses} ${className}`
      }
      {...props}
    >
      <span
        className={
          `flex items-center justify-center gap-2 w-full h-full font-display text-title font-bold ` +
          `[transform:skewX(calc(-1*var(--skew-angle)))] px-4 leading-none`
        }
      >
        {children}
      </span>
    </button>
  );
}
