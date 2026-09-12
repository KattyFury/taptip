"use client";

import { useRouter } from "next/navigation";
import { Screen, BackAction, PrimaryButton, SlantButton } from "@/components/screen";
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
      action={
        <BackAction onBack={() => router.push("/dashboard")}>
          <PrimaryButton onClick={() => router.push("/dashboard")}>Done</PrimaryButton>
        </BackAction>
      }
    >
      <p className="font-body text-lead text-accent text-center">
        Send USDC (Arc network) to your wallet address below, or use the Circle Faucet
      </p>
      <div className="w-full flex items-center gap-2 bg-surface rounded-[var(--radius-slant)] p-3">
        <code className="font-body text-small font-mono break-all flex-1">{walletAddress}</code>
        <CopyButton value={walletAddress} label="Copy wallet address" />
      </div>
      <SlantButton
        style={{ height: "56px", width: "100%" }}
        onClick={() => window.open(CIRCLE_FAUCET_URL, "_blank", "noopener,noreferrer")}
      >
        Open Circle Faucet
      </SlantButton>
    </Screen>
  );
}
