"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Cong noi dung `position: fixed` ra NGOAI `.tt-frame` (qua React Portal
 * vao `document.body`) - dung cho moi lop scrim/popup toan man hinh
 * (AppLockGate, menu Home, PickerModal...).
 *
 * Nguyen nhan bug (phan hoi that 09-24: "khi popup passkey hien len thi 2
 * ben tu dung xuat hien line xam"): `.tt-frame` (app/layout.tsx) dung
 * `transform: scale(--frame-scale)` de fit khung thiet ke 390x844 co dinh
 * vao moi kich thuoc man hinh. Theo dung spec CSS, mot ancestor co
 * `transform` se tao ra "containing block" MOI cho moi con chau
 * `position: fixed` - `inset-0` cua chung vi vay bam theo box 390x844
 * (TRUOC KHI scale) cua `.tt-frame`, KHONG PHAI viewport that cua trinh
 * duyet. Tren gan nhu moi dien thoai that (ty le man hinh hiem khi dung
 * dung 390:844), frame-scale de lai 1 khe letterbox 2 ben - khe nay binh
 * thuong vo hinh (page-backdrop ~ background, cung mau kem), nhung cac
 * lop scrim (nen den mo) khong voi toi duoc khien khe do lo ra thanh 1
 * dai mau khac tong, nhin nhu "line xam" doc 2 ben man hinh.
 *
 * Fix: render qua Portal thang vao `document.body` - ra khoi pham vi
 * transform cua `.tt-frame`, `fixed inset-0` luc nay moi thuc su bam theo
 * viewport that. Dung y het cach `<Toaster />` (app/layout.tsx) da dat
 * NGOAI `.tt-frame` trong DOM tu dau.
 *
 * Chi mount portal SAU KHI da hydrate xong (`document` chua ton tai luc
 * render tren server) - cac call site deu la overlay dieu khien boi
 * state (menu mo, popup loi...) nen 1 nhip cho nay khong anh huong UX.
 */
export function FixedOverlay({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
