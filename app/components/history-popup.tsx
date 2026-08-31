"use client";

import { ContentPopup } from "@/components/content-popup";
import * as Icon from "@/components/icons";

// TODO(v2): danh sach tinh, chua noi D1 `transactions` that (xem
// docs/HANDOFF.md muc "CON LAI" - can viet lai luong ghi giao dich vao D1
// truoc khi popup nay doc duoc du lieu song). Giu placeholder de UI dung
// dung khuon ContentPopup, khong crash vi Supabase nhu ban v1.
const SAMPLE_ROWS = [
  { direction: "out" as const, counterparty: "0x_a91c4", amount: 3, time: "14:22" },
  { direction: "in" as const, counterparty: "0x_7fe20", amount: 1, time: "11:05" },
  { direction: "in" as const, counterparty: "Nạp từ ví ngoài", amount: 50, time: "09:40" },
];

export function HistoryPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <ContentPopup open={open} onClose={onClose}>
      <div className="flex flex-col px-[18px] max-h-[60vh] overflow-y-auto">
        {SAMPLE_ROWS.map((row, i) => (
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
            <span className="flex-1 text-[14px] font-semibold">{row.counterparty}</span>
            <div className="text-right">
              <div
                className={
                  "text-[14px] font-bold font-num " +
                  (row.direction === "out" ? "text-danger" : "text-success")
                }
              >
                {row.direction === "out" ? "-" : "+"}${row.amount.toFixed(2)}
              </div>
              <div className="text-[10px] text-hint">{row.time}</div>
            </div>
          </div>
        ))}
      </div>
    </ContentPopup>
  );
}
