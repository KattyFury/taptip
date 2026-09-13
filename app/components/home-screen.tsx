"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import * as Icon from "@/components/icons";
import { useBalance, BalanceProvider } from "@/contexts/balanceContext";
import { SlantButton } from "@/components/screen";
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

  const hasWallet =
    !!primaryWallet.wallet_address && primaryWallet.wallet_address !== "0x0";

  const goTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  return (
    // LUOI 10 HANG PX CO DINH - dung TUYET DOI theo toa do that trong Figma
    // "Taptip" (get_design_context node 11:207/11:424, khong doan/them gi
    // ngoai file): cai gi Figma KHONG co (canh bao mang, dia chi tren than
    // Home) nghia la KHONG dung - dia chi vi chi hien trong Menu. Deposit/
    // History/Withdraw la MAN RIENG (/dashboard/deposit,history,withdraw),
    // khong con la popup - dung Figma ve chung thanh frame toan khung rieng
    // co Back+Done, khong phai the noi tren Home.
    //  1 : wordmark "TapTip" (chu) + icon Menu
    //  2-5 : QR to (4 hang, dung khop khoi "Rectangle 3")
    //  6 : "Balance: $XXX" (dong tren) + "Tip amount:" (dong duoi, cung hang)
    //  7 : preset tien tip (khoa/+ + toi da 5 nut, keo doc de chinh gia) -
    //      thay han popup Tip Setting + nut "Option" cu.
    //  8 : "Unlock then slide to edit, + to add value" (hint, dung chu
    //      Figma nguyen van)
    //  9 : Tap to Tip, full-width, hinh nghieng dac trung
    //  10 : cho bao loi so du (dung chu Figma "make it red, this size" - day
    //      la o day DE CHO thong bao loi, khong phai ghi chu bo di)
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
              {/* Card cat goc dac trung + VIEN XANH quanh het duong cat (ke
                  ca canh cheo) - clip-path khong tu ve duoc net vien tren
                  canh vua cat cua no (CSS border bi cat mat theo, de lo mau
                  nen phia sau, bug that 09-13), nen phai gia lap vien bang
                  2 LOP tt-card-cut long nhau: lop ngoai mau xanh (chinh la
                  "vien"), lop trong nen kem inset 2px de lo dung 2px xanh
                  quanh moi canh. Noi dung that nam tren lop nen, tu m-[2px]
                  de khop dung do inset cua lop nen ben duoi. */}
              <div className="absolute right-0 top-full z-50 mt-2 w-max tt-card-cut bg-brand shadow-modal">
                <div className="absolute inset-[2px] tt-card-cut bg-background" aria-hidden="true" />
                <div className="relative m-[2px] overflow-hidden">
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
                    onClick={() => goTo("/dashboard/deposit")}
                  >
                    <Icon.ArrowDown className="w-5 h-5 shrink-0" />
                    Deposit
                  </button>
                  <button
                    className="w-full flex items-center gap-3 text-left px-4 py-3 font-display text-lead font-semibold text-foreground border-b border-brand/30"
                    onClick={() => goTo("/dashboard/withdraw")}
                  >
                    <Icon.ArrowUp className="w-5 h-5 shrink-0" />
                    Withdraw
                  </button>
                  <button
                    className="w-full flex items-center gap-3 text-left px-4 py-3 font-display text-lead font-semibold text-foreground border-b border-brand/30"
                    onClick={() => goTo("/dashboard/history")}
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
          // Sharp corners, KHONG bo goc/nghieng - dung Figma "Rectangle 3"
          // (bg-black phang, khong rounded) - QR phai vuong nguyen de quet
          // duoc, day la ngoai le co chu dich duy nhat trong he thong.
          <div className="h-full aspect-square max-w-full p-4 bg-background border-2 border-brand flex items-center justify-center">
            <QRCodeSVG
              value={encodeTapTipQr(primaryWallet.wallet_address)}
              size={260}
              className="w-full h-full"
              fgColor="#000000"
            />
          </div>
        ) : (
          <div className="h-full aspect-square max-w-full flex items-center justify-center border-2 border-brand font-body text-lead text-accent text-center px-4">
            Setting up your wallet...
          </div>
        )}
      </div>

      {/* Hang 6 : dung 2 dong nhu Figma - "Balance: $XXX" tren, "Tip amount:"
          duoi, cung 1 hang (node 11:213/11:214 + 11:218). */}
      <div className="flex flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <span className="font-body text-lead text-foreground">Balance:</span>
          <span className="font-display text-figure font-bold text-brand leading-none">
            ${formatBalance(balance.token)}
          </span>
        </div>
        <span className="font-body text-lead text-foreground">Tip amount:</span>
      </div>

      {/* Hang 7 : preset tien tip - khoa/+ ben trai, cac nut $ ben phai */}
      <TipPresetsRow />

      {/* Hang 8 : hint nguyen van Figma (node 11:219) */}
      <div className="flex items-center">
        <span className="font-body text-small text-accent">
          Unlock then slide to edit, + to add value
        </span>
      </div>

      {/* Hang 9 : Tap to Tip, full-width, hinh nghieng dac trung */}
      <div className="flex items-center min-w-0">
        <SlantButton
          style={{ width: "100%", height: "70px" }}
          className="text-title"
          onClick={() => router.push("/dashboard/tip")}
        >
          Tap to Tip
        </SlantButton>
      </div>

      {/* Hang 10 : cho bao loi so du */}
      <div className="flex items-center justify-center">
        {balanceError && (
          <p className="font-body text-small font-semibold text-danger text-center">
            {balanceError}
          </p>
        )}
      </div>
    </div>
  );
}
