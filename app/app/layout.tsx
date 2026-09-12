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
  interactiveWidget: "resizes-content",
  themeColor: "#155EEF",
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
      <body className="bg-page-backdrop text-foreground font-sans min-h-dvh overflow-hidden">
          <BalanceProvider>
            {/* Toaster PHAI nam ngoai container can giua: sonner render mot
                <section> tham gia layout, de trong flex la no an mat mot phan
                be ngang va day khung dien thoai lech sang phai. */}
            <Toaster expand />
            <div className="flex items-center justify-center min-h-dvh">
              {/* Khung dien thoai CO DINH 390x844 (dung khung Figma goc) -
                  quy luat thiet ke moi 09-12 chia luoi bang PX CO DINH (10
                  hang 70px + 16px gap doc = 844; 12 cot + 8px gap ngang),
                  khong con luoi ty le cqh nhu ban cu (co dan theo moi kich
                  thuoc man hinh). App danh cho mobile, khong can fluid. */}
              <div className="tt-frame relative w-[390px] h-[844px] flex flex-col bg-background border-2 border-border overflow-hidden">
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
