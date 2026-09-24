"use client";

/**
 * Tab "Send Tip" o Home - Figma "tip" (44:445) + "edit" (44:495), ban cap nhat
 * 09-24b. Thay han ban truoc ("Default amount" + "Other amounts" + nut "+"):
 *
 *   - Luoi 2x2 pill so tien 158x49 trong the xam 340x235 (padding 8, khe 8).
 *     Pill dang chon: nen vang, vien #1A1A1A. Pill khac: nen kem, vien den.
 *     Bam 1 pill = chon lam muc gui tu dong (default_slot).
 *   - Dong mo ta 16px xam #686868 + link "EDIT" do gach chan.
 *   - EDIT -> chon 1 o -> mo AmountPicker (frame "edit"): hop 340x275 o
 *     y=405, luot doc snap giua, SAVE (xanh) moi luu, X / bam ra ngoai = huy.
 *
 * Van dung chung backend /api/tip-settings (5 cot slot, khong doi schema).
 * Figma ve dung 4 pill -> hien slot 1-4; slot 4 con trong (user cu chi co 3
 * nut mac dinh) thi tu dien 1 gia tri de luon du 4 o nhu thiet ke.
 */

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface TipSettings {
  slot1: number;
  slot2: number;
  slot3: number;
  slot4: number | null;
  slot5: number | null;
  default_slot: number;
}

export const VISIBLE_SLOTS = [1, 2, 3, 4] as const;
const PICKER_MIN = 1;
const PICKER_MAX = 200;

export const slotValue = (settings: TipSettings, slot: number): number | null =>
  settings[`slot${slot}` as keyof TipSettings] as number | null;

