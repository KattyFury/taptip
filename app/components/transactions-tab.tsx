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

import { Transactions } from "@/components/transactions";

interface Props {
  primaryWallet: { wallet_address: string };
  profile: {
    id: any;
  } | null;
}

// Modal "Tip history" chi co tieu de + o tim + danh sach theo ban thiet ke.
// Tieu de do <DialogTitle> ben home-screen.tsx dat, khong dat lai o day.
export default async function TransactionsTab({ primaryWallet, profile }: Props) {
  // TODO(v2): Transactions van doc tu Supabase (Wallet type day du) - se viet
  // lai theo D1 o Wireframe v2 Group E, chua lam trong lan sua nay.
  return <Transactions wallet={primaryWallet as any} profile={profile} />
}
