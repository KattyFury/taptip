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
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { arcTestnet } from "@/components/web3-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

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

export const Transactions: FunctionComponent<Props> = (props) => {
  const router = useRouter();
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [counterpartyNames, setCounterpartyNames] = useState<Record<string, string>>({});

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

  // Transaction type display mapping
  const getTransactionTypeDisplay = (type: string) => {
    if (type === "USDC_TRANSFER_IN" || type === "received") {
      return "Received"
    }

    if (type === "USDC_TRANSFER_OUT" || type === "sent") {
      return "Sent"
    }

    return type
  };

  const getStatusDisplay = (status: string) => {
    if (status === "COMPLETE") return "Complete";
    if (status === "PENDING") return "Pending";
    if (status === "FAILED") return "Failed";
    return status;
  };

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
      setRefreshing(true);
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
      setRefreshing(false);
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

  if (loading) {
    return <Skeleton className="w-full h-[30px] rounded-md" />;
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 text-destructive">
        <p>Error loading transactions: {error}</p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-2"
          onClick={updateTransactions}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <>
        <div className="flex flex-col justify-between mb-4">
          <Input
            placeholder="Search transactions..."
            className="w-full mb-2"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
          />
        </div>
        <p className="text-xl text-muted-foreground">
          No transactions yet
        </p>
      </>
    );
  }

  return (
    <>
      <Input
        placeholder="Search transactions..."
        className="w-full mb-2"
        value={searchQuery}
        onChange={event => setSearchQuery(event.target.value)}
      />

      <div className="space-y-8">
        {Object.entries(groupedTransactions).map(([day, transactions]) => (
          <div key={day}>
            <h2 className="text-xl font-bold mb-2">{day}</h2>
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const isReceived =
                  transaction.transaction_type === 'USDC_TRANSFER_IN' ||
                  transaction.transaction_type === 'received';
                // Arc goes PENDING → COMPLETE directly, no CONFIRMED state
                const statusClass = transaction.status === "COMPLETE"
                  ? "bg-green-100 text-green-800"
                  : transaction.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : transaction.status === "FAILED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800";

                const counterpartyName = transaction.circle_contract_address
                  ? counterpartyNames[transaction.circle_contract_address.toLowerCase()]
                  : undefined;
                const displayLabel = counterpartyName
                  ? `Tip: ${counterpartyName}`
                  : transaction.circle_transaction_id
                    ? `${transaction.circle_transaction_id.slice(0, 6)}...${transaction.circle_transaction_id.slice(-4)}`
                    : 'Unknown address';

                return (
                  <div
                    key={transaction.id}
                    className="p-4 pl-0 hover:bg-gray-50 dark:hover:bg-white/5"
                    onClick={() => router.push(
                      `/dashboard/transaction/${transaction.circle_transaction_id}`
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium">
                            {displayLabel}
                          </span>
                          <Badge className={`ml-2 rounded-none ${statusClass}`}>
                            {getStatusDisplay(transaction.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {getTransactionTypeDisplay(transaction.transaction_type)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.formattedDate}
                        </div>
                      </div>
                      <div
                        className={`ml-auto font-medium ${
                          isReceived ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isReceived ? '+' : '-'}
                        {parseFloat(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
