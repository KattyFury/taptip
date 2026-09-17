"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import * as Icon from "@/components/icons";
import { useBalance, BalanceProvider } from "@/contexts/balanceContext";
import { SlantButton, TapTipLogo, LOGO_HOME, CutCornerCard } from "@/components/ui";
import { TipPresetsRow } from "@/components/tip-presets-row";
import { CopyButton } from "@/components/copy-button";
import { shortenAddress } from "@/lib/utils/address";
import { encodeTapTipQr } from "@/lib/utils/qr-payment";
import { signOutAction } from "@/app/actions";

interface Props {
  primaryWallet: {
    wallet_address: string;
  };
  profile: {
    id: string;
    name: string;
    daily_tip_limit: number | null;
  };
}

/** Lam tron XUONG 2 chu so thap phan - khong bao gio hien nhieu hon so that co. */
function formatBalance(token: number): string {
  if (isNaN(token) || token <= 0) return "0";
  return (Math.floor(token * 100) / 100).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}


// BalanceProvider rieng, dia chi biet san tu server (primaryWallet.wallet_address)
// - khong con phu thuoc Web3Context ket noi WebAuthn xong moi thay so du. Che
// len BalanceProvider goc o app/layout.tsx (khong dia chi, khong lam gi).
export default function HomeScreen(props: Props) {
  return (
    <BalanceProvider walletAddress={props.primaryWallet.wallet_address}>
      <HomeScreenContent {...props} />
    </BalanceProvider>
  );
}

