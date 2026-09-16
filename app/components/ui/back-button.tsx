/**
 * BackButton Component
 * Dựa trên Figma Frame 1:87 (enter email), 1:104 (deposit), 1:115 (history), 1:122 (history)
 * - Nút nghiêng viền xanh: skewX(-16deg), border-2 border-brand, bg-background
 * - Icon: Tam giác đặc màu xanh Polygon 1 chỉ về bên trái
 */

import React from "react";

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onBack?: () => void;
  className?: string;
  ariaLabel?: string;
}

export function BackButton({
  onBack,
  className = "",
  ariaLabel = "Go back",
  ...props
}: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label={ariaLabel}
      className={
        `h-full w-full bg-background border-2 border-brand [transform:skewX(var(--skew-angle))] ` +
        `rounded-[var(--radius-slant)] shadow-btn disabled:opacity-50 disabled:pointer-events-none ` +
        `transition-transform active:scale-[0.98] ${className}`
      }
      {...props}
    >
      <span className="flex items-center justify-center w-full h-full [transform:skewX(calc(-1*var(--skew-angle)))]">
        <svg
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-brand"
        >
          <polygon points="19,4 6,12.5 19,21" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}
