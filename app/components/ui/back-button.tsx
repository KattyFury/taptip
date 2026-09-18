/**
 * Nut Back - Figma node 31:110 / 31:108 / 31:106 / 30:95 (x=33 w=113 h=49).
 *
 * SVG goc: fill="#FFFDF5" + stroke="#155EEF" khong co stroke-width -> VIEN 1px
 * (ban truoc de border-2). Figma KHONG ve icon ben trong nut nay, nhung user
 * da xac nhan: "nut back bo icon vao nen minh k ve" -> giu tam giac xanh.
 */

import React from "react";
import { SLANT_SHAPE, SLANT_CONTENT } from "./slant";

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
        `h-full bg-background border border-brand ${SLANT_SHAPE} ` +
        `shadow-btn disabled:opacity-50 disabled:pointer-events-none ` +
        `transition-transform active:scale-[0.98] ${className}`
      }
      {...props}
    >
      <span className={`flex items-center justify-center w-full h-full ${SLANT_CONTENT}`}>
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
