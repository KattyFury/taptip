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

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Share, SquarePlus, CheckCircle2 } from "lucide-react";

const SPLASH_DURATION_MS = 1600;

export default function Splash() {
  const router = useRouter();
  const [step, setStep] = useState<"splash" | "add-to-home">("splash");

  useEffect(() => {
    const timer = setTimeout(() => setStep("add-to-home"), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (step === "splash") {
    return (
      <div className="flex flex-col h-full px-5">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <img src="/logo.png" alt="TapTip" className="h-[16vh] w-[16vh] object-contain" />
          <h1 className="text-3xl font-bold">TapTip</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-5">
      {/* He luoi 10 hang: 1 (dem) + 5 (noi dung, tam ~hang 3.5) + 3 (dem) + 1 (nut) */}
      <div style={{ flex: "1 1 0" }} />

      <div style={{ flex: "5 1 0", minHeight: 0 }} className="flex flex-col items-center justify-center gap-6 w-full max-w-xs mx-auto">
        <h1 className="text-2xl font-bold text-center">
          Add TapTip to Home Screen
        </h1>
        <p className="text-muted-foreground text-center">
          Opens as fast as a real app, no need to go back through the browser.
        </p>

        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <MoreHorizontal className="h-[3.5vh] w-[3.5vh] text-primary shrink-0" />
            <span className="text-sm">Tap the options menu</span>
          </div>
          <div className="flex items-center gap-3">
            <Share className="h-[3.5vh] w-[3.5vh] text-primary shrink-0" />
            <span className="text-sm">Tap the Share icon in Safari</span>
          </div>
          <div className="flex items-center gap-3">
            <SquarePlus className="h-[3.5vh] w-[3.5vh] text-primary shrink-0" />
            <span className="text-sm">Choose "Add to Home Screen"</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-[3.5vh] w-[3.5vh] text-primary shrink-0" />
            <span className="text-sm">Tap "Add" to finish</span>
          </div>
        </div>
      </div>

      <div style={{ flex: "3 1 0" }} />

      {/* Hang 9-10: nut hanh dong, cao 4/5 hang, rong 2/3 man can giua */}
      <div style={{ flex: "1 1 0", minHeight: 0 }} className="flex items-center">
        <Button
          className="w-2/3 mx-auto h-[80%] rounded-full text-lg font-semibold"
          onClick={() => router.push("/sign-in")}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
