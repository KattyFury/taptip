"use client";

import { useEffect, useState } from "react";
import { ContentPopup } from "@/components/content-popup";
import * as Icon from "@/components/icons";
import { toast } from "sonner";

interface TipSettings {
  slot1: number;
  slot2: number;
  slot3: number;
  slot4: number | null;
  default_slot: number;
}

const SLOTS = [1, 2, 3, 4] as const;

export function TipSettingPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState<TipSettings | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [draftValue, setDraftValue] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/tip-settings")
      .then((res) => res.json() as Promise<{ settings: TipSettings }>)
      .then((data) => setSettings(data.settings))
      .catch(() => toast.error("Không tải được Tip Setting"));
  }, [open]);

  const slotValue = (slot: number) =>
    settings ? (settings[`slot${slot}` as keyof TipSettings] as number | null) : null;

  const startEdit = (slot: number) => {
    const current = slotValue(slot);
    setDraftValue(current != null ? String(current) : "");
    setEditingSlot(slot);
  };

  const saveEdit = async () => {
    if (editingSlot == null) return;
    const slot = editingSlot;
    const parsed = parseFloat(draftValue);
    setEditingSlot(null);

    if (draftValue.trim() === "" || isNaN(parsed) || parsed <= 0) {
      return;
    }

    const res = await fetch("/api/tip-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, value: parsed }),
    });

    if (!res.ok) {
      toast.error("Không lưu được, thử lại");
      return;
    }

    const { settings: next } = (await res.json()) as { settings: TipSettings };
    setSettings(next);
  };

  const makeDefault = async (slot: number) => {
    if (!settings || settings.default_slot === slot || slotValue(slot) == null) return;

    const res = await fetch("/api/tip-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, setDefault: true }),
    });

    if (!res.ok) {
      toast.error("Không lưu được, thử lại");
      return;
    }

    const { settings: next } = (await res.json()) as { settings: TipSettings };
    setSettings(next);
  };

  return (
    <ContentPopup open={open} onClose={onClose}>
      <div className="flex flex-col px-[18px]">
        {SLOTS.map((slot) => {
          const value = slotValue(slot);
          const isEditing = editingSlot === slot;
          const isDefault = settings?.default_slot === slot;

          return (
            <div
              key={slot}
              className="flex items-center justify-between gap-2.5 py-4 border-b border-border last:border-b-0"
            >
              {isEditing ? (
                <input
                  autoFocus
                  type="number"
                  inputMode="decimal"
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
                  placeholder="Số tiền"
                  className="w-[100px] text-[21px] font-bold font-num outline-none border-b-2 border-primary bg-transparent"
                />
              ) : (
                <button
                  className="flex items-center gap-2.5 text-left disabled:pointer-events-none"
                  disabled={value == null}
                  onClick={() => makeDefault(slot)}
                >
                  <span className="text-[21px] font-bold font-num">
                    {value != null ? `$${value}` : "+ Nhập số"}
                  </span>
                  {isDefault && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-1 rounded-sm">
                      Mặc định
                    </span>
                  )}
                </button>
              )}

              <button
                aria-label="Sửa số tiền"
                onClick={() => startEdit(slot)}
                className="w-7 h-7 rounded-full border border-border flex items-center justify-center shrink-0"
              >
                <Icon.Edit className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ContentPopup>
  );
}
