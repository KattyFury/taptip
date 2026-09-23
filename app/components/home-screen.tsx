"use client";

import { useEffect, useRef, useState } from "react";
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

/** Poll nen moi 10s de bat duoc tip MOI NHAN trong luc dang dung tren Home -
 * truoc day balance chi fetch 1 lan luc mount, ai gui tien cho minh trong
 * luc minh dang mo app se khong bao gio thay so du cap nhat tru khi tu tay
 * roi/mo lai man (phan hoi that 09-23: "so du khong update nhanh"). */
const BALANCE_POLL_MS = 10000;

function HomeScreenContent({ primaryWallet }: Props) {
  const router = useRouter();
  const { balance, balanceError, refreshBalances } = useBalance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState<number | null>(null);

  const hasWallet =
    !!primaryWallet.wallet_address && primaryWallet.wallet_address !== "0x0";

  useEffect(() => {
    const interval = setInterval(() => {
      refreshBalances().catch(() => {});
    }, BALANCE_POLL_MS);
    return () => clearInterval(interval);
  }, [refreshBalances]);

  // So sanh voi lan doc TRUOC do (khong phai lan dau tien) de phat hien
  // "vua co tien vao" - lan dau mount chi ghi nhan moc, khong bao "nhan tien"
  // (moc chua tung biet truoc do). Epsilon nho de tranh nhieu lam tron float.
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

      {/* Khung QR - node 11:211 goc Figma la 340x333 nen den, nhung phan hoi
          that 09-23 (user chot thang, bo qua Figma cu o day): "bo hoan toan
          cac vien den di, hien thi QR to ro dung phan thuoc ve no" - KHONG
          con khung den trang tri nao nua, QR chiem full 340x333 duoc cap,
          tu no la 1 khoi trang+den ro rang, khong co lop nen den bao quanh.
          Giu `marginSize={4}` (quiet zone trang chuan ISO/IEC 18004, xem
          giai thich cu trong git log) vi day la phan TRANG thuoc chinh QR,
          khac hoan toan voi khung den trang tri da bi bo. */}
      <div
        className="absolute overflow-hidden flex items-center justify-center"
        style={{ left: 25.04, top: 57, width: 340, height: 333 }}
      >
        {hasWallet ? (
          <QRCodeSVG
            value={encodeTapTipQr(primaryWallet.wallet_address)}
            size={333}
            marginSize={4}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        ) : (
          <div className="font-body text-body text-foreground/50 text-center px-4">
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

      {/* "Tap to tip" - node 29:16 y=738 h=49; dai nut x=25..365 theo quy
          luat chung (hinh nhin thay tinh ca phan nghieng, xem screen.tsx) */}
      <div className="absolute" style={{ left: 25, top: 738, width: 340, height: 49 }}>
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

      {/* Popup bao "vua nhan tip" - phan hoi that 09-23: dung Home ma co
          nguoi tip minh thi khong biet gi ca, khong the doi refresh thu
          cong. Dat o HANG 1 (dung nghia den: de theo bang so lieu Figma,
          hang 1 = y=0..48.8, dung noi logo/nut menu dang nam), tu an sau
          3s (dong bo voi timeout xoa state o useEffect tren). z-60 - CAO
          HON menu (z-50) va lop mo menuOpen (khong bi mo/che khi menu dang
          mo) vi day la thong bao quan trong hon UI dang mo. */}
      {receivedAmount != null && (
        <div
          className="absolute z-[60] flex items-center justify-center bg-success text-background font-display text-body font-bold rounded-[8px] shadow-btn pointer-events-none"
          style={{ left: 25.04, top: 0, width: 340, height: 48.8 }}
        >
          +${formatBalance(receivedAmount)} received
        </div>
      )}

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
