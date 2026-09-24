/**
 * Nut pill (bo tron hoan toan) - THAY THE HOAN TOAN he "nut nghieng" cu.
 *
 * Redesign 09-24 theo Figma ban moi user dua truc tiep (rLGoWK4AHhqov9CKHXJqqE,
 * "Figma la nguon su that", user chot: "lam giong Figma 100% thi lam"). Doi
 * chieu nhieu frame (Sign in 37:85, OTP 37:190, Home 37:244...) deu ra dung
 * `rounded-[50px]` (= pill hoan toan voi moi chieu cao dung trong app nay,
 * dung thang rounded-full) - khong con hinh binh hanh nghieng nua.
 *
 * GIU NGUYEN TEN COMPONENT `SlantButton` (dung sai ten so voi hinh dang that
 * bay gio) de KHONG phai doi import o 13 file dang dung no - day la lua chon
 * co chu dich, danh doi 1 cai ten hoi sai lay it rui ro sua nham khi doi
 * hang loat call site. Neu sau nay don dep, doi ten thanh PillButton va
 * chay tim-thay-thay the dong loat.
 *
 * Cap nhan do tu Figma:
 *   size="action" : Quicksand Bold 24px - nut hang 14 (Send OTP, Done,
 *                    Continue, Create wallet)
 *   size="inline" : Quicksand SemiBold 20px - nut giua man
 */

import React from "react";

export interface SlantButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "preset";
  size?: "action" | "inline";
  isActive?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SlantButton({
  variant = "primary",
  size = "action",
  isActive = false,
  className = "",
  children,
  ...props
}: SlantButtonProps) {
  let styleClasses = "";

  // Mau lay THANG tu get_design_context, khong doan:
  //   primary: bg #F5B800, chu DEN (truoc la xanh 155eef)
  //   outline: bg kem (--background), vien DEN 1px, chu DEN (truoc la brand)
  // Disabled: Figma dung opacity 0.33 (khong phai 0.5 nhu ban cu) - xem man
  // Sign in luc chua go email, nut "Send OTP" mo dung muc nay.
  if (variant === "primary") {
    // 09-24b: Figma ve nut vang CO vien den 1px (enter-otp 37:195, deposit 45:566...)
    styleClasses = "bg-primary text-primary-foreground border border-foreground";
  } else if (variant === "outline") {
    styleClasses = "bg-background border border-foreground text-foreground";
  } else if (variant === "preset") {
    styleClasses = isActive
      ? "bg-primary text-foreground border border-foreground"
      : "bg-background border border-foreground text-foreground";
  }

  const label = size === "action" ? "text-title font-bold" : "text-body font-semibold";

  return (
    <button
      className={
        `h-full w-full rounded-full ` +
        `disabled:opacity-[0.33] disabled:pointer-events-none ` +
        `transition-transform active:scale-[0.98] ${styleClasses} ${className}`
      }
      {...props}
    >
      <span
        className={`flex items-center justify-center gap-2 w-full h-full font-display ${label} px-4 leading-[normal]`}
      >
        {children}
      </span>
    </button>
  );
}
