"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as Icon from "@/components/icons";
import { useBalance, BalanceProvider } from "@/contexts/balanceContext";
import SendFlow from "@/components/send-flow";
import { CenteredCard, AnchoredCard } from "@/components/content-popup";
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

/** Toi da 3 thong bao dismiss-duoc o hang 7-8. Chua co nguon du lieu that
 * nao nuoi tinh nang nay - de mang rong, chi dung khuon san cho sau nay. */
interface Announcement {
  id: string;
  text: string;
}

function formatBalance(token: number): number {
  if (isNaN(token)) return 0;
  return Math.max(0, Math.floor(token));
}

function shortenAddress(address: string): string {
  if (!address || address.length < 8) return address;
  return `0x_${address.slice(-5)}`;
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
  const { balance } = useBalance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [popup, setPopup] = useState<PopupKind>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(false);
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
    // KHONG dat padding doc o day - luoi 10 hang phai neo dung dinh 0 / day 10.
    <div data-home-root className="relative flex flex-col h-full">
      {/* ================== LUOI 10 HANG MAN HOME (Figma taptip-home 09-02) ===
          1 : logo (trai) + icon Menu (phai)
          2 : "Balance" + so du lon, xep doc
          3-6 : QR to full + dia chi rut gon [copy]
          7-8 : toi da 3 thong bao co the dismiss
          9 : nut Option (1/3) + Tip (2/3)
          ==================================================================== */}

      {/* Hang 1 */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="relative flex items-center justify-between px-5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-full.svg" alt="TapTip" className="h-[3.7cqh] w-auto" />
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open menu"
          className="w-[6cqh] h-[6cqh] min-w-[38px] min-h-[38px] flex items-center justify-center"
        >
          <Icon.Menu className="w-[3.2cqh] h-[3.2cqh] min-w-[18px] min-h-[18px] text-foreground" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-5 top-full z-50 mt-1.5 w-[210px] rounded-card border border-border bg-background shadow-modal overflow-hidden">
              <button
                className="w-full flex items-center gap-3 text-left px-4 py-3 text-body font-semibold border-b border-border"
                onClick={() => openFromMenu("deposit")}
              >
                <Icon.ArrowDown className="w-4 h-4 shrink-0" />
                Deposit
              </button>
              <button
                className="w-full flex items-center gap-3 text-left px-4 py-3 text-body font-semibold border-b border-border"
                onClick={() => openFromMenu("withdraw")}
              >
                <Icon.ArrowUp className="w-4 h-4 shrink-0" />
                Withdraw
              </button>
              <button
                className="w-full flex items-center gap-3 text-left px-4 py-3 text-body font-semibold border-b border-border"
                onClick={() => openFromMenu("history")}
              >
                <Icon.Clock className="w-4 h-4 shrink-0" />
                History
              </button>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 text-left px-4 py-3 text-body font-semibold text-danger"
                >
                  <Icon.Logout className="w-4 h-4 shrink-0 text-danger" />
                  Log out
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Hang 2 : Balance xep tren so du lon - can 1.6 don vi vi 2 dong chu
          (nhan + so lon) cao hon 1 hang don, khong thi tran xuong khung QR. */}
      <div
        style={{ flex: "1.6 1 0", minHeight: 0 }}
        className="flex flex-col items-start justify-center px-5"
      >
        <span className="text-lead font-bold text-accent">Balance</span>
        <span className="text-figure font-bold">
          ${formatBalance(balance.token)}
        </span>
      </div>

      {/* Hang 3-4-5-6 : QR to full + dia chi rut gon */}
      <div
        style={{ flex: "3.4 1 0", minHeight: 0 }}
        className="flex flex-col items-center justify-center gap-[1.5cqh] px-5"
      >
        {hasWallet ? (
          <div
            style={{ aspectRatio: "1" }}
            className="w-full max-h-full p-[1.5cqh] bg-background border border-border rounded-xl flex items-center justify-center"
          >
            <QRCodeSVG
              value={encodeTapTipQr(primaryWallet.wallet_address)}
              size={260}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div
            style={{ aspectRatio: "1" }}
            className="w-full flex items-center justify-center border border-border rounded-xl text-body text-accent text-center px-4"
          >
            Setting up your wallet...
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddressExpanded((v) => !v)}
            className="text-body font-semibold"
          >
            {addressExpanded
              ? primaryWallet.wallet_address
              : shortenAddress(primaryWallet.wallet_address)}
          </button>
          <CopyButton value={primaryWallet.wallet_address} label="Copy wallet address" />
        </div>
      </div>

      {/* Hang 7-8 : toi da 3 thong bao, an han neu rong (chua co nguon du lieu that) */}
      <div
        style={{ flex: "2 1 0", minHeight: 0 }}
        className="flex flex-col justify-center gap-[1cqh] px-5"
      >
        {announcements.slice(0, 3).map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-3 bg-surface rounded-full pl-4 pr-3 py-[1.2cqh]"
          >
            <span className="text-body text-foreground truncate">{a.text}</span>
            <button
              onClick={() => dismissAnnouncement(a.id)}
              aria-label="Dismiss"
              className="text-danger shrink-0 w-4 h-4 flex items-center justify-center"
            >
              <Icon.X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Hang 9 : nut Option (1/3) + Tip (2/3), ca hai pill vang.
          `relative` de neo AnchoredCard (Tip Setting) ngay phia tren nut Option. */}
      <div
        style={{ flex: "2 1 0", minHeight: 0, minWidth: 0 }}
        className="relative flex items-center gap-2.5 px-5"
      >
        <button
          style={{ flex: "1 1 0", minWidth: 0 }}
          className="h-[6.8cqh] min-h-[52px] rounded-full bg-primary text-primary-foreground shadow-btn flex items-center justify-center"
          onClick={() => setPopup((p) => (p === "tipSetting" ? null : "tipSetting"))}
          aria-label="Tip options"
        >
          <Icon.Option className="w-[2.4cqh] h-[2.4cqh] min-w-[16px] min-h-[16px]" />
        </button>
        <button
          style={{ flex: "2 1 0", minWidth: 0 }}
          className="h-[6.8cqh] min-h-[52px] rounded-full bg-primary text-primary-foreground shadow-btn text-lead font-bold flex items-center justify-center gap-2"
          onClick={() => setSendOpen(true)}
        >
          <Icon.Tip className="w-[2.4cqh] h-[2.4cqh] min-w-[16px] min-h-[16px] shrink-0" />
          Tip
        </button>

        <AnchoredCard
          open={popup === "tipSetting"}
          onClose={() => setPopup(null)}
          className="bottom-full left-5 mb-2 w-[62%] min-w-[220px]"
        >
          <TipSettingPopup onClose={() => setPopup(null)} />
        </AnchoredCard>
      </div>

      <SendFlow open={sendOpen} onOpenChange={setSendOpen} />

      <HistoryPopup open={popup === "history"} onClose={() => setPopup(null)} />

      <CenteredCard open={popup === "deposit"} onClose={() => setPopup(null)} title="Deposit">
        <div className="flex flex-col gap-3 p-[18px]">
          <p className="text-body font-semibold text-accent">
            Send USDC (Arc network) to your wallet address below, or use the Circle Faucet for testnet funds.
          </p>
          <div className="flex items-center gap-2 bg-surface rounded-xl p-[10px]">
            <code className="text-small font-mono break-all flex-1">
              {primaryWallet.wallet_address}
            </code>
            <CopyButton value={primaryWallet.wallet_address} label="Copy wallet address" />
          </div>
          <a
            href={CIRCLE_FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center"
          >
            Open Circle Faucet
          </a>
        </div>
      </CenteredCard>

      <CenteredCard open={popup === "withdraw"} onClose={() => setPopup(null)} title="Withdraw">
        <div className="flex flex-col gap-3 p-[18px]">
          <p className="text-body font-semibold text-accent">
            Withdrawals aren&apos;t available yet during the testnet phase.
          </p>
          <button
            className="h-11 rounded-full bg-primary text-primary-foreground font-bold"
            onClick={() => setPopup(null)}
          >
            Got it
          </button>
        </div>
      </CenteredCard>
    </div>
  );
}
