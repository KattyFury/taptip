"use client";

import { useRouter } from "next/navigation";
import { Screen, BackAction, ROW_H, SLANT_X, SLANT_W, CONTENT_X, rowTop } from "@/components/screen";
import { SlantButton } from "@/components/ui";
import { useState } from "react";
import * as Icon from "@/components/icons";
import { shortenAddress } from "@/lib/utils/address";

const CIRCLE_FAUCET_URL = "https://faucet.circle.com/";

/**
 * Man Deposit - Figma frame "7" (node 30:65).
 *   body      30:69  y=170 x=25 w=340 h=244, Montserrat Medium 19px leading 30
 *   o dia chi 30:72  y=284, dai nut x=25..365 (quy luat 09-18), nen cream + vien xanh 1px,
 *                    nhan Sora SemiBold 19px mau brand, CAN GIUA
 *   faucet    30:73  y=341, dai nut x=25..365, nen vang, nhan Sora SemiBold 19px
 *   Back+Done y=738
 */
export function DepositScreen({ walletAddress }: { walletAddress: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Toa do trong vung noi dung (goc = rowTop(4) = 170.4, left = 25)
  const slantLeft = SLANT_X - CONTENT_X; // 0 - dai nut trung vung noi dung
  const addrTop = rowTop(6) - rowTop(4); // 113.6
  const faucetTop = rowTop(7) - rowTop(4); // 170.4

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
        Send USDC (Arc network) to your wallet address below, or use the Circle Faucet
      </p>

      <div
        className="absolute"
        style={{ left: slantLeft, top: addrTop, width: SLANT_W, height: ROW_H }}
      >
        <SlantButton
          variant="outline"
          size="inline"
          onClick={copyAddress}
          aria-label="Copy wallet address"
        >
          {shortenAddress(walletAddress)}
          {copied ? (
            <Icon.Check className="w-4 h-4 text-success" />
          ) : (
            <Icon.Copy className="w-4 h-4" />
          )}
        </SlantButton>
      </div>

      <div
        className="absolute"
        style={{ left: slantLeft, top: faucetTop, width: SLANT_W, height: ROW_H }}
      >
        <SlantButton
          size="inline"
          onClick={() => window.open(CIRCLE_FAUCET_URL, "_blank", "noopener,noreferrer")}
        >
          Open Circle Faucet
        </SlantButton>
      </div>
    </Screen>
  );
}
