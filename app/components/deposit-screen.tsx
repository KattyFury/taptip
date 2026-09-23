"use client";

import { useRouter } from "next/navigation";
import { Screen, BackAction, rowTop } from "@/components/screen";
import { SlantButton } from "@/components/ui";
import { useState } from "react";
import * as Icon from "@/components/icons";
import { shortenAddress } from "@/lib/utils/address";

const CIRCLE_FAUCET_URL = "https://faucet.circle.com/";

/**
 * Man Deposit - Figma frame "29" (node 38:413), redesign 09-24.
 *
 * Doi khac han ban truoc: dia chi vi + link Faucet gio la CHU CO GACH CHAN
 * (khong phai nut pill day du) kem huy hieu tron vang danh so 1/2 - dung
 * cung ngon ngu voi danh sach 5 buoc o man PWA-install. Mau chu xanh
 * #155EEF + font Sora - day la CHO DUY NHAT trong toan bo redesign Figma
 * moi con giu mau/font he cu (moi noi khac da doi qua Quicksand/den/xanh
 * la), nhieu kha nang la 1 o Figma designer chua kip cap nhat - nhung user
 * yeu cau "lam giong Figma 100%" nen giu dung nhu Figma ve, khong tu sua.
 */
export function DepositScreen({ walletAddress }: { walletAddress: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Toa do trong vung noi dung (goc = rowTop(4))
  const addrTop = rowTop(6) - rowTop(4);
  const faucetTop = addrTop + 48.8 + 8;

  return (
    <Screen
      title="Deposit"
      action={
        <BackAction onBack={() => router.push("/dashboard")}>
          <SlantButton onClick={() => router.push("/dashboard")}>Done</SlantButton>
        </BackAction>
      }
    >
      <p className="font-body text-body font-medium text-foreground text-left w-full leading-[30px]">
        Send USDC (Arc network) to your wallet address below, or use the Circle Faucet.
      </p>

      <button
        type="button"
        onClick={copyAddress}
        aria-label="Copy wallet address"
        className="absolute flex items-center gap-2"
        style={{ left: 0, top: addrTop, height: 25 }}
      >
        <span className="rounded-full bg-primary text-foreground font-display font-bold text-small w-[25px] h-[25px] flex items-center justify-center shrink-0">
          1
        </span>
        <span className="font-display font-bold text-body text-[#155eef] underline">
          {shortenAddress(walletAddress)} [copy]
        </span>
        {copied ? <Icon.Check className="w-4 h-4 text-success" /> : null}
      </button>

      <button
        type="button"
        onClick={() => window.open(CIRCLE_FAUCET_URL, "_blank", "noopener,noreferrer")}
        className="absolute flex items-center gap-2"
        style={{ left: 0, top: faucetTop, height: 25 }}
      >
        <span className="rounded-full bg-primary text-foreground font-display font-bold text-small w-[25px] h-[25px] flex items-center justify-center shrink-0">
          2
        </span>
        <span className="font-display font-bold text-body text-[#155eef] underline">
          Open Circle Faucet
        </span>
      </button>
    </Screen>
  );
}
