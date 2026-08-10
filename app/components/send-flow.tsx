"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Icon from "@/components/icons";
import { useWeb3 } from "@/components/web3-provider";
import { useBalance } from "@/contexts/balanceContext";
import { toast } from "sonner";
import { decodeTapTipQr } from "@/lib/utils/qr-payment";

// Gia tri tinh bang USDC truc tiep, chua lam quy doi VND (can ty gia that,
// khong hardcode).
const DEFAULT_PRESETS = ["1", "5", "10"];
const PRESETS_STORAGE_KEY = "taptip_presets";
const QR_REGION_ID = "taptip-qr-region";

type Step = "amount" | "scan" | "sending" | "success";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAmount?: string;
}

export default function SendFlow({ open, onOpenChange, initialAmount }: Props) {
  const { sendUSDC } = useWeb3();
  const { balance, refreshBalances } = useBalance();
  const [step, setStep] = useState<Step>("amount");
  const [presets, setPresets] = useState<string[]>(DEFAULT_PRESETS);
  const [amount, setAmount] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null,
  );
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastAmount, setLastAmount] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch {
        // ignore corrupted local data
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      if (initialAmount) {
        setAmount(initialAmount);
        setStep("scan");
      }
    } else {
      setStep("amount");
      setAmount(null);
      setShowCustomInput(false);
      setCustomAmount("");
      setConfirmDeleteIndex(null);
      setScanError(null);
      stopScanner();
    }
  }, [open, initialAmount]);

  useEffect(() => {
    if (step === "scan") {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [step]);

  const savePresets = (next: string[]) => {
    setPresets(next);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(next));
  };

  const balanceNum = isNaN(balance.token) ? 0 : balance.token;

  const choosePreset = (value: string) => {
    setAmount(value);
    setStep("scan");
  };

  const confirmDelete = (index: number) => {
    const next = presets.filter((_, i) => i !== index);
    savePresets(next);
    setConfirmDeleteIndex(null);
  };

  const addCustomAmount = () => {
    const value = parseFloat(customAmount);
    if (!customAmount || isNaN(value) || value <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const next = [...presets, customAmount].sort(
      (a, b) => parseFloat(a) - parseFloat(b),
    );
    savePresets(next);
    setCustomAmount("");
    setShowCustomInput(false);
  };

  const startScanner = async () => {
    setScanError(null);

    // Doi 1 frame de dam bao div QR_REGION_ID da that su co trong DOM
    // (dialog + step chuyen cung luc co the chua kip commit)
    if (!document.getElementById(QR_REGION_ID)) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    if (!document.getElementById(QR_REGION_ID)) {
      setScanError("Couldn't open camera. Try uploading a photo instead.");
      return;
    }

    try {
      const scanner = new Html5Qrcode(QR_REGION_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          // qrbox theo % kich thuoc khung thay vi px co dinh, de o quet luon
          // can giua va khop voi overlay vien trang 70% ve o duoi
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
      // Permission denied hoac khong co camera (VD test tren PC) la truong
      // hop da xu ly (fallback sang nhap anh), khong phai loi bat ngo.
      console.warn("Could not start camera:", err);
      setScanError("Couldn't open camera. Try uploading a photo instead.");
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
      setScanError("Couldn't read a QR code in this image.");
    } finally {
      e.target.value = "";
    }
  };

  const handleScanResult = async (decodedText: string) => {
    const decoded = decodeTapTipQr(decodedText);
    if (!decoded) {
      setScanError(
        "Invalid QR - wrong network, wrong currency, or not a TapTip QR code.",
      );
      return;
    }
    if (!amount) {
      setScanError("Missing amount, go back and choose an amount.");
      return;
    }

    stopScanner();
    setStep("sending");

    const txHash = await sendUSDC(decoded.address, amount);

    if (!txHash) {
      toast.error("Send failed, try again");
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

  // Buoc sending/success: giu nguyen man quet phia sau nhung lam mo con 40%,
  // roi noi mot the popover nho len tren.
  const isOverlayStep = step === "sending" || step === "success";
  const scanIsBehind = isOverlayStep || step === "scan";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[600px] max-h-[80vh] gap-[14px]"
        onInteractOutside={(e) => {
          if (step === "sending") e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (step === "sending") e.preventDefault();
        }}
      >
        {step === "amount" && (
          <>
            <DialogHeader>
              <DialogTitle>Choose an amount</DialogTitle>
            </DialogHeader>

            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-[10px]">
              {presets.map((value, index) => {
                const disabled = parseFloat(value) > balanceNum;
                const confirming = confirmDeleteIndex === index;
                return (
                  <div
                    key={value}
                    className={
                      "flex items-center gap-2 " + (disabled ? "opacity-50" : "")
                    }
                  >
                    <button
                      disabled={disabled}
                      onClick={() => choosePreset(value)}
                      className="flex-1 border border-border rounded-xl p-4 shadow-btn flex justify-between items-center text-[17px] disabled:pointer-events-none"
                    >
                      <span className="font-num">{value} USDC</span>
                      {disabled && (
                        <span className="text-[13px] text-hint">
                          Not enough balance
                        </span>
                      )}
                    </button>

                    {confirming ? (
                      <>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => confirmDelete(index)}
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDeleteIndex(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteIndex(index)}
                        aria-label={`Remove ${value} USDC`}
                        className="w-9 h-9 flex items-center justify-center"
                      >
                        <Icon.Cancel className="w-[18px] h-[18px] text-accent" />
                      </button>
                    )}
                  </div>
                );
              })}

              {showCustomInput ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    autoFocus
                    placeholder="USDC amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                  <Button size="sm" onClick={addCustomAmount}>
                    Add
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-2 py-2 text-[17px] text-foreground"
                >
                  <Icon.Add className="w-4 h-4 text-accent shrink-0" />
                  Enter a different amount
                </button>
              )}
            </div>
          </>
        )}

        {scanIsBehind && (
          <div
            className={
              "flex flex-col gap-[14px] flex-1 min-h-0 " +
              (isOverlayStep ? "opacity-40 pointer-events-none" : "")
            }
          >
            <DialogHeader>
              <DialogTitle>
                Scan QR to send <span className="font-num">{amount}</span> USDC
              </DialogTitle>
            </DialogHeader>

            {/* Khung camera vuong. aspect-square thay vi flex-1: html5-qrcode
                tu dat kich thuoc video theo ty le camera, de flex-1 se tao
                dai den letterbox o duoi khi khung cao hon video. */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-foreground shrink-0">
              <div id={QR_REGION_ID} className="w-full h-full" />
              {/* O ngam: vuong 70% canh ngan, can giua - ve de khop dung voi
                  qrbox cau hinh cho thu vien */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-[15%] top-[15%] w-[70%] h-[70%] border-[3px] border-background rounded-sm"
              />
            </div>

            {scanError && (
              <p className="text-[15px] font-extrabold text-danger text-center">
                {scanError}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="chip"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon.Image className="w-4 h-4 text-accent shrink-0" />
                Upload photo from gallery
              </Button>
            </div>

            <div className="flex-1" />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="pill"
                className="flex-1"
                onClick={() => setStep("amount")}
                aria-label="Go back"
              >
                <Icon.Back className="w-4 h-4" />
              </Button>
              <Button
                variant="dark"
                size="pill"
                className="flex-[2]"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {/* The popover noi len tren man quet da lam mo */}
        {step === "sending" && (
          <OverlayCard>
            <Icon.Loading className="w-[56px] h-[56px] text-accent animate-spin" />
            <p className="text-[20px] font-bold">Processing transaction...</p>
          </OverlayCard>
        )}

        {step === "success" && (
          <OverlayCard>
            <Icon.Check className="w-[56px] h-[56px] text-success" />
            <p className="text-[20px] font-bold font-num">-{lastAmount} USDC</p>
          </OverlayCard>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** The thong bao nho noi giua man - dung cho buoc dang xu ly va thanh cong. */
function OverlayCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-100px)] max-w-[330px] bg-background rounded-xl shadow-popover px-5 py-7 flex flex-col items-center gap-4">
      {children}
    </div>
  );
}
