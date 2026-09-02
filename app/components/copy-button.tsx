"use client";

import { useState } from "react";
import * as Icon from "@/components/icons";

/**
 * Nut copy dung chung (dia chi vi o Home + popup Deposit). Bam xong: icon
 * Copy doi sang Check mau --success trong 3s roi tu quay lai - KHONG dung
 * toast (theo yeu cau dong bo thiet ke 09-02).
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={label}
      className={
        "w-[3.4cqh] h-[3.4cqh] min-w-[26px] min-h-[26px] rounded-full flex items-center justify-center shrink-0 " +
        (copied ? "text-success" : "text-foreground")
      }
    >
      {copied ? (
        <Icon.Check className="w-[1.8cqh] h-[1.8cqh] min-w-[12px] min-h-[12px]" />
      ) : (
        <Icon.Copy className="w-[1.8cqh] h-[1.8cqh] min-w-[12px] min-h-[12px]" />
      )}
    </button>
  );
}
