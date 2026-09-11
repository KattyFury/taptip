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
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/users";
import HomeScreen from "@/components/home-screen";

export default async function Dashboard() {
  const userId = await getSession();
  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await getUserById(userId);
  if (!user) {
    return redirect("/sign-in");
  }

  if (!user.wallet_address) {
    return redirect("/dashboard/setup-wallet");
  }

  const primaryWallet = { wallet_address: user.wallet_address };
  const profile = { id: user.id, name: "", daily_tip_limit: null };

  return <HomeScreen primaryWallet={primaryWallet} profile={profile} />;
}
