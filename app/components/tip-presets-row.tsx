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

  const adjustValue = (slot: number, delta: number) => {
    const current = slotValue(slot) ?? 0;
    const next = Math.max(1, current + delta);
    persist(slot, next);
  };

  // Toa do do tu Figma frame "5" (11:207), goc toa do la khoi cha 340x106
  // dat o x=25.04 y=511:
  //   o khoa  (11:220) x=25.04 y=526 -> rel (0, 15),  33x33, GOC VUONG, den
  //   o "+"   (11:221) x=25.04 y=568 -> rel (0, 57),  33x33, GOC VUONG, #a4afc3
  //   the 1-3 (11:222..224) x=65.99/168.33/270.66 -> rel 40.95, w=94.337 h=106
  //   -> cot the bat dau o 40.95, rong 299.05, cach nhau 8px
  //      (3 the: (299.05-16)/3 = 94.35, khop dung Figma)
  //   tam giac (11:229/230) 10.76x9.32 mau #6797F5, thut ~9px khoi goc phai
  return (
    <div className="relative w-full h-full select-none">
      <button
        onClick={() => setUnlocked((v) => !v)}
        aria-label={unlocked ? "Lock tip amounts" : "Unlock to edit tip amounts"}
        className={`absolute flex items-center justify-center transition-colors ${
          unlocked ? "bg-brand text-white" : "bg-black text-white"
        }`}
        style={{ left: 0, top: 15, width: 33, height: 33 }}
      >
        {unlocked ? <Icon.LockOpen className="w-4 h-4" /> : <Icon.Lock className="w-4 h-4" />}
      </button>
      <button
        onClick={addSlot}
        disabled={!canAddMore}
        aria-label="Add another tip amount"
        className="absolute bg-accent text-white flex items-center justify-center disabled:opacity-40"
        style={{ left: 0, top: 57, width: 33, height: 33 }}
      >
        <Icon.Add className="w-4 h-4 stroke-[2.5]" />
      </button>

      <div
        className="absolute flex"
        style={{ left: 40.95, top: 0, width: 299.05, height: 106, gap: 8 }}
      >
        {visibleSlots.map((slot) => {
          const isDragging = dragSlot === slot;
          const displayValue = isDragging && dragValue != null ? dragValue : slotValue(slot);
          const removable = slot > DEFAULT_SLOT_COUNT;

          return (
            <div key={slot} className="relative flex-1 min-w-0">
              <div
                onClick={() => {
                  if (!unlocked) makeDefault(slot);
                }}
                onPointerDown={onPointerDown(slot, slotValue(slot) ?? 0)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                style={{ touchAction: unlocked ? "none" : "auto" }}
                className="w-full h-full rounded-[8px] bg-surface flex items-center justify-center relative cursor-pointer"
              >
                <span className="font-display text-title font-bold text-brand leading-none">
                  ${displayValue}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustValue(slot, 1);
                  }}
                  aria-label="Increase tip amount"
                  className="absolute text-brand-soft"
                  style={{ top: 9, right: 9 }}
                >
                  <svg width="10.76" height="9.32" viewBox="0 0 10.7604 9.31875" fill="none">
                    <path d="M5.38018 0L10.7604 9.31875H0L5.38018 0Z" fill="currentColor" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustValue(slot, -1);
                  }}
                  aria-label="Decrease tip amount"
                  className="absolute text-brand-soft"
                  style={{ bottom: 9, right: 9 }}
                >
                  <svg
                    width="10.76"
                    height="9.32"
                    viewBox="0 0 10.7604 9.31875"
                    fill="none"
                    style={{ transform: "rotate(180deg)" }}
                  >
                    <path d="M5.38018 0L10.7604 9.31875H0L5.38018 0Z" fill="currentColor" />
                  </svg>
                </button>
              </div>

              {unlocked && removable && (
                <button
                  onClick={() => clearSlot(slot)}
                  aria-label="Remove this tip amount"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger text-background flex items-center justify-center shadow-btn z-10"
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
