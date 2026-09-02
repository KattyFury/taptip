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

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Screen, SingleAction, PrimaryButton, TextLink } from "@/components/screen";

const SPLASH_DURATION_MS = 1600;

// Tung dong co the co doan in dam - dung <strong> thay vi string thuong.
const INSTALL_STEPS: Record<"ios" | "android", ReactNode[]> = {
  ios: [
    <>Open <strong className="font-extrabold">TapTip in Safari</strong></>,
    <>Tap <strong className="font-extrabold">Option</strong> in Safari</>,
    <>Tap <strong className="font-extrabold">Share</strong></>,
    <>Tap <strong className="font-extrabold">Add to Home Screen</strong></>,
    <>Tap <strong className="font-extrabold">Add</strong> – you&apos;re done!</>,
  ],
  android: [
    <>Open <strong className="font-extrabold">TapTip in Chrome</strong></>,
    <>Tap <strong className="font-extrabold">⋮</strong> in the top-right corner</>,
    <>Tap <strong className="font-extrabold">Add to Home screen</strong></>,
    <>Tap <strong className="font-extrabold">Add</strong> — you&apos;re done!</>,
  ],
};

// Doan Android ("android") - moi thu con lai (iOS/iPadOS/desktop Safari...)
// mac dinh ve iOS, vi phan lon nguoi test/dung app hien tai la iPhone.
function detectPlatform(): "ios" | "android" {
  if (typeof navigator === "undefined") return "ios";
  return /android/i.test(navigator.userAgent) ? "android" : "ios";
}

export default function Splash() {
  const router = useRouter();
  const [step, setStep] = useState<"splash" | "add-to-home">("splash");
  const [platform, setPlatform] = useState<"ios" | "android">("ios");

  useEffect(() => {
    setPlatform(detectPlatform());
    const timer = setTimeout(() => setStep("add-to-home"), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  // Splash: chu ky TapTip can giua, hoi cao hon tam mot chut
  // (luoi 1 dem tren / 5 logo / 4 dem duoi)
  if (step === "splash") {
    return (
      <div className="flex flex-col h-full px-5">
        <div style={{ flex: "1 1 0" }} />
        <div
          style={{ flex: "5 1 0", minHeight: 0 }}
          className="flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.svg" alt="TapTip" className="w-[60%] h-auto" />
        </div>
        <div style={{ flex: "4 1 0" }} />
      </div>
    );
  }

  return (
    <div className="h-full px-5">
      <Screen
        title={
          <>
            Add TapTip to your
            <br />
            Home Screen
          </>
        }
        tightContent
        action={
          <SingleAction>
            <PrimaryButton onClick={() => router.push("/sign-in")}>
              Continue
            </PrimaryButton>
          </SingleAction>
        }
        foot={
          <div style={{ marginTop: "-2.5cqh" }}>
            <TextLink onClick={() => router.push("/sign-in")}>Skip</TextLink>
          </div>
        }
      >
        <ol className="w-fit flex flex-col gap-[1.5cqh]">
          {INSTALL_STEPS[platform].map((label, index) => (
            <li key={index} className="flex items-center gap-3">
              <span className="w-[2.8cqh] h-[2.8cqh] rounded-full bg-accent text-background shrink-0 flex items-center justify-center text-small font-extrabold">
                {index + 1}
              </span>
              <span className="text-body">{label}</span>
            </li>
          ))}
        </ol>
      </Screen>
    </div>
  );
}
