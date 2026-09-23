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
 * Man 20 (Figma node 37:209) - redesign 09-24 gio Figma DA ve man nay dung
 * (truoc do la phan SUY RA, dung khuon Screen chung). Chu chinh xac tu
 * design context: "We can't sign you in. Please try again later." voi
 * "can't" IN DAM.
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
      <p className="font-display text-body font-medium text-foreground text-left w-full leading-[40px]">
        We <span className="font-bold">can&apos;t</span> sign you in. Please try again later.
      </p>
    </Screen>
  );
}