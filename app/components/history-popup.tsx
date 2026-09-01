"use client";

import { useEffect, useState } from "react";
import { ContentPopup } from "@/components/content-popup";
import * as Icon from "@/components/icons";
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

function formatTime(iso: string): string {
  const date = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
      .catch(() => toast.error("Không tải được lịch sử giao dịch"));
  }, [open]);

  return (
    <ContentPopup open={open} onClose={onClose}>
      <div className="flex flex-col px-[18px] max-h-[60vh] overflow-y-auto">
        {rows == null && (
          <p className="py-6 text-center text-[14px] text-hint">Đang tải...</p>
        )}
        {rows != null && rows.length === 0 && (
          <p className="py-6 text-center text-[14px] text-hint">Chưa có giao dịch nào</p>
        )}
        {rows?.map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3.5 border-b border-border last:border-b-0"
          >
            <div
              className={
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 " +
                (row.direction === "out" ? "bg-danger-bg" : "bg-success-bg")
              }
            >
              {row.direction === "out" ? (
                <Icon.ArrowUp className={"w-3.5 h-3.5 text-danger"} />
              ) : (
                <Icon.ArrowDown className={"w-3.5 h-3.5 text-success"} />
              )}
            </div>
            <span className="flex-1 text-[14px] font-semibold">
              {shortenAddress(row.counterparty)}
            </span>
            <div className="text-right">
              <div
                className={
                  "text-[14px] font-bold font-num " +
                  (row.direction === "out" ? "text-danger" : "text-success")
                }
              >
                {row.direction === "out" ? "-" : "+"}${row.amount.toFixed(2)}
              </div>
              <div className="text-[10px] text-hint">{formatTime(row.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </ContentPopup>
  );
}
