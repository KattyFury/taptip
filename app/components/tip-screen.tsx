"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import * as Icon from "@/components/icons";
import { Screen, BackAction, PrimaryButton } from "@/components/screen";
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
        title="Tipping..."
        tightContent
        action={
          <BackAction onBack={() => router.push("/dashboard")}>
            <PrimaryButton onClick={() => router.push("/dashboard")}>Done</PrimaryButton>
          </BackAction>
        }
      >
        {/* Do lai TUYET DOI tu get_metadata node 11:458 (px that, khong doan
            qua % suy dien): camera y=172 h=327.8 (KHONG phai vuong - ti le
            340x328, gan vuong nhung khong dung 1:1), roi CHI 16px (dung 1
            row-gap) toi hang preset y=516. Ca 2 nam gon trong 1 khoi gap-4
            rieng (16px) - KHONG dung gap-6 mac dinh cua Screen (24px, sai
            khoang cach that trong Figma). Da bo het: khung vang huong dan
            quet (Figma khong ve), nut "Upload a QR image instead" (Figma
            khong co), gioi han max-w gia tao truoc do. */}
        <div className="w-full flex flex-col gap-4">
          <div
            className="relative w-full tt-card-cut overflow-hidden bg-foreground"
            style={{ height: "328px" }}
          >
            <div id={QR_REGION_ID} className="w-full h-full" />
          </div>

          {/* Preset $ - nghieng + VIEN xanh (khac han preset phang tren
              Home): chua chon = nen trong, da chon = nen vang. Dung 3 cot 1
              hang nhu Figma (khong phai luoi 2 cot). */}
          <div className="w-full grid grid-cols-3 gap-2">
            {([1, 2, 3, 4, 5] as const).map((slot) => {
              const value = slotAmount(slot);
              if (value == null) return null;
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => selectSlot(slot)}
                  className={
                    `w-full h-[70px] [transform:skewX(var(--skew-angle))] rounded-[var(--radius-slant)] border-2 border-brand font-display text-lead font-bold ` +
                    (isSelected ? "bg-primary text-primary-foreground" : "bg-background text-brand")
                  }
                >
                  <span className="inline-block [transform:skewX(calc(-1*var(--skew-angle)))]">${value}</span>
                </button>
              );
            })}
          </div>
        </div>

        {scanError && (
          <p className="font-body text-small font-semibold text-danger text-center">{scanError}</p>
        )}
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
