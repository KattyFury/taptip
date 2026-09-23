"use client";

/**
 * Bang chon so tien tip - Figma frame "26" (node 37:310) ben tab "Send Tip"
 * cua Home. THAY THE HOAN TOAN TipPresetsRow cu (hang ngang keo doc chinh
 * gia) - redesign 09-24:
 *   - "Default amount:" - 1 pill vang, la muc DANG DUNG de gui tip. Bam vao
 *     mo PICKER (frame 27) de doi so tien.
 *   - "Other amounts:" - danh sach pill con lai (toi da 4), bam 1 cai =
 *     HOAN DOI len lam default (dung API setDefault co san, giong tinh
 *     than "tap to select" cua ban cu). Pill tu them (slot 4/5) co the xoa
 *     (dau x do goc tren-phai). Pill cuoi la nut "+" them moi (toi da 5).
 *   - Phan hoi that 09-23: "sua 3 thanh keo thanh dang moi, hien thi cac
 *     nut, click vao la duoc keo chon nhu chon gio phone" -> PickerModal
 *     cuon doc, snap giua, thay he keo doc/mui ten tang-giam cu.
 *
 * Van dung chung backend /api/tip-settings (khong doi schema) - chi doi
 * lop giao dien.
 */

import { useState } from "react";
import * as Icon from "@/components/icons";
import { toast } from "sonner";

export interface TipSettings {
  slot1: number;
  slot2: number;
  slot3: number;
  slot4: number | null;
  slot5: number | null;
  default_slot: number;
}

const SLOTS = [1, 2, 3, 4, 5] as const;
const MAX_SLOTS = 5;
/** 3 nut mac dinh khong xoa duoc - chi nut tu them (4-5) moi co dau X. */
const DEFAULT_SLOT_COUNT = 3;
const PICKER_MIN = 1;
const PICKER_MAX = 200;

export function TipAmountPanel({
  settings,
  onSettingsChange,
}: {
  settings: TipSettings;
  onSettingsChange: (next: TipSettings) => void;
}) {
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  const slotValue = (slot: number): number | null =>
    settings[`slot${slot}` as keyof TipSettings] as number | null;

  const visibleSlots = SLOTS.filter((slot) => slotValue(slot) != null);
  const otherSlots = visibleSlots.filter((slot) => slot !== settings.default_slot);
  const nextEmptySlot = SLOTS.find((slot) => slotValue(slot) == null);
  const canAddMore = visibleSlots.length < MAX_SLOTS && nextEmptySlot != null;

  const persistValue = async (slot: number, value: number) => {
    const previous = settings;
    onSettingsChange({ ...settings, [`slot${slot}`]: value } as TipSettings);
    const res = await fetch("/api/tip-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, value }),
    });
    if (!res.ok) {
      onSettingsChange(previous);
      toast.error("Could not save, try again");
      return;
    }
    const { settings: next } = (await res.json()) as { settings: TipSettings };
    onSettingsChange(next);
  };

  const makeDefault = async (slot: number) => {
    if (settings.default_slot === slot) return;
    const previous = settings;
    onSettingsChange({ ...settings, default_slot: slot });
    const res = await fetch("/api/tip-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, setDefault: true }),
    });
    if (!res.ok) {
      onSettingsChange(previous);
      toast.error("Could not save, try again");
      return;
    }
    const { settings: next } = (await res.json()) as { settings: TipSettings };
    onSettingsChange(next);
  };

  const addSlot = () => {
    if (nextEmptySlot == null) return;
    const lastValue = [...visibleSlots].reverse().map(slotValue).find((v) => v != null) ?? 0;
    persistValue(nextEmptySlot, (lastValue as number) + 10);
  };

  const clearSlot = (slot: number) => {
    fetch("/api/tip-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, clear: true }),
    })
      .then((res) => res.json() as Promise<{ settings: TipSettings }>)
      .then((data) => onSettingsChange(data.settings))
      .catch(() => toast.error("Could not remove, try again"));
  };

  return (
    <div className="w-full flex flex-col" style={{ gap: 8 }}>
      {/* Default amount */}
      <div className="w-full bg-surface rounded-[8px] flex items-center justify-between px-[10px]" style={{ height: 49 }}>
        <span className="font-body text-small font-medium text-foreground">Default amount:</span>
        <button
          type="button"
          onClick={() => setPickerSlot(settings.default_slot)}
          className="bg-primary border border-foreground text-foreground font-body text-small font-medium rounded-full"
          style={{ width: 150, height: 32.66 }}
        >
          ${slotValue(settings.default_slot)}
        </button>
      </div>

      {/* Other amounts */}
      <div className="w-full bg-surface rounded-[8px] px-[10px] py-[8px] flex flex-col" style={{ gap: 8 }}>
        <div className="flex items-center justify-between">
          <span className="font-body text-small font-medium text-foreground">Other amounts:</span>
          {otherSlots[0] != null && (
            <OtherPill slot={otherSlots[0]} value={slotValue(otherSlots[0])!} onPromote={makeDefault} onClear={clearSlot} removable={otherSlots[0] > DEFAULT_SLOT_COUNT} />
          )}
        </div>
        <div className="grid grid-cols-2" style={{ gap: 8 }}>
          {otherSlots.slice(1).map((slot) => (
            <OtherPill key={slot} slot={slot} value={slotValue(slot)!} onPromote={makeDefault} onClear={clearSlot} removable={slot > DEFAULT_SLOT_COUNT} />
          ))}
          {canAddMore && (
            <button
              type="button"
              onClick={addSlot}
              aria-label="Add another tip amount"
              className="bg-background border border-foreground rounded-full flex items-center justify-center"
              style={{ height: 32.66 }}
            >
              <Icon.Add className="w-4 h-4 text-foreground" />
            </button>
          )}
        </div>
      </div>

      {pickerSlot != null && (
        <PickerModal
          initialValue={slotValue(pickerSlot) ?? PICKER_MIN}
          onClose={() => setPickerSlot(null)}
          onConfirm={(value) => {
            persistValue(pickerSlot, value);
            setPickerSlot(null);
          }}
        />
      )}
    </div>
  );
}

