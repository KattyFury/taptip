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
import { Share, SquarePlus, CheckCircle2 } from "lucide-react";

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
      {/* Hang 1-6: huong dan them vao man hinh chinh */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-xs mx-auto">
        <h1 className="text-2xl font-bold text-center">
          Thêm TapTip vào Màn hình chính
        </h1>
        <p className="text-muted-foreground text-center">
          Mở nhanh như một ứng dụng thật, không cần vào lại trình duyệt.
        </p>

        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Share className="h-[3.5vh] w-[3.5vh] text-primary shrink-0" />
            <span className="text-sm">Nhấn biểu tượng Chia sẻ trên Safari</span>
          </div>
          <div className="flex items-center gap-3">
            <SquarePlus className="h-[3.5vh] w-[3.5vh] text-primary shrink-0" />
            <span className="text-sm">Chọn "Thêm vào MH chính"</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-[3.5vh] w-[3.5vh] text-primary shrink-0" />
            <span className="text-sm">Nhấn "Thêm" để hoàn tất</span>
          </div>
        </div>
      </div>

      {/* Hang 9: nut hanh dong */}
      <div className="pb-[2vh]">
        <Button
          className="w-full py-6 rounded-full text-lg font-semibold"
          onClick={() => router.push("/sign-in")}
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
