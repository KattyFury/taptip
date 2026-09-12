"use client";

import { useEffect, useRef, useState } from "react";
import * as Icon from "@/components/icons";
import { toast } from "sonner";

interface TipSettings {
  slot1: number;
  slot2: number;
  slot3: number;
  slot4: number | null;
  slot5: number | null;
  default_slot: number;
}

const SLOTS = [1, 2, 3, 4, 5] as const;
const MAX_SLOTS = 5;
/** 8px keo = doi $1 - danh cho thao tac "slide len xuong de chinh so tien". */
const PX_PER_DOLLAR = 8;

/**
 * Hang preset tien tip ngay tren Home (thay the popup "Tip Setting" rieng +
 * nut "Option" xau xi cu - theo dung yeu cau thiet ke moi 09-12):
 *
 * - Khoa (icon Lock/LockOpen): mac dinh KHOA - bam 1 cai de MO KHOA, luc do
 *   moi keo (keo doc) tren tung nut de chinh so tien. Bam lai de khoa lai.
 * - Dau + : them nut moi (toi da 5, mac dinh 3: $2/$10/$20).
 * - Bam 1 nut (bat ky luc nao, khoa hay khong) = chon lam mac dinh (vien
 *   vang) - mac dinh la so tien Send flow tu dong chon san khi mo Scan to tip.
 */
export function TipPresetsRow() {
  const [settings, setSettings] = useState<TipSettings | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [dragSlot, setDragSlot] = useState<number | null>(null);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const dragStartRef = useRef<{ y: number; value: number } | null>(null);

  useEffect(() => {
    fetch("/api/tip-settings")
      .then((res) => res.json() as Promise<{ settings: TipSettings }>)
      .then((data) => setSettings(data.settings))
      .catch(() => toast.error("Could not load tip amounts"));
  }, []);

  if (!settings) return <div />;

  const slotValue = (slot: number): number | null =>
    settings[`slot${slot}` as keyof TipSettings] as number | null;

  const visibleSlots = SLOTS.filter((slot) => slotValue(slot) != null);
  const nextEmptySlot = SLOTS.find((slot) => slotValue(slot) == null);
  const canAddMore = visibleSlots.length < MAX_SLOTS && nextEmptySlot != null;

  const persist = async (slot: number, value: number) => {
    const res = await fetch("/api/tip-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, value }),
    });
    if (!res.ok) {
      toast.error("Could not save, try again");
      return;
    }
    const { settings: next } = (await res.json()) as { settings: TipSettings };
    setSettings(next);
  };

  const makeDefault = async (slot: number) => {
    if (settings.default_slot === slot) return;
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

  const addSlot = () => {
    if (nextEmptySlot == null) return;
    const lastValue = [...visibleSlots].reverse().map(slotValue).find((v) => v != null) ?? 0;
    persist(nextEmptySlot, (lastValue as number) + 10);
  };

  const onPointerDown = (slot: number, value: number) => (e: React.PointerEvent) => {
    if (!unlocked) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragStartRef.current = { y: e.clientY, value };
    setDragSlot(slot);
    setDragValue(value);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragSlot == null || !dragStartRef.current) return;
    const deltaY = dragStartRef.current.y - e.clientY;
    const deltaDollars = Math.round(deltaY / PX_PER_DOLLAR);
    const next = Math.max(1, dragStartRef.current.value + deltaDollars);
    setDragValue(next);
  };

  const onPointerUp = () => {
    if (dragSlot != null && dragValue != null) {
      const original = dragStartRef.current?.value;
      if (dragValue !== original) {
        persist(dragSlot, dragValue);
      }
    }
    dragStartRef.current = null;
    setDragSlot(null);
    setDragValue(null);
  };

  return (
    <div className="flex items-center gap-3 h-full">
      {/* Icon khoa + "+" xep doc, ben trai - dung Tabler thay 2 o vuong den/
          xam placeholder trong Figma. */}
      <div className="flex flex-col justify-between h-full py-0.5 shrink-0">
        <button
          onClick={() => setUnlocked((v) => !v)}
          aria-label={unlocked ? "Lock tip amounts" : "Unlock to edit tip amounts"}
          className={`w-8 h-8 rounded-[6px] flex items-center justify-center ${
            unlocked ? "bg-brand text-background" : "bg-surface text-brand"
          }`}
        >
          {unlocked ? <Icon.LockOpen className="w-4 h-4" /> : <Icon.Lock className="w-4 h-4" />}
        </button>
        <button
          onClick={addSlot}
          disabled={!canAddMore}
          aria-label="Add another tip amount"
          className="w-8 h-8 rounded-[6px] bg-surface text-brand flex items-center justify-center disabled:opacity-30"
        >
          <Icon.Add className="w-4 h-4" />
        </button>
      </div>

      {/* Cac nut preset - keo doc de chinh so tien khi da mo khoa. */}
      <div className="flex-1 grid gap-2 h-full" style={{ gridTemplateColumns: `repeat(${visibleSlots.length}, 1fr)` }}>
        {visibleSlots.map((slot) => {
          const isDefault = settings.default_slot === slot;
          const isDragging = dragSlot === slot;
          const displayValue = isDragging && dragValue != null ? dragValue : slotValue(slot);
          return (
            <button
              key={slot}
              onClick={() => makeDefault(slot)}
              onPointerDown={onPointerDown(slot, slotValue(slot) ?? 0)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{ touchAction: unlocked ? "none" : "auto" }}
              className={
                "h-full rounded-[var(--radius-slant)] flex flex-col items-center justify-center gap-0.5 font-display font-bold " +
                (isDefault ? "bg-primary text-primary-foreground" : "bg-surface text-brand") +
                (unlocked ? " ring-2 ring-brand/40" : "")
              }
            >
              {unlocked && <Icon.ChevronUp className="w-3 h-3 opacity-60" />}
              <span className="text-title leading-none">${displayValue}</span>
              {unlocked && <Icon.ChevronDown className="w-3 h-3 opacity-60" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