function OtherPill({
  slot,
  value,
  removable,
  onPromote,
  onClear,
}: {
  slot: number;
  value: number;
  removable: boolean;
  onPromote: (slot: number) => void;
  onClear: (slot: number) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onPromote(slot)}
        className="w-full bg-background border border-foreground text-foreground font-body text-small font-medium rounded-full"
        style={{ height: 32.66 }}
      >
        ${value}
      </button>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear(slot);
          }}
          aria-label="Remove this tip amount"
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-danger text-background flex items-center justify-center"
        >
          <Icon.X className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

/**
 * Picker cuon so tien - Figma frame "27" (node 38:338), popup vien den
 * rounded-[8px] chinh giua, dau X do goc tren-phai de dong. Cuon doc,
 * gia tri o GIUA duoc chon (dam), 2 ben mo dan.
 */
function PickerModal({
  initialValue,
  onClose,
  onConfirm,
}: {
  initialValue: number;
  onClose: () => void;
  onConfirm: (value: number) => void;
}) {
  const ITEM_H = 39.34; // 275.364 / 7 hang hien Figma ve
  const VISIBLE_ROWS = 7;
  const [value, setValue] = useState(initialValue);

  const range = Array.from(
    { length: PICKER_MAX - PICKER_MIN + 1 },
    (_, i) => PICKER_MIN + i,
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollTop / ITEM_H);
    const picked = range[Math.min(Math.max(index, 0), range.length - 1)];
    if (picked !== value) setValue(picked);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" onClick={onClose}>
      <div
        className="relative bg-background border border-foreground rounded-[8px] overflow-hidden"
        style={{ width: 324, height: ITEM_H * VISIBLE_ROWS }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute z-10 -top-2 -right-2 w-6 h-6 rounded-full bg-danger text-background flex items-center justify-center"
        >
          <Icon.X className="w-3.5 h-3.5" />
        </button>

        {/* Vach highlight hang giua - chi de trang tri, khong bat su kien */}
        <div
          className="absolute left-2 right-2 pointer-events-none rounded-full bg-primary/40"
          style={{ top: ITEM_H * Math.floor(VISIBLE_ROWS / 2), height: ITEM_H }}
        />

        <div
          className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
          style={{ paddingTop: ITEM_H * Math.floor(VISIBLE_ROWS / 2), paddingBottom: ITEM_H * Math.floor(VISIBLE_ROWS / 2) }}
          onScroll={handleScroll}
          ref={(el) => {
            if (el && el.dataset.inited !== "1") {
              el.dataset.inited = "1";
              el.scrollTop = (initialValue - PICKER_MIN) * ITEM_H;
            }
          }}
        >
          {range.map((n) => (
            <div
              key={n}
              className="snap-center flex items-center justify-center font-body text-small"
              style={{ height: ITEM_H, color: n === value ? undefined : "#909090" }}
            >
              <span className={n === value ? "font-bold text-foreground" : "font-medium"}>
                ${n}
              </span>
            </div>
          ))}
        </div>

        {/* Xac nhan bang cach cham ra ngoai hoac tu dong luu khi dung cuon -
            them 1 nut nho o duoi de ro rang co hanh dong xac nhan, tranh
            nguoi dung khong biet phai lam gi tiep. */}
        <button
          type="button"
          onClick={() => onConfirm(value)}
          className="absolute bottom-2 right-2 font-body text-small font-bold text-foreground underline"
        >
          Done
        </button>
      </div>
    </div>
  );
}
