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
import { useWeb3 } from "@/components/web3-provider";
import { toast } from "sonner";

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
  const { account } = useWeb3();
  const effectiveAddress = knownAddress || account.address || null;

  const [balance, setBalance] = useState({
    native: 0,
    token: 0,
    loading: true,
  });

  // Use refs to track if balances have been loaded and prevent infinite loops
  const balancesLoadedRef = useRef(false);
  const prevAddressRef = useRef<string | null>(null);
  const isRefreshingRef = useRef(false);

  interface BalanceResponse {
    balance: string;
  }

  // Fetch balance from API. Tra ve null khi KHONG doc duoc - khong tra "0",
  // vi "0" gia khien nguoi dung tuong minh het tien (day dung la cai bay im
  // lang tung giau bug passkey suot nhieu tuan).
  const fetchBalanceFromAPI = useCallback(
    async (address: string): Promise<number | null> => {
      if (!address) return null;

      try {
        const response = await fetch("/api/wallet/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletId: address, blockchain: "arc" }),
        });

        if (!response.ok) {
          console.error("Balance endpoint returned", response.status);
          return null;
        }

        const data = (await response.json()) as BalanceResponse;
        const parsed = parseFloat(data.balance);
        return isNaN(parsed) ? null : parsed;
      } catch (error) {
        console.error("Error fetching balance from API:", error);
        return null;
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
      const apiBalance = await fetchBalanceFromAPI(effectiveAddress);

      if (apiBalance == null) {
        // Giu nguyen so du cu, danh dau chua doc duoc de con thu lai lan sau.
        toast.error("Could not read your balance");
        setBalance((prev) => ({ ...prev, loading: false }));
        return;
      }

      setBalance((prev) => ({
        native: prev.native,
        token: apiBalance,
        loading: false,
      }));

      balancesLoadedRef.current = true;
    } catch (error) {
      console.error("Error refreshing balances:", error);
      toast.error("Failed to refresh balances");

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
    refreshBalances: loadBalances,
    isRefreshing: isRefreshingRef.current,
  };
}
