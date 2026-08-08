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
import { WalletBalance } from "@/components/wallet-balance";

interface Props {
  primaryWallet: {
    wallet_address: string;
  };
  historyContent: React.ReactNode;
}

export default function HomeScreen({ primaryWallet, historyContent }: Props) {
  const { balance } = useBalance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<"main" | "history">("main");

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
      {/* Hang 1: Balance */}
      <div className="flex flex-col items-center pt-8">
        <div className="text-4xl font-bold">{formattedBalance} USDC</div>
      </div>

      {/* Hang 2-5: QR code cua vi minh */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {hasWallet ? (
          <div className="p-4 bg-white rounded-2xl border">
            <QRCodeSVG value={primaryWallet.wallet_address} size={220} />
          </div>
        ) : (
          <div className="w-[220px] h-[220px] flex items-center justify-center border rounded-2xl text-sm text-muted-foreground text-center px-4">
            Đang tạo ví...
          </div>
        )}
        {/* Hang 6: chu thich */}
        <p className="text-sm text-muted-foreground text-center px-8">
          Cho người khác quét để nhận tip
        </p>
      </div>

      {/* Hang 9: 2 nut hanh dong */}
      <div className="flex gap-2 pb-3">
        <Button
          variant="secondary"
          className="flex-1 py-6 rounded-full"
          onClick={() => toast.info("Tip ngẫu nhiên - sắp có")}
        >
          <Shuffle className="mr-1 h-4 w-4" />
          Ngẫu nhiên
        </Button>
        <Button
          className="flex-[2] py-6 rounded-full text-lg font-semibold"
          onClick={() => toast.info("Quét QR để tip - sắp có")}
        >
          <Send className="mr-1 h-4 w-4" />
          Tip
        </Button>
      </div>

      {/* Hang 10: icon menu */}
      <div className="pb-4">
        <Dialog open={menuOpen} onOpenChange={closeMenu}>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
            <Menu />
          </Button>
          <DialogContent className="sm:max-w-md">
            {menuView === "main" ? (
              <>
                <DialogHeader>
                  <DialogTitle>Số dư & Ví</DialogTitle>
                </DialogHeader>
                <WalletBalance />
                <Button variant="outline" className="w-full" disabled>
                  Rút (chưa khả dụng)
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMenuView("history")}
                >
                  Lịch sử tip
                </Button>
              </>
            ) : (
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
