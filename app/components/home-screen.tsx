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
import { encodeTapTipQr } from "@/lib/utils/qr-payment";

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
    <div data-home-root className="flex flex-col h-full">
      {/* He luoi 10 hang cho ca man hinh. BAT BUOC dung flex: "N 1 0" -
          flexBasis PHAI la 0, neu chi dat flexGrow thi trinh duyet chi chia
          phan DU sau khi tru kich thuoc noi dung, hang nao noi dung to (QR)
          se tu chiem nhieu hon phan cua no -> lech het luoi.
          Tong: 1 + 0.5 + 3 + 0.5 + 1 + 2 + 1 + 1 = 10 */}

      {/* Hang 0-1: Balance */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex items-center justify-center">
        <div className="text-[4.5vh] font-bold text-center">
          Số dư: {formattedBalance} USDC
        </div>
      </div>

      {/* Hang 1-1.5: khoang cach truoc QR */}
      <div style={{ flex: "0.5 1 0" }} />

      {/* Hang 1.5-4.5: QR, cao dung 3 hang, vuong theo chieu cao hang */}
      <div style={{ flex: "3 1 0", minHeight: 0 }} className="flex items-center justify-center">
        {hasWallet ? (
          <div
            style={{ height: "100%", aspectRatio: "1" }}
            className="p-[1.5vh] bg-white rounded-2xl border flex items-center justify-center"
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
            className="flex items-center justify-center border rounded-2xl text-[1.8vh] text-muted-foreground text-center px-4"
          >
            Đang tạo ví...
          </div>
        )}
      </div>

      {/* Hang 4.5-5: khoang cach sau QR */}
      <div style={{ flex: "0.5 1 0" }} />

      {/* Hang 5-6: chu thich */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex items-center justify-center">
        <p className="text-[1.8vh] text-muted-foreground text-center px-8">
          Cho người khác quét để nhận tip, chỉ nhận USDC mạng Arc Testnet
        </p>
      </div>

      {/* Hang 6-8: khoang trong */}
      <div style={{ flex: "2 1 0" }} />

      {/* Hang 8-9: 2 nut hanh dong. TUYET DOI khong dat padding tren hang -
          padding la kich thuoc toi thieu khong co duoc, se bi CONG THEM ngoai
          phan chia ty le, day hang phinh to va lech ca luoi. Muon co khoang
          tho thi cho nut cao theo % chieu cao hang. */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex gap-2 items-center">
        <Button
          variant="secondary"
          style={{ flex: "1 1 0" }}
          className="h-[80%] rounded-full text-[1.8vh]"
          disabled
          onClick={startRandomTip}
        >
          <Shuffle className="mr-1 h-[2vh] w-[2vh]" />
          Ngẫu nhiên
        </Button>
        <Button
          style={{ flex: "2 1 0" }}
          className="h-[80%] rounded-full text-[2.2vh] font-semibold"
          onClick={() => {
            setRandomSendAmount(undefined);
            setSendOpen(true);
          }}
        >
          <Send className="mr-1 h-[2.2vh] w-[2.2vh]" />
          Tip
        </Button>
      </div>

      <SendFlow
        open={sendOpen}
        onOpenChange={setSendOpen}
        initialAmount={randomSendAmount}
      />

      {/* Hang 9-10: icon menu */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex items-center">
        <Dialog open={menuOpen} onOpenChange={closeMenu}>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
            <Menu className="h-[2.2vh] w-[2.2vh]" />
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
