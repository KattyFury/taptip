"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import * as Icon from "@/components/icons";
import { useBalance, BalanceProvider } from "@/contexts/balanceContext";
import { SlantButton } from "@/components/screen";
import { TapTipLogo, CutCornerCard } from "@/components/ui";
import { TipPresetsRow } from "@/components/tip-presets-row";
import { CopyButton } from "@/components/copy-button";
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

function shortenAddress(address: string): string {
  if (!address || address.length < 6) return address;
  return `0x...${address.slice(-4)}`;
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
  const [showQr, setShowQr] = useState(false);

  const hasWallet =
    !!primaryWallet.wallet_address && primaryWallet.wallet_address !== "0x0";

  const goTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  return (
    <div
      data-home-root
      className="flex flex-col justify-between items-center w-full h-full min-h-0 px-[var(--grid-margin)] pt-3 pb-3 sm:pt-4 sm:pb-4 overflow-y-auto"
    >
      {/* Header : Logo TapTip + Menu button */}
      <div className="w-full max-w-[340px] flex items-center justify-between shrink-0 h-[48px] relative">
        <TapTipLogo size="sm" />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            className="w-9 h-9 flex items-center justify-center text-brand"
          >
            <Icon.Menu className="w-6 h-6" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-max">
                <CutCornerCard variant="bordered">
                  <div className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b border-brand/30">
                    <div className="flex flex-col min-w-0">
                      <span className="font-body text-small text-accent">Account Number</span>
                      <span className="font-display text-lead font-bold text-brand truncate">
                        {shortenAddress(primaryWallet.wallet_address)}
                      </span>
                    </div>
                    <CopyButton value={primaryWallet.wallet_address} label="Copy wallet address" />
                  </div>
                  <button
                    className="w-full flex items-center gap-3 text-left px-4 py-3 font-display text-lead font-semibold text-foreground border-b border-brand/30 hover:bg-surface/30"
                    onClick={() => goTo("/dashboard/deposit")}
                  >
                    <Icon.ArrowDown className="w-5 h-5 shrink-0" />
                    Deposit
                  </button>
                  <button
                    className="w-full flex items-center gap-3 text-left px-4 py-3 font-display text-lead font-semibold text-foreground border-b border-brand/30 hover:bg-surface/30"
                    onClick={() => goTo("/dashboard/withdraw")}
                  >
                    <Icon.ArrowUp className="w-5 h-5 shrink-0" />
                    Withdraw
                  </button>
                  <button
                    className="w-full flex items-center gap-3 text-left px-4 py-3 font-display text-lead font-semibold text-foreground border-b border-brand/30 hover:bg-surface/30"
                    onClick={() => goTo("/dashboard/history")}
                  >
                    <Icon.Clock className="w-5 h-5 shrink-0" />
                    History
                  </button>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 text-left px-4 py-3 font-display text-lead font-semibold text-danger hover:bg-danger-bg/30"
                    >
                      <Icon.Logout className="w-5 h-5 shrink-0 text-danger" />
                      Log out
                    </button>
                  </form>
                </CutCornerCard>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Box : Rectangle 3 dung Figma (w=340, h=328, bg-black, border-2 border-brand)
          Mac dinh la hop den tinh chuan Figma Frame 1:25, bam vao de mo QR code nhan tien */}
      <div className="w-full max-w-[340px] aspect-[340/310] sm:aspect-[340/328] bg-black border-2 border-brand relative flex items-center justify-center shrink-0 overflow-hidden">
        {hasWallet ? (
          showQr ? (
            <div className="p-3 bg-white flex items-center justify-center rounded">
              <QRCodeSVG
                value={encodeTapTipQr(primaryWallet.wallet_address)}
                size={220}
                className="w-full h-full max-h-full"
                fgColor="#000000"
              />
            </div>
          ) : (
            <button
              onClick={() => setShowQr(true)}
              className="w-full h-full flex flex-col items-center justify-center gap-2 group text-white/50 hover:text-white/80 transition-colors"
              aria-label="Tap to view QR code"
            >
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 group-hover:scale-110 transition-transform">
                <Icon.QrCode className="w-5 h-5" />
              </div>
              <span className="font-body text-[14px] text-white/60">Tap to show QR code</span>
            </button>
          )
        ) : (
          <div className="font-body text-lead text-white/50 text-center px-4">
            Setting up your wallet...
          </div>
        )}
        {showQr && (
          <button
            onClick={() => setShowQr(false)}
            className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white rounded text-xs font-body hover:bg-black border border-white/30"
          >
            Hide QR
          </button>
        )}
      </div>

      {/* Balance & Tip amount - dung Figma:
          - Balance: Montserrat 500 20px #000000, so tien Sora 700 32px #155EEF
          - Tip amount: Montserrat 500 20px #000000 */}
      <div className="w-full max-w-[340px] flex flex-col gap-1 shrink-0 pt-1">
        <div className="flex items-baseline gap-2">
          <span className="font-body text-[20px] font-medium text-foreground">
            Balance:
          </span>
          <span className="font-display text-[32px] font-bold text-brand leading-none">
            ${formatBalance(balance.token)}
          </span>
        </div>
        <span className="font-body text-[20px] font-medium text-foreground">
          Tip amount:
        </span>
      </div>

      {/* Tip Presets Row : 33px control stack + 3 pills voi tam giac blue */}
      <div className="w-full max-w-[340px] h-[70px] shrink-0 flex items-center">
        <TipPresetsRow />
      </div>

      {/* Hint : Unlock then slide to edit, + to add value (Montserrat 500 16px #A4AFC3) */}
      <div className="w-full max-w-[340px] shrink-0">
        <span className="font-body text-[16px] font-medium text-accent">
          Unlock then slide to edit, + to add value
        </span>
      </div>

      {/* Button Tap to tip : Slant button cao dung 1 hang luoi (--grid-row-h,
          v4 09-16: ~48.8px, truoc 70px), mau vang #F5B800, chu xanh Sora 700 24px */}
      <div className="w-full max-w-[340px] h-[var(--grid-row-h)] shrink-0 flex items-center">
        <SlantButton
          className="text-title w-full h-full font-display font-bold shadow-btn"
          onClick={() => router.push("/dashboard/tip")}
        >
          Tap to tip
        </SlantButton>
      </div>

      {/* Thong bao loi so du neu co */}
      {balanceError && (
        <div className="w-full max-w-[340px] shrink-0 flex items-center justify-center min-h-[20px]">
          <p className="font-body text-small font-semibold text-danger text-center">
            {balanceError}
          </p>
        </div>
      )}
    </div>
  );
}
