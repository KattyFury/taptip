"use client";

import { useRouter } from "next/navigation";
import { Screen, BackAction, PrimaryButton } from "@/components/screen";

/**
 * Man Withdraw rieng - Figma khong ve frame nay (chi co muc "Withdraw"
 * trong Menu), dung lai dung khuon Screen/Back+Done nhu Deposit/History de
 * dong bo, noi dung la thong bao chua kha dung (dung nhu ban PRD: testnet
 * chua ho tro rut tien that).
 */
export function WithdrawScreen() {
  const router = useRouter();

  return (
    <Screen
      title="Withdraw"
      action={
        <BackAction onBack={() => router.push("/dashboard")}>
          <PrimaryButton onClick={() => router.push("/dashboard")}>Done</PrimaryButton>
        </BackAction>
      }
    >
      <p className="font-body text-lead text-accent text-center">
        Withdrawals aren&apos;t available yet during the testnet phase.
      </p>
    </Screen>
  );
}
