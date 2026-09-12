"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as Icon from "@/components/icons";
import { useBalance, BalanceProvider } from "@/contexts/balanceContext";
import SendFlow from "@/components/send-flow";
import { CenteredCard, AnchoredCard } from "@/components/content-popup";
import { SlantButton } from "@/components/screen";
import { TipSettingPopup } from "@/components/tip-setting-popup";
import { HistoryPopup } from "@/components/history-popup";
import { CopyButton } from "@/components/copy-button";
import { encodeTapTipQr } from "@/lib/utils/qr-payment";
import { signOutAction } from "@/app/actions";

const CIRCLE_FAUCET_URL = "https://faucet.circle.com/";

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

/** Toi da 3 thong bao dismiss-duoc o hang 8. Chua co nguon du lieu that
 * nao nuoi tinh nang nay - de mang rong, chi dung khuon san cho sau nay. */
interface Announcement {
  id: string;
  text: string;
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

type PopupKind = "tipSetting" | "history" | "deposit" | "withdraw" | null;

function HomeScreenContent({ primaryWallet }: Props) {
  const { balance, balanceError } = useBalance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [popup, setPopup] = useState<PopupKind>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const hasWallet =
    !!primaryWallet.wallet_address && primaryWallet.wallet_address !== "0x0";

  const openFromMenu = (kind: PopupKind) => {
    setMenuOpen(false);
    setPopup(kind);
  };

  const dismissAnnouncement = (id: string) => {
    setAnnouncements((list) => list.filter((a) => a.id !== id));
  };

  return (
    // LUOI 10 HANG PX CO DINH (Figma "Taptip" 09-12, khung 390x844):
    //  1 : wordmark "TapTip" (chu, khong con anh logo) + icon Menu
    //  2-5 : QR to (4 hang, dung khop khoi QR trong Figma)
    //  6 : "Balance: $XXX"
    //  7 : canh bao mang + dia chi rut gon [copy]
    //  8 : toi da 3 thong bao co the dismiss
    //  9 : nut Option (1/3) + Tap to Tip (2/3), deu hinh nghieng
    //  10 : cho bao loi so du
    <div
      data-home-root
      className="relative grid w-full h-full px-[25px]"
      style={{ gridTemplateRows: "repeat(10, var(--grid-row-h))", rowGap: "var(--grid-row-gap)" }}
    >
      {/* Hang 1 */}
      <div className="relative flex items-center justify-between">
        <span className="font-display text-[28px] font-bold text-brand leading-none">TapTip</span>
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
              {/* Card cat goc dac trung (tt-card-cut), khop kieu Figma
                  "Rectangle 15" (menu popup neo tu icon Menu). */}
              <div className="absolute right-0 top-full z-50 mt-2 w-max tt-card-cut border-2 border-brand bg-background shadow-modal overflow-hidden">
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
                className="w-full flex items-center gap-3 text-left px-4 py-3 font-display text-lead font-semibold text-foreground border-b border-brand/30"
                onClick={() => openFromMenu("deposit")}
              >
                <Icon.ArrowDown className="w-5 h-5 shrink-0" />
                Deposit
              </button>
              <button
                className="w-full flex items-center gap-3 text-left px-4 py-3 font-display text-lead font-semibold text-foreground border-b border-brand/30"
                onClick={() => openFromMenu("withdraw")}
              >
                <Icon.ArrowUp className="w-5 h-5 shrink-0" />
                Withdraw
              </button>
              <button
                className="w-full flex items-center gap-3 text-left px-4 py-3 font-display text-lead font-semibold text-foreground border-b border-brand/30"
                onClick={() => openFromMenu("history")}
              >
                <Icon.Clock className="w-5 h-5 shrink-0" />
                History
              </button>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 text-left px-4 py-3 font-display text-lead font-semibold text-danger"
                >
                  <Icon.Logout className="w-5 h-5 shrink-0 text-danger" />
                  Log out
                </button>
              </form>
            </div>
          </>
        )}
        </div>
      </div>

      {/* Hang 2-5 : QR to, 4 hang dung (2 * 70 + 3*16... = 4 hang = 328px,
          khop dung khoi "Rectangle 3" trong Figma). KHONG nghieng khung nay -
          QR phai vuong that de quet duoc. */}
      <div style={{ gridRow: "2 / 6" }} className="flex items-center justify-center">
        {hasWallet ? (
          <div className="h-full aspect-square max-w-full p-4 bg-background border-2 border-brand rounded-[var(--radius-slant)] flex items-center justify-center">
            <QRCodeSVG
              value={encodeTapTipQr(primaryWallet.wallet_address)}
              size={260}
              className="w-full h-full"
              fgColor="#000000"
            />
          </div>
        ) : (
          <div className="h-full aspect-square max-w-full flex items-center justify-center border-2 border-brand rounded-[var(--radius-slant)] font-body text-lead text-accent text-center px-4">
            Setting up your wallet...
          </div>
        )}
      </div>

