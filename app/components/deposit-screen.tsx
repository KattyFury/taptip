"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Screen, BackAction, StepDot } from "@/components/screen";
import { SlantButton } from "@/components/ui";
import * as Icon from "@/components/icons";
import { shortenAddress } from "@/lib/utils/address";

const CIRCLE_FAUCET_URL = "https://faucet.circle.com/";

/**
 * Man Deposit - Figma "deposit" (38:413), ban cap nhat 09-24b:
 *   - doan mo ta Quicksand Medium 19/30 (khac cac man khac 20/40)
 *   - danh sach 2 dong tu y=276 (moi dong cao 40): cham vang so o x=33,
 *     chu XANH LA dam 19px o x=66 - dong 1 dia chi vi + copy, dong 2 link
 *     "Open Circle Faucet" gach chan. (Ban truoc con xanh duong #155EEF +
 *     Sora - Figma moi da doi.)
 */
export function DepositScreen({ walletAddress }: { walletAddress: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Screen
      title="Deposit"
      action={
        <BackAction onBack={() => router.push("/dashboard")}>
          <SlantButton onClick={() => router.push("/dashboard")}>Done</SlantButton>
        </BackAction>
      }
    >
      <p className="font-body text-[19px] font-medium text-foreground leading-[30px]">
        Send USDC (Arc network) to your wallet address below, or use the Circle Faucet.
      </p>

      <ol className="absolute flex flex-col" style={{ left: 0, top: 106.32 }}>
        <li className="flex items-center" style={{ height: 40, paddingLeft: 8, gap: 8 }}>
          <StepDot n={1} />
          <button
            type="button"
            onClick={copyAddress}
            aria-label="Copy wallet address"
            className="flex items-center gap-1.5 font-display text-[19px] font-bold text-brand leading-[40px]"
          >
            {shortenAddress(walletAddress)}
            {copied ? <Icon.Check className="w-4 h-4" /> : <Icon.Copy className="w-4 h-4" />}
          </button>
        </li>
        <li className="flex items-center" style={{ height: 40, paddingLeft: 8, gap: 8 }}>
          <StepDot n={2} />
          <a
            href={CIRCLE_FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-[19px] font-bold text-brand underline leading-[40px]"
          >
            Open Circle Faucet
          </a>
        </li>
      </ol>
    </Screen>
  );
}
