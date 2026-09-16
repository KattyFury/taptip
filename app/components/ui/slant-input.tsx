/**
 * SlantInput Component
 * Dựa trên Figma Frame 1:87 (enter email) & Frame 1:96 (entered email)
 * - Ô nhập nghiêng skewX(-16deg) bo góc 8px
 * - Nền xám nhạt bg-surface (#DBDEE4), chiều cao 53px
 * - Input bên trong phản nghiêng để chữ thẳng, font Montserrat 20px
 */

import React, { forwardRef } from "react";

export interface SlantInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export const SlantInput = forwardRef<HTMLInputElement, SlantInputProps>(
  ({ containerClassName = "", className = "", ...props }, ref) => {
    return (
      <div
        className={`relative w-full max-w-[335px] h-[53px] mx-auto flex items-center ${containerClassName}`}
      >
        {/* SVG Background chuan 100% vector tu Figma */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 335 53"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.5085 5.3093C14.6457 2.12536 17.6616 0 21.0425 0H326.053C331.585 0 335.447 5.48073 333.587 10.6907L320.551 47.1907C319.414 50.3746 316.398 52.5 313.017 52.5H8.00678C2.47453 52.5 -1.38787 47.0193 0.472828 41.8093L13.5085 5.3093Z"
            fill="var(--surface, #DBDEE4)"
          />
        </svg>

        {/* Ô nhập text thẳng tự nhiên, padding-left 34px chuẩn Figma */}
        <input
          ref={ref}
          className={
            `relative z-10 w-full h-full pl-[34px] pr-6 bg-transparent outline-none ` +
            `font-body text-[20px] font-medium text-foreground placeholder:text-hint ` +
            `leading-normal ${className}`
          }
          {...props}
        />
      </div>
    );
  }
);

SlantInput.displayName = "SlantInput";
