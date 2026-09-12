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
      {/* Doan mo ta: den, can TRAI (khong phai xam/can giua) - dung mau/can
          le nguyen ban Figma node 11:395. */}
      <p className="font-body text-lead text-foreground text-left w-full">
        Send USDC (Arc network) to your wallet address below, or use the Circle Faucet
      </p>

      {/* O dia chi: hop VIEN xanh nen trong (cung kieu nut outline voi Back),
          KHONG phai o nen xam nhu input - dung Figma node 11:387/11:403. */}
      <div
        className="w-full h-[52px] [transform:skewX(var(--skew-angle))] rounded-[var(--radius-slant)] bg-background border-2 border-brand shrink-0"
      >
        <div className="flex items-center gap-2 w-full h-full px-4 [transform:skewX(calc(-1*var(--skew-angle)))]">
          <span className="font-display text-lead font-semibold text-brand truncate flex-1">
            {walletAddress}
          </span>
          <CopyButton value={walletAddress} label="Copy wallet address" />
        </div>
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
