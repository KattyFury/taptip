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
import {
  X,
  Plus,
  ArrowLeft,
  ImageIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useWeb3 } from "@/components/web3-provider";
import { useBalance } from "@/contexts/balanceContext";
import { toast } from "sonner";
import { decodeTapTipQr } from "@/lib/utils/qr-payment";

// Giai doan 1: gia tri tinh bang USDC truc tiep, chua lam quy doi VND
// (spec PRD noi "hien thi quy doi VND" - de danh cho Giai doan 2, can ty
// gia that thay vi hardcode)
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
          // qrbox theo % kich thuoc khung thay vi px co dinh, de khung quet
          // luon can giua va vua voi moi kich thuoc man hinh
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
      setScanError("Invalid QR - wrong network, wrong currency, or not a TapTip QR code.");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md flex flex-col h-[600px] max-h-[80vh]"
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
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {presets.map((value, index) => {
                const disabled = parseFloat(value) > balanceNum;
                const confirming = confirmDeleteIndex === index;
                return (
                  <div key={value} className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={disabled}
                      className="flex-1 justify-between py-6"
                      onClick={() => choosePreset(value)}
                    >
                      <span>{value} USDC</span>
                      {disabled && (
                        <span className="text-xs text-muted-foreground">
                          Not enough balance
                        </span>
                      )}
                    </Button>
                    {confirming ? (
                      <>
                        <Button
                          size="sm"
                          variant="destructive"
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
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setConfirmDeleteIndex(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                  <Button onClick={addCustomAmount}>Add</Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setShowCustomInput(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Enter a different amount
                </Button>
              )}
            </div>
          </>
        )}

        {step === "scan" && (
          <>
            <DialogHeader>
              <DialogTitle>Scan QR to send {amount} USDC</DialogTitle>
            </DialogHeader>
            <div className="flex-1 flex flex-col gap-3">
              {/* aspect-square thay vi flex-1: thu vien html5-qrcode tu dat
                  kich thuoc video theo ty le camera, de flex-1 se tao dai den
                  letterbox o duoi khi khung cao hon video */}
              <div
                id={QR_REGION_ID}
                className="w-full aspect-square bg-black rounded-xl overflow-hidden"
              />
              {scanError && (
                <p className="text-sm text-red-600 text-center">{scanError}</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                className="w-2/3 mx-auto"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload photo from gallery
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setStep("amount")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                className="flex-[2] rounded-full"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </>
        )}

        {step === "sending" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>Processing transaction...</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-xl font-semibold">-{lastAmount} USDC</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
