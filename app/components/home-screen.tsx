"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import * as Icon from "@/components/icons";
import { useBalance, BalanceProvider } from "@/contexts/balanceContext";
import { TapTipWordmark } from "@/components/ui";
import { TipAmountPanel, type TipSettings } from "@/components/tip-amount-panel";
import { CopyButton } from "@/components/copy-button";
import { shortenAddress } from "@/lib/utils/address";
import { encodeTapTipQr, decodeTapTipQr } from "@/lib/utils/qr-payment";
import { CONTENT_X, CONTENT_W } from "@/components/screen";
import { signOutAction } from "@/app/actions";
import { toast } from "sonner";

const QR_REGION_ID = "taptip-qr-region";

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

/** Co chu LON NHAT ma "$so" van vua trong khung - Figma frame 23 (so dai,
 * 24px) vs frame 24/26 (so ngan, 40px): "man nhan nhung so tien to va ngan
 * nen fit vua cho trong" (phan hoi that 09-24) - tu co gian theo do dai. */
function balanceSizePx(text: string): number {
  if (text.length <= 4) return 40;
  if (text.length <= 6) return 30;
  return 24;
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

/** Poll nen moi 10s de bat duoc tip MOI NHAN trong luc dang dung tren Home. */
const BALANCE_POLL_MS = 10000;

type Tab = "get" | "send";

function HomeScreenContent({ primaryWallet }: Props) {
  const router = useRouter();
  const { balance, balanceError, refreshBalances } = useBalance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("get");
  const [settings, setSettings] = useState<TipSettings | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [sendStep, setSendStep] = useState<"scan" | "sending" | "success">("scan");
  const [lastAmount, setLastAmount] = useState<number | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const hasWallet =
    !!primaryWallet.wallet_address && primaryWallet.wallet_address !== "0x0";
  const balanceNum = isNaN(balance.token) ? 0 : balance.token;

  const goTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const shortAddress = shortenAddress(primaryWallet.wallet_address);

  // ============= Poll so du nen + bao "vua nhan tip" (hang 1, tu an 3s) ====
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBalances().catch(() => {});
    }, BALANCE_POLL_MS);
    return () => clearInterval(interval);
  }, [refreshBalances]);

  const previousBalanceRef = useRef<number | null>(null);
  const noticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (balance.loading || isNaN(balance.token)) return;
    const previous = previousBalanceRef.current;
    if (previous != null && balance.token > previous + 0.005) {
      const delta = balance.token - previous;
      setReceivedAmount(delta);
      if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
      noticeTimeoutRef.current = setTimeout(() => setReceivedAmount(null), 3000);
    }
    previousBalanceRef.current = balance.token;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance.token, balance.loading]);
  useEffect(
    () => () => {
      if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
    },
    [],
  );

  // ============= Tip settings (dung chung cho ca tab Send + picker) =======
  useEffect(() => {
    fetch("/api/tip-settings")
      .then((res) => res.json() as Promise<{ settings: TipSettings }>)
      .then((data) => setSettings(data.settings))
      .catch(() => toast.error("Could not load tip amounts"));
  }, []);

  const defaultAmount = settings
    ? (settings[`slot${settings.default_slot}` as keyof TipSettings] as number | null)
    : null;

  // ============= Camera - CHI chay khi tab=send va dang o buoc scan =======
  const startScanner = async () => {
    setScanError(null);
    if (!document.getElementById(QR_REGION_ID)) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    if (!document.getElementById(QR_REGION_ID)) return;

    try {
      const scanner = new Html5Qrcode(QR_REGION_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (w: number, h: number) => {
            const size = Math.max(50, Math.floor(Math.min(w, h) * 0.7));
            return { width: size, height: size };
          },
          aspectRatio: CONTENT_W / 333,
        },
        (decodedText) => handleScanResultRef.current(decodedText),
        () => {},
      );
    } catch (err) {
      console.warn("Could not start camera:", err);
      setScanError("Could not open camera.");
    }
  };

  const stopScanner = () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      scanner.stop().then(() => scanner.clear()).catch(() => {});
    } catch {
      // scanner chua kip chay xong luc bi yeu cau dung
    }
  };

  useEffect(() => {
    if (tab === "send" && sendStep === "scan") {
      startScanner();
    } else {
      stopScanner();
    }
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, sendStep]);

  const handleScanResult = async (decodedText: string) => {
    if (defaultAmount == null) {
      setScanError("Choose an amount first.");
      return;
    }
    if (defaultAmount > balanceNum) {
      setScanError("Not enough balance to send this amount.");
      return;
    }
    const decoded = decodeTapTipQr(decodedText);
    if (!decoded.ok) {
      setScanError(
        decoded.reason === "wrong-network"
          ? "This QR is for another network. TapTip only sends on Arc Testnet."
          : "That doesn't look like a wallet QR code.",
      );
      return;
    }

    stopScanner();
    setSendStep("sending");

    const response = await fetch("/api/tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toAddress: decoded.address, amount: defaultAmount }),
    }).catch(() => null);

    if (!response?.ok) {
      const message = response
        ? ((await response.json().catch(() => null)) as { error?: string } | null)?.error
        : null;
      toast.error(message || "Send failed, try again");
      setSendStep("scan");
      return;
    }

    setLastAmount(defaultAmount);
    setSendStep("success");
    refreshBalances().catch((err) => console.error("Failed to refresh balance:", err));
    setTimeout(() => setSendStep("scan"), 2000);
  };

  const handleScanResultRef = useRef(handleScanResult);
  useEffect(() => {
    handleScanResultRef.current = handleScanResult;
  });

  return (
    <div data-home-root className="relative w-full h-full overflow-hidden">
      <div className={`absolute inset-0 ${menuOpen ? "opacity-20 pointer-events-none" : ""}`}>
        {/* Header - Figma frame 23/26...: wordmark "TapTip.fun" (chu, 20px)
            trai + nut menu 33.32x33.32 phai. */}
        <div className="absolute" style={{ left: CONTENT_X, top: 12 }}>
          <TapTipWordmark fontSize={20} />
        </div>

        {/* Khung QR/camera - CHUNG 1 vi tri cho ca 2 tab (324x333, rounded-8,
            nen --surface). Get Tip: QR that. Send Tip: camera quet that. */}
        <div
          className="absolute bg-surface rounded-[8px] overflow-hidden flex items-center justify-center"
          style={{ left: CONTENT_X, top: 56.32, width: CONTENT_W, height: 333 }}
        >
          {tab === "get" ? (
            hasWallet ? (
              <QRCodeSVG
                value={encodeTapTipQr(primaryWallet.wallet_address)}
                size={324}
                marginSize={4}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            ) : (
              <div className="font-body text-body text-foreground/50 text-center px-4">
                Setting up your wallet...
              </div>
            )
          ) : (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <div id={QR_REGION_ID} className="w-full h-full" />
              {scanError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/90 z-20">
                  <Icon.Warning className="w-8 h-8 text-danger mb-2" />
                  <p className="font-body text-small font-medium text-white/80">{scanError}</p>
                  <button
                    onClick={startScanner}
                    className="mt-4 font-body text-small font-medium text-white underline"
                  >
                    Retry
                  </button>
                </div>
              )}
              {(sendStep === "sending" || sendStep === "success") && (
                <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center gap-3">
                  {sendStep === "sending" ? (
                    <>
                      <Icon.Loading className="w-10 h-10 text-primary animate-spin" />
                      <p className="font-display text-title font-bold text-white">Processing...</p>
                    </>
                  ) : (
                    <>
                      <Icon.Check className="w-10 h-10 text-success" />
                      <p className="font-display text-title font-bold text-white">Tipped ${lastAmount}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Balance - luon hien, ca 2 tab. */}
        <div
          className="absolute flex items-center justify-between"
          style={{ left: CONTENT_X, top: 397.32, width: CONTENT_W, height: 49 }}
        >
          <span className="font-body text-body font-medium text-foreground">Balance:</span>
          <span
            className="font-display font-bold text-[#42a556]"
            style={{ fontSize: balanceSizePx(`$${formatBalance(balance.token)}`) }}
          >
            ${formatBalance(balance.token)}
          </span>
        </div>

        {/* Send Tip: bang chon so tien, chiem het khoang trong ben duoi
            Balance den truoc hang tab. */}
        {tab === "send" && settings && (
          <div className="absolute" style={{ left: CONTENT_X, top: 461, width: CONTENT_W }}>
            <TipAmountPanel settings={settings} onSettingsChange={setSettings} />
          </div>
        )}

        {/* Bao loi doc so du - hang 15 */}
        {balanceError && (
          <p
            className="absolute font-body text-small font-medium text-danger leading-[20px]"
            style={{ left: CONTENT_X, top: 795, width: CONTENT_W, height: 49 }}
          >
            {balanceError}
          </p>
        )}
      </div>

      {/* Popup "vua nhan tip" - hang 1, tu an sau 3s, z cao hon menu. */}
      {receivedAmount != null && (
        <div
          className="absolute z-[60] flex items-center justify-center bg-success text-background font-display text-body font-bold rounded-[8px] shadow-btn pointer-events-none"
          style={{ left: CONTENT_X, top: 0, width: CONTENT_W, height: 48.8 }}
        >
          +${formatBalance(receivedAmount)} received
        </div>
      )}

      {/* Nut menu */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open menu"
        className="absolute z-50 flex items-center justify-center text-foreground"
        style={{ left: CONTENT_X + CONTENT_W - 33.32, top: 8.16, width: 33.32, height: 33.32 }}
      >
        <Icon.Menu className="w-6 h-6" />
      </button>

      {/* Menu popup - Figma frame 28 (node 38:376): khung rounded-[8px]
          vien den, danh sach chu don gian, "Log out" mau do. Them muc
          "Setting" moi (khong co trong ban truoc). */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute z-50 bg-background border border-foreground rounded-[8px] px-5 py-4"
            style={{ left: CONTENT_X + 58, top: 49, width: 274 }}
          >
            <div className="flex items-center gap-2 font-display text-small font-medium text-foreground py-1">
              <span>Wallet address: {shortAddress}</span>
              <CopyButton value={primaryWallet.wallet_address} label="Copy wallet address" />
            </div>
            <button
              onClick={() => goTo("/dashboard/deposit")}
              className="block w-full text-left font-display text-small font-medium text-foreground py-1"
            >
              Deposit
            </button>
            <button
              onClick={() => goTo("/dashboard/withdraw")}
              className="block w-full text-left font-display text-small font-medium text-foreground py-1"
            >
              Withdraw
            </button>
            <button
              onClick={() => goTo("/dashboard/history")}
              className="block w-full text-left font-display text-small font-medium text-foreground py-1"
            >
              History
            </button>
            <button
              onClick={() => goTo("/dashboard/settings")}
              className="block w-full text-left font-display text-small font-medium text-foreground py-1"
            >
              Setting
            </button>
            <form action={signOutAction}>
              <button
                type="submit"
                className="block w-full text-left font-display text-small font-medium text-danger py-1"
              >
                Log out
              </button>
            </form>
          </div>
        </>
      )}

      {/* Hang tab Get Tip / Send Tip - pill 2 nua, dung chinh vi tri hang
          hanh dong (738.4) nhu moi man khac. */}
      <div
        className="absolute bg-surface rounded-full flex overflow-hidden"
        style={{ left: CONTENT_X, top: 738.53, width: CONTENT_W, height: 49.32 }}
      >
        <button
          onClick={() => setTab("get")}
          className={`flex-1 h-full font-display text-title font-bold rounded-full transition-colors ${
            tab === "get" ? "bg-primary text-foreground" : "text-[#909090]"
          }`}
        >
          Get Tip
        </button>
        <button
          onClick={() => setTab("send")}
          className={`flex-1 h-full font-display text-title font-bold rounded-full transition-colors ${
            tab === "send" ? "bg-primary text-foreground" : "text-[#909090]"
          }`}
        >
          Send Tip
        </button>
      </div>
    </div>
  );
}
