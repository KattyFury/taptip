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

import type { Viewport } from "next";
import { Quicksand } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { BalanceProvider } from "@/contexts/balanceContext";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "http://localhost:3000";

// Quy luat thiet ke MOI (09-24, redesign theo Figma ban moi user dua truc
// tiep - "Figma la nguon su that"): doi font display tu Sora sang Quicksand
// (xac nhan bang get_design_context man Sign in that: title dung
// "Quicksand:Bold", nut dung "Quicksand:Medium/Bold" - font tron, am, hop
// tong mau kem/vang/xanh la Tet). Ban Figma cap nhat sau do (09-24b) doi
// luon PHAN NOI DUNG sang Quicksand Medium - Montserrat da bo han.
const quicksand = Quicksand({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "TapTip",
  description: "Tip and gift money as fast as a handshake",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#FFF8EB", // 09-24: kem giay redesign Tet, truoc la #FFFDF5
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={quicksand.variable}
      suppressHydrationWarning
    >
      <body className="bg-page-backdrop text-foreground font-sans min-h-dvh h-dvh overflow-hidden">
        {/* Khung thiet ke la 390x844 CO DINH. Thay vi co gian tung phan tu
            (ban cu dung clamp/dvh -> lech Figma tren moi may), ta scale
            NGUYEN KHUNG. CSS thuan khong chia duoc length/length ra so cho
            scale() nen phai tinh bang script - chay truoc paint de khong
            nhay khung. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){function s(){var e=Math.min(window.innerWidth/390,window.innerHeight/844);" +
              "document.documentElement.style.setProperty('--frame-scale',String(e));}" +
              "s();window.addEventListener('resize',s,{passive:true});" +
              "window.addEventListener('orientationchange',s);})();",
          }}
        />
        <BalanceProvider>
          <Toaster expand />
          <div className="flex items-center justify-center min-h-dvh h-dvh w-full overflow-hidden">
            <div className="tt-frame relative flex flex-col bg-background overflow-hidden border-0 sm:border-2 border-border sm:rounded-[24px] sm:shadow-2xl">
              <main className="flex-1 flex flex-col items-center overflow-hidden w-full h-full">
                <div className="flex flex-col w-full h-full flex-1 overflow-hidden">{children}</div>
              </main>
            </div>
          </div>
        </BalanceProvider>
      </body>
    </html>
  );
}
