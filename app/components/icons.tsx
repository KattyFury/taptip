/**
 * Bo icon TapTip - dung Tabler Icons (@tabler/icons-react, MIT license).
 * Thay the han bo icon tu ve tay 09-02 (quy luat thiet ke moi 09-12: dong bo
 * bang mot thu vien icon chuyen nghiep thay vi tu ve).
 *
 * QUY DINH: moi icon trong app phai lay tu file nay (khong import truc tiep
 * tu @tabler/icons-react o noi khac) - de doi stroke-width/size 1 cho ca app
 * chi can sua o day.
 *
 * Cach dung: <Icon.Mail className="w-6 h-6 text-accent" />
 * Mau lay theo currentColor -> dat bang class text-*.
 */

import {
  IconPlus,
  IconArrowRight,
  IconMail,
  IconUser,
  IconDice5,
  IconCoin,
  IconMenu2,
  IconAdjustmentsHorizontal,
  IconArrowLeft,
  IconCopy,
  IconDots,
  IconX,
  IconPencil,
  IconSquareX,
  IconPhoto,
  IconLoader2,
  IconCheck,
  IconArrowDown,
  IconArrowUp,
  IconClock,
  IconLogout2,
  IconAlertTriangle,
  IconLock,
  IconLockOpen,
  IconChevronUp,
  IconChevronDown,
  IconQrcode,
  type IconProps as TablerIconProps,
} from "@tabler/icons-react";

interface IconProps {
  className?: string;
}

const DEFAULT_STROKE = 2.25;

function wrap(Base: React.ComponentType<TablerIconProps>) {
  return function WrappedIcon({ className }: IconProps) {
    return <Base className={className} stroke={DEFAULT_STROKE} />;
  };
}

export const Add = wrap(IconPlus);
export const SignIn = wrap(IconArrowRight);
export const Mail = wrap(IconMail);
export const Person = wrap(IconUser);
export const Dice = wrap(IconDice5);
export const Tip = wrap(IconCoin);
export const Menu = wrap(IconMenu2);
export const Settings = wrap(IconAdjustmentsHorizontal);
export const Back = wrap(IconArrowLeft);
export const Copy = wrap(IconCopy);
export const Option = wrap(IconDots);
export const X = wrap(IconX);
export const Edit = wrap(IconPencil);
export const Cancel = wrap(IconSquareX);
export const Image = wrap(IconPhoto);
export const Loading = wrap(IconLoader2);
export const Check = wrap(IconCheck);
export const ArrowDown = wrap(IconArrowDown);
export const ArrowUp = wrap(IconArrowUp);
export const Clock = wrap(IconClock);
export const Logout = wrap(IconLogout2);
export const Warning = wrap(IconAlertTriangle);
export const Lock = wrap(IconLock);
export const LockOpen = wrap(IconLockOpen);
export const ChevronUp = wrap(IconChevronUp);
export const ChevronDown = wrap(IconChevronDown);
export const QrCode = wrap(IconQrcode);
