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
import { TapTipLogo, LOGO_SPLASH, SlantButton } from "@/components/ui";

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

  // Splash (Figma frame "1", node 5:15): CHI co wordmark, dat tuyet doi o
  // x=100.11 y=166.13 - KHONG can giua doc (ban truoc can giua nen lech han).
  if (step === "splash") {
    return (
      <div className="relative w-full h-full">
        <div className="absolute" style={{ left: 100.11, top: 166.13 }}>
          <TapTipLogo {...LOGO_SPLASH} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Screen
        title="Add Taptip to your Home Screen"
        action={
          <SlantButton onClick={() => router.push("/sign-in")}>
            Continue
          </SlantButton>
        }
        foot={
          <TextLink onClick={() => router.push("/sign-in")}>Skip</TextLink>
        }
      >
        {/* Figma node 7:49 (so thu tu) + 7:47 (chu), ca hai top=170 cao 220:
            cot so x=33 rong 25 can giua, cot chu x=66 rong 291, moi dong
            leading 40px. Ca hai deu Montserrat 19px - so la Bold mau brand,
            chu la Medium den voi tu khoa in dam. */}
        <div style={{ marginLeft: 8.04, width: 324 }}>
          {INSTALL_STEPS[platform].map((label, index) => (
            <div key={index} className="flex" style={{ gap: 8 }}>
              <span
                className="font-body text-body font-bold text-brand text-center shrink-0"
                style={{ width: 25, lineHeight: "40px" }}
              >
                {index + 1}.
              </span>
              <span
                className="font-body text-body font-medium text-foreground"
                style={{ width: 291, lineHeight: "40px" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </Screen>
    </div>
  );
}
