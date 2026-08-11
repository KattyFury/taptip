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

import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import HomeScreen from "@/components/home-screen";

const TransactionsTab = dynamic(() => import("@/components/transactions-tab"), { ssr: true });

export default async function Dashboard() {
  const supabase = await createSupabaseServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const isWalletSetupComplete = user?.user_metadata?.wallet_setup_complete;

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("auth_user_id", user?.id)
    .single();

  if (!profile) {
    return redirect("/sign-in");
  }

  // Check for wallets in database
  const { data: wallets } = await supabase
    .schema("public")
    .from("wallets")
    .select()
    .eq("profile_id", profile.id);

  const hasPendingWallets = wallets?.some(wallet =>
    wallet.circle_wallet_id === "pending-setup" || !wallet.wallet_address
  );

  if ((!wallets || wallets.length === 0 || hasPendingWallets) && !isWalletSetupComplete) {
    return redirect(`/dashboard/setup-wallet?username=${crypto.randomUUID()}`);
  }

  // Get the Arc wallet
  const arcWallet = wallets?.find(w => w.blockchain === "ARC");

  const primaryWallet = arcWallet || {
    circle_wallet_id: "incomplete-setup",
    wallet_address: user?.user_metadata?.wallet_address || "0x0",
    profile_id: profile.id,
    blockchain: "ARC",
  };

  return (
    <HomeScreen
      primaryWallet={primaryWallet}
      accountName={profile.name}
      historyContent={<TransactionsTab primaryWallet={primaryWallet} profile={profile} />}
    />
  );
}
