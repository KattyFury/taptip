"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Screen, BackAction } from "@/components/screen";
import { SlantButton, TextField } from "@/components/ui";
import { BalanceProvider, useBalance } from "@/contexts/balanceContext";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Man Withdraw - Figma "withdraw" (45:552), ban cap nhat 09-24b. Truoc day
 * chi la dong "chua kha dung"; Figma moi ve FORM that:
 *   - "Balance: 1000 USDC" y=114 (nhan den, so xam #686868), Quicksand 20 dam
 *   - o "Paste the wallet address" 340x49 y=170
 *   - o "Type the amounts" 265x49 y=227 + link "SEND" do gach chan ben phai
 * Gui qua dung API /api/tip (Circle ky phia server, app tra gas) - rut tien
 * ve vi ngoai ban chat la 1 lenh chuyen USDC nhu tip.
 */
export function WithdrawScreen({ walletAddress }: { walletAddress: string }) {
  return (
    <BalanceProvider walletAddress={walletAddress}>
      <WithdrawContent />
    </BalanceProvider>
  );
}

function formatAmount(token: number): string {
  if (isNaN(token) || token <= 0) return "0";
  // Figma viet "1000 USDC" - khong co dau phay ngan cach hang nghin
  return String(Math.floor(token * 100) / 100);
}

function WithdrawContent() {
  const router = useRouter();
  const { balance, refreshBalances } = useBalance();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  const send = async () => {
    const value = Number(amount.replace(",", "."));
    if (!ADDRESS_REGEX.test(toAddress.trim())) {
      setMessage({ kind: "error", text: "Enter a valid wallet address (0x...)." });
      return;
    }
    if (!isFinite(value) || value <= 0) {
      setMessage({ kind: "error", text: "Enter an amount greater than 0." });
      return;
    }
    if (value > balance.token) {
      setMessage({ kind: "error", text: "Not enough balance." });
      return;
    }

    setSending(true);
    setMessage(null);
    const res = await fetch("/api/tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toAddress: toAddress.trim(), amount: value }),
    }).catch(() => null);
    setSending(false);

    if (!res?.ok) {
      const err = res ? ((await res.json().catch(() => null)) as { error?: string } | null)?.error : null;
      setMessage({ kind: "error", text: err || "Send failed, try again." });
      return;
    }
    toast.success(`Sent $${formatAmount(value)}`);
    setMessage({ kind: "ok", text: `Sent $${formatAmount(value)} to ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}` });
    setToAddress("");
    setAmount("");
    refreshBalances().catch(() => {});
  };

  return (
    <Screen
      title="Withdraw"
      contentTop={114}
      action={
        <BackAction onBack={() => router.push("/dashboard")}>
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
        Balance:&nbsp;<span className="text-secondary-text">{formatAmount(balance.token)} USDC</span>
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
        />
      </div>

      <button
        type="button"
        onClick={send}
        disabled={sending}
        className="absolute font-display text-body font-bold text-danger underline leading-[24px] disabled:opacity-[0.33]"
        style={{ left: 273, top: 113.16, width: 67, height: 49.16 }}
      >
        {sending ? "..." : "SEND"}
      </button>
    </Screen>
  );
}
