"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import * as Icon from "@/components/icons";
import { useBalance, BalanceProvider } from "@/contexts/balanceContext";
import SendFlow from "@/components/send-flow";
import { ContentPopup } from "@/components/content-popup";
import { TipSettingPopup } from "@/components/tip-setting-popup";
import { HistoryPopup } from "@/components/history-popup";
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

  const hasWallet =
    !!primaryWallet.wallet_address && primaryWallet.wallet_address !== "0x0";

  const copyAddress = () => {
    navigator.clipboard.writeText(primaryWallet.wallet_address);
    toast.success("Đã copy địa chỉ ví");
  };

  const openFromMenu = (kind: PopupKind) => {
    setMenuOpen(false);
    if (kind === "deposit") copyAddress();
    setPopup(kind);
  };

  return (
    // KHONG dat padding doc o day - luoi 10 hang phai neo dung dinh 0 / day 10.
    <div data-home-root className="relative flex flex-col h-full">
      {/* ================== LUOI 10 HANG MAN HOME (Wireframe v2 Group A) ======
          1 : Balance (trai) + icon Menu (phai)
          2 : so du lon
          3-5 : QR to full
          6 : so tai khoan rut gon
          7-8 : vung thong bao (mac dinh trong)
          9-10 : panel noi, Tip Setting 1/3 + Tip 2/3
          ==================================================================== */}

      {/* Hang 1 */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="relative flex items-center justify-between px-5"
      >
        <span className="text-small font-bold text-hint uppercase tracking-wide">Balance</span>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Mở menu"
          className="w-[6cqh] h-[6cqh] min-w-[38px] min-h-[38px] rounded-full border border-foreground bg-background flex items-center justify-center"
        >
          <Icon.Menu className="w-[2.5cqh] h-[2.5cqh] min-w-[14px] min-h-[14px] text-foreground" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-5 top-full z-50 mt-1.5 w-[210px] rounded-xl bg-background shadow-modal overflow-hidden">
              <button
                className="w-full flex items-center gap-3 text-left px-4 py-3 text-[14px] font-bold border-b border-border"
                onClick={() => openFromMenu("deposit")}
              >
                <Icon.ArrowDown className="w-4 h-4 shrink-0" />
                Nạp
              </button>
              <button
                className="w-full flex items-center gap-3 text-left px-4 py-3 text-[14px] font-bold border-b border-border"
                onClick={() => openFromMenu("withdraw")}
              >
                <Icon.ArrowUp className="w-4 h-4 shrink-0" />
                Rút
              </button>
              <button
                className="w-full flex items-center gap-3 text-left px-4 py-3 text-[14px] font-bold border-b border-border"
                onClick={() => openFromMenu("history")}
              >
                <Icon.Clock className="w-4 h-4 shrink-0" />
                Lịch sử giao dịch
              </button>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 text-left px-4 py-3 text-[14px] font-bold text-danger"
                >
                  <Icon.Logout className="w-4 h-4 shrink-0 text-danger" />
                  Đăng xuất
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Hang 2 */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="flex items-baseline gap-1.5 px-5"
      >
        <span className="text-figure font-bold font-num">
          ${formatBalance(balance.token)}
        </span>
        <span className="text-small font-bold text-hint">USDC</span>
      </div>

      {/* Hang 3-4-5 : QR to full, the co bo goc + chấm vang trang tri */}
      <div
        style={{ flex: "3 1 0", minHeight: 0 }}
        className="flex items-center justify-center"
      >
        {hasWallet ? (
          <div
            style={{ height: "100%", aspectRatio: "1" }}
            className="relative p-[1.5cqh] bg-background border border-border rounded-xl shadow-btn flex items-center justify-center"
          >
            <QRCodeSVG
              value={encodeTapTipQr(primaryWallet.wallet_address)}
              size={260}
              className="w-full h-full"
            />
            <span
              aria-hidden
              className="absolute -bottom-[1cqh] -right-[1cqh] w-[3cqh] h-[3cqh] min-w-[22px] min-h-[22px] rounded-full bg-primary border-2 border-background shadow-btn"
            />
          </div>
        ) : (
          <div
            style={{ height: "100%", aspectRatio: "1" }}
            className="flex items-center justify-center border border-border rounded-xl text-body text-hint text-center px-4"
          >
            Đang tạo ví...
          </div>
        )}
      </div>

      {/* Hang 6 : so tai khoan rut gon, dang chip */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="flex items-center justify-center"
      >
        <div className="flex items-center gap-2 bg-surface rounded-full py-1.5 pl-4 pr-1.5">
          <span className="text-small text-hint font-bold">Số TK</span>
          <button
            onClick={() => setAddressExpanded((v) => !v)}
            className="text-small font-bold font-num"
          >
            {addressExpanded
              ? primaryWallet.wallet_address
              : shortenAddress(primaryWallet.wallet_address)}
          </button>
          <button
            onClick={copyAddress}
            aria-label="Copy địa chỉ ví"
            className="w-[3.4cqh] h-[3.4cqh] min-w-[26px] min-h-[26px] rounded-full bg-background flex items-center justify-center shrink-0"
          >
            <Icon.Copy className="w-[1.8cqh] h-[1.8cqh] min-w-[12px] min-h-[12px]" />
          </button>
        </div>
      </div>

      {/* Hang 7-8 : vung thong bao, mac dinh trong hoan toan - khong ve khung
          khi khong co gi, tranh nhin nhu placeholder quen xoa. */}
      <div style={{ flex: "2 1 0", minHeight: 0 }} />

      {/* Hang 9-10 : 2 nut vien thuoc rieng biet, Tip Setting (vien) + Tip (day, co icon).
          Chieu cao dat bang cqh (ty le theo KHUNG, khong phai theo hang) -
          dung % cua hang 2 don vi se qua cao so voi be ngang, bien nut
          "Tip Setting" (hep vi flex:1) thanh hinh tron thay vi vien thuoc. */}
      <div
        style={{ flex: "2 1 0", minHeight: 0, minWidth: 0 }}
        className="flex items-center gap-2.5 px-5"
      >
        <button
          style={{ flex: "1 1 0", minWidth: 0 }}
          className="h-[6.8cqh] min-h-[52px] rounded-full border border-foreground bg-background text-small font-bold flex items-center justify-center"
          onClick={() => setPopup("tipSetting")}
        >
          Tip Setting
        </button>
        <button
          style={{ flex: "2 1 0", minWidth: 0 }}
          className="h-[6.8cqh] min-h-[52px] rounded-full bg-primary text-primary-foreground shadow-btn text-lead font-extrabold flex items-center justify-center gap-2"
          onClick={() => setSendOpen(true)}
        >
          <Icon.Tip className="w-[2.4cqh] h-[2.4cqh] min-w-[16px] min-h-[16px] shrink-0" />
          Tip
        </button>
      </div>

      <SendFlow open={sendOpen} onOpenChange={setSendOpen} />

      <TipSettingPopup open={popup === "tipSetting"} onClose={() => setPopup(null)} />
      <HistoryPopup open={popup === "history"} onClose={() => setPopup(null)} />

      <ContentPopup open={popup === "deposit"} onClose={() => setPopup(null)}>
        <div className="flex flex-col gap-3 p-[18px]">
          <p className="text-[17px] font-bold text-accent">
            App vừa copy số tài khoản cho bạn, hãy tới trang để faucet.
          </p>
          <code className="text-[13px] font-mono bg-surface p-[10px] rounded-xl break-all block">
            {primaryWallet.wallet_address}
          </code>
          <a
            href={CIRCLE_FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 rounded-full bg-primary text-primary-foreground font-extrabold flex items-center justify-center"
          >
            Mở Circle Faucet
          </a>
        </div>
      </ContentPopup>

      <ContentPopup open={popup === "withdraw"} onClose={() => setPopup(null)}>
        <div className="flex flex-col gap-3 p-[18px]">
          <p className="text-[17px] font-bold text-accent">
            Tính năng chưa khả dụng ở giai đoạn testnet.
          </p>
          <button
            className="h-11 rounded-full bg-primary text-primary-foreground font-extrabold"
            onClick={() => setPopup(null)}
          >
            Đã hiểu
          </button>
        </div>
      </ContentPopup>
    </div>
  );
}
