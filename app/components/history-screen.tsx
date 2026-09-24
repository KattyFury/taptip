"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Screen, BackAction } from "@/components/screen";
import { SlantButton } from "@/components/ui";
import { shortenAddress } from "@/lib/utils/address";
import { usePrefs } from "@/contexts/prefs-context";

interface TransactionRow {
  direction: "in" | "out";
  kind?: "tip" | "withdraw" | "deposit";
  counterparty: string;
  amount: number;
  createdAt: string;
}

function formatDate(iso: string): string {
  const date = new Date(iso.endsWith("Z") ? iso : `${iso.replace(" ", "T")}Z`);
  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
}

/** Nhan tung loai (user chot 09-24b: rut ghi "Withdrew", hien ca tien nap) */
function label(row: TransactionRow): { verb: string; prep: string } {
  if (row.kind === "withdraw") return { verb: "Withdrew", prep: "to" };
  if (row.kind === "deposit") return { verb: "Deposited", prep: "from" };
  return row.direction === "out" ? { verb: "Tipped", prep: "for" } : { verb: "Received", prep: "from" };
}

/**
 * Man History - Figma "history" (38:453): tieu de + the xam x=25 y=105.93
 * 340x575.39 bo 8 + Back/Done. Figma chua ve noi dung dong - dung LAI kieu
 * the thong bao o Home (324x49 bo 8, xanh = tien vao, do = tien ra, chu
 * 16/20) + ngay giao dich ben phai (#686868). Tai 1 lan (user: tam thoi).
 */
export function HistoryScreen() {
  const router = useRouter();
  const { money } = usePrefs();
  const [rows, setRows] = useState<TransactionRow[] | null>(null);

  useEffect(() => {
    fetch("/api/transactions?include=deposits")
      .then((res) => res.json() as Promise<{ transactions: TransactionRow[] }>)
      .then((data) => setRows(data.transactions))
      .catch(() => toast.error("Could not load transaction history"));
  }, []);

  return (
    <Screen
      title="History"
      contentTop={105.93}
      action={
        <BackAction>
          <SlantButton onClick={() => router.push("/dashboard")}>Done</SlantButton>
        </BackAction>
      }
    >
      <div className="bg-surface rounded-[8px] overflow-y-auto no-scrollbar" style={{ width: 340, height: 575.39 }}>
        {rows == null && (
          <p className="h-full flex items-center justify-center font-body text-small font-medium text-hint">
            Loading...
          </p>
        )}
        {rows != null && rows.length === 0 && (
          <p className="h-full flex items-center justify-center font-body text-small font-medium text-hint">
            No transactions yet
          </p>
        )}
        {rows != null && rows.length > 0 && (
          <div className="flex flex-col" style={{ padding: 8, gap: 8 }}>
            {rows.map((row, i) => {
              const { verb, prep } = label(row);
              return (
                <div
                  key={i}
                  className={`flex shrink-0 items-center justify-between rounded-[8px] font-body text-small font-medium text-foreground leading-[20px] ${
                    row.direction === "out" ? "bg-danger-bg" : "bg-success-bg"
                  }`}
                  style={{ height: 49, paddingLeft: 7.62, paddingRight: 11 }}
                >
                  <span>
                    {verb} <span className="font-bold">{money(row.amount)}</span> {prep}{" "}
                    {shortenAddress(row.counterparty)}
                  </span>
                  <span className="text-secondary-text shrink-0 pl-2">{formatDate(row.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Screen>
  );
}
