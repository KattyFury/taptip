"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Screen, BackAction, rowTop } from "@/components/screen";
import { SlantButton } from "@/components/ui";
import { shortenAddress } from "@/lib/utils/address";

interface TransactionRow {
  direction: "in" | "out";
  counterparty: string;
  amount: number;
  createdAt: string;
}


function formatDate(iso: string): string {
  const date = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
}

/**
 * Man History rieng (khong con la popup) - dung Figma frame "history"
 * (node 11:408): tieu de + danh sach giao dich trong khung rieng, Back +
 * Done o hang hanh dong.
 */
export function HistoryScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<TransactionRow[] | null>(null);

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json() as Promise<{ transactions: TransactionRow[] }>)
      .then((data) => setRows(data.transactions))
      .catch(() => toast.error("Could not load transaction history"));
  }, []);

  return (
    <Screen
      title="History"
      contentTop={rowTop(3)}
      action={
        <BackAction onBack={() => router.push("/dashboard")}>
          <SlantButton onClick={() => router.push("/dashboard")}>Done</SlantButton>
        </BackAction>
      }
    >
      {/* Figma frame "30" (node 38:453): the 324x568, bo goc 8px, nen
          --surface - KHONG con vat goc (cut-corner) nhu ban truoc, redesign
          09-24 bo han he chamfer, chi dung rounded-[8px] don gian. */}
      <div className="w-full h-full overflow-y-auto bg-surface rounded-[8px] px-4">
        {rows == null && (
          <p className="py-6 text-center font-body text-body text-accent">Loading...</p>
        )}
        {rows != null && rows.length === 0 && (
          <p className="py-6 text-center font-body text-body text-accent">No transactions yet</p>
        )}
        {rows?.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 py-3 border-b border-brand/20 last:border-b-0"
          >
            <div className="flex flex-col">
              <span className="font-body text-body font-semibold text-foreground">
                {row.direction === "out" ? "Sent to " : "Received from "}
                {shortenAddress(row.counterparty)}
              </span>
              <span className="font-body text-small text-accent">{formatDate(row.createdAt)}</span>
            </div>
            <span
              className={
                "font-display text-body font-bold shrink-0 " +
                (row.direction === "out" ? "text-danger" : "text-success")
              }
            >
              {row.direction === "out" ? "-" : "+"}${row.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </Screen>
  );
}
