"use client";

import { useRouter } from "next/navigation";
import { Screen, BackAction } from "@/components/screen";
import { SlantButton } from "@/components/ui";

/**
 * Man Withdraw - Figma KHONG ve frame nay (chi co muc "Withdraw" trong menu
 * frame "6"). Day la phan SUY RA, dung lai dung khuon frame "7" Deposit:
 * tieu de hang 2, body Montserrat Medium 19px leading 30 can trai o hang 4,
 * Back + Done o hang 14.
 */
export function WithdrawScreen() {
  const router = useRouter();

  return (
    <Screen
      title="Withdraw"
      action={
        <BackAction onBack={() => router.push("/dashboard")}>
          <SlantButton onClick={() => router.push("/dashboard")}>Done</SlantButton>
        </BackAction>
      }
    >
      <p className="font-body text-body font-medium text-foreground text-left w-full leading-[30px]">
        Withdrawals aren&apos;t available yet during the testnet phase.
      </p>
    </Screen>
  );
}
