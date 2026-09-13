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
              {/* Tren dien thoai that: full-bleed, KHONG khung/vien - day la
                  web app mo thang tren man hinh that cua user, khong phai
                  anh mockup. Vien den 2px + khung 390x844 co dinh CHI hien
                  tren man rong (sm: tro len, vd xem thu tren laptop) de
                  gia lap dang "trong khung dien thoai" cho de nhin - bug
                  that (09-13): dang de vien nay chay ca tren dien thoai
                  that lam app bi "thu nho lai trong 1 khung" that su. */}
              <div className="tt-frame relative w-full h-dvh sm:w-[390px] sm:h-[844px] flex flex-col bg-background border-0 sm:border-2 border-border overflow-hidden">
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
