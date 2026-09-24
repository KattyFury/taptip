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
import { Screen, TextLink, SingleAction, StepDot } from "@/components/screen";
import { TapTipWordmark, SlantButton } from "@/components/ui";

const SPLASH_DURATION_MS = 1600;

// Tung dong co doan in dam theo dung Figma Frame 1:13
const INSTALL_STEPS: Record<"ios" | "android", ReactNode[]> = {
  ios: [
    <>Open <strong className="font-bold">TapTip in Safari</strong></>,
    <>Tap <strong className="font-bold">Option</strong></>,
    <>Tap <strong className="font-bold">Share</strong></>,
    <>Tap <strong className="font-bold">Add to Home Screen</strong></>,
    <>Tap <strong className="font-bold">Add</strong> – you&apos;re done!</>,
  ],
  android: [
    <>Open <strong className="font-bold">TapTip in Chrome</strong></>,
    <>Tap <strong className="font-bold">⋮</strong> in the top-right corner</>,
    <>Tap <strong className="font-bold">Add to Home screen</strong></>,
    <>Tap <strong className="font-bold">Add</strong> — you&apos;re done!</>,
  ],
};

function detectPlatform(): "ios" | "android" {
  if (typeof navigator === "undefined") return "ios";
  return /android/i.test(navigator.userAgent) ? "android" : "ios";
}

function isInstalledStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return window.matchMedia?.("(display-mode: standalone)").matches === true || iosStandalone;
}

export default function Splash() {
  const router = useRouter();
  const [step, setStep] = useState<"splash" | "add-to-home">("splash");
  const [platform, setPlatform] = useState<"ios" | "android">("ios");

  useEffect(() => {
    setPlatform(detectPlatform());
    const timer = setTimeout(() => {
      if (isInstalledStandalone()) {
        router.push("/sign-in");
      } else {
        setStep("add-to-home");
      }
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [router]);

  // Splash - Figma "splash" (37:2): wordmark 40px o y=170 can giua + 3 hinh
  // trang tri (khung xanh/vang goc duoi-trai dung DUNG asset Group 28, 2 o
  // vuong xoay 60 do vien do/vang ben phai). Khung 390x844 tu cat phan tran.
  if (step === "splash") {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="absolute left-0 flex items-center justify-center"
          style={{ top: 170.32, width: 390, height: 49 }}
        >
          <TapTipWordmark fontSize={40} />
        </div>

        <div
          className="absolute flex items-center justify-center"
          style={{ left: -62.18, top: 692.74, width: 199.769, height: 199.769 }}
        >
          <div className="rotate-90">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/splash-deco.svg" alt="" width={199.769} height={199.769} className="block" />
          </div>
        </div>

        <div
          className="absolute flex items-center justify-center"
          style={{ left: 197.68, top: 519.19, width: 152.109, height: 152.109 }}
        >
          <div
            className="rotate-60 bg-background border-4 border-danger"
            style={{ width: 111.352, height: 111.352 }}
          />
        </div>

        <div
          className="absolute flex items-center justify-center"
          style={{ left: 218.71, top: 540.22, width: 110.054, height: 110.054 }}
        >
          <div className="rotate-60 border-4 border-primary" style={{ width: 80.565, height: 80.565 }} />
        </div>
      </div>
    );
  }

  // Add to Home Screen - Figma "add-home" (37:10): cham vang so o x=33, chu
  // o x=66 (Quicksand 20/40, doan dam Bold), Continue nut don 274 can giua,
  // Skip o y=795.
  return (
    <Screen
      title="Add Taptip to your Home Screen"
      action={
        <SingleAction>
          <SlantButton onClick={() => router.push("/sign-in")}>Continue</SlantButton>
        </SingleAction>
      }
      foot={<TextLink onClick={() => router.push("/sign-in")}>Skip</TextLink>}
    >
      <ol className="flex flex-col">
        {INSTALL_STEPS[platform].map((label, index) => (
          <li key={index} className="flex items-center" style={{ height: 40, paddingLeft: 8, gap: 8 }}>
            <StepDot n={index + 1} />
            <span className="font-body text-body font-medium text-foreground leading-[40px] whitespace-nowrap">
              {label}
            </span>
          </li>
        ))}
      </ol>
    </Screen>
  );
}
