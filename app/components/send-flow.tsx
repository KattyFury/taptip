"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import * as Icon from "@/components/icons";
import { useWeb3 } from "@/components/web3-provider";
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
  const { sendUSDC } = useWeb3();
  const { balance, refreshBalances } = useBalance();
  const [step, setStep] = useState<Step>("scan");
  const [settings, setSettings] = useState<TipSettings | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastAmount, setLastAmount] = useState<number | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedSlotRef = useRef<number | null>(null);

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
      .catch(() => toast.error("Không tải được Tip Setting"));
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

  const selectedAmount = slotAmount(selectedSlot);

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
        (decodedText) => handleScanResult(decodedText),
        () => {
          // ignore per-frame "not found" callbacks
        },
      );
    } catch (err) {
      console.warn("Could not start camera:", err);
      setScanError("Không mở được camera. Thử tải ảnh từ thư viện.");
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
      setScanError("Không đọc được mã QR trong ảnh này.");
    } finally {
      e.target.value = "";
    }
  };

  const handleScanResult = async (decodedText: string) => {
    const amount = selectedAmount;
    if (amount == null) {
      setScanError("Chưa chọn số tiền.");
      return;
    }
    if (amount > balanceNum) {
      setScanError("Số dư không đủ để gửi mức này.");
      return;
    }

    const decoded = decodeTapTipQr(decodedText);
    if (!decoded) {
      setScanError("Mã QR không hợp lệ — sai mạng, sai loại tiền, hoặc không phải QR TapTip.");
      return;
    }

    stopScanner();
    setStep("sending");

    const txHash = await sendUSDC(decoded.address, String(amount));

    if (!txHash) {
      toast.error("Gửi thất bại, thử lại");
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

  if (!open) return null;

  const isOverlayStep = step === "sending" || step === "success";

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* ================ LUOI 10 HANG MAN QUET (Wireframe v2 Group B) ========
          1 : header "Tip"
          2 : dem
          3-5 : camera to full
          6-8 : trong
          9 : 4 nut chon so tien
          10 : "Thoat" do
          ========================================================================= */}

      {/* Hang 1 */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex items-center justify-center">
        <span className="text-[17px] font-extrabold">Tip</span>
      </div>

      {/* Hang 2 */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} />

      {/* Hang 3-4-5 : camera to full */}
      <div style={{ flex: "3 1 0", minHeight: 0 }} className="flex items-center justify-center px-5">
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-foreground">
          <div id={QR_REGION_ID} className="w-full h-full" />
          <div
            aria-hidden
            className="pointer-events-none absolute left-[15%] top-[15%] w-[70%] h-[70%] border-[3px] border-primary rounded-sm"
          />
        </div>
      </div>

      {/* Hang 6-7-8 : trong */}
      <div style={{ flex: "3 1 0", minHeight: 0 }} className="flex items-center justify-center px-6">
        {scanError && (
          <p className="text-[14px] font-extrabold text-danger text-center">{scanError}</p>
        )}
      </div>

      {/* Hang 9 : 4 nut chon so tien */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex items-center justify-center gap-2.5">
        {([1, 2, 3, 4] as const).map((slot) => {
          const value = slotAmount(slot);
          if (value == null) return null;
          const isSelected = selectedSlot === slot;
          return (
            <button
              key={slot}
              onClick={() => selectSlot(slot)}
              className={
                "px-[18px] py-2.5 rounded-full text-[14px] font-bold font-num border-2 " +
                (isSelected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border text-foreground")
              }
            >
              ${value}
            </button>
          );
        })}
      </div>

      {/* Hang 10 : Thoat */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex items-center justify-center">
        <button
          onClick={() => onOpenChange(false)}
          className="text-[14px] font-extrabold text-danger"
        >
          Thoát
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {isOverlayStep && (
        <OverlayCard>
          {step === "sending" && (
            <>
              <Icon.Loading className="w-[56px] h-[56px] text-accent animate-spin" />
              <p className="text-[20px] font-bold">Đang xử lý...</p>
            </>
          )}
          {step === "success" && (
            <>
              <Icon.Check className="w-[56px] h-[56px] text-success" />
              <p className="text-[20px] font-bold font-num">-${lastAmount}</p>
            </>
          )}
        </OverlayCard>
      )}
    </div>
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
