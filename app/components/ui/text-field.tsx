/**
 * O nhap lieu - pill hoan toan (rounded-[50px], Figma frame "14" Sign in,
 * node 37:90 "Vector 5" - khung SVG bo tron day du tren khung cao 49px).
 * Redesign 09-24: THAY doi tu hinh chu nhat bo goc 8px cua ban 09-17 - Figma
 * moi ve pill giong het nut hanh dong, khong con la "ngoai le hinh dang".
 *
 * Placeholder mau #909090 (Figma "muted"), chu nhap Montserrat Medium 20px.
 */

import React, { forwardRef } from "react";

export const TextField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function TextField({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={
        `w-full h-full px-[33px] bg-surface rounded-full outline-none ` +
        `font-body text-body font-medium text-foreground placeholder:text-hint ${className}`
      }
      {...props}
    />
  );
});
