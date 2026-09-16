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
import { Screen, TextLink } from "@/components/screen";
import { TapTipLogo, SlantButton } from "@/components/ui";

const SPLASH_DURATION_MS = 1600;

// Tung dong co doan in dam theo dung Figma Frame 1:13
const INSTALL_STEPS: Record<"ios" | "android", ReactNode[]> = {
  ios: [
    <>Open <strong className="font-bold text-foreground">TapTip in Safari</strong></>,
    <>Tap <strong className="font-bold text-foreground">Option</strong></>,
    <>Tap <strong className="font-bold text-foreground">Share</strong></>,
    <>Tap <strong className="font-bold text-foreground">Add to Home Screen</strong></>,
    <>Tap <strong className="font-bold text-foreground">Add</strong> – you&apos;re done!</>,
  ],
  android: [
    <>Open <strong className="font-bold text-foreground">TapTip in Chrome</strong></>,
    <>Tap <strong className="font-bold text-foreground">⋮</strong> in the top-right corner</>,
    <>Tap <strong className="font-bold text-foreground">Add to Home screen</strong></>,
    <>Tap <strong className="font-bold text-foreground">Add</strong> — you&apos;re done!</>,
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

  // Splash: dung logo TapTip (Figma 1:10)
  if (step === "splash") {
    return (
      <div className="flex flex-col items-center justify-center h-full px-5">
        <TapTipLogo size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Screen
        title="Add Taptip to your Home Screen"
        tightContent
        action={
          <SlantButton onClick={() => router.push("/sign-in")}>
            Continue
          </SlantButton>
        }
        foot={
          <TextLink onClick={() => router.push("/sign-in")}>Skip</TextLink>
        }
      >
        <div className="w-full max-w-[324px] flex flex-col gap-4 pt-2">
          {INSTALL_STEPS[platform].map((label, index) => (
            <div key={index} className="flex items-baseline gap-2 font-body text-[20px] leading-[24px]">
              <span className="font-display font-bold text-brand shrink-0">
                {index + 1}.
              </span>
              <span className="text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </Screen>
    </div>
  );
}
