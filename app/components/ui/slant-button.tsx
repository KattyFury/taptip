/**
 * SlantButton - nut nghieng dac trung, BAN DUY NHAT trong app.
 * (Truoc 09-17 ton tai 2 ban trung ten o day va o components/screen.tsx,
 * render khac nhau va bi dung lan lon giua cac man - da gop lam mot.)
 *
 * Cac cap nhan do tu Figma:
 *   size="action" : Sora Bold 23px   - nut hang 14 (Send OTP, Done, Continue,
 *                                      Create wallet, Tap to tip) + preset Tipping
 *   size="inline" : Sora SemiBold 19px - nut giua man (o dia chi, Open Circle Faucet)
 */

import React from "react";
import { SLANT_SHAPE, SLANT_CONTENT } from "./slant";

export interface SlantButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "preset";
  size?: "action" | "inline";
  isActive?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SlantButton({
  variant = "primary",
  size = "action",
  isActive = false,
  fullWidth = true,
  className = "",
  children,
  ...props
}: SlantButtonProps) {
  let styleClasses = "";

  // Vien 1px: cac SVG goc (24:9 Send OTP, 31:110 Back, 30:72 o dia chi,
  // 31:102 preset) deu la stroke="#155EEF" KHONG co stroke-width -> mac dinh
  // 1. Ban truoc de border-2 cho tat ca.
  // Preset DANG CHON chi co fill vang, KHONG vien (SVG 31:100 khong stroke).
  if (variant === "primary") {
    styleClasses = "bg-primary text-primary-foreground shadow-btn border-0";
  } else if (variant === "outline") {
    styleClasses = "bg-background border border-brand text-brand shadow-btn";
  } else if (variant === "preset") {
    styleClasses = isActive
      ? "bg-primary text-brand shadow-btn"
      : "bg-background border border-brand text-brand shadow-btn";
  }

  const label =
    size === "action"
      ? "text-title font-bold"
      : "text-body font-semibold";

  return (
    <button
      className={
        `h-full ${fullWidth ? "w-full" : ""} ${SLANT_SHAPE} ` +
        `disabled:opacity-50 disabled:pointer-events-none ` +
        `transition-all active:scale-[0.98] ${styleClasses} ${className}`
      }
      {...props}
    >
      <span
        className={
          `flex items-center justify-center gap-2 w-full h-full font-display ${label} ` +
          `${SLANT_CONTENT} px-4 leading-none`
        }
      >
        {children}
      </span>
    </button>
  );
}
