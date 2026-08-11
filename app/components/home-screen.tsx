"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as Icon from "@/components/icons";
import { useBalance } from "@/contexts/balanceContext";
import SendFlow from "@/components/send-flow";
import { encodeTapTipQr } from "@/lib/utils/qr-payment";
import { signOutAction } from "@/app/actions";

const CIRCLE_FAUCET_URL = "https://faucet.circle.com/";

interface Props {
  primaryWallet: {
    wallet_address: string;
  };
  accountName: string;
  historyContent: React.ReactNode;
}

/** So nguyen, gioi han 0-9999 - dung chung cho ca man chinh lan popup Menu. */
function toBalanceInt(token: number): number {
  if (isNaN(token)) return 0;
  return Math.max(0, Math.min(9999, Math.floor(token)));
}

/**
 * "$XXXX" luon du 4 chu so de do rong khong nhay khi so du doi - chu so 0
 * dan dau khong co nghia thi ve vo hinh (invisible, van chiem cho) thay vi
 * an han, giu dung vi tri can giua cua ca cum.
 */
function BalanceDigits({
  amount,
  className = "",
}: {
  amount: number;
  className?: string;
}) {
  const trueDigits = toBalanceInt(amount).toString();
  const padded = trueDigits.padStart(4, "0");
  const leadingZeros = padded.length - trueDigits.length;

  return (
    <span className={"font-num tabular-nums " + className}>
      {padded.split("").map((digit, i) => (
        <span key={i} className={i < leadingZeros ? "invisible" : undefined}>
          {digit}
        </span>
      ))}
    </span>
  );
}

function shortenAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function HomeScreen({ primaryWallet, accountName, historyContent }: Props) {
  const { balance } = useBalance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<
    "main" | "deposit" | "withdraw" | "history"
  >("main");
  const [sendOpen, setSendOpen] = useState(false);
  const [randomSendAmount, setRandomSendAmount] = useState<string | undefined>();

  const startRandomTip = () => {
    const balanceNum = isNaN(balance.token) ? 0 : balance.token;
    if (balanceNum <= 0) {
      toast.error("Not enough balance for a random tip");
      return;
    }
    const max = Math.min(5, balanceNum);
    const random = Math.max(0.1, Math.random() * max);
    setRandomSendAmount(random.toFixed(2));
    setSendOpen(true);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(primaryWallet.wallet_address);
    toast.success("Wallet address copied");
  };

  const hasWallet =
    !!primaryWallet.wallet_address && primaryWallet.wallet_address !== "0x0";

  const closeMenu = (open: boolean) => {
    setMenuOpen(open);
    if (!open) setMenuView("main");
  };

  return (
    // KHONG dat padding doc o day. Ban thiet ke goc co pb 16px, nhung padding
    // an vao chieu cao luoi -> 10 hang khong con chia tron khung, icon menu roi
    // ve vach 9.32 thay vi 9.5. Luoi phai neo dung dinh 0 / day 10 cua khung.
    <div data-home-root className="relative flex flex-col h-full">
      {/* ================== LUOI 10 HANG MAN HOME ==========================
          Tong: 1 + 0.5 + 3 + 0.25 + 1 + 2.25 + 1 + 1 = 10

            0.00 - 1.00   so du
            1.00 - 1.50   dem
            1.50 - 4.50   QR (vuong theo chieu cao hang)
            4.50 - 4.75   dem sat QR
            4.75 - 5.75   chu thich
            5.75 - 8.00   khoang trong
            8.00 - 9.00   nut Random + Tip (cao 66.6% hang)
            9.00 - 10.00  icon menu, GOC TRAI-DUOI (tam doc o vach 9.5)

          3 luat bat buoc: xem components/screen.tsx.
          ==================================================================== */}

      {/* 0.00 - 1.00 : so du. Nhan "Balance: $" dung yen, 4 chu so co do rong
          co dinh (xem BalanceDigits) de ca cum khong nhun khi so du doi. */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="flex items-center justify-center"
      >
        <div className="flex items-baseline gap-1">
          <span className="text-lead font-bold text-accent shrink-0">
            Balance: $
          </span>
          <BalanceDigits amount={balance.token} className="text-figure font-bold" />
        </div>
      </div>

      {/* 1.00 - 1.50 */}
      <div style={{ flex: "0.5 1 0" }} />

      {/* 1.50 - 4.50 : QR nhan tien */}
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
            Creating wallet...
          </div>
        )}
      </div>

      {/* 4.50 - 4.75 */}
      <div style={{ flex: "0.25 1 0" }} />

      {/* 4.75 - 5.75 : chu thich, 2 dong */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="flex items-center justify-center"
      >
        <p className="text-lead font-bold text-accent text-center px-[30px]">
          Scan to send me a tip
          <br />
          Only USDC on Arc Testnet
        </p>
      </div>

      {/* 5.75 - 8.00 */}
      <div style={{ flex: "2.25 1 0" }} />

      {/* 8.00 - 9.00 : hai nut hanh dong.
          minWidth:0 bat buoc tren ca hang lan tung nut - mac dinh flex item co
          min-width:auto khien hang khong co ngang duoc va tran ra le. */}
      <div
        style={{ flex: "1 1 0", minHeight: 0, minWidth: 0 }}
        className="relative z-10 flex items-center gap-2"
      >
        <button
          style={{ flex: "1 1 0", minWidth: 0 }}
          className="h-[66.6%] rounded-full bg-surface text-foreground opacity-50 shadow-btn flex items-center justify-center disabled:pointer-events-none"
          disabled
          onClick={startRandomTip}
          aria-label="Random tip amount"
        >
          <Icon.Dice className="w-[3cqh] h-[3cqh] shrink-0" />
        </button>
        <button
          style={{ flex: "2 1 0", minWidth: 0 }}
          className="h-[66.6%] rounded-full bg-primary text-primary-foreground shadow-btn flex items-center justify-center gap-[6px] text-[2.58cqh] font-extrabold"
          onClick={() => {
            setRandomSendAmount(undefined);
            setSendOpen(true);
          }}
        >
          <Icon.Tip className="w-[2.15cqh] h-[2.15cqh] shrink-0" />
          Tip
        </button>
      </div>

      <SendFlow
        open={sendOpen}
        onOpenChange={setSendOpen}
        initialAmount={randomSendAmount}
      />

      {/* 9.00 - 10.00 : icon menu o GOC TRAI-DUOI, tam doc dung vach 9.5.
          overflow-hidden + relative: khoanh vung dung cho ca mang tron trang
          tri lan vung bam nut Menu, khong cho tran len hang 9. */}
      <div
        style={{ flex: "1 1 0", minHeight: 0 }}
        className="relative z-10 flex items-center justify-start overflow-hidden"
      >
        {/* Mang tron vang trang tri o goc trai-duoi. Tam dat o (1.7cqh, day
            khung) nen chi lo ra mot phan tu - nam duoi icon menu. Kich thuoc
            quy doi sang cqh (truoc la px cung) de khong bao gio lan qua hang
            9 tren man hinh khac ty le luc test - overflow-hidden cua hang
            nay cat dut phan con lai bat ke sai so lam tron. */}
        <div
          aria-hidden
          className="absolute left-[1.7cqh] bottom-0 w-[20cqh] h-[20cqh] rounded-full bg-primary -translate-x-1/2 translate-y-1/2 z-0"
        />

        <Dialog open={menuOpen} onOpenChange={closeMenu}>
          {/* p + -ml bu lai phan padding: vung bam to gan bang mang tron ma
              khong lam icon Menu doi vi tri hien thi (xem giai thich trong
              HANDOFF.md). */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="relative z-10 flex items-center justify-center p-[3cqh] -ml-[3cqh]"
          >
            <Icon.Menu className="w-[3cqh] h-[3cqh] text-foreground" />
          </button>

          <DialogContent
            className={
              (menuView === "history" ? "max-h-[70%] gap-3" : "gap-3") +
              " relative"
            }
          >
            {menuView === "main" && (
              <>
                <DialogClose asChild>
                  <button
                    aria-label="Close menu"
                    className="absolute top-4 right-4 text-foreground"
                  >
                    <Icon.Cancel className="w-[22px] h-[22px]" />
                  </button>
                </DialogClose>

                <DialogHeader>
                  <DialogTitle>Menu</DialogTitle>
                </DialogHeader>

                <div className="flex items-baseline justify-center gap-1 py-2">
                  <span className="text-[17px] font-bold text-accent shrink-0">
                    Balance: $
                  </span>
                  <BalanceDigits amount={balance.token} className="text-[28px] font-bold" />
                </div>

                <div className="flex flex-col gap-1 text-center">
                  <p className="text-[17px] font-bold">Account: {accountName}</p>
                  <div className="flex items-center justify-center gap-2 text-[14px] text-hint">
                    <span>Address: {shortenAddress(primaryWallet.wallet_address)}</span>
                    <button onClick={copyAddress} aria-label="Copy wallet address">
                      <Icon.Copy className="w-[14px] h-[14px]" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-[10px]">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      copyAddress();
                      setMenuView("deposit");
                    }}
                  >
                    Deposit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setMenuView("withdraw")}
                  >
                    Withdraw
                  </Button>
                </div>
                <Button variant="outline" onClick={() => setMenuView("history")}>
                  Tip History
                </Button>

                {/* Dang xuat khong co trong ban thiet ke handoff, nhung day la
                    loi ra duy nhat cua app - de tam o day cho khoi mat chuc
                    nang, cho ban thiet ke chot cho dat chinh thuc. */}
                <form action={signOutAction} className="flex justify-center">
                  <Button
                    variant="link"
                    size="text"
                    type="submit"
                    className="text-destructive"
                  >
                    Sign out
                  </Button>
                </form>
              </>
            )}

            {menuView === "deposit" && (
              <>
                <DialogHeader>
                  <DialogTitle>Deposit USDC (testnet)</DialogTitle>
                </DialogHeader>
                <p className="text-[21px] font-bold text-accent">
                  Your wallet address has been copied:
                </p>
                <code className="text-[14px] font-mono bg-surface p-[10px] rounded-xl break-all block">
                  {primaryWallet.wallet_address}
                </code>
                <ol className="text-[17px] list-decimal pl-5 flex flex-col gap-1.5">
                  <li>Open the Circle Faucet page</li>
                  <li>Paste the wallet address you just copied</li>
                  <li>Click Request on that page</li>
                </ol>
                <Button size="block" asChild>
                  <a
                    href={CIRCLE_FAUCET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Circle Faucet
                  </a>
                </Button>
                <Button
                  variant="link"
                  size="text"
                  onClick={() => setMenuView("main")}
                >
                  Back
                </Button>
              </>
            )}

            {menuView === "withdraw" && (
              <>
                <DialogHeader>
                  <DialogTitle>Withdraw</DialogTitle>
                </DialogHeader>
                <p className="text-[21px] font-bold text-accent">
                  This feature isn&apos;t available yet - withdrawals only open
                  on mainnet.
                </p>
                <Button size="block" onClick={() => setMenuView("main")}>
                  Got it
                </Button>
              </>
            )}

            {menuView === "history" && (
              <>
                <DialogHeader>
                  <DialogTitle>Tip history</DialogTitle>
                </DialogHeader>
                {historyContent}
                <Button
                  variant="link"
                  size="text"
                  onClick={() => setMenuView("main")}
                >
                  Back
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
