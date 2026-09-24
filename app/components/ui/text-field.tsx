/**
 * O nhap lieu - Figma 09-24b (enter-email "Vector 5" 37:90, withdraw 45:577):
 * chu nhat bo goc 8px (KHONG con pill nhu ban 09-24 dau), nen #E4E4DB, chu
 * Quicksand Medium 20px, le trai 10px, placeholder #AEAEAE (Figma "muted").
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
        `w-full h-full px-[10px] bg-surface rounded-[8px] outline-none ` +
        `font-body text-body font-medium text-foreground placeholder:text-hint ${className}`
      }
      {...props}
    />
  );
});
