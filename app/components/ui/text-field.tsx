/**
 * O nhap lieu - Figma frame "3" Sign in (node 24:8).
 *
 * DO TU SVG GOC, khong doan qua anh render: path la
 *   M0 8V41C0 45.4183 3.58172 49 8 49H332C336.418 49 340 45.4183 340 41V8...
 * -> HINH CHU NHAT BO GOC 8px, 340x49. KHONG nghieng.
 *
 * Day la ngoai le duy nhat cua he thong: nut thi nghieng, nhung o nhap thi
 * thang. Ca hai ban truoc deu sai (ban cu ve parallelogram bang <svg> path
 * rieng, ban 09-17 dau tien dung skew) - deu do nhin anh render roi doan.
 *
 * Chu cach mep trai 33px (placeholder node 7:56 dat o x=58, khung o x=25).
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
        `w-full h-full pl-[33px] pr-[33px] bg-surface rounded-[8px] outline-none ` +
        `font-body text-body font-medium text-foreground placeholder:text-hint ${className}`
      }
      {...props}
    />
  );
});
