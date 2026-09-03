/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/** Mot thong diep duy nhat cho moi kieu doc so du that bai - nguoi dung khong
 * can biet la loi mang hay loi RPC, chi can biet TIEN VAN AN TOAN. Loi nay hay
 * bat ngay SAU khi tip thanh cong (refreshBalances chay lien sau /api/tip),
 * nen cau chu phai chan duoc hieu nham "tip that bai". */
const BALANCE_READ_ERROR =
  "Couldn't refresh your balance. Your money is safe - try again in a moment.";

/** Khoang cho giua cac lan thu lai (ms). Lan doc dau tien chay ngay, sau do
 * moi so trong mang nay la mot lan thu nua - tong cong 3 lan trong ~4.5s.
 *
 * LY DO: refreshBalances() chay NGAY sau /api/tip, luc do giao dich vua len
 * chain va RPC Arc thuong chua tra loi kip -> truoc day bao loi do ngay, dung
 * khoanh khac nguoi dung vua tip xong nen de tuong tip that bai. Doi mot nhip
 * roi doc lai thi hau het cac ca nay tu khoi, khong con phai bao loi gi ca. */
const RETRY_DELAYS_MS = [1500, 3000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Phan biet loi TU KHOI DUOC (RPC chua kip tra loi, mang chop chop) voi loi
 * thu lai bao nhieu lan cung the (het phien dang nhap, dia chi sai). Thu lai
 * loai thu hai chi lam nguoi dung ngoi cho them 4.5s roi van nhan dung cai
 * loi do. */
type BalanceFetch =
  | { ok: true; value: number }
  | { ok: false; retryable: boolean };

/**
 * knownAddress: dia chi vi da biet san tu server (primaryWallet.wallet_address),
 * khong phu thuoc pipeline WebAuthn/passkey phia client. Truoc day hook nay chi
 * fetch khi Web3Context bao isConnected=true (tuc la toan bo chuoi khoi tao
 * WebAuthn -> toCircleSmartAccount -> bundler chay xong khong loi) - bat ky
 * truc trac nao trong chuoi do bi console.error nuot mat, so du ket vinh vien
 * o 0 ma khong bao gio bao loi cho user. Uu tien knownAddress, fallback ve
 * account.address (Web3Context) neu khong duoc truyen vao.
 */
export function useWalletBalances(knownAddress?: string) {
  const effectiveAddress = knownAddress || null;

  const [balance, setBalance] = useState({
    native: 0,
    token: 0,
    loading: true,
  });

  // Loi doc so du hien o HANG 10 man Home (chu do, can giua) - khong con dung
  // toast goc phai: toast tu bien mat va de bi bo lo dung luc nguoi dung dang
  // nhin vao so du.
  const [error, setError] = useState<string | null>(null);

  // Use refs to track if balances have been loaded and prevent infinite loops
  const balancesLoadedRef = useRef(false);
  const prevAddressRef = useRef<string | null>(null);
  const isRefreshingRef = useRef(false);

  interface BalanceResponse {
    balance: string;
  }

  // Fetch balance from API. KHONG BAO GIO tra "0" khi doc that bai - "0" gia
  // khien nguoi dung tuong minh het tien (day dung la cai bay im lang tung
  // giau bug passkey suot nhieu tuan).
  const fetchBalanceFromAPI = useCallback(
    async (address: string): Promise<BalanceFetch> => {
      if (!address) return { ok: false, retryable: false };

      try {
        const response = await fetch("/api/wallet/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletId: address, blockchain: "arc" }),
        });

        if (!response.ok) {
          console.error("Balance endpoint returned", response.status);
          // 502 = route khong doc noi RPC Arc (xem app/api/wallet/balance):
          // dung loai tu khoi duoc. 400/401 thi thu lai cung vay thoi.
          return { ok: false, retryable: response.status >= 500 };
        }

        const data = (await response.json()) as BalanceResponse;
        const parsed = parseFloat(data.balance);
        if (isNaN(parsed)) {
          console.error("Balance endpoint returned unparsable body:", data);
          return { ok: false, retryable: false };
        }
        return { ok: true, value: parsed };
      } catch (error) {
        // Mat mang / request bi huy - dung loai doi mot nhip la khoi.
        console.error("Error fetching balance from API:", error);
        return { ok: false, retryable: true };
      }
    },
    [],
  );

  // Load balance tu Circle API - v2 bo Supabase (khong con DB fast-path/cache
  // rieng), moi lan mo Home la fetch lai thang tu Circle.
  const loadBalances = useCallback(async () => {
    if (!effectiveAddress || isRefreshingRef.current) {
      if (!effectiveAddress) {
        setBalance((prev) => ({ ...prev, loading: false }));
      }
      return;
    }

    isRefreshingRef.current = true;

    setBalance((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      let result = await fetchBalanceFromAPI(effectiveAddress);

      for (const delay of RETRY_DELAYS_MS) {
        if (result.ok || !result.retryable) break;
        await sleep(delay);
        result = await fetchBalanceFromAPI(effectiveAddress);
      }

      if (!result.ok) {
        // Giu nguyen so du cu, danh dau chua doc duoc de con thu lai lan sau.
        setError(BALANCE_READ_ERROR);
        setBalance((prev) => ({ ...prev, loading: false }));
        return;
      }

      setError(null);

      setBalance((prev) => ({
        native: prev.native,
        token: result.value,
        loading: false,
      }));

      balancesLoadedRef.current = true;
    } catch (error) {
      console.error("Error refreshing balances:", error);
      setError(BALANCE_READ_ERROR);

      setBalance((prev) => ({ ...prev, loading: false }));
    } finally {
      isRefreshingRef.current = false;
    }
  }, [effectiveAddress, fetchBalanceFromAPI]);

  // Helper to check if account has changed
  const hasAddressChanged = useCallback(() => {
    const prev = prevAddressRef.current;
    const current = effectiveAddress;

    prevAddressRef.current = current;

    return prev !== current;
  }, [effectiveAddress]);

  // Initialize balances as soon as we know a wallet address - khong con cho
  // Web3Context/WebAuthn ket noi xong, dia chi da biet san tu server la du.
  useEffect(() => {
    if (!effectiveAddress) return;

    const addressChanged = hasAddressChanged();
    const isFirstLoad = !balancesLoadedRef.current;

    const freshInitialization =
      typeof window !== "undefined" &&
      localStorage.getItem("wallet_just_initialized");

    if (freshInitialization) {
      localStorage.removeItem("wallet_just_initialized");
      balancesLoadedRef.current = false;

      const timeoutId = setTimeout(() => {
        loadBalances();
      }, 1000);

      return () => clearTimeout(timeoutId);
    } else if (isFirstLoad || addressChanged) {
      loadBalances();
    }
  }, [effectiveAddress, loadBalances, hasAddressChanged]);

  return {
    balance,
    error,
    refreshBalances: loadBalances,
    isRefreshing: isRefreshingRef.current,
  };
}