async function patchSettings(body: Record<string, unknown>): Promise<TipSettings> {
  const res = await fetch("/api/tip-settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("save failed");
  const { settings } = (await res.json()) as { settings: TipSettings };
  return settings;
}

/** Luu so tien cho 1 slot - lac quan cap nhat UI truoc, loi thi tra lai. */
export async function saveSlotValue(
  settings: TipSettings,
  slot: number,
  value: number,
  onChange: (next: TipSettings) => void,
) {
  onChange({ ...settings, [`slot${slot}`]: value } as TipSettings);
  try {
    onChange(await patchSettings({ slot, value }));
  } catch {
    onChange(settings);
    toast.error("Could not save, try again");
  }
}

/* ============================ Luoi 2x2 ==================================== */

export function TipAmountGrid({
  settings,
  onSettingsChange,
  onEditSlot,
  initialEditing = false,
}: {
  settings: TipSettings;
  onSettingsChange: (next: TipSettings) => void;
  /** Da bam EDIT roi chon 1 o -> mo picker cho o do */
  onEditSlot: (slot: number) => void;
  initialEditing?: boolean;
}) {
  // EDIT -> chon o can sua. Figma khong ve buoc nay; user mo ta 09-24b: "bam
  // edit thi se duoc chon 1 trong cac o de thay doi so tien bang cach luot,
  // chon xong click SAVE la luu".
  const [editing, setEditing] = useState(initialEditing);
  // Slot 4 trong / default dang o slot 5 (khong hien) -> sua 1 lan cho khop
  // 4 pill cua Figma.
  const fixedRef = useRef(false);
  useEffect(() => {
    if (fixedRef.current) return;
    fixedRef.current = true;
    if (settings.slot4 == null) {
      const taken = VISIBLE_SLOTS.map((s) => slotValue(settings, s)).filter((v): v is number => v != null);
      const candidate = !taken.includes(20) ? 20 : Math.max(...taken) + 10;
      saveSlotValue(settings, 4, candidate, onSettingsChange);
    }
    if (settings.default_slot === 5) {
      makeDefault(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hien 4 o theo so tien TANG DAN; moi lan mo tab Send Tip luon chon o dau
  // tien = it tien nhat (user chot 09-24b).
  const orderedSlots = [...VISIBLE_SLOTS].sort(
    (a, b) => (slotValue(settings, a) ?? Infinity) - (slotValue(settings, b) ?? Infinity),
  );
  const cheapestRef = useRef(false);
  useEffect(() => {
    if (cheapestRef.current || settings.slot4 == null) return;
    cheapestRef.current = true;
    makeDefault(orderedSlots[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.slot4]);

  const makeDefault = async (slot: number) => {
    if (settings.default_slot === slot || slotValue(settings, slot) == null) return;
    const previous = settings;
    onSettingsChange({ ...settings, default_slot: slot });
    try {
      onSettingsChange(await patchSettings({ slot, setDefault: true }));
    } catch {
      onSettingsChange(previous);
      toast.error("Could not save, try again");
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute grid grid-cols-2" style={{ left: 8, top: 8, width: 324, gap: 8 }}>
        {orderedSlots.map((slot) => {
          const value = slotValue(settings, slot);
          const selected = settings.default_slot === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => {
                if (editing) {
                  setEditing(false);
                  onEditSlot(slot);
                } else {
                  makeDefault(slot);
                }
              }}
              disabled={value == null}
              className={
                "rounded-full border font-display text-title font-bold text-foreground leading-[40px] " +
                (selected ? "bg-primary border-ink" : "bg-background border-foreground")
              }
              style={{ height: 49 }}
            >
              {value != null ? `$${value}` : ""}
            </button>
          );
        })}
      </div>

      <p
        className="absolute font-body text-small font-medium text-secondary-text leading-[24px] flex items-center"
        style={{ left: 8, top: 122, width: 324, height: 70 }}
      >
        {editing ? (
          <span>
            Tap the <span className="font-bold">amount you want to change</span>.
          </span>
        ) : (
          <span>
            Automatically sends the selected amount when scanning a QR. Tap{" "}
            <span className="font-bold">Edit to change the amounts</span>.
          </span>
        )}
      </p>

      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        className="absolute font-display text-body font-bold text-danger underline leading-[24px]"
        style={{ left: 8, top: 192, width: 324, height: 35 }}
      >
        {editing ? "CANCEL" : "EDIT"}
      </button>
    </div>
  );
}

/* ============================ Picker ====================================== */

const ITEM_H = 275.36 / 7; // luoi 7 hang trong hop cao 275.36
const VISIBLE_ROWS = 5; // Figma 09-24b (co SAVE): hien 5 so, hang 2..6
const PAD_ROWS = Math.floor(VISIBLE_ROWS / 2);

/**
 * Hop picker - Figma "edit" (44:495, ban co nut SAVE): hop 340x275.36 bo 8
 * vien den. Hang 1 de trong (dau X goc phai), hang 2-6 la vung luot 5 so -
 * so giua to dam trong pill vang 157.43x47.68, so khac 16px #AEAEAE. Duoi
 * cung "SAVE" xanh la gach chan (y=233 trong hop, cao 35).
 * SAVE = luu, X / bam ra ngoai = huy (khong luu).
 */
export function AmountPicker({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: number;
  onSave: (value: number) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const range = Array.from({ length: PICKER_MAX - PICKER_MIN + 1 }, (_, i) => PICKER_MIN + i);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const index = Math.round(e.currentTarget.scrollTop / ITEM_H);
    const picked = range[Math.min(Math.max(index, 0), range.length - 1)];
    if (picked !== value) setValue(picked);
  };

  return (
    <div
      className="relative bg-background border border-foreground rounded-[8px] overflow-hidden"
      style={{ width: 340.07, height: 275.36 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 bg-primary border border-foreground rounded-full pointer-events-none"
        style={{ top: ITEM_H * 3 + (ITEM_H - 47.68) / 2, width: 157.43, height: 47.68 }}
      />

      <div
        className="absolute left-0 right-0 overflow-y-auto snap-y snap-mandatory no-scrollbar"
        style={{
          top: ITEM_H,
          height: ITEM_H * VISIBLE_ROWS,
          paddingTop: ITEM_H * PAD_ROWS,
          paddingBottom: ITEM_H * PAD_ROWS,
        }}
        onScroll={handleScroll}
        ref={(el) => {
          if (el && el.dataset.inited !== "1") {
            el.dataset.inited = "1";
            el.scrollTop = (initialValue - PICKER_MIN) * ITEM_H;
          }
        }}
      >
        {range.map((n) => (
          <button
            key={n}
            type="button"
            onClick={(e) => {
              e.currentTarget.parentElement?.scrollTo({ top: (n - PICKER_MIN) * ITEM_H, behavior: "smooth" });
            }}
            className={
              "snap-center w-full flex items-center justify-center font-display " +
              (n === value ? "text-title font-bold text-foreground" : "text-small font-medium text-hint")
            }
            style={{ height: ITEM_H }}
          >
            ${n}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onCancel}
        aria-label="Close without saving"
        className="absolute flex items-center justify-center"
        style={{ right: 11, top: 11, width: 16.7455, height: 17.4736 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/close-x.svg" alt="" width={16.7455} height={17.4736} />
      </button>

      <button
        type="button"
        onClick={() => onSave(value)}
        className="absolute left-0 right-0 font-display text-body font-bold text-brand underline leading-[24px]"
        style={{ top: 233, height: 35 }}
      >
        SAVE
      </button>
    </div>
  );
}
