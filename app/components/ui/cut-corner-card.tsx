/**
 * Khung vat cheo goc duoi-phai, 3 goc con lai bo 8px.
 *
 * Kich thuoc vat KHONG co dinh - do tu 3 SVG goc Figma moi noi mot khac
 * (xem .tt-card-cut trong globals.css), nen phai truyen cutX/cutY:
 *   menu    (11:30) cutX=29.3 cutY=46.3, co vien xanh 1px + shadow
 *   History (30:91) cutX=34.4 cutY=46.9, khong vien
 *   camera  (30:98) cutX=37   cutY=47.7, khong vien
 *
 * variant="bordered" ve vien bang KY THUAT 2 LOP long nhau (lop ngoai mau
 * vien, lop trong inset 1px mau nen): CSS `border` bi clip-path cat mat
 * theo, de lo nen trang ngay tai canh vat.
 */

import React from "react";

interface CutCornerCardProps {
  children: React.ReactNode;
  variant?: "bordered" | "solid";
  /** Be ngang vet vat, px - do tu SVG Figma cua dung khoi do */
  cutX: number;
  /** Chieu cao vet vat, px */
  cutY: number;
  className?: string;
  containerClassName?: string;
}

export function CutCornerCard({
  children,
  variant = "solid",
  cutX,
  cutY,
  className = "",
  containerClassName = "",
}: CutCornerCardProps) {
  const cut = {
    "--cut-x": `${cutX}px`,
    "--cut-y": `${cutY}px`,
  } as React.CSSProperties;

  if (variant === "bordered") {
    return (
      <div
        style={cut}
        className={`relative tt-card-cut bg-brand shadow-modal p-px ${containerClassName}`}
      >
        <div style={cut} className={`tt-card-cut bg-background w-full h-full ${className}`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div style={cut} className={`tt-card-cut ${className} ${containerClassName}`}>
      {children}
    </div>
  );
}
