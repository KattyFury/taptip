"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import * as Icon from "@/components/icons";
import { Screen, BackAction } from "@/components/screen";
import { CutCornerCard, SlantButton } from "@/components/ui";
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
  slot5: number | null;
  default_slot: number;
}

/**
 * Man "Tipping..." rieng (khong con la popup) - dung dung Figma frame
 * (node 11:458, lop trong file dat nham ten "history" nhung noi dung/tieu
 * de la man tip: camera quet QR cat goc + 3 preset $, Back+Done). Nut preset
 * o day KIEU KHAC han preset tren Home: nghieng + VIEN xanh (khong phai nen
 * xam phang) - chon roi thi nen vang, khong chon thi nen trong.
 */
export function TipScreen() {
  const router = useRouter();
  const { balance, refreshBalances } = useBalance();
  const [step, setStep] = useState<Step>("scan");
  const [settings, setSettings] = useState<TipSettings | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastAmount, setLastAmount] = useState<number | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const selectedSlotRef = useRef<number | null>(null);

  const balanceNum = isNaN(balance.token) ? 0 : balance.token;

  useEffect(() => {
    fetch("/api/tip-settings")
      .then((res) => res.json() as Promise<{ settings: TipSettings }>)
      .then((data) => {
        setSettings(data.settings);
        if (selectedSlotRef.current == null) {
          selectSlot(data.settings.default_slot);
        }
      })
      .catch(() => toast.error("Could not load tip amounts"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step === "scan") {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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
            // html5-qrcode tu nem loi neu duoi 50px (vd camera gia/do phan
            // giai la nho trong moi truong test) - dat san 1 san chan.
            const size = Math.max(50, Math.floor(Math.min(w, h) * 0.7));
            return { width: size, height: size };
          },
          // Khung camera khong con vuong tuyet doi (340x328 theo Figma) -
          // xin video dung ti le do thay vi 1:1 de video lap day khong bi
          // crop/letterbox lech.
          aspectRatio: 340 / 328,
        },
        (decodedText) => handleScanResultRef.current(decodedText),
        () => {
          // ignore per-frame "not found" callbacks
        },
      );
    } catch (err) {
      console.warn("Could not start camera:", err);
      setScanError("Could not open camera.");
    }
  };

  const stopScanner = () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      // html5-qrcode co the nem loi DONG BO (khong phai Promise reject) neu
      // goi stop() luc scanner con dang giua chung khoi dong (vd React 18
      // Strict Mode dev mount-cleanup-mount kep) - .catch() thoi khong bat
      // duoc, phai boc ca try/catch ben ngoai.
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          // scanner may already be stopped
        });
    } catch {
      // scanner chua kip chay xong luc bi yeu cau dung - bo qua an toan
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
      router.push("/dashboard");
    }, 2000);
  };

  const handleScanResultRef = useRef(handleScanResult);
  useEffect(() => {
    handleScanResultRef.current = handleScanResult;
  });

  const isOverlayStep = step === "sending" || step === "success";

  return (
    <>
      <Screen
        tightContent
        wideContent
        action={
          <BackAction onBack={() => router.push("/dashboard")}>
            <SlantButton onClick={() => router.push("/dashboard")}>Done</SlantButton>
          </BackAction>
        }
      >
        <div className="w-full flex flex-col items-center gap-4">
          {/* Rectangle 17 dung Figma frame "9 Tipping" (node 30:93): cao dung
              9 hang luoi + 8 khoang gap (v4 09-16: 9*48.8+8*8=503.2, truoc
              chi 5 hang = 414px - vung noi dung rong hon han o luoi 15 hang) */}
          <div className="w-full max-w-[340px] h-[calc(9*var(--grid-row-h)+8*var(--grid-row-gap))] shrink-0">
            <CutCornerCard className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
              <div id={QR_REGION_ID} className="w-full h-full" />
              {scanError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/90 z-20">
                  <Icon.Warning className="w-8 h-8 text-danger mb-2" />
                  <p className="font-body text-small text-white/80 font-medium">{scanError}</p>
                  <button
                    onClick={startScanner}
                    className="mt-3 px-4 py-1.5 rounded-full bg-surface/20 text-white text-xs font-medium hover:bg-surface/30 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
            </CutCornerCard>
          </div>

          {/* Preset $ - 3 nut nghieng dung Figma:
              - Rectangle 28 ($2): vang chu xanh vien xanh
              - Rectangle 32 ($10), 33 ($20): trang chu xanh vien xanh
              - px-2.5 giup goc nghieng -16deg khong bi tran/cat mep phai */}
          <div className="w-full max-w-[340px] px-2.5 flex items-center justify-between gap-3 h-[var(--grid-row-h)] shrink-0">
            {([1, 2, 3] as const).map((slot) => {
              const value = slotAmount(slot);
              if (value == null) return null;
              const isSelected = selectedSlot === slot;
              return (
                <div key={slot} className="flex-1 h-full min-w-0">
                  <SlantButton
                    variant="preset"
                    isActive={isSelected}
                    onClick={() => selectSlot(slot)}
                    className="text-title"
                  >
                    ${value}
                  </SlantButton>
                </div>
              );
            })}
          </div>
        </div>
      </Screen>

      {isOverlayStep && (
        <OverlayCard>
          {step === "sending" && (
            <>
              <Icon.Loading className="w-14 h-14 text-brand animate-spin" />
              <p className="font-display text-title font-bold text-brand">Processing...</p>
            </>
          )}
          {step === "success" && (
            <>
              <Icon.Check className="w-14 h-14 text-success" />
              <p className="font-display text-title font-bold text-brand">Tipped ${lastAmount}</p>
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
