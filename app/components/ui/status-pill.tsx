/**
 * Huy hieu trang thai giao dich - dinh nghia DUY NHAT cho ca app.
 * Dung o lich su tip va o modal chi tiet giao dich.
 *
 * Arc di thang PENDING -> COMPLETE, khong co trang thai CONFIRMED.
 */

import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  COMPLETE: "bg-success-bg text-success-fg",
  PENDING: "bg-warning-bg text-warning-fg",
  FAILED: "bg-danger-bg text-danger-fg",
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETE: "Complete",
  PENDING: "Pending",
  FAILED: "Failed",
};

export function StatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (status || "").toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl px-2 py-0.5 text-[12px] font-extrabold",
        STATUS_STYLE[key] ?? "bg-surface text-hint",
        className,
      )}
    >
      {STATUS_LABEL[key] ?? status}
    </span>
  );
}

/**
 * Huy hieu tron co mui ten cho tung dong lich su:
 * nhan = nen xanh la + mui ten xuong, gui = nen do + mui ten len.
 */
export function DirectionBadge({ received }: { received: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-[22px] h-[22px] rounded-full p-[5px] shrink-0",
        received ? "bg-success-bg" : "bg-danger-bg",
      )}
      aria-label={received ? "Received" : "Sent"}
    >
      <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className="w-full h-full">
        <path
          d={
            received
              ? "M50 10L50 90M70 70L50 90L30 70"
              : "M50 90L50 10M30 30L50 10L70 30"
          }
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
