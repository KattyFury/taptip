/**
 * Nut Back - pill vien den, Figma ve o vi tri cach o placeholder VUONG DEN
 * (icon chua ve that trong Figma - user xac nhan 09-24: "cac hinh vuong nho
 * trong thiet ke la placeholder cho icon, chon bo icon svg nao dep lay lam
 * chung" -> dung Tabler Icons dang co san trong components/icons.tsx, nhu
 * moi icon khac trong app).
 */


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
        `h-full w-full bg-background border border-foreground rounded-full ` +
        `disabled:opacity-[0.33] disabled:pointer-events-none ` +
        `transition-transform active:scale-[0.98] flex items-center justify-center ${className}`
      }
      {...props}
    >
      {/* Mui ten lay DUNG asset Figma (Vector 18/19/20/21 - moi man cung 1
          path), giu nguyen kich thuoc goc cua SVG 30.646x19.588. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/figma/arrow-left.svg" alt="" width={30.646} height={19.588} />
    </button>
  );
}
