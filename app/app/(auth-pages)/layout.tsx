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

import { GlobalContextProvider } from "@/contexts/global-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false)

  const checkAuth = async () => {
    const response = await fetch('/api/auth-status')
    const { authenticated } = (await response.json()) as { authenticated: boolean }

    if (authenticated) {
      router.push('/dashboard')
      return
    }

    setChecked(true)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  if (!checked) return null;

  return (
    <GlobalContextProvider>
      {/* Chi padding ngang. KHONG dat margin/padding doc o day - luoi 10 hang
          phai chia tron chieu cao khung, them 1px doc la lech het cac vach. */}
      <div className="flex flex-col flex-1 w-full px-5">{children}</div>
    </GlobalContextProvider>
  );
}
