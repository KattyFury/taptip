"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Menu, Shuffle, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBalance } from "@/contexts/balanceContext";
import SendFlow from "@/components/send-flow";

const CIRCLE_FAUCET_URL = "https://faucet.circle.com/";

interface Props {
  primaryWallet: {
    wallet_address: string;
  };
  historyContent: React.ReactNode;
}

export default function HomeScreen({ primaryWallet, historyContent }: Props) {
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
      toast.error("Không đủ số dư để tip ngẫu nhiên");
      return;
    }
    const max = Math.min(5, balanceNum);
    const random = Math.max(0.1, Math.random() * max);
    setRandomSendAmount(random.toFixed(2));
    setSendOpen(true);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(primaryWallet.wallet_address);
    toast.success("Đã copy địa chỉ ví");
  };

  const formattedBalance =
    isNaN(balance.token) || balance.token === 0 ? "0" : balance.token.toFixed(2);

  const hasWallet =
    !!primaryWallet.wallet_address && primaryWallet.wallet_address !== "0x0";

  const closeMenu = (open: boolean) => {
    setMenuOpen(open);
    if (!open) setMenuView("main");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hang 1-6: Balance + QR + chu thich, can giua chung 1 khoi */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-4xl font-bold">{formattedBalance} USDC</div>

        {hasWallet ? (
          <div className="p-4 bg-white rounded-2xl border">
            <QRCodeSVG value={primaryWallet.wallet_address} size={220} />
          </div>
        ) : (
          <div className="w-[220px] h-[220px] flex items-center justify-center border rounded-2xl text-sm text-muted-foreground text-center px-4">
            Đang tạo ví...
          </div>
        )}
        <p className="text-sm text-muted-foreground text-center px-8">
          Cho người khác quét để nhận tip
        </p>
      </div>

      {/* Hang 9: 2 nut hanh dong, to du chieu cao 1 hang */}
      <div className="flex gap-2 pb-3">
        <Button
          variant="secondary"
          className="flex-1 h-20 rounded-full"
          disabled
          onClick={startRandomTip}
        >
          <Shuffle className="mr-1 h-4 w-4" />
          Ngẫu nhiên
        </Button>
        <Button
          className="flex-[2] h-20 rounded-full text-lg font-semibold"
          onClick={() => {
            setRandomSendAmount(undefined);
            setSendOpen(true);
          }}
        >
          <Send className="mr-1 h-4 w-4" />
          Tip
        </Button>
      </div>

      <SendFlow
        open={sendOpen}
        onOpenChange={setSendOpen}
        initialAmount={randomSendAmount}
      />

      {/* Hang 10: icon menu */}
      <div className="pb-4">
        <Dialog open={menuOpen} onOpenChange={closeMenu}>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
            <Menu />
          </Button>
          <DialogContent className="sm:max-w-md">
            {menuView === "main" && (
              <>
                <DialogHeader>
                  <DialogTitle>Số dư & Ví</DialogTitle>
                </DialogHeader>
                <div className="text-2xl font-bold text-center py-2">
                  {formattedBalance} USDC
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    copyAddress();
                    setMenuView("deposit");
                  }}
                >
                  Nạp
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMenuView("withdraw")}
                >
                  Rút
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMenuView("history")}
                >
                  Lịch sử tip
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Thoát
                </Button>
              </>
            )}

            {menuView === "deposit" && (
              <>
                <DialogHeader>
                  <DialogTitle>Nạp USDC (testnet)</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Đã tự copy địa chỉ ví của bạn:
                </p>
                <code className="text-xs break-all bg-muted p-2 rounded block">
                  {primaryWallet.wallet_address}
                </code>
                <ol className="text-sm list-decimal list-inside space-y-1">
                  <li>Mở trang Circle Faucet</li>
                  <li>Dán địa chỉ ví vừa copy</li>
                  <li>Bấm Request trên trang đó</li>
                </ol>
                <Button className="w-full" asChild>
                  <a href={CIRCLE_FAUCET_URL} target="_blank" rel="noopener noreferrer">
                    Mở trang Circle Faucet
                  </a>
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setMenuView("main")}>
                  Quay lại
                </Button>
              </>
            )}

            {menuView === "withdraw" && (
              <>
                <DialogHeader>
                  <DialogTitle>Rút</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Tính năng chưa khả dụng — rút chỉ mở ở mainnet.
                </p>
                <Button className="w-full" onClick={() => setMenuView("main")}>
                  Đã hiểu
                </Button>
              </>
            )}

            {menuView === "history" && (
              <>
                <DialogHeader>
                  <DialogTitle>Lịch sử tip</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                  {historyContent}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
