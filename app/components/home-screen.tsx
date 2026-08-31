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
  historyContent: React.ReactNode;
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
        className="flex items-center justify-between px-5"
      >
        <span className="text-small font-bold text-hint">Balance</span>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Mở menu"
          className="w-[6cqh] h-[6cqh] min-w-[34px] min-h-[34px] rounded-xl bg-primary flex items-center justify-center"
        >
          <Icon.Menu className="w-[3cqh] h-[3cqh] min-w-[16px] min-h-[16px] text-primary-foreground" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-5 top-full z-50 mt-1.5 w-[200px] rounded-xl bg-background shadow-modal overflow-hidden">
              <button
                className="w-full text-left px-4 py-3 text-[14px] font-bold border-b border-border"
                onClick={() => openFromMenu("deposit")}
              >
                Nạp
              </button>
              <button
                className="w-full text-left px-4 py-3 text-[14px] font-bold border-b border-border"
                onClick={() => openFromMenu("withdraw")}
              >
                Rút
              </button>
              <button
                className="w-full text-left px-4 py-3 text-[14px] font-bold border-b border-border"
                onClick={() => openFromMenu("history")}
              >
                Lịch sử giao dịch
              </button>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full text-left px-4 py-3 text-[14px] font-bold text-danger"
                >
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
        className="flex items-center px-5"
      >
        <span className="text-figure font-bold font-num">
          ${formatBalance(balance.token)}
        </span>
      </div>

      {/* Hang 3-4-5 : QR to full */}
      <div
        style={{ flex: "3 1 0", minHeight: 0 }}
        className="flex items-center justify-center"
      >
        {hasWallet ? (
          <div
            style={{ height: "100%", aspectRatio: "1" }}
            className="p-[1.5cqh] bg-background border border-border rounded-xl flex items-center justify-center"
          >
            <QRCodeSVG
              value={encodeTapTipQr(primaryWallet.wallet_address)}
              size={260}
              className="w-full h-full"
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

      {/* Hang 6 : so tai khoan rut gon */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="flex items-center justify-center gap-2"
      >
        <span className="text-small text-hint">Số tài khoản:</span>
        <button
          onClick={() => setAddressExpanded((v) => !v)}
          className="text-small font-bold font-num underline decoration-primary decoration-2 underline-offset-2"
        >
          {addressExpanded
            ? primaryWallet.wallet_address
            : shortenAddress(primaryWallet.wallet_address)}
        </button>
        <button onClick={copyAddress} aria-label="Copy địa chỉ ví">
          <Icon.Copy className="w-[2cqh] h-[2cqh] min-w-[14px] min-h-[14px]" />
        </button>
      </div>

      {/* Hang 7-8 : vung thong bao, mac dinh trong */}
      <div
        style={{ flex: "2 1 0", minHeight: 0 }}
        className="flex items-center justify-center px-5"
      >
        <div className="w-full h-[calc(100%-16px)] rounded-xl border border-dashed border-border" />
      </div>

      {/* Hang 9-10 : panel noi, Tip Setting 1/3 + Tip 2/3 */}
      <div
        style={{ flex: "2 1 0", minHeight: 0, minWidth: 0 }}
        className="flex rounded-t-xl overflow-hidden shadow-btn"
      >
        <button
          style={{ flex: "1 1 0", minWidth: 0 }}
          className="border-r border-border bg-background text-small font-bold flex items-center justify-center"
          onClick={() => setPopup("tipSetting")}
        >
          Tip Setting
        </button>
        <button
          style={{ flex: "2 1 0", minWidth: 0 }}
          className="bg-primary text-primary-foreground text-lead font-extrabold flex items-center justify-center"
          onClick={() => setSendOpen(true)}
        >
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
