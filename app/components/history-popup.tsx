"use client";

import { useEffect, useState } from "react";
import { CenteredCard } from "@/components/content-popup";
import { toast } from "sonner";

interface TransactionRow {
  direction: "in" | "out";
  counterparty: string;
  amount: number;
  createdAt: string;
}

function shortenAddress(address: string): string {
  if (!address || address.length < 8) return address;
  return `0x_${address.slice(-5)}`;
}

function formatDate(iso: string): string {
  const date = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function HistoryPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<TransactionRow[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setRows(null);
    fetch("/api/transactions")
      .then((res) => res.json() as Promise<{ transactions: TransactionRow[] }>)
      .then((data) => setRows(data.transactions))
      .catch(() => toast.error("Could not load transaction history"));
  }, [open]);

  return (
    <CenteredCard open={open} onClose={onClose} title="History">
      <div className="flex flex-col px-[18px] pb-[18px]">
        {rows == null && (
          <p className="py-6 text-center text-body text-accent">Loading...</p>
        )}
        {rows != null && rows.length === 0 && (
          <p className="py-6 text-center text-body text-accent">No transactions yet</p>
        )}
        {rows?.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 py-[12px] border-b border-border last:border-b-0"
          >
            <div className="flex flex-col">
              <span className="text-body font-semibold">
                {row.direction === "out" ? "Sent to " : "Received from "}
                {shortenAddress(row.counterparty)}
              </span>
              <span className="text-small text-accent">{formatDate(row.createdAt)}</span>
            </div>
            <span
              className={
                "text-lead font-bold shrink-0 " +
                (row.direction === "out" ? "text-danger" : "text-success")
              }
            >
              {row.direction === "out" ? "-" : "+"}${row.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </CenteredCard>
  );
}
