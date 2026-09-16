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
import { Sora, Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { BalanceProvider } from "@/contexts/balanceContext";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "http://localhost:3000";

// Quy luat thiet ke moi (09-12, thay het ban Inter/Archivo cu): Sora cho
// display (tieu de, so tien, nut bam), Montserrat cho noi dung (nhan, mo ta,
// o nhap). Hai font tach rieng - KHONG dung chung 1 font cho ca app nhu ban cu.
const sora = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
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
  themeColor: "#FFFDF5",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-page-backdrop text-foreground font-sans min-h-dvh h-dvh overflow-hidden">
        <BalanceProvider>
          <Toaster expand />
          <div className="flex items-center justify-center min-h-dvh h-dvh w-full">
            {/* Mobile-first: 100% full-height dvh tren dien thoai, khung demo can giua tren desktop */}
            <div className="tt-frame relative w-full h-full sm:h-[844px] sm:max-h-[min(844px,calc(100dvh-24px))] sm:w-[390px] flex flex-col bg-background border-0 sm:border-2 border-border sm:rounded-[24px] sm:shadow-2xl overflow-hidden">
              <main className="flex-1 flex flex-col items-center overflow-hidden w-full h-full pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
                <div className="flex flex-col w-full h-full flex-1 overflow-hidden">{children}</div>
              </main>
            </div>
          </div>
        </BalanceProvider>
      </body>
    </html>
  );
}
