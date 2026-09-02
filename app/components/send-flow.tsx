"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import * as Icon from "@/components/icons";
import { CenteredCard } from "@/components/content-popup";
import { useBalance } from "@/contexts/balanceContext";
import { toast } from "sonner";
import { decodeTapTipQr } from "@/lib/utils/qr-payment";

const QR_REGION_ID = "taptip-qr-region";

type Step = "scan" | "sending" | "success";

interface TipSettings {
  slot1: number;
  slot2: number;
  slot3: number;
  slot4: number | null;
  default_slot: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SendFlow({ open, onOpenChange }: Props) {

  const { balance, refreshBalances } = useBalance();
  const [step, setStep] = useState<Step>("scan");
  const [settings, setSettings] = useState<TipSettings | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | "custom" | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastAmount, setLastAmount] = useState<number | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedSlotRef = useRef<number | "custom" | null>(null);

  const balanceNum = isNaN(balance.token) ? 0 : balance.token;

  useEffect(() => {
    if (!open) {
      setStep("scan");
      setScanError(null);
      stopScanner();
      return;
    }

    fetch("/api/tip-settings")
      .then((res) => res.json() as Promise<{ settings: TipSettings }>)
      .then((data) => {
        setSettings(data.settings);
        // Man tinh giu nguyen muc vua chon lan quet truoc - chi dat lai ve
        // mac dinh neu chua tung chon gi trong phien nay.
        if (selectedSlotRef.current == null) {
          selectSlot(data.settings.default_slot);
        }
      })
      .catch(() => toast.error("Could not load tip amounts"));
  }, [open]);

  useEffect(() => {
    if (open && step === "scan") {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [open, step]);

  const slotAmount = (slot: number | null): number | null => {
    if (!settings || slot == null) return null;
    return settings[`slot${slot}` as keyof TipSettings] as number | null;
  };

  const selectSlot = (slot: number) => {
    selectedSlotRef.current = slot;
    setSelectedSlot(slot);
    setScanError(null);
  };

  const selectCustom = () => {
    selectedSlotRef.current = "custom";
    setSelectedSlot("custom");
    setScanError(null);
  };

  const customAmountNum = parseFloat(customAmount);
  const selectedAmount =
    selectedSlot === "custom"
      ? (customAmount.trim() !== "" && !isNaN(customAmountNum) && customAmountNum > 0
          ? customAmountNum
          : null)
      : slotAmount(selectedSlot);

  const startScanner = async () => {
    setScanError(null);

    if (!document.getElementById(QR_REGION_ID)) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    if (!document.getElementById(QR_REGION_ID)) {
      return;
    }

    try {
      const scanner = new Html5Qrcode(QR_REGION_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (w: number, h: number) => {
            const size = Math.floor(Math.min(w, h) * 0.7);
            return { width: size, height: size };
          },
          aspectRatio: 1,
        },
        (decodedText) => handleScanResultRef.current(decodedText),
        () => {
          // ignore per-frame "not found" callbacks
        },
      );
    } catch (err) {
      console.warn("Could not start camera:", err);
      setScanError("Could not open camera. Try uploading a QR image instead.");
    }
  };

  const stopScanner = () => {
    const scanner = scannerRef.current;
    if (scanner) {
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          // scanner may already be stopped
        });
      scannerRef.current = null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    const scanner = new Html5Qrcode(QR_REGION_ID);
    try {
      const decodedText = await scanner.scanFile(file, false);
      handleScanResult(decodedText);
    } catch (err) {
      console.error("Could not decode QR from image:", err);
      setScanError("Could not read a QR code in this image.");
    } finally {
      e.target.value = "";
    }
  };

  const handleScanResult = async (decodedText: string) => {
    const amount = selectedAmount;
    if (amount == null) {
      setScanError("Choose an amount first.");
      return;
    }
    if (amount > balanceNum) {
      setScanError("Not enough balance to send this amount.");
      return;
    }

    const decoded = decodeTapTipQr(decodedText);
    if (!decoded.ok) {
      // Log nguyen van de con lan ra QR nao khong doc duoc, thay vi doan mo.
      console.warn("Rejected QR:", decodedText);
      setScanError(
        decoded.reason === "wrong-network"
          ? "This QR is for another network. TapTip only sends on Arc Testnet."
          : "That doesn't look like a wallet QR code.",
      );
      return;
    }

    stopScanner();
    setStep("sending");

    // Circle giu khoa va ky phia server -> khong co buoc xac nhan nao o day,
    // quet xong la tien di. Lich su cung duoc route ghi luon.
    const response = await fetch("/api/tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toAddress: decoded.address, amount }),
    }).catch(() => null);

