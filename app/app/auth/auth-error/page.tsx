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

import { useRouter } from "next/navigation";
import { Screen } from "@/components/screen";
import { SlantButton } from "@/components/ui";

/**
 * Figma KHONG ve man nay - phan SUY RA, dung khuon Screen chung. Truoc
 * 09-17 day la <div>Authentication error</div> tran, khong font khong token,
 * la scaffold con sot lai tu ban fork arc-p2p-payments.
 */
export default function AuthError() {
  const router = useRouter();

  return (
    <Screen
      title="Something went wrong"
      action={
        <SlantButton onClick={() => router.push("/sign-in")}>Back to sign in</SlantButton>
      }
    >
      <p className="font-body text-body font-medium text-foreground text-left w-full leading-[30px]">
        We couldn&apos;t sign you in. Please try again.
      </p>
    </Screen>
  );
}