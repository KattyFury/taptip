"use client";

/**
 * Home - Figma 09-24b: "home" (43:264, tab Get Tip), "tip" (44:445, tab Send
 * Tip), "edit" (44:495, picker so tien), "menu" (44:521). Toa do la px tuyet
 * doi trong khung 390x844, do thang tu get_design_context:
 *
 *   Header      wordmark 20px x=25, nut menu 33.32 o x=331.5 y=8.16
 *   Khung       QR (Get) / camera (Send): x=25 y=56.32 340x333 bo 8
 *   Balance     y=397.32 cao 49: nhan 20 dam + so xanh #42A556 (28-37px)
 *   The xam     x=25 y=446.32 340x235 bo 8, #E4E4DB
 *                 Get : danh sach thong bao 324x49 (xanh/do/vang) co dau X
 *                 Send: luoi 2x2 so tien + mo ta + EDIT (tip-amount-panel)
 *   Thanh tab   y=738 340x49.32 pill xam; tab dang chon pill 174px - Get
 *               xanh la #42A556, Send do #E12B32; chu tab chua chon #AEAEAE
 *   Menu/picker lam MO (blur) toan bo phia sau - dung Figma, khong dung nen den.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import * as Icon from "@/components/icons";
import { useBalance, BalanceProvider } from "@/contexts/balanceContext";
import { SlantButton, TapTipWordmark } from "@/components/ui";
import {
  TipAmountGrid,
  AmountPicker,
  saveSlotValue,
  slotValue,
  type TipSettings,
} from "@/components/tip-amount-panel";
import { shortenAddress } from "@/lib/utils/address";
import { encodeTapTipQr, decodeTapTipQr } from "@/lib/utils/qr-payment";
import { signOutAction } from "@/app/actions";
import { describeSendError, formatLockUntil, type SendErrorBody } from "@/lib/utils/send-errors";
import { toast } from "sonner";

const QR_REGION_ID = "taptip-qr-region";
const CIRCLE_FAUCET_URL = "https://faucet.circle.com/";
const DISMISSED_KEY = "taptip_dismissed_notices";
/** Thong bao giao dich chi hien trong 24h gan nhat */
const NOTICE_WINDOW_MS = 24 * 60 * 60 * 1000;
/** The xam cao 235: 4 dong 49 + khe 8 vua khit - toi da 4 thong bao */
const MAX_NOTICES = 4;
const POLL_MS = 10000;

interface Props {
  primaryWallet: { wallet_address: string };
  profile: { id: string; name: string; daily_tip_limit: number | null };
  /** Chi dung cho anh chup so sanh Figma / test: mo san 1 trang thai */
  initialTab?: Tab;
  initialOverlay?: "menu" | "edit" | "choose" | "logout";
}

type Tab = "get" | "send";

interface TransactionRow {
  direction: "in" | "out";
  counterparty: string;
  amount: number;
  createdAt: string;
}

type Notice =
  | { id: string; kind: "received" | "tipped"; amount: number; address: string }
  | { id: string; kind: "low-balance" }
  | { id: string; kind: "wallet-locked"; until: number };

/** Lam tron XUONG 2 chu so thap phan - khong bao gio hien nhieu hon so that co. */
function formatAmount(token: number): string {
  if (isNaN(token) || token <= 0) return "0";
  return (Math.floor(token * 100) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** Figma: "$XXX" (ngan) 37px, "$XXXXXXX" (dai) 28px - co chu tu co theo do dai. */
function balanceSizePx(text: string): number {
  if (text.length <= 4) return 37;
  if (text.length <= 6) return 32;
  return 28;
}

function parseUtc(iso: string): number {
  return new Date(iso.endsWith("Z") ? iso : `${iso}Z`).getTime();
}

function readDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

// BalanceProvider rieng theo dia chi vi biet san tu server - che len
// BalanceProvider goc o app/layout.tsx (khong dia chi).
export default function HomeScreen(props: Props) {
  return (
    <BalanceProvider walletAddress={props.primaryWallet.wallet_address}>
      <HomeScreenContent {...props} />
    </BalanceProvider>
  );
}

function HomeScreenContent({ primaryWallet, initialTab = "get", initialOverlay }: Props) {
  const router = useRouter();
  const { balance, balanceError, refreshBalances } = useBalance();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [menuOpen, setMenuOpen] = useState(initialOverlay === "menu");
  // O dang sua trong picker (null = picker dong)
  const [pickerSlot, setPickerSlot] = useState<number | null>(initialOverlay === "edit" ? 1 : null);
  const pickerOpen = pickerSlot != null;
  const [settings, setSettings] = useState<TipSettings | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  /** Khoa gui/rut 24h sau khi reset Passkey (ms) */
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  /** Bam vao QR -> copy dia chi, hien "Copied to clipboard" 2s */
  const [qrCopied, setQrCopied] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(initialOverlay === "logout");
  const [scanError, setScanError] = useState<string | null>(null);
  const [sendStep, setSendStep] = useState<"scan" | "sending" | "success">("scan");
  const [lastAmount, setLastAmount] = useState<number | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const address = primaryWallet.wallet_address;
  const hasWallet = !!address && address !== "0x0";
  const balanceNum = isNaN(balance.token) ? 0 : balance.token;
  const overlayOpen = menuOpen || pickerOpen || confirmLogout;

  const goTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  // ================= Du lieu: tip settings + giao dich ======================
  useEffect(() => {
    fetch("/api/tip-settings")
      .then((res) => res.json() as Promise<{ settings: TipSettings }>)
      .then((data) => setSettings(data.settings))
      .catch(() => toast.error("Could not load tip amounts"));
    setDismissed(readDismissed());
    fetch("/api/applock/status")
      .then((r) => (r.ok ? (r.json() as Promise<{ walletLockedUntil: number | null }>) : null))
      .then((s) => s && setLockedUntil(s.walletLockedUntil))
      .catch(() => {});
  }, []);

  const loadTransactions = useCallback(() => {
    fetch("/api/transactions")
      .then((res) => (res.ok ? (res.json() as Promise<{ transactions: TransactionRow[] }>) : null))
      .then((data) => data && setTransactions(data.transactions))
      .catch(() => {});
  }, []);

  // Poll nen moi 10s: so du + giao dich moi -> the "Received $X from ..."
  // hien ngay trong luc dang mo Home (phan hoi that 09-23).
  useEffect(() => {
    loadTransactions();
    const interval = setInterval(() => {
      refreshBalances().catch(() => {});
      loadTransactions();
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [refreshBalances, loadTransactions]);

  const defaultAmount = settings ? slotValue(settings, settings.default_slot) : null;

  // User chot 09-24b: Send Tip KHONG phai man mac dinh - dien thoai khoa /
  // app an xuong nen la tu ve tab Get Tip (tat camera), dong moi popup.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "hidden") return;
      setTab("get");
      setMenuOpen(false);
      setPickerSlot(null);
      setConfirmLogout(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // ================= Thong bao o tab Get Tip ================================
  const notices: Notice[] = [];
  if (lockedUntil && lockedUntil > Date.now()) {
    notices.push({ id: "wallet-locked", kind: "wallet-locked", until: lockedUntil });
  }
  const lowBalance =
    !balance.loading && !balanceError && (balanceNum <= 0 || (defaultAmount != null && balanceNum < defaultAmount));
  if (lowBalance && !dismissed.includes("low-balance")) {
    notices.push({ id: "low-balance", kind: "low-balance" });
  }
  const now = Date.now();
  for (const tx of transactions) {
    if (notices.length >= MAX_NOTICES) break;
    if (now - parseUtc(tx.createdAt) > NOTICE_WINDOW_MS) continue;
    const id = `${tx.direction}-${tx.createdAt}-${tx.counterparty}-${tx.amount}`;
    if (dismissed.includes(id)) continue;
    notices.push({
      id,
      kind: tx.direction === "in" ? "received" : "tipped",
      amount: tx.amount,
      address: tx.counterparty,
    });
  }
  // Canh bao het tien nam CUOI danh sach nhu Figma (xanh, do, roi vang)
  notices.sort((a, b) => Number(a.kind === "low-balance") - Number(b.kind === "low-balance"));
  // Khoa vi luon nam DAU (quan trong nhat)
  notices.sort((a, b) => Number(b.kind === "wallet-locked") - Number(a.kind === "wallet-locked"));

  const dismissNotice = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    // Canh bao het tien / khoa vi chi an trong phien nay - mo app lan sau
    // van con thi phai nhac lai.
    if (id === "low-balance" || id === "wallet-locked") return;
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next.filter((d) => d !== "low-balance" && d !== "wallet-locked").slice(-200)));
    } catch {
      // localStorage bi chan - chi an trong phien nay
    }
  };

  // ================= Camera (chi chay o tab Send, buoc scan) ================
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
          aspectRatio: 340 / 333,
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
    if (tab === "send" && sendStep === "scan" && !pickerOpen) startScanner();
    else stopScanner();
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, sendStep, pickerOpen]);

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
          ? "This QR isn't for USDC on Arc."
          : "This isn't a TapTip QR code.",
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
      const body = response ? ((await response.json().catch(() => null)) as SendErrorBody | null) : null;
      setScanError(describeSendError(body, "Send failed, try again."));
      setSendStep("scan");
      return;
    }

    setLastAmount(defaultAmount);
    setSendStep("success");
    refreshBalances().catch(() => {});
    loadTransactions();
    // Tip lien tiep nhieu nguoi: quay lai quet ngay, khong roi man
    // Popup "Tipped $X" 3s (user chot 09-24b: 2s nhanh qua) roi quet tiep
    setTimeout(() => setSendStep("scan"), 3000);
  };

  const handleScanResultRef = useRef(handleScanResult);
  useEffect(() => {
    handleScanResultRef.current = handleScanResult;
  });

  const copyFromQr = () => {
    navigator.clipboard.writeText(address).catch(() => {});
    setQrCopied(true);
    setTimeout(() => setQrCopied(false), 2000);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savePicker = (value: number) => {
    const slot = pickerSlot;
    setPickerSlot(null);
    if (settings && slot != null && value !== slotValue(settings, slot)) {
      saveSlotValue(settings, slot, value, setSettings);
    }
  };

  const balanceText = `$${formatAmount(balance.token)}`;

  return (
    <div data-home-root className="relative w-full h-full overflow-hidden">
      {/* ======= Noi dung chinh - bi lam mo khi mo menu / picker ======= */}
      <div
        className="absolute inset-0 transition-[filter] duration-150"
        style={overlayOpen ? { filter: "blur(4px)" } : undefined}
        aria-hidden={overlayOpen}
      >
        <div className="absolute flex items-center" style={{ left: 25, top: 0.32, width: 166, height: 49 }}>
          <TapTipWordmark fontSize={20} />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="absolute flex items-center justify-center text-foreground"
          style={{ left: 331.51, top: 8.16, width: 33.32, height: 33.32 }}
        >
          <Icon.Menu className="w-8 h-8" />
        </button>

        {/* Khung QR / camera */}
        <div
          className={`absolute rounded-[8px] overflow-hidden flex items-center justify-center ${
            tab === "get" ? "bg-white" : "bg-ink"
          }`}
          style={{ left: 25, top: 56.32, width: 340, height: 333 }}
        >
          {tab === "get" ? (
            hasWallet ? (
              <button type="button" onClick={copyFromQr} aria-label="Copy wallet address" className="relative block">
                <QRCodeSVG value={encodeTapTipQr(address)} size={333} marginSize={4} bgColor="#FFFFFF" fgColor="#000000" />
                {qrCopied && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-3 bg-foreground text-background font-body text-small font-bold rounded-full px-4 py-2 whitespace-nowrap">
                    Copied to clipboard
                  </span>
                )}
              </button>
            ) : (
              <p className="font-body text-body font-medium text-hint">Setting up your wallet...</p>
            )
          ) : (
            <div className="relative w-full h-full">
              <div id={QR_REGION_ID} className="w-full h-full" />
              {scanError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-ink">
                  <Icon.Warning className="w-8 h-8 text-danger mb-2" />
                  <p className="font-body text-small font-medium text-white/80">{scanError}</p>
                  <button onClick={startScanner} className="mt-4 font-body text-small font-bold text-primary underline">
                    Retry
                  </button>
                </div>
              )}
              {sendStep !== "scan" && (
                <div className="absolute inset-0 z-30 bg-ink flex flex-col items-center justify-center gap-3">
                  {sendStep === "sending" ? (
                    <>
                      <Icon.Loading className="w-10 h-10 text-primary animate-spin" />
                      <p className="font-display text-title font-bold text-white">Sending...</p>
                    </>
                  ) : (
                    <>
                      <Icon.Check className="w-10 h-10 text-brand" />
                      <p className="font-display text-title font-bold text-white">Tipped ${lastAmount}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Balance */}
        <div
          className="absolute flex items-center font-display font-bold text-body text-foreground leading-[40px]"
          style={{ left: 25, top: 397.32, height: 49 }}
        >
          Balance:
        </div>
        <div
          className="absolute flex items-center justify-center font-display font-bold text-brand leading-[40px] whitespace-nowrap"
          style={{ left: 113.97, top: 397.32, width: 162.13, height: 49, fontSize: balanceSizePx(balanceText) }}
        >
          {balanceText}
        </div>

        {/* The xam */}
        <div className="absolute bg-surface rounded-[8px]" style={{ left: 25, top: 446.32, width: 340, height: 235 }}>
          {tab === "get" ? (
            notices.length === 0 ? (
              <p className="absolute inset-0 flex items-center justify-center font-body text-small font-medium text-hint">
                No new activity
              </p>
            ) : (
              <div className="absolute flex flex-col" style={{ left: 8, top: 8, width: 324, gap: 8 }}>
                {notices.map((n) => (
                  <NoticeRow
                    key={n.id}
                    notice={n}
                    onDismiss={() => dismissNotice(n.id)}
                    onOpen={() => router.push("/dashboard/history")}
                  />
                ))}
              </div>
            )
          ) : settings ? (
            <TipAmountGrid
              settings={settings}
              onSettingsChange={setSettings}
              onEditSlot={setPickerSlot}
              initialEditing={initialOverlay === "choose"}
            />
          ) : null}
        </div>

        {balanceError && (
          <p
            className="absolute font-body text-small font-medium text-danger text-center leading-[20px]"
            style={{ left: 25, top: 688, width: 340, height: 44 }}
          >
            {balanceError}
          </p>
        )}

        {/* Thanh tab */}
        <div className="absolute bg-surface rounded-full" style={{ left: 25, top: 738, width: 340, height: 49.32 }}>
          <div
            className={`absolute top-0 rounded-full transition-[left,background-color] duration-200 ${
              tab === "get" ? "bg-brand" : "bg-danger"
            }`}
            style={{ left: tab === "get" ? 0 : 166, width: 174, height: 49.32 }}
          />
          <button
            type="button"
            onClick={() => setTab("get")}
            className={`absolute top-0 font-display text-title font-bold leading-[normal] ${
              tab === "get" ? "text-foreground" : "text-hint"
            }`}
            style={{ left: 0, width: 174, height: 49.32 }}
          >
            Get Tip
          </button>
          <button
            type="button"
            onClick={() => setTab("send")}
            className={`absolute top-0 font-display text-title font-bold leading-[normal] ${
              tab === "send" ? "text-foreground" : "text-hint"
            }`}
            style={{ left: 166, width: 174, height: 49.32 }}
          >
            Send Tip
          </button>
        </div>
      </div>

      {/* ======= Lop phu: menu / picker ======= */}
      {overlayOpen && (
        <div
          className="absolute inset-0 z-40"
          onClick={() => {
            setMenuOpen(false);
            setPickerSlot(null);
            setConfirmLogout(false);
          }}
          aria-hidden="true"
        />
      )}

      {menuOpen && (
        <div
          className="absolute z-50 bg-background border border-foreground rounded-[8px] flex flex-col items-end font-display text-small font-medium text-foreground leading-[32px]"
          style={{ left: 191.04, top: 48.97, width: 173.8, height: 212, padding: "10px 10px 10px 0" }}
        >
          <button type="button" onClick={copyAddress} className="flex items-center gap-1" aria-label="Copy wallet address">
            <span>{shortenAddress(address)}</span>
            {copied ? <Icon.Check className="w-4 h-4 text-brand" /> : <Icon.Copy className="w-4 h-4" />}
          </button>
          <button type="button" onClick={() => goTo("/dashboard/deposit")}>Deposit</button>
          <button type="button" onClick={() => goTo("/dashboard/withdraw")}>Withdraw</button>
          <button type="button" onClick={() => goTo("/dashboard/history")}>History</button>
          <button type="button" onClick={() => goTo("/dashboard/settings")}>Setting</button>
          <button
            type="button"
            className="text-danger"
            onClick={() => {
              setMenuOpen(false);
              setConfirmLogout(true);
            }}
          >
            Log out
          </button>
        </div>
      )}

      {/* Xac nhan dang xuat (user chot 09-24b) - cung kieu hop picker */}
      {confirmLogout && (
        <div
          className="absolute z-50 bg-background border border-foreground rounded-[8px] flex flex-col items-center"
          style={{ left: 24.96, top: 405.32, width: 340.07, padding: "24px 24px 16px", gap: 16 }}
        >
          <p className="font-display text-title font-bold text-foreground">Log out?</p>
          <p className="font-body text-small font-medium text-secondary-text text-center leading-[24px]">
            You&apos;ll need your email and a new code to sign in again.
          </p>
          <form action={signOutAction} className="w-full" style={{ height: 49.32 }}>
            <SlantButton type="submit">Log out</SlantButton>
          </form>
          <button
            type="button"
            onClick={() => setConfirmLogout(false)}
            className="font-display text-small font-semibold text-foreground underline"
          >
            Cancel
          </button>
        </div>
      )}

      {pickerSlot != null && settings && (
        <div className="absolute z-50" style={{ left: 24.96, top: 405.32 }}>
          <AmountPicker
            initialValue={slotValue(settings, pickerSlot) ?? 1}
            onSave={savePicker}
            onCancel={() => setPickerSlot(null)}
          />
        </div>
      )}
    </div>
  );
}

/** 1 dong thong bao 324x49 - Figma Rectangle 76/77/78 + chu 16/20 + dau X. */
function NoticeRow({
  notice,
  onDismiss,
  onOpen,
}: {
  notice: Notice;
  onDismiss: () => void;
  /** Bam vao dong Received/Tipped -> mo History (user chot 09-24b) */
  onOpen: () => void;
}) {
  const bg =
    notice.kind === "received" ? "bg-success-bg" : notice.kind === "tipped" ? "bg-danger-bg" : "bg-warning-bg";

  if (notice.kind === "wallet-locked") {
    return (
      <div className={`relative rounded-[8px] ${bg}`} style={{ height: 49 }}>
        <p
          className="absolute flex items-center font-body text-small font-medium text-foreground leading-[20px]"
          style={{ left: 7.62, top: 0, width: 277.31, height: 49 }}
        >
          <span>
            Sending is paused until <span className="font-bold">{formatLockUntil(notice.until)}</span> (Passkey was reset).
          </span>
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ right: 11.16, width: 16.7455, height: 17.4736 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/close-x.svg" alt="" width={16.7455} height={17.4736} />
        </button>
      </div>
    );
  }

  const isTx = notice.kind === "received" || notice.kind === "tipped";

  return (
    <div
      className={`relative rounded-[8px] ${bg} ${isTx ? "cursor-pointer" : ""}`}
      style={{ height: 49 }}
      onClick={isTx ? onOpen : undefined}
      role={isTx ? "button" : undefined}
    >
      <p
        className="absolute flex items-center font-body text-small font-medium text-foreground leading-[20px]"
        style={{ left: 7.62, top: 0, width: 277.31, height: 49 }}
      >
        {notice.kind === "low-balance" ? (
          <span>
            You don’t have enough USDC to tip. Please{" "}
            <a
              href={CIRCLE_FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline"
            >
              tap here to faucet
            </a>
            .
          </span>
        ) : (
          <span>
            {notice.kind === "received" ? "Received " : "Tipped "}
            <span className="font-bold">${formatAmount(notice.amount)}</span>
            {notice.kind === "received" ? " from " : " for "}
            {shortenAddress(notice.address)}
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        aria-label="Dismiss"
        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{ right: 11.16, width: 16.7455, height: 17.4736 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/close-x.svg" alt="" width={16.7455} height={17.4736} />
      </button>
    </div>
  );
}