function HomeScreenContent({ primaryWallet }: Props) {
  const router = useRouter();
  const { balance, balanceError } = useBalance();
  const [menuOpen, setMenuOpen] = useState(false);

  const hasWallet =
    !!primaryWallet.wallet_address && primaryWallet.wallet_address !== "0x0";

  const goTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const shortAddress = shortenAddress(primaryWallet.wallet_address);

  // Moi toa do duoi day do tuyet doi tu Figma frame "5" (11:207) va frame "6"
  // (29:28) bang get_design_context - xem bang so lieu trong HANDOFF 09-17.
  return (
    <div data-home-root className="relative w-full h-full overflow-hidden">
      {/* Khi menu mo, Figma frame "6" lam MO toan bo noi dung phia sau: do
          mau pixel khung QR (den dac -> #ccc9c4 tren nen cream) ra dung
          opacity 0.200. Rieng nut menu KHONG mo - Figma de no la node rieng
          (29:63) nam ngoai nhom bi mo (29:62). */}
      <div className={`absolute inset-0 ${menuOpen ? "opacity-20" : ""}`}>
        {/* Logo - node 29:8 */}
        <div className="absolute" style={{ left: 25.04, top: 16 }}>
          <TapTipLogo {...LOGO_HOME} />
        </div>

      {/* Khung QR - node 11:211: 340x333, nen den, KHONG vien, KHONG bo goc.
          Ban truoc them border-2 border-brand va mot buoc "Tap to show QR"
          ma Figma khong he ve - da bo ca hai. */}
      <div
        className="absolute bg-black overflow-hidden flex items-center justify-center"
        style={{ left: 25.04, top: 57, width: 340, height: 333 }}
      >
        {hasWallet ? (
          <QRCodeSVG
            value={encodeTapTipQr(primaryWallet.wallet_address)}
            size={313}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        ) : (
          <div className="font-body text-body text-white/50 text-center px-4">
            Setting up your wallet...
          </div>
        )}
      </div>

      {/* Hang "Balance:" + "$XXX" - node 11:213 va 11:214 NAM CUNG MOT HANG
          (ca hai top=390 h=64): nhan can trai, so tien can giua khung.
          Ban truoc xep DOC thanh 2 dong - sai han. */}
      <div className="absolute" style={{ left: 25, top: 390, width: 339.99, height: 64 }}>
        <span
          className="absolute left-0 font-body text-body font-medium text-foreground"
          style={{ top: 12, lineHeight: "40px" }}
        >
          Balance:
        </span>
        <span
          className="absolute inset-x-0 text-center font-display text-figure font-bold text-brand"
          style={{ top: 12, lineHeight: "40px" }}
        >
          ${formatBalance(balance.token)}
        </span>
      </div>

      {/* "Tip amount:" - node 11:218, dong chu sat day khung 65px (ket thuc o 511) */}
      <span
        className="absolute font-body text-body font-medium text-foreground"
        style={{ left: 25.04, top: 470.87, width: 339.96, lineHeight: "40px" }}
      >
        Tip amount:
      </span>

      {/* Hang preset - the o y=511 cao 106 (2 hang luoi), o khoa/+ o cot trai */}
      <div className="absolute" style={{ left: 25.04, top: 511, width: 340, height: 106 }}>
        <TipPresetsRow />
      </div>

      {/* Hint - node 11:219: 15px mau --hint */}
      <span
        className="absolute font-body text-small font-medium text-accent"
        style={{ left: 25.04, top: 617, width: 340.5, lineHeight: "40px" }}
      >
        Unlock then slide to edit, + to add value
      </span>

      {/* "Tap to tip" - node 29:16: x=33 w=324 y=738 h=49 */}
      <div className="absolute" style={{ left: 33.04, top: 738, width: 324, height: 49 }}>
        <SlantButton onClick={() => router.push("/dashboard/tip")}>Tap to tip</SlantButton>
      </div>

      {/* Hang 15 - node 11:212 chinh la SPEC cho dong bao loi:
          "If bug happen: make it red, this size, and understandable"
          -> Montserrat Medium 15px, mau --danger, leading 20px */}
      {balanceError && (
        <p
          className="absolute font-body text-small font-medium text-danger leading-[20px]"
          style={{ left: 25.04, top: 795, width: 340.5, height: 49 }}
        >
          {balanceError}
        </p>
      )}
      </div>

      {/* Nut menu - node 11:217/29:63: Figma ve o DAC 25.04px (placeholder),
          giu icon that ben trong theo dung chot cua user */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open menu"
        className="absolute z-50 flex items-center justify-center text-brand"
        style={{ left: 339.995, top: 12.998, width: 25.04, height: 25.04 }}
      >
        <Icon.Menu className="w-full h-full" />
      </button>

      {/* Menu - frame "6" (29:28). Figma chi ve MOT khoi chu 5 dong:
          khong icon, khong nhan "Account Number", khong duong ke phan cach.
          Card: x=88.4 y=49 w=277.5 h=240.81, vien xanh 1px, vat 29.3x46.3. */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute z-50"
            style={{ left: 88.4, top: 49, width: 277.5, height: 240.81 }}
          >
            <CutCornerCard variant="bordered" cutX={29.3} cutY={46.3}>
              <div
                className="w-full h-full flex flex-col justify-center"
                style={{ paddingLeft: 18.27 }}
              >
                {/* Figma viet literal "0xAbCd...EfGh [copy]" - "[copy]" la
                    cach user ghi tat cho "cho phep copy", user da chot dung
                    ICON thay vi in ra chu do. */}
                <div
                  className="flex items-center gap-2 font-display text-body font-semibold text-brand"
                  style={{ lineHeight: "40px" }}
                >
                  <span>{shortAddress}</span>
                  <CopyButton value={primaryWallet.wallet_address} label="Copy wallet address" />
                </div>
                <button
                  onClick={() => goTo("/dashboard/deposit")}
                  className="text-left font-display text-body font-semibold text-foreground"
                  style={{ lineHeight: "40px" }}
                >
                  Deposit
                </button>
                <button
                  onClick={() => goTo("/dashboard/withdraw")}
                  className="text-left font-display text-body font-semibold text-foreground"
                  style={{ lineHeight: "40px" }}
                >
                  Withdraw
                </button>
                <button
                  onClick={() => goTo("/dashboard/history")}
                  className="text-left font-display text-body font-semibold text-foreground"
                  style={{ lineHeight: "40px" }}
                >
                  History
                </button>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="text-left font-display text-body font-semibold text-danger"
                    style={{ lineHeight: "40px" }}
                  >
                    Log out
                  </button>
                </form>
              </div>
            </CutCornerCard>
          </div>
        </>
      )}
    </div>
  );
}
