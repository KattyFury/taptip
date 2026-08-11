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
import axios from "axios";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

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

  // Create Supabase client once per hook instance
  const supabaseRef = useRef(createSupabaseBrowserClient());

  const [balance, setBalance] = useState({
    native: 0,
    token: 0,
    loading: true,
  });

  // Use refs to track if balances have been loaded and prevent infinite loops
  const balancesLoadedRef = useRef(false);
  const prevAddressRef = useRef<string | null>(null);
  const isRefreshingRef = useRef(false);
  const realtimeChannelRef = useRef<any>(null);

  interface BalanceResponse {
    balance: string;
  }

  // Fetch balance directly from Supabase
  const fetchBalanceFromDB = useCallback(
    async (address: string): Promise<string> => {
      if (!address) return "0";

      try {
        // Query the database directly
        const { data, error } = await supabaseRef.current
          .from("wallets")
          .select("balance")
          .eq("wallet_address", address.toLowerCase())
          .eq("blockchain", "ARC")
          .single();

        if (error) {
          console.error("Error fetching balance from DB:", error);
          return "0";
        }

        return data?.balance || "0";
      } catch (error) {
        console.error("Error fetching balance from DB:", error);
        return "0";
      }
    },
    [],
  );

  // Fetch balance from API
  const fetchBalanceFromAPI = useCallback(
    async (address: string): Promise<string> => {
      if (!address) return "0";

      try {
        const response = await axios.post<BalanceResponse>(
          "/api/wallet/balance",
          {
            walletId: address,
            blockchain: "arc",
          },
        );

        return response.data.balance || "0";
      } catch (error) {
        console.error("Error fetching balance from API:", error);
        return "0";
      }
    },
    [],
  );

  // Load initial balances from DB, then refresh from API
  const loadBalances = useCallback(async () => {
    if (!effectiveAddress || isRefreshingRef.current) {
      if (!effectiveAddress) {
        setBalance((prev) => ({ ...prev, loading: false }));
      }
      return;
    }

    isRefreshingRef.current = true;

    // First set loading state
    setBalance((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      // STEP 1: Try to get balance from DB first (fast)
      const dbBalance = await fetchBalanceFromDB(effectiveAddress);

      // Update state with DB value immediately (faster UX)
      setBalance((prev) => ({
        native: prev.native,
        token: parseFloat(dbBalance) || 0,
        loading: true, // Keep loading while we fetch from API
      }));

      // STEP 2: Then fetch from API to ensure latest value (slower but accurate)
      const apiBalance = await fetchBalanceFromAPI(effectiveAddress);

      // Update state with API value and finish loading
      const finalBalance = parseFloat(apiBalance) || 0;
      prevBalanceRef.current = finalBalance;
      setBalance((prev) => ({
        native: prev.native,
        token: finalBalance || prev.token,
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
  }, [effectiveAddress, fetchBalanceFromDB, fetchBalanceFromAPI]);

  // Helper to check if account has changed
  const hasAddressChanged = useCallback(() => {
    const prev = prevAddressRef.current;
    const current = effectiveAddress;

    prevAddressRef.current = current;

    return prev !== current;
  }, [effectiveAddress]);

  // Track previous balance for realtime toast dedup
  const prevBalanceRef = useRef<number | null>(null);

  // Handle realtime balance updates
  const updateWalletBalance = useCallback(
    (payload: any) => {
      const newBalance = Number(payload.new.balance);

      if (isNaN(newBalance)) {
        console.error(
          "Invalid balance update received:",
          payload.new.balance,
        );
        return;
      }

      const prevBalance = prevBalanceRef.current;
      if (prevBalance !== null && newBalance === prevBalance) {
        return;
      }

      prevBalanceRef.current = newBalance;
      toast.info(`Balance: ${newBalance} USDC`);

      setBalance((prev) => ({
        ...prev,
        token: newBalance,
      }));
    },
    [],
  );

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

  // Set up realtime subscription for wallet updates
  useEffect(() => {
    if (realtimeChannelRef.current) {
      supabaseRef.current.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    if (!effectiveAddress) return;

    const walletChannel = supabaseRef.current
      .channel("wallet-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
        },
        (payload) => {
          const address = payload.new.wallet_address.toLowerCase();
          const blockchain = payload.new.blockchain;

          if (
            blockchain === "ARC" &&
            address === effectiveAddress?.toLowerCase()
          ) {
            updateWalletBalance(payload);
          }
        },
      )
      .subscribe();

    realtimeChannelRef.current = walletChannel;

    return () => {
      if (realtimeChannelRef.current) {
        supabaseRef.current.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [effectiveAddress, updateWalletBalance]);

  return {
    balance,
    refreshBalances: loadBalances,
    isRefreshing: isRefreshingRef.current,
  };
}