    if (!response?.ok) {
      const message = response
        ? ((await response.json().catch(() => null)) as { error?: string } | null)?.error
        : null;
      toast.error(message || "Send failed, try again");
      setStep("scan");
      return;
    }

    setLastAmount(amount);
    setStep("success");
    refreshBalances().catch((err) => {
      console.error("Failed to refresh balance after send:", err);
    });

    setTimeout(() => {
      setStep("scan");
    }, 2000);
  };

  // Camera dang ky callback quet MOT LAN luc scanner.start(), nen callback do
  // "dong bang" moi state tai thoi diem ay - luc do `settings` con dang fetch
  // nen chua chon slot nao, `selectedAmount` = null. UI render lai thay $1
  // sang len nhung callback cu van cam null -> quet xong bao "Choose an amount
  // first" du man hinh dang hien $1 (va khong bao gio hoi passkey vi chua
  // toi buoc ky). Tro nay luon tro toi ban moi nhat cua handleScanResult.
  const handleScanResultRef = useRef(handleScanResult);
  useEffect(() => {
    handleScanResultRef.current = handleScanResult;
  });

  const isOverlayStep = step === "sending" || step === "success";

  return (
    <>
      {/* Card "Scan to tip" giua man, Home mo phia sau qua scrim cua CenteredCard.
          maxHeightCqh cao hon mac dinh (68) de co cho spacing thoang hon giua
          camera/QR, "Upload..." va luoi nut chon tien + Custom. */}
      <CenteredCard
        open={open}
        onClose={() => onOpenChange(false)}
        title="Scan to tip"
        maxHeightCqh={80}
      >
        <div className="flex flex-col items-center px-[18px] pb-[18px] gap-[2.2cqh]">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-foreground">
            <div id={QR_REGION_ID} className="w-full h-full" />
            <div
              aria-hidden
              className="pointer-events-none absolute left-[15%] top-[15%] w-[70%] h-[70%] border-[3px] border-primary rounded-sm"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-body font-semibold text-center"
          >
            Upload a QR image instead
          </button>

          {scanError && (
            <p className="text-small font-semibold text-danger text-center">{scanError}</p>
          )}

          <div className="w-full grid grid-cols-2 gap-2.5">
            {([1, 2, 3, 4] as const).map((slot) => {
              const value = slotAmount(slot);
              if (value == null) return null;
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => selectSlot(slot)}
                  className={
                    "w-full h-[6.68cqh] min-h-[38px] rounded-full text-lead font-bold " +
                    (isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground")
                  }
                >
                  ${value}
                </button>
              );
            })}
            <button
              onClick={selectCustom}
              className={
                "w-full h-[6.68cqh] min-h-[38px] rounded-full text-lead font-bold " +
                (selectedSlot === "custom"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-foreground")
              }
            >
              Custom
            </button>
          </div>

          {selectedSlot === "custom" && (
            <input
              autoFocus
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter an amount"
              className="w-full h-[6cqh] min-h-[44px] rounded-full border border-border bg-background px-4 text-body text-center outline-none focus:ring-2 focus:ring-primary"
            />
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </CenteredCard>

      {isOverlayStep && (
        <OverlayCard>
          {step === "sending" && (
            <>
              <Icon.Loading className="w-[56px] h-[56px] text-accent animate-spin" />
              <p className="text-[20px] font-bold">Processing...</p>
            </>
          )}
          {step === "success" && (
            <>
              <Icon.Check className="w-[56px] h-[56px] text-success" />
              <p className="text-[20px] font-bold">-${lastAmount}</p>
            </>
          )}
        </OverlayCard>
      )}
    </>
  );
}

/** The thong bao nho noi giua man - dung cho buoc dang xu ly va thanh cong. */
function OverlayCard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-scrim" />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-100px)] max-w-[330px] bg-background rounded-xl shadow-popover px-5 py-7 flex flex-col items-center gap-4">
        {children}
      </div>
    </>
  );
}
