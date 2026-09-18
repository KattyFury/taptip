/**
 * Hinh dang dac trung TapTip: chu nhat NGHIENG (skewX) bo goc 8px.
 * Goc lay tu Figma (--skew-angle trong globals.css).
 *
 * Ky thuat: skew ca phan tu cha, roi counter-skew lop con ben trong de
 * chu/icon dung thang.
 *
 * KICH THUOC: o cha cua nut = HINH NHIN THAY (tinh ca phan nghieng). Nut tu
 * co lai --slant-overhang moi ben truoc khi skew, nen dat nut vao o 340px la
 * hinh binh hanh nhin thay rong dung 340px, khong loi ra ngoai. Nho vay 2 nut
 * canh nhau chi can cach o cha 8px la khe giua 2 canh nghieng cung dung 8px.
 *
 * QUY TAC BAT BUOC (da sai that 2 lan, ghi lai de khong lap): KHONG BAO GIO
 * dat nen/vien/shadow rieng len chinh phan tu mang SLANT_CONTENT. Bounding
 * box cua no la hinh CHU NHAT, khong trung voi hinh BINH HANH nhin thay,
 * nen 2 goc doi dien se loi ra ngoai net nghieng. Neu bat buoc phai co
 * (vd nen autofill cua trinh duyet), phai INSET no vao trong bang padding
 * cua CHA.
 */
export const SLANT_SHAPE =
  "[transform:skewX(var(--skew-angle))] rounded-[var(--radius-slant)] " +
  "mx-[var(--slant-overhang)] w-[calc(100%_-_2*var(--slant-overhang))]";

export const SLANT_CONTENT = "[transform:skewX(calc(-1*var(--skew-angle)))]";
