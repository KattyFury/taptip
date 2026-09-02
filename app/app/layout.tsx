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
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { BalanceProvider } from "@/contexts/balanceContext";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "http://localhost:3000";

// Inter: toan bo chu giao dien, ke ca so - Figma dung Inter cho tat ca,
// khong tach font rieng cho con so nhu ban cu (Nunito + Comfortaa).
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "TapTip",
  description: "Tip and gift money as fast as a handshake",
};

export const viewport: Viewport = {
  interactiveWidget: "resizes-content",
  themeColor: "#FFCC00",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className="bg-page-backdrop text-foreground font-sans min-h-dvh overflow-hidden">
          <BalanceProvider>
            {/* Toaster PHAI nam ngoai container can giua: sonner render mot
                <section> tham gia layout, de trong flex la no an mat mot phan
                be ngang va day khung dien thoai lech sang phai. */}
            <Toaster expand />
            <div className="flex items-center justify-center min-h-dvh">
              {/* Khung dien thoai 430x932. `tt-frame` bat container-type: size
                  de don vi cqh cua chu/icon bam theo chieu cao khung nay. */}
              <div className="tt-frame relative w-full max-w-[430px] h-dvh max-h-[932px] flex flex-col bg-background shadow-modal overflow-hidden">
                <main className="flex-1 flex flex-col items-center overflow-hidden">
                  <div className="flex flex-col w-full flex-1">{children}</div>
                </main>
              </div>
            </div>
          </BalanceProvider>
      </body>
    </html>
  );
}
