"use client";

import { useEffect, useState } from "react";
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

/**
 * Card noi dung cua popup Tip amounts - vo AnchoredCard boc quanh no o
 * home-screen.tsx, nen component nay khong tu quan ly open/dinh vi nua.
 */
export function TipSettingPopup({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<TipSettings | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [draftValue, setDraftValue] = useState("");

  useEffect(() => {
    fetch("/api/tip-settings")
      .then((res) => res.json() as Promise<{ settings: TipSettings }>)
      .then((data) => setSettings(data.settings))
      .catch(() => toast.error("Could not load tip amounts"));
  }, []);

  const slotValue = (slot: number) =>
    settings ? (settings[`slot${slot}` as keyof TipSettings] as number | null) : null;

  const visibleSlots = SLOTS.filter((slot) => slotValue(slot) != null || editingSlot === slot);
  const nextEmptySlot = SLOTS.find((slot) => slotValue(slot) == null);
  const canAddMore = nextEmptySlot != null && editingSlot !== nextEmptySlot;

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
      toast.error("Could not save, try again");
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
      toast.error("Could not save, try again");
      return;
    }

    const { settings: next } = (await res.json()) as { settings: TipSettings };
    setSettings(next);
  };

  return (
    <div className="flex flex-col px-[18px] py-[16px]">
      <h2 className="text-body font-semibold mb-2">Tip amounts</h2>

      {visibleSlots.map((slot) => {
        const value = slotValue(slot);
        const isDefault = settings?.default_slot === slot;
        const isEditing = editingSlot === slot;

        return (
          <div
            key={slot}
            className="flex items-center justify-between gap-2.5 py-[10px] border-b border-border last:border-b-0"
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
                placeholder="Amount"
                className="w-[80px] text-lead font-bold outline-none border-b-2 border-primary bg-transparent"
              />
            ) : (
              <button
                className="flex items-center gap-2.5 text-left flex-1"
                onClick={() => makeDefault(slot)}
              >
                <span className={"text-body " + (isDefault ? "font-semibold" : "text-accent")}>
                  {isDefault ? "Default" : "Option"}
                </span>
                <span className="text-lead font-bold">${value}</span>
              </button>
            )}

            <button
              aria-label="Edit amount"
              onClick={() => startEdit(slot)}
              className="w-6 h-6 flex items-center justify-center shrink-0"
            >
              <Icon.Option className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      {canAddMore && (
        <button
          className="text-body text-accent text-left py-[10px]"
          onClick={() => startEdit(nextEmptySlot)}
        >
          + Add more option
        </button>
      )}
    </div>
  );
}
