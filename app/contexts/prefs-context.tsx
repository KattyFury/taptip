"use client";

/**
 * Cai dat user dung chung trong dashboard (man Setting, 09-24b): don vi tien
 * + gioi han tip/ngay. Doc 1 lan tu /api/preferences; lan dau gui kem mui gio
 * may de server tinh dung "hom nay" cho gioi han tip.
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Currency = "USD" | "USDC";

export interface Prefs {
  dailyTipLimit: number | null;
  currency: Currency;
}

interface PrefsContextValue {
  prefs: Prefs;
  loaded: boolean;
  update: (patch: Partial<Prefs>) => Promise<void>;
  /** Hien so tien theo don vi user chon: "$12.5" hoac "12.5 USDC" */
  money: (amount: number) => string;
}

const DEFAULT: Prefs = { dailyTipLimit: null, currency: "USD" };

function fmt(amount: number): string {
  if (!isFinite(amount)) return "0";
  return (Math.floor(amount * 100 + 1e-6) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formatMoney(amount: number, currency: Currency): string {
  return currency === "USDC" ? `${fmt(amount)} USDC` : `$${fmt(amount)}`;
}

const PrefsContext = createContext<PrefsContextValue>({
  prefs: DEFAULT,
  loaded: false,
  update: async () => {},
  money: (a) => formatMoney(a, "USD"),
});

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => (r.ok ? (r.json() as Promise<{ prefs: Prefs & { tzOffsetMinutes: number } }>) : null))
      .then((data) => {
        if (!data) return;
        setPrefs({ dailyTipLimit: data.prefs.dailyTipLimit, currency: data.prefs.currency });
        const tz = new Date().getTimezoneOffset();
        if (data.prefs.tzOffsetMinutes !== tz) {
          fetch("/api/preferences", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tzOffsetMinutes: tz }),
          }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const update = useCallback(async (patch: Partial<Prefs>) => {
    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = (await res.json().catch(() => null)) as { prefs?: Prefs; error?: string } | null;
    if (!res.ok || !data?.prefs) throw new Error(data?.error || "Could not save");
    setPrefs({ dailyTipLimit: data.prefs.dailyTipLimit, currency: data.prefs.currency });
  }, []);

  const money = useCallback((amount: number) => formatMoney(amount, prefs.currency), [prefs.currency]);

  return <PrefsContext.Provider value={{ prefs, loaded, update, money }}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  return useContext(PrefsContext);
}