      {/* Hang 6 : Balance - 1 dong, nhan den + so tien xanh Sora Bold (khop
          bo cuc Figma "Balance: $XXX" nam ngang, khong xep doc nhu ban cu). */}
      <div className="flex items-center gap-2">
        <span className="font-body text-lead text-foreground">Balance:</span>
        <span className="font-display text-figure font-bold text-brand leading-none">
          ${formatBalance(balance.token)}
        </span>
        <span className="font-body text-small text-accent">
          ({formatBalance(balance.token)} USDC)
        </span>
      </div>

      {/* Hang 7 : canh bao mang + dia chi rut gon */}
      <div className="flex flex-col justify-center gap-1">
        <span className="font-body text-small font-semibold text-danger">
          Current available network: Arc Testnet
        </span>
        <div className="flex items-center gap-2">
          <span className="font-body text-small font-semibold text-accent">
            Account Number: {shortenAddress(primaryWallet.wallet_address)}
          </span>
          <CopyButton value={primaryWallet.wallet_address} label="Copy wallet address" />
        </div>
      </div>

      {/* Hang 8 : toi da 3 thong bao, an han neu rong */}
      <div className="flex flex-col justify-center gap-2">
        {announcements.slice(0, 3).map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-3 bg-surface rounded-[var(--radius-slant)] pl-4 pr-3 py-2"
          >
            <span className="font-body text-small text-foreground truncate">{a.text}</span>
            <button
              onClick={() => dismissAnnouncement(a.id)}
              aria-label="Dismiss"
              className="text-danger shrink-0 w-4 h-4 flex items-center justify-center"
            >
              <Icon.X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Hang 9 : nut Option (1/3) + Tap to Tip (2/3), hinh nghieng dac trung.
          `relative` de neo AnchoredCard (Tip Setting) ngay phia tren nut Option. */}
      <div className="relative flex items-center gap-3 min-w-0">
        <SlantButton
          style={{ flex: "1 1 0", minWidth: 0, height: "70px" }}
          onClick={() => setPopup((p) => (p === "tipSetting" ? null : "tipSetting"))}
          aria-label="Tip options"
        >
          <Icon.Option className="w-5 h-5" />
        </SlantButton>
        <SlantButton
          style={{ flex: "2 1 0", minWidth: 0, height: "70px" }}
          className="text-title"
          onClick={() => setSendOpen(true)}
        >
          Tap to Tip
        </SlantButton>

        <AnchoredCard
          open={popup === "tipSetting"}
          onClose={() => setPopup(null)}
          className="bottom-full left-0 mb-2 w-[62%] min-w-[220px]"
        >
          <TipSettingPopup onClose={() => setPopup(null)} />
        </AnchoredCard>
      </div>

      {/* Hang 10 : cho bao loi so du */}
      <div className="flex items-center justify-center">
        {balanceError && (
          <p className="font-body text-small font-semibold text-danger text-center">
            {balanceError}
          </p>
        )}
      </div>

      <SendFlow open={sendOpen} onOpenChange={setSendOpen} />

      <HistoryPopup open={popup === "history"} onClose={() => setPopup(null)} />

      <CenteredCard open={popup === "deposit"} onClose={() => setPopup(null)} title="Deposit">
        <div className="flex flex-col gap-4 p-6">
          <p className="font-body text-lead text-accent">
            Send USDC (Arc network) to your wallet address below, or use the Circle Faucet for testnet funds.
          </p>
          <div className="flex items-center gap-2 bg-surface rounded-[var(--radius-slant)] p-3">
            <code className="font-body text-small font-mono break-all flex-1">
              {primaryWallet.wallet_address}
            </code>
            <CopyButton value={primaryWallet.wallet_address} label="Copy wallet address" />
          </div>
          <SlantButton
            style={{ height: "56px" }}
            onClick={() => window.open(CIRCLE_FAUCET_URL, "_blank", "noopener,noreferrer")}
          >
            Open Circle Faucet
          </SlantButton>
        </div>
      </CenteredCard>

      <CenteredCard open={popup === "withdraw"} onClose={() => setPopup(null)} title="Withdraw">
        <div className="flex flex-col gap-4 p-6">
          <p className="font-body text-lead text-accent">
            Withdrawals aren&apos;t available yet during the testnet phase.
          </p>
          <SlantButton style={{ height: "56px" }} onClick={() => setPopup(null)}>
            Got it
          </SlantButton>
        </div>
      </CenteredCard>
    </div>
  );
}
