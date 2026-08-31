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

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

interface Props {
  children: ReactNode
}

export default async function Layout({ children }: Props) {
  const userId = await getSession();

  if (!userId) {
    return redirect("/sign-in");
  }

  return (
    // Chi padding ngang o day. Man nao can khoang tho duoi (Home) thi tu them
    // pb tren container luoi cua no.
    <div className="relative flex flex-col h-full px-5">
      {children}
    </div>
  );
}
