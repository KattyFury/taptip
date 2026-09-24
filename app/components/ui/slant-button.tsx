/**
 * Nut chinh (pill vang) - Figma 09-24b: nen #F5B800, vien den 1px,
 * rounded-full, chu Quicksand Bold 24px den. Disabled = opacity 0.33
 * (Figma "Send OTP" khi chua go email).
 *
 * Ten `SlantButton` la di san tu he "nut nghieng" cu (da bo) - giu ten de
 * khong phai sua hang loat import.
 */

import React from "react";

export function SlantButton({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        `h-full w-full rounded-full bg-primary text-primary-foreground border border-foreground ` +
        `disabled:opacity-[0.33] disabled:pointer-events-none ` +
        `transition-transform active:scale-[0.98] ${className}`
      }
      {...props}
    >
      <span className="flex items-center justify-center gap-2 w-full h-full font-display text-title font-bold px-4 leading-[normal]">
        {children}
      </span>
    </button>
  );
}
