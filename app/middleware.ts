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

import { NextResponse, type NextRequest } from "next/server";
import { getKv } from "@/lib/cloudflare";

// Dung middleware.ts (Edge runtime, deprecated nhung con ho tro) thay vi
// proxy.ts moi cua Next 16 - proxy.ts bat buoc chay Node.js runtime, va
// @opennextjs/cloudflare (adapter deploy len Cloudflare Workers) chua ho tro
// Node.js middleware (xem opennextjs/opennextjs-cloudflare#962).
//
// Middleware nay chi lam MOT viec: dieu huong theo trang thai dang nhap.
// Cac route /api tu kiem tra session bang getSession() nen khong can di qua
// day - va PHAI khong di qua day: matcher cu con om ca /_next/:path* khien
// moi file tinh (js/css/anh) cung goi KV mot lan, ton latency + luot doc KV.
export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("taptip_session")?.value;
  const kv = await getKv();
  const userId = sessionToken ? await kv.get(`session:${sessionToken}`) : null;

  if (!userId && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // "/" la man Splash + Add to Home Screen (app/page.tsx) - chi danh cho
  // nguoi chua dang nhap. Da dang nhap thi bo qua, vao thang dashboard.
  if (userId && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
