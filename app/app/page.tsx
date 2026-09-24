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
import { SlantButton } from "@/components/ui";
import { SplashView } from "@/components/splash-view";

/**
 * "/" - Splash + Add to Home Screen (chi cho nguoi CHUA dang nhap; da dang
 * nhap thi middleware.ts day thang vao /dashboard).
 *
 * Quy tac user chot 09-24b:
 *   - Splash chi hien trong luc dang tai (khong con ep 1.6s) - JS chay xong
 *     la quyet dinh ngay: da cai PWA -> /sign-in, chua -> man huong dan cai.
 *   - Man huong dan LUON hien moi lan mo tren trinh duyet (app nham tip
 *     nhanh, can nguoi dung cai ra man hinh chinh).
 *   - Giu 2 phien ban iPhone (Safari) / Android (Chrome). Android ma trinh
 *     duyet ho tro cai tu dong (su kien beforeinstallprompt) thi nut
 *     Continue doi thanh "Install app" + them dong huong dan bam nut de cai.
 */

// Tung dong co doan in dam theo dung Figma "add-home" (37:10)
const INSTALL_STEPS: Record<"ios" | "android", ReactNode[]> = {
  ios: [
    <>Open <strong className="font-bold">TapTip in Safari</strong></>,
    <>Tap <strong className="font-bold">Option</strong></>,
    <>Tap <strong className="font-bold">Share</strong></>,
    <>Tap <strong className="font-bold">Add to Home Screen</strong></>,
    <>Tap <strong className="font-bold">Add</strong> – you’re done!</>,
  ],
  android: [
    <>Open <strong className="font-bold">TapTip in Chrome</strong></>,
    <>Tap <strong className="font-bold">⋮</strong> in the top-right corner</>,
    <>Tap <strong className="font-bold">Add to Home screen</strong></>,
    <>Tap <strong className="font-bold">Add</strong> – you’re done!</>,
  ],
};

/** Su kien cai PWA cua Chrome/Android - chua co trong lib.dom chuan */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    /** Bat som trong app/layout.tsx (su kien co the ban ra truoc khi trang nay mount) */
    __taptipInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

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
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isInstalledStandalone()) {
      router.replace("/sign-in");
      return;
    }
    setPlatform(detectPlatform());
    setStep("add-to-home");

    setInstallPrompt(window.__taptipInstallPrompt ?? null);
    const onReady = () => setInstallPrompt(window.__taptipInstallPrompt ?? null);
    window.addEventListener("taptip-install-ready", onReady);
    return () => window.removeEventListener("taptip-install-ready", onReady);
  }, [router]);

  if (step === "splash") return <SplashView />;

  const canAutoInstall = platform === "android" && installPrompt != null;

  const install = async () => {
    if (!installPrompt) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      window.__taptipInstallPrompt = null;
      setInstallPrompt(null);
      if (outcome === "accepted") router.push("/sign-in");
    } finally {
      setInstalling(false);
    }
  };

  return (
    <Screen
      title="Add Taptip to your Home Screen"
      action={
        <SingleAction>
          {canAutoInstall ? (
            <SlantButton onClick={install} disabled={installing}>
              {installing ? "Installing..." : "Install app"}
            </SlantButton>
          ) : (
            <SlantButton onClick={() => router.push("/sign-in")}>Continue</SlantButton>
          )}
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

      {canAutoInstall && (
        <p
          className="font-body text-body font-medium text-foreground leading-[30px] mt-4"
          style={{ paddingLeft: 8 }}
        >
          Or tap <strong className="font-bold">Install app</strong> below to install it automatically.
        </p>
      )}
    </Screen>
  );
}
