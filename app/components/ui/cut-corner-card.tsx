/**
 * CutCornerCard Component
 * Dựa trên Figma Frame 1:55 (menu), Frame 1:115 (history), Frame 1:122 (tip/camera)
 * - Khung hình chữ nhật vát chéo góc dưới-phải (68px dọc x 32px ngang)
 * - Hỗ trợ border viền xanh (dùng cho menu popup) hoặc surface/solid background
 */

import React from "react";

interface CutCornerCardProps {
  children: React.ReactNode;
  variant?: "bordered" | "solid";
  borderColor?: string;
  bgColor?: string;
  className?: string;
  containerClassName?: string;
}

export function CutCornerCard({
  children,
  variant = "solid",
  className = "",
  containerClassName = "",
}: CutCornerCardProps) {
  if (variant === "bordered") {
    return (
      <div
        className={`relative tt-card-cut bg-brand shadow-modal p-[2px] ${containerClassName}`}
      >
        <div
          className={`tt-card-cut bg-background w-full h-full ${className}`}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`tt-card-cut ${className} ${containerClassName}`}>
      {children}
    </div>
  );
}
