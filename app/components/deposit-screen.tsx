"use client";

import { useRouter } from "next/navigation";
import { Screen, BackAction } from "@/components/screen";
import { SlantButton } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

const CIRCLE_FAUCET_URL = "https://faucet.circle.com/";

/**
 * Man Deposit rieng (khong con la popup) - dung Figma frame "deposit"
 * (node 11:386): tieu de + doan mo ta + o dia chi [copy] + nut "Open Circle
 * Faucet" trong noi dung, Back + Done o hang hanh dong.
 */
export function DepositScreen({ walletAddress }: { walletAddress: string }) {
  const router = useRouter();

  return (
    <Screen
      title="Deposit"
      tightContent
      action={
        <BackAction onBack={() => router.push("/dashboard")}>
          <SlantButton onClick={() => router.push("/dashboard")}>Done</SlantButton>
        </BackAction>
      }
    >
      <p className="font-body text-[20px] leading-[24px] text-foreground text-left w-full">
        Send USDC (Arc network) to your wallet address below, or use the Circle Faucet
      </p>

      {/* O dia chi vi: hop nghieng vien xanh */}
      <div
        className="w-full h-[53px] [transform:skewX(var(--skew-angle))] rounded-[var(--radius-slant)] bg-background border-2 border-brand shrink-0"
      >
        <div className="flex items-center gap-2 w-full h-full px-4 [transform:skewX(calc(-1*var(--skew-angle)))]">
          <span className="font-display text-[20px] font-semibold text-brand truncate flex-1">
            {walletAddress}
          </span>
          <CopyButton value={walletAddress} label="Copy wallet address" />
        </div>
      </div>

      <div className="w-full h-[53px]">
        <SlantButton
          onClick={() => window.open(CIRCLE_FAUCET_URL, "_blank", "noopener,noreferrer")}
        >
          Open Circle Faucet
        </SlantButton>
      </div>
    </Screen>
  );
}
