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
/** 3 nut mac dinh $2/$10/$20 khong xoa duoc - chi nut TU THEM (4-5) moi co
 * dau X. */
const DEFAULT_SLOT_COUNT = 3;
/** 18px keo = doi $1 - tang tu 8 len 18 vi 8 qua nhay (mot chut run tay la
 * doi so ngay, dung phan hoi that 09-13: "keo con nhay nhay bay ba"). */
const PX_PER_DOLLAR = 18;

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

  const clearSlot = (slot: number) => {
    fetch("/api/tip-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, clear: true }),
    })
      .then((res) => res.json() as Promise<{ settings: TipSettings }>)
      .then((data) => setSettings(data.settings))
      .catch(() => toast.error("Could not remove, try again"));
  };

  // Da tung "nhay nhay bay ba" (phan hoi that 09-13) vi moi lan pointermove
  // deu setState + trinh duyet co the vua keo vua cuon trang cung luc. Sua:
  // preventDefault + capture bang chinh currentTarget (khong phai e.target -
  // co the la span/svg con ben trong) de dam bao nhan du moi su kien keo.
  const onPointerDown = (slot: number, value: number) => (e: React.PointerEvent) => {
    if (!unlocked) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = { y: e.clientY, value };
    setDragSlot(slot);
    setDragValue(value);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragSlot == null || !dragStartRef.current) return;
    e.preventDefault();
    const deltaY = dragStartRef.current.y - e.clientY;
    const deltaDollars = Math.round(deltaY / PX_PER_DOLLAR);
    const next = Math.max(1, dragStartRef.current.value + deltaDollars);
    setDragValue((prev) => (prev === next ? prev : next));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragSlot != null && dragValue != null) {
      const original = dragStartRef.current?.value;
      if (dragValue !== original) {
        persist(dragSlot, dragValue);
      }
    }
    e.currentTarget.releasePointerCapture(e.pointerId);
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
          // Chi nut TU THEM (4-5) moi xoa duoc - 3 nut mac dinh $2/$10/$20
          // khong co dau X (yeu cau that 09-13).
          const removable = slot > DEFAULT_SLOT_COUNT;
          return (
            <div key={slot} className="relative h-full select-none">
              <button
                onClick={() => {
                  // Che do mo khoa la de KEO chinh gia, khong phai de chon
                  // mac dinh - tranh vua keo vua vo tinh doi mac dinh.
                  if (!unlocked) makeDefault(slot);
                }}
                onPointerDown={onPointerDown(slot, slotValue(slot) ?? 0)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                style={{ touchAction: unlocked ? "none" : "auto" }}
                className={
                  "w-full h-full rounded-[var(--radius-slant)] flex flex-col items-center justify-center gap-0.5 font-display font-bold " +
                  (isDefault ? "bg-primary text-primary-foreground" : "bg-surface text-brand") +
                  (unlocked ? " ring-2 ring-brand/40" : "")
                }
              >
                {unlocked && <Icon.ChevronUp className="w-3 h-3 opacity-60" />}
                <span className="text-title leading-none">${displayValue}</span>
                {unlocked && <Icon.ChevronDown className="w-3 h-3 opacity-60" />}
              </button>

              {unlocked && removable && (
                <button
                  onClick={() => clearSlot(slot)}
                  aria-label="Remove this tip amount"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger text-background flex items-center justify-center shadow-btn"
                >
                  <Icon.X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
