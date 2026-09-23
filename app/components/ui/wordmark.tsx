/**
 * Wordmark "TapTip.fun" - CHU THAT (khong phai anh SVG nua).
 *
 * Redesign 09-24: doi chieu nhieu frame Figma (Splash 37:2, Home
 * 37:244/261/272/310...) deu ve wordmark bang TEXT hai mau ("TapTip" den +
 * ".fun" vang #F5B800, Quicksand Bold), KHONG con la anh logo-full.svg nhu
 * ban truoc. File public/logo-full.svg + public/icon-mark.svg (user dua
 * 09-24) van giu de dung cho favicon/PWA icon/branding ben ngoai app, nhung
 * trong app tu gio dung component nay.
 */

interface TapTipWordmarkProps {
  /** px, Figma: Splash=40, Home/header=20 */
  fontSize: number;
  className?: string;
}

export function TapTipWordmark({ fontSize, className = "" }: TapTipWordmarkProps) {
  return (
    <span
      className={`font-display font-bold leading-none whitespace-nowrap ${className}`}
      style={{ fontSize }}
    >
      <span className="text-foreground">TapTip</span>
      <span className="text-primary">.fun</span>
    </span>
  );
}
