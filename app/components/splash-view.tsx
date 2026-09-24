/**
 * Hinh Splash - Figma "splash" (37:2): wordmark 40px o y=170 can giua + 3
 * hinh trang tri dung yen (khung xanh/vang goc duoi-trai = asset Group 28,
 * 2 o vuong xoay 60 do vien do/vang ben phai). Khung 390x844 tu cat phan tran.
 *
 * User chot 09-24b: Splash CHI hien trong luc dang tai that (khong ep hien
 * co dinh 1.6s nhu truoc) - dung lam man cho cho: "/" luc chua biet di dau,
 * app/dashboard/loading.tsx, va AppLockGate luc dang hoi / cho Passkey.
 */

import { TapTipWordmark } from "@/components/ui";

export function SplashView() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      <div
        className="absolute left-0 flex items-center justify-center"
        style={{ top: 170.32, width: 390, height: 49 }}
      >
        <TapTipWordmark fontSize={40} />
      </div>

      <div
        className="absolute flex items-center justify-center"
        style={{ left: -62.18, top: 692.74, width: 199.769, height: 199.769 }}
      >
        <div className="rotate-90">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/splash-deco.svg" alt="" width={199.769} height={199.769} className="block" />
        </div>
      </div>

      <div
        className="absolute flex items-center justify-center"
        style={{ left: 197.68, top: 519.19, width: 152.109, height: 152.109 }}
      >
        <div className="rotate-60 bg-background border-4 border-danger" style={{ width: 111.352, height: 111.352 }} />
      </div>

      <div
        className="absolute flex items-center justify-center"
        style={{ left: 218.71, top: 540.22, width: 110.054, height: 110.054 }}
      >
        <div className="rotate-60 border-4 border-primary" style={{ width: 80.565, height: 80.565 }} />
      </div>
    </div>
  );
}
