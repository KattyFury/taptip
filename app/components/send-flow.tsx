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

// Giai doan 1: gia tri tinh bang USDC truc tiep, chua lam quy doi VND
// (spec PRD noi "hien thi quy doi VND" - de danh cho Giai doan 2, can ty
// gia that thay vi hardcode)
const DEFAULT_PRESETS = ["1", "5", "10"];
const PRESETS_STORAGE_KEY = "taptip_presets";
const QR_REGION_ID = "taptip-qr-region";
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

type Step = "amount" | "scan" | "sending" | "success";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SendFlow({ open, onOpenChange }: Props) {
  const { sendUSDC } = useWeb3();
  const { balance } = useBalance();
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
    if (!open) {
      setStep("amount");
      setAmount(null);
      setShowCustomInput(false);
      setCustomAmount("");
      setConfirmDeleteIndex(null);
      setScanError(null);
      stopScanner();
    }
  }, [open]);

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
      toast.error("Nhập số tiền hợp lệ");
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
    try {
      const scanner = new Html5Qrcode(QR_REGION_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScanResult(decodedText),
        () => {
          // ignore per-frame "not found" callbacks
        },
      );
    } catch (err) {
      console.error("Could not start camera:", err);
      setScanError("Không mở được camera. Thử nhập ảnh từ kho ảnh.");
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
      setScanError("Không đọc được QR trong ảnh này.");
    } finally {
      e.target.value = "";
    }
  };

  const handleScanResult = async (decodedText: string) => {
    if (!ADDRESS_REGEX.test(decodedText)) {
      setScanError("QR không hợp lệ — không phải địa chỉ ví.");
      return;
    }
    if (!amount) {
      setScanError("Thiếu số tiền, quay lại chọn số tiền.");
      return;
    }

    stopScanner();
    setStep("sending");

    const txHash = await sendUSDC(decodedText, amount);

    if (!txHash) {
      toast.error("Gửi thất bại, thử lại");
      setStep("scan");
      return;
    }

    setLastAmount(amount);
    setStep("success");

    setTimeout(() => {
      setStep("scan");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col h-[600px] max-h-[80vh]">
        {step === "amount" && (
          <>
            <DialogHeader>
              <DialogTitle>Chọn số tiền</DialogTitle>
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
                          Không đủ số dư
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
                          Xoá
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDeleteIndex(null)}
                        >
                          Huỷ
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
                    placeholder="Số USDC"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                  <Button onClick={addCustomAmount}>Thêm</Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setShowCustomInput(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nhập số khác
                </Button>
              )}
            </div>
          </>
        )}

        {step === "scan" && (
          <>
            <DialogHeader>
              <DialogTitle>Quét QR để gửi {amount} USDC</DialogTitle>
            </DialogHeader>
            <div className="flex-1 flex flex-col gap-3">
              <div
                id={QR_REGION_ID}
                className="flex-1 bg-black rounded-lg overflow-hidden"
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
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Nhập ảnh từ kho ảnh
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
                Hoàn tất
              </Button>
            </div>
          </>
        )}

        {step === "sending" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>Đang xử lý giao dịch...</p>
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
