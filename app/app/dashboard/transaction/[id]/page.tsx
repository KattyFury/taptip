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

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import * as Icon from "@/components/icons";
import {
  TransactionDetail,
  type TransactionDetailData,
} from "@/components/transaction-detail";

/**
 * Trang chi tiet giao dich mo bang link truc tiep.
 * Luong binh thuong trong app mo chi tiet bang modal noi tren Lich su tip
 * (components/transactions.tsx) - ca hai dung chung <TransactionDetail>.
 */
export default function Transaction() {
  const router = useRouter();
  const [detail, setDetail] = useState<TransactionDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    async function fetchTransaction() {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/wallet/transactions/${id}`);
        const parsed = await response.json();

        if (parsed.error) {
          setError(parsed.error);
          return;
        }

        const tx = parsed.transaction;
        const created = new Date(tx.createDate);
        const received = tx.transactionType === "USDC_TRANSFER_IN";
        const counterparty = received ? tx.from : tx.to;

        setDetail({
          status: tx.state,
          received,
          amount:
            tx.amounts && tx.amounts[0]
              ? parseFloat(tx.amounts[0]).toFixed(2)
              : "0.00",
          counterparty: counterparty
            ? `${counterparty.slice(0, 6)}...${counterparty.slice(-4)}`
            : "Unknown address",
          date: created.toLocaleDateString("en-US"),
          time: created.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          txHash: tx.txHash,
        });
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError("Could not load transaction details");
      } finally {
        setLoading(false);
      }
    }

    fetchTransaction();
  }, [id]);

  return (
    <div className="flex flex-col h-full py-6 gap-4 overflow-y-auto">
      <div className="grid grid-cols-[24px_1fr_24px] items-center">
        <span />
        <h1 className="text-[20px] font-extrabold text-center">
          Transaction Details
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          aria-label="Close"
          className="justify-self-end"
        >
          <Icon.Cancel className="w-5 h-5 text-accent" />
        </button>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="w-full h-40 rounded-xl" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col gap-3 items-center text-center">
          <Icon.Warning className="w-10 h-10 text-danger" />
          <p className="text-[15px] font-extrabold text-danger">{error}</p>
        </div>
      )}

      {!loading && !error && !detail && (
        <p className="text-[17px] text-hint text-center">Invalid transaction</p>
      )}

      {!loading && detail && <TransactionDetail data={detail} />}
    </div>
  );
}
