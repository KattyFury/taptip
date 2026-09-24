"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Screen, BackAction } from "@/components/screen";
import { SlantButton, TextField } from "@/components/ui";
import { BalanceProvider, useBalance } from "@/contexts/balanceContext";
import { usePrefs } from "@/contexts/prefs-context";
import { describeSendError, type SendErrorBody } from "@/lib/utils/send-errors";
import { shortenAddress } from "@/lib/utils/address";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
/** Luon chua lai trong vi de tra phi gas (USDC la gas token tren Arc) */
const GAS_RESERVE = 0.1;

/**
 * Man Withdraw - Figma "withdraw" (45:552): "Balance: 1000 USDC" y=114, o
 * dia chi 340x49 y=170, o so tien 265x49 y=227 + link "SEND" do.
 *
 * User chot 09-24b:
 *   - rut DUOC so le (khac tip), co nut Max
 *   - luon chua lai $0.1 tranh het gas; khong co muc toi thieu
 *   - bam SEND -> hop xac nhan "Send $X to 0x...?" (rut ra ngoai khong lay lai duoc)
 *   - ghi History la "Withdrew" (kind=withdraw), khong tinh vao gioi han tip/ngay
 */
export function WithdrawScreen({ walletAddress }: { walletAddress: string }) {
  return (
    <BalanceProvider walletAddress={walletAddress}>
      <WithdrawContent />
    </BalanceProvider>
  );
}

function floor2(n: number): number {
  return Math.floor(n * 100 + 1e-6) / 100;
}

function WithdrawContent() {
  const router = useRouter();
  const { money } = usePrefs();
  const { balance, refreshBalances } = useBalance();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  const balanceNum = isNaN(balance.token) ? 0 : balance.token;
  const maxAmount = Math.max(0, floor2(balanceNum - GAS_RESERVE));
  const value = Number(amount.replace(",", "."));

  const validate = (): string | null => {
    if (!ADDRESS_REGEX.test(toAddress.trim())) return "Enter a valid wallet address (0x...).";
    if (!isFinite(value) || value <= 0) return "Enter an amount greater than 0.";
    if (!/^\d+([.,]\d{1,2})?$/.test(amount.trim())) return "Use at most 2 decimals.";
    if (value > maxAmount) return `You can withdraw up to ${money(maxAmount)} (${money(GAS_RESERVE)} stays for network fees).`;
    return null;
  };

  const askConfirm = () => {
    const error = validate();
    if (error) {
      setMessage({ kind: "error", text: error });
      return;
    }
    setMessage(null);
    setConfirming(true);
  };

  const send = async () => {
    setConfirming(false);
    setSending(true);
    setMessage(null);
    const res = await fetch("/api/tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toAddress: toAddress.trim(), amount: value, kind: "withdraw" }),
    }).catch(() => null);
    setSending(false);

    if (!res?.ok) {
      const body = res ? ((await res.json().catch(() => null)) as SendErrorBody | null) : null;
      setMessage({ kind: "error", text: describeSendError(body, "Send failed, try again.") });
      return;
    }
    toast.success(`Sent ${money(value)}`);
    setMessage({ kind: "ok", text: `Sent ${money(value)} to ${shortenAddress(toAddress.trim())}` });
    setToAddress("");
    setAmount("");
    refreshBalances().catch(() => {});
  };

  return (
    <div className="relative w-full h-full">
      <div
        className="absolute inset-0 transition-[filter] duration-150"
        style={confirming ? { filter: "blur(4px)" } : undefined}
      >
        <Screen
          title="Withdraw"
          contentTop={114}
          action={
            <BackAction>
              <SlantButton onClick={() => router.push("/dashboard")}>Done</SlantButton>
            </BackAction>
          }
          foot={
            message && (
              <p
                className={`font-body text-small font-medium text-center leading-[20px] px-[25px] ${
                  message.kind === "error" ? "text-danger" : "text-brand"
                }`}
              >
                {message.text}
              </p>
            )
          }
        >
          <p className="flex items-center font-display text-body font-bold text-foreground leading-[40px]" style={{ height: 47.84 }}>
            Balance:&nbsp;<span className="text-secondary-text">{money(balanceNum)}</span>
          </p>

          <div className="absolute" style={{ left: 0, top: 56, width: 340, height: 49 }}>
            <TextField
              placeholder="Paste the wallet address"
              value={toAddress}
              onChange={(e) => {
                setToAddress(e.target.value);
                setMessage(null);
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="absolute" style={{ left: 0, top: 113.16, width: 265, height: 49 }}>
            <TextField
              placeholder="Type the amounts"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setMessage(null);
              }}
              style={{ paddingRight: 56 }}
            />
            <button
              type="button"
              onClick={() => {
                setAmount(String(maxAmount));
                setMessage(null);
              }}
              className="absolute top-1/2 -translate-y-1/2 font-display text-small font-bold text-foreground underline"
              style={{ right: 10 }}
            >
              MAX
            </button>
          </div>

          <button
            type="button"
            onClick={askConfirm}
            disabled={sending}
            className="absolute font-display text-body font-bold text-danger underline leading-[24px] disabled:opacity-[0.33]"
            style={{ left: 273, top: 113.16, width: 67, height: 49.16 }}
          >
            {sending ? "..." : "SEND"}
          </button>
        </Screen>
      </div>

      {confirming && (
        <>
          <div className="absolute inset-0 z-40" onClick={() => setConfirming(false)} aria-hidden="true" />
          <div
            className="absolute z-50 bg-background border border-foreground rounded-[8px] flex flex-col items-center"
            style={{ left: 24.96, top: 405.32, width: 340.07, padding: "24px 24px 16px", gap: 16 }}
          >
            <p className="font-display text-title font-bold text-foreground text-center leading-[normal]">
              Send {money(value)} to {shortenAddress(toAddress.trim())}?
            </p>
            <p className="font-body text-small font-medium text-secondary-text text-center leading-[24px]">
              Withdrawals can&apos;t be undone. Double-check the address.
            </p>
            <div className="w-full" style={{ height: 49.32 }}>
              <SlantButton onClick={send}>Send</SlantButton>
            </div>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="font-display text-small font-semibold text-foreground underline"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
