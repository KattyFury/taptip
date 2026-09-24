/**
 * Bo icon TapTip - dung Tabler Icons (@tabler/icons-react, MIT license).
 * Thay the han bo icon tu ve tay 09-02 (quy luat thiet ke moi 09-12: dong bo
 * bang mot thu vien icon chuyen nghiep thay vi tu ve).
 *
 * QUY DINH: moi icon trong app phai lay tu file nay (khong import truc tiep
 * tu @tabler/icons-react o noi khac) - de doi stroke-width/size 1 cho ca app
 * chi can sua o day.
 *
 * Cach dung: <Icon.Menu className="w-6 h-6" />
 * Mau lay theo currentColor -> dat bang class text-*.
 */

import {
  IconMenu2,
  IconCopy,
  IconCheck,
  IconLoader2,
  IconAlertTriangle,
  IconFaceId,
  IconMail,
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

export const Menu = wrap(IconMenu2);
export const Copy = wrap(IconCopy);
export const Check = wrap(IconCheck);
export const Loading = wrap(IconLoader2);
export const Warning = wrap(IconAlertTriangle);
export const FaceId = wrap(IconFaceId);
export const Mail = wrap(IconMail);
