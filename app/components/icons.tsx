/**
 * Bo icon TapTip - line-art 100x100 viewBox, stroke-width 10, currentColor.
 * Nguon: C:\Users\Dell\Desktop\taptip (bo rieng cho ban ve Figma 09-02),
 * du thi lay tu D:\Files\Claude\Icons (khong dung icon library).
 *
 * QUY DINH: moi icon trong app phai lay tu file nay. Khong import
 * lucide-react hay bat ky icon library nao khac - de ca app cung mot
 * net ve (do day 10, bo goc round, viewBox 100).
 *
 * Cach dung: <Icon.Mail className="w-[56px] h-[56px] text-accent" />
 * Mau lay theo currentColor -> dat bang class text-*.
 */

interface IconProps {
  className?: string;
}

// Wrapper chung: moi icon chi khac phan path ben trong
function Svg({
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

const S = {
  stroke: "currentColor",
  strokeWidth: 10,
} as const;

const SRound = {
  ...S,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Dau + trong khung - man Add to Home, dong "Enter a different amount" */
export function Add({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M90 10H10V90H90V10Z" {...S} strokeLinejoin="round" />
      <path d="M70 50L30.0098 49.9883" {...SRound} />
      <path d="M50.0049 30L49.9951 70" {...SRound} />
    </Svg>
  );
}

/** Mui ten vao khung - man dang nhap email */
export function SignIn({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M50.0015 90L90 90L90 10L50.0015 10M70 50L10 50M50.0015 70L70 50L50.0015 30"
        {...SRound}
      />
    </Svg>
  );
}

/** Phong bi - man nhap OTP */
export function Mail({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M90 20H10V80H90V20ZM10 20L50 50L90 20" {...S} strokeLinejoin="round" />
    </Svg>
  );
}

/** Avatar trong khung - man tao username */
export function Person({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="10" y="10" width="80" height="80" {...S} strokeLinejoin="round" />
      <circle cx="50" cy="40.3223" r="15" {...S} />
      <path
        d="M20 90C23.2422 78 33.7813 60 50 60C66.2187 60 76.7578 78 80 90"
        {...SRound}
      />
    </Svg>
  );
}

/** Khuon mat trong 4 goc quet - man passkey */
export function FaceId({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M30 10H10V30" {...SRound} />
      <path d="M90 30L90 10L70 10" {...SRound} />
      <path d="M70 90L90 90L90 70" {...SRound} />
      <path d="M10 70L10 90L30 90" {...SRound} />
      <path
        d="M30 65C32.0139 68.3333 38.8333 75 50 75C61.1667 75 67.9861 68.3333 70 65"
        {...SRound}
      />
      <path d="M35.0521 30V40" {...SRound} />
      <path d="M50 45V55" {...SRound} />
      <path d="M65.0098 30V40" {...SRound} />
    </Svg>
  );
}

/** Hai con xuc xac - nut Random o Home */
export function Dice({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M90 10H40V40H60V60H90V10Z" {...S} strokeLinejoin="round" />
      <circle cx="35" cy="65" r="10" transform="rotate(90 35 65)" fill="currentColor" />
      <circle cx="55" cy="25" r="5" transform="rotate(90 55 25)" fill="currentColor" />
      <circle cx="75" cy="25" r="5" transform="rotate(90 75 25)" fill="currentColor" />
      <circle cx="75" cy="45" r="5" transform="rotate(90 75 45)" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M40 40H10V90H60V60V40H40Z"
        {...S}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Dong tien - nut Tip o Home. Nguon: D:\Files\Claude\icons\tip.svg */
export function Tip({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M80 23.3333V10L64.0835 10L35.9165 10L20 10V23.3333C14.4772 23.3333 10 29.3029 10 36.6667L10 76.6667C10 84.0305 14.4772 90 20 90H80C85.5229 90 90 84.0305 90 76.6667V36.6667C90 29.3029 85.5229 23.3333 80 23.3333Z"
        {...S}
        strokeLinejoin="round"
      />
      <path
        d="M65.0889 35H42.5889C38.4467 35 35.0889 38.3579 35.0889 42.5C35.0889 46.6421 38.4467 50 42.5889 50H57.5889C61.731 50 65.0889 53.3579 65.0889 57.5C65.0889 61.6421 61.731 65 57.5889 65H35.0889"
        {...SRound}
      />
      <path d="M50 25V75" {...SRound} />
    </Svg>
  );
}

/** 5 gach ngang - mo menu tai khoan o Home */
export function Menu({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M10 90H90M90 70H10M10 50H90M90 30H10M10 10H90"
        {...S}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** 3 thanh truot - mo man Cai dat tu Menu */
export function Settings({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 25H90" {...SRound} />
      <circle cx="35" cy="25" r="8" fill="currentColor" />
      <path d="M10 50H90" {...SRound} />
      <circle cx="65" cy="50" r="8" fill="currentColor" />
      <path d="M10 75H90" {...SRound} />
      <circle cx="45" cy="75" r="8" fill="currentColor" />
    </Svg>
  );
}

/** Mui ten quay lai - nut phu hang hanh dong */
export function Back({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M30 50L10 70L30 90M10 70H50C60 70.1428 80 66.9235 80 40.5336C80 14.1437 50 10 50 10"
        {...SRound}
      />
    </Svg>
  );
}

/** Hai o vuong chong nhau - nut copy dia chi vi. Nguon: Desktop/taptip/copy.svg */
export function Copy({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 10H70V30H30V70H10V10Z" {...SRound} strokeLinejoin="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M70 30H30V70V90H90V30H70Z"
        {...SRound}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 3 cham tron - nut "Tip option" o Home va hanh dong tung dong trong Tip
 * Setting. Nguon: Desktop/taptip/option.svg */
export function Option({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="20" cy="50" r="10" fill="currentColor" />
      <circle cx="50" cy="50" r="10" fill="currentColor" />
      <circle cx="80" cy="50" r="10" fill="currentColor" />
    </Svg>
  );
}

/** Dau X don gian - dong popup card, dismiss thong bao. Khac Cancel (X trong
 * khung vuong). Nguon: Desktop/taptip/x.svg */
export function X({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 10L90 90M10 90L90 10" {...SRound} />
    </Svg>
  );
}

/** But chi - sua muc tien trong popup Tip Setting */
export function Edit({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 80L25 60L65 20C68 17 73 17 76 20L80 24C83 27 83 32 80 35L40 75L20 80Z" {...SRound} />
      <path d="M55 30L70 45" {...SRound} />
    </Svg>
  );
}

/** X trong khung - xoa muc tien, dong modal chi tiet giao dich */
export function Cancel({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M90 10H10V90H90V10Z" {...S} strokeLinejoin="round" />
      <path d="M64.1436 64.1387L35.8745 35.853" {...SRound} />
      <path d="M64.147 35.8574L35.8558 64.1348" {...SRound} />
    </Svg>
  );
}

/** Anh trong khung - nut tai anh tu thu vien */
export function Image({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="10" y="10" width="80" height="80" {...S} strokeLinejoin="round" />
      <path d="M10 90L60 50L88.7904 70" {...SRound} />
      <circle cx="35" cy="35" r="10" {...S} />
    </Svg>
  );
}

/** Dong ho cat - trang thai dang xu ly giao dich (co animate-spin) */
export function Loading({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M79.525 30C72.2523 40.4968 62.0867 50 50 50C37.9133 50 27.7477 40.4968 20.475 30H50H79.525Z"
        fill="currentColor"
      />
      <path
        d="M20.475 30C15.5651 22.9133 11.9737 15.3738 10 10H90C88.0263 15.3738 84.4349 22.9133 79.525 30C72.2523 40.4968 62.0867 50 50 50C37.9133 50 27.7477 40.4968 20.475 30ZM79.525 30H50H20.475"
        {...SRound}
      />
      <path
        d="M50 90L90 90C85.1029 76.6667 70.2469 50 50 50C29.7531 50 14.8971 76.6667 10 90L50 90ZM50 50L50 90"
        {...SRound}
      />
    </Svg>
  );
}

/** Dau tich trong vong tron - trang thai gui thanh cong */
export function Check({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M34.9183 50L49.9999 65.0078L64.9403 40.0195" {...SRound} />
      <circle cx="50" cy="50" r="40" {...S} />
    </Svg>
  );
}

/** Mui ten xuong - huy hieu giao dich NHAN trong lich su */
export function ArrowDown({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M50 10L50 90M70 70L50 90L30 70" {...SRound} />
    </Svg>
  );
}

/** Mui ten len - huy hieu giao dich GUI trong lich su */
export function ArrowUp({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M50 90L50 10M30 30L50 10L70 30" {...SRound} />
    </Svg>
  );
}

/** Dong ho - muc "Lich su giao dich" trong Menu dropdown */
export function Clock({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="50" cy="50" r="40" {...S} />
      <path d="M50 28V52L68 64" {...SRound} />
    </Svg>
  );
}

/** Mui ten ra khoi khung - muc "Dang xuat" trong Menu dropdown */
export function Logout({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M60 15H25C19.4772 15 15 19.4772 15 25V75C15 80.5228 19.4772 85 25 85H60" {...SRound} />
      <path d="M45 50H90M90 50L72 32M90 50L72 68" {...SRound} />
    </Svg>
  );
}

/** Canh bao - thong bao loi dang khoi */
export function Warning({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M10 55.0684C10 32.977 27.9086 15.0684 50 15.0684C64.8057 15.0684 77.7325 23.1123 84.6487 35.0684C88.0521 40.9518 90 47.7826 90 55.0684C90 77.1597 72.0914 95.0684 50 95.0684C27.9086 95.0684 10 77.1597 10 55.0684Z"
        {...SRound}
      />
      <path d="M50 35.0692L50 60.1016" {...SRound} />
      <circle cx="50" cy="75.0859" r="5" transform="rotate(-180 50 75.0859)" fill="currentColor" />
    </Svg>
  );
}
