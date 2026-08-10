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

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Wallet } from "@/types/database.types";
import { useEffect, useMemo, useState, type FunctionComponent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { arcTestnet } from "@/components/web3-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { StatusPill, DirectionBadge } from "@/components/ui/status-pill";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import * as Icon from "@/components/icons";
import {
  TransactionDetail,
  type TransactionDetailData,
} from "@/components/transaction-detail";

const ARC_CHAIN_ID = arcTestnet.id;

// Simple transaction format from API
interface SimpleTransaction {
  hash: string;
  from: string;
  to: string;
  toAddress?: string;
  fromAddress?: string;
  amount: string;
  timestamp: string;
  networkId: number;
  networkName: string;
  state: string;
  transactionType: string;
  id: string;
}

// Response type for the transfers API
interface TransfersResponse {
  transactions: SimpleTransaction[];
  pagination: {
    hasMore: boolean;
    pageAfter?: string;
    pageBefore?: string;
  };
  error?: string;
}

// Database transaction type
interface Transaction {
  id: string;
  status: string;
  created_at: string;
  circle_transaction_id: string;
  circle_contract_address: string;
  transaction_type: string;
  amount: string;
  network_id: number;
  network_name: string;
}

interface Props {
  wallet: Wallet;
  profile: {
    id: any;
  } | null;
}

async function syncTransactions(
  supabase: SupabaseClient,
  walletId: string,
  profileId: string,
  circleWalletId: string
) {
  try {
    // Fetch transactions from Arc
    const arcResponse = await fetch(
      `/api/wallet/transactions`,
      {
        method: "POST",
        body: JSON.stringify({
          walletId: circleWalletId,
          networkId: ARC_CHAIN_ID,
          pageSize: 50
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let arcTransactions: SimpleTransaction[] = [];

    if (arcResponse.ok) {
      const data: TransfersResponse = await arcResponse.json();
      arcTransactions = data.transactions || [];
    } else {
      console.error("Arc API response error:", await arcResponse.json());
    }

    // Deduplicate by hash (Circle may return multiple transfer records per on-chain tx)
    if (arcTransactions.length > 0) {
      const seenHashes = new Set<string>();
      const records = arcTransactions
        .filter((tx) => {
          if (seenHashes.has(tx.hash)) return false;
          seenHashes.add(tx.hash);
          return true;
        })
        .map((tx) => {
          const toAddress = tx.to || tx.toAddress || "";
          const fromAddress = tx.from || tx.fromAddress || "";
          const isReceived = toAddress && circleWalletId
            ? toAddress.toLowerCase() === circleWalletId.toLowerCase()
            : false;

          return {
            wallet_id: walletId,
            profile_id: profileId,
            circle_transaction_id: tx.hash,
            transaction_type: isReceived ? "USDC_TRANSFER_IN" : "USDC_TRANSFER_OUT",
            amount: parseFloat(tx.amount) || 0,
            currency: "USDC",
            status: tx.state || "COMPLETE",
            created_at: tx.timestamp,
            network_id: ARC_CHAIN_ID,
            network_name: "Arc Testnet",
            circle_contract_address: isReceived ? fromAddress : toAddress,
          };
        });

      const { data: existing } = await supabase
        .from("transactions")
        .select("circle_transaction_id")
        .eq("wallet_id", walletId);

      const existingIds = new Set(
        existing?.map((t: any) => t.circle_transaction_id) || []
      );

      const newRecords = records.filter(
        (r) => !existingIds.has(r.circle_transaction_id)
      );

      if (newRecords.length > 0) {
        const { error: insertError } = await supabase
          .from("transactions")
          .insert(newRecords);
        if (insertError) {
          console.error("Error inserting transactions:", insertError);
        }
      }
    }

    // Return all transactions from database
    const { data: allTransactions, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("wallet_id", walletId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching transactions:", fetchError);
      return [];
    }

    return allTransactions || [];
  } catch (error) {
    console.error("Error in syncTransactions:", error);
    return [];
  }
}

const supabase = createSupabaseBrowserClient();

const shortenHash = (hash: string) =>
  `${hash.slice(0, 6)}...${hash.slice(-4)}`;

export const Transactions: FunctionComponent<Props> = (props) => {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [counterpartyNames, setCounterpartyNames] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<TransactionDetailData | null>(null);

  const formattedData = useMemo(
    () =>
      data.map((transaction) => ({
        ...transaction,
        created_at: new Date(transaction.created_at).toISOString(),
        formattedDate: "",
      })),
    [data]
  );

  const searchedData = useMemo(() => {
    if (!searchQuery) return formattedData;
    const query = searchQuery.toLowerCase();
    return formattedData.filter(tx =>
      tx.circle_transaction_id.toLowerCase().includes(query)
    );
  }, [formattedData, searchQuery]);

  // Group transactions by day (header shows month/day/year)
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof formattedData> = {};

    searchedData.forEach((transaction) => {
      const date = new Date(transaction.created_at);
      const dayKey = date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      transaction.formattedDate = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey]!.push(transaction);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const [mA, dA, yA] = a.split('/').map(Number);
      const [mB, dB, yB] = b.split('/').map(Number);
      return new Date(yB, mB - 1, dB).getTime() - new Date(yA, mA - 1, dA).getTime();
    });

    const sortedGroups: Record<string, typeof formattedData> = {};
    sortedKeys.forEach(key => sortedGroups[key] = groups[key]!);
    return sortedGroups;
  }, [searchedData]);

  const loadCounterpartyNames = async (transactions: Transaction[]) => {
    const addresses = Array.from(
      new Set(
        transactions
          .map((t) => t.circle_contract_address?.toLowerCase())
          .filter((a): a is string => !!a)
      )
    );

    if (addresses.length === 0) return;

    const { data: matchedWallets } = await supabase
      .from("wallets")
      .select("wallet_address, profile_id")
      .in("wallet_address", addresses);

    if (!matchedWallets || matchedWallets.length === 0) return;

    const profileIds = Array.from(
      new Set(matchedWallets.map((w: any) => w.profile_id))
    );

    const { data: matchedProfiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", profileIds);

    const nameByProfileId: Record<string, string> = {};
    (matchedProfiles || []).forEach((p: any) => {
      if (p.name) nameByProfileId[p.id] = p.name;
    });

    const nameByAddress: Record<string, string> = {};
    matchedWallets.forEach((w: any) => {
      const name = nameByProfileId[w.profile_id];
      if (name) nameByAddress[w.wallet_address.toLowerCase()] = name;
    });

    setCounterpartyNames(nameByAddress);
  };

  const updateTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!props.wallet?.id || !props.profile?.id || !props.wallet?.circle_wallet_id) {
        setError("Missing wallet or profile information");
        return;
      }

      const transactions = await syncTransactions(
        supabase,
        props.wallet.id,
        props.profile.id,
        props.wallet.circle_wallet_id
      );

      setData(transactions);
      await loadCounterpartyNames(transactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!props.wallet?.id || !props.profile?.id) {
      return;
    }

    const transactionSubscription = supabase
      .channel("transactions")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `profile_id=eq.${props.profile?.id}`,
        },
        () => updateTransactions()
      )
      .subscribe();

    updateTransactions();

    return () => {
      supabase.removeChannel(transactionSubscription);
    };
  }, [props.wallet?.id, props.profile?.id, props.wallet?.circle_wallet_id]);

  const searchField = (
    <Input
      placeholder="Search transactions..."
      value={searchQuery}
      onChange={event => setSearchQuery(event.target.value)}
    />
  );

  if (loading) {
    return (
      <>
        {searchField}
        <div className="flex flex-col gap-3">
          <Skeleton className="w-1/3 h-5 rounded-xl" />
          <Skeleton className="w-full h-10 rounded-xl" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3 items-center text-center">
        <Icon.Warning className="w-10 h-10 text-danger" />
        <p className="text-[15px] font-extrabold text-danger">
          Couldn&apos;t load your tips: {error}
        </p>
        <Button size="row" onClick={updateTransactions}>
          Try again
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <>
        {searchField}
        <p className="text-[17px] text-hint text-center py-4">
          No transactions yet
        </p>
      </>
    );
  }

  return (
    <>
      {searchField}

      <div className="flex-1 min-h-0 flex flex-col gap-5 overflow-y-auto">
        {Object.entries(groupedTransactions).map(([day, transactions]) => (
          <div key={day}>
            <div className="text-[18px] font-bold font-num mb-2">{day}</div>

            <div className="flex flex-col gap-3">
              {transactions.map((transaction) => {
                const received =
                  transaction.transaction_type === 'USDC_TRANSFER_IN' ||
                  transaction.transaction_type === 'received';

                const counterpartyName = transaction.circle_contract_address
                  ? counterpartyNames[transaction.circle_contract_address.toLowerCase()]
                  : undefined;
                const displayLabel = counterpartyName
                  ? `Tip: ${counterpartyName}`
                  : transaction.circle_transaction_id
                    ? shortenHash(transaction.circle_transaction_id)
                    : 'Unknown address';

                const amount = parseFloat(transaction.amount).toFixed(2);

                return (
                  <button
                    key={transaction.id}
                    className="flex flex-col gap-1.5 py-2.5 text-left"
                    onClick={() =>
                      setSelected({
                        status: transaction.status,
                        received,
                        amount,
                        counterparty:
                          counterpartyName ??
                          (transaction.circle_contract_address
                            ? shortenHash(transaction.circle_contract_address)
                            : "Unknown address"),
                        date: day,
                        time: transaction.formattedDate,
                        txHash: transaction.circle_transaction_id,
                      })
                    }
                  >
                    <div className="flex items-center gap-2">
                      <DirectionBadge received={received} />
                      <span className="flex-1 text-[17px] font-extrabold">
                        {displayLabel}
                      </span>
                      <span
                        className={
                          "text-[17px] font-extrabold font-num " +
                          (received ? "text-success" : "text-danger")
                        }
                      >
                        {received ? "+" : "-"}
                        {amount}{" "}
                        <span className="text-[12px] font-extrabold font-sans">
                          USDC
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pl-[30px]">
                      <span className="text-[14px] text-accent font-num">
                        {transaction.formattedDate}
                      </span>
                      <StatusPill status={transaction.status} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Chi tiet giao dich: modal thu hai noi len tren modal Lich su tip */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[80%] overflow-y-auto">
          <div className="grid grid-cols-[24px_1fr_24px] items-center">
            <span />
            <DialogTitle>Transaction Details</DialogTitle>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="justify-self-end"
            >
              <Icon.Cancel className="w-5 h-5 text-accent" />
            </button>
          </div>

          {selected && <TransactionDetail data={selected} />}
        </DialogContent>
      </Dialog>
    </>
  );
};
