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

// Ca 5 hang deu dua vao le ngang 20px dat mot lan duy nhat o app/dashboard/
// layout.tsx (px-5) - KHONG tu them px-5 rieng trong tung hang o day nua,
// keo cong don thanh 40px (bai hoc 09-02: le kep tren toan man Home).

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
    // KHONG dat padding doc o day - luoi 10 hang phai neo dung dinh 0 / day 10.
    <div data-home-root className="relative flex flex-col h-full">
      {/* ================== LUOI 10 HANG MAN HOME (Figma taptip-home 09-02) ===
          1 : logo (trai) + icon Menu (phai)
          2 : "Balance" + so du lon, xep doc - gon trong đung 1 hang
          3-6 : QR to full + dia chi rut gon [copy]
          7-8 : toi da 3 thong bao co the dismiss
          9 : nut Option (1/3) + Tip (2/3), tam nut o giua hang 9
          10 : dem duoi (khong noi dung)
          ==================================================================== */}

      {/* Hang 1 */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="relative flex items-center justify-between"
      >
        {/* Logo ha xuong 5px NET so voi tam hang 1 (09-03: +5, roi +5 nua thanh
            10, roi lui lai dung 5). Phai dung transform: margin/padding se lam
            hang 1 cao them va day ca luoi 10 hang lech theo, transform thi
            khong dung den layout. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-full.svg"
          alt="TapTip"
          style={{ transform: "translateY(5px)" }}
          className="h-[3.7cqh] w-auto"
        />
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
            <div className="absolute right-0 top-full z-50 mt-1.5 w-[210px] rounded-card border border-border bg-background shadow-modal overflow-hidden">
              <div className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
                <div className="flex flex-col min-w-0">
                  <span className="text-small text-accent">Account Number</span>
                  <span className="text-body font-semibold truncate">
                    {shortenAddress(primaryWallet.wallet_address)}
                  </span>
                </div>
                <CopyButton value={primaryWallet.wallet_address} label="Copy wallet address" />
              </div>
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

      {/* Hang 2 : Balance can giua (ngang), so du lon cach nhan "Balance"
          1 khoang tho (gap) - van dung leading-none de gon dung trong 1 hang.
          Hien "$40 (40 USDC)": con so DOLA la con so LON vi nguoi dung nghi
          bang dola chu khong nghi bang token; so USDC lui ve trong ngoac, nho
          + xam - van phai co vi app tip bang USDC. */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="flex flex-col items-center justify-center gap-[0.8cqh]"
      >
        <span className="text-lead font-bold text-accent leading-none">Balance</span>
        <span className="flex items-baseline gap-2 leading-none whitespace-nowrap">
          <span className="text-figure font-bold">
            ${formatBalance(balance.token)}
          </span>
          <span className="text-lead font-bold text-accent">
            ({formatBalance(balance.token)} USDC)
          </span>
        </span>
      </div>

      {/* Hang 3-4-5-6 : QR to full + dia chi rut gon, dung du 4 hang.
          Khung QR boc trong 1 lop flex-1 min-h-0 rieng - lay dung phan
          chieu cao CON LAI sau khi tru hang dia chi (auto height) o duoi,
          roi moi ap aspect-square + h-full (cao truoc, rong suy tu ty le) -
          tranh QR to hon budget that su cua no ma tran sang hang 2/7 (bug
          cu: w-full + aspect-ratio suy rong truoc, khong biet truoc chieu
          cao con lai bao nhieu nen bi tran). */}
      <div
        style={{ flex: "4 1 0", minHeight: 0 }}
        className="flex flex-col items-center justify-center gap-[1.5cqh]"
      >
        <div className="w-full flex-1 min-h-0 flex items-center justify-center">
          {hasWallet ? (
            <div
              style={{ aspectRatio: "1" }}
              className="h-full max-w-full p-[1.5cqh] bg-background flex items-center justify-center"
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
              className="h-full max-w-full flex items-center justify-center border border-border rounded-xl text-body text-accent text-center px-4"
            >
              Setting up your wallet...
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-center gap-[0.6cqh]">
          {/* Canh bao mang: tien gui nham mang khac la mat, phai noi ro ngay
              tren dia chi vi truoc khi nguoi ta dua QR cho nguoi khac. */}
          {/* text-body (17px @390x844) chu khong phai text-small (15px): day la
              canh bao MAT TIEN THAT neu gui nham mang, khong phai chu thich phu. */}
          <span className="text-body font-semibold text-danger text-center">
            Current available network: Arc Testnet
          </span>

          <div className="flex items-center gap-2">
            {/* text-lead = 22px quy chieu khung 390x844 (yeu cau 09-03) - day
                la thong tin nguoi khac phai doc de doi chieu vi, khong phai
                caption. */}
            <span className="text-lead font-semibold text-accent">
              Account Number: {shortenAddress(primaryWallet.wallet_address)}
            </span>
            <CopyButton value={primaryWallet.wallet_address} label="Copy wallet address" />
          </div>
        </div>
      </div>

      {/* Hang 7-8 : toi da 3 thong bao, an han neu rong (chua co nguon du lieu that) */}
      <div
        style={{ flex: "2 1 0", minHeight: 0 }}
        className="flex flex-col justify-center gap-[1cqh]"
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

      {/* Hang 9 : nut Option (1/3) + Tip (2/3), ca hai pill vang, tam nut
          o giua hang 9 (flex dung dung 1 hang, khong lan qua hang 10 nua).
          `relative` de neo AnchoredCard (Tip Setting) ngay phia tren nut Option. */}
      <div
        style={{ flex: "1 1 0", minHeight: 0, minWidth: 0 }}
        className="relative flex items-center gap-2.5"
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
          className="h-[6.8cqh] min-h-[52px] rounded-full bg-primary text-primary-foreground shadow-btn text-lead font-bold flex items-center justify-center"
          onClick={() => setSendOpen(true)}
        >
          Tap to Tip
        </button>

        <AnchoredCard
          open={popup === "tipSetting"}
          onClose={() => setPopup(null)}
          className="bottom-full left-0 mb-2 w-[62%] min-w-[220px]"
        >
          <TipSettingPopup onClose={() => setPopup(null)} />
        </AnchoredCard>
      </div>

      {/* Hang 10 : cho bao loi so du - chu do, can giua CA ngang lan doc trong
          dung hang 10. Khong co loi thi hang van chiem du cho nhu cu (luoi 10
          hang khong xe dich khi loi hien ra roi tat di). */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="flex items-center justify-center"
      >
        {balanceError && (
          <p className="text-body font-semibold text-danger text-center">
            {balanceError}
          </p>
        )}
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
