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
export async function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    'http://localhost:3000',
    'https://64b3466d-48ab-43ac-94e1-df5a0c65600c-00-3dcvk8y4qe4v6.kirk.replit.dev',
  ];

  // Create the response with the original headers
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add CORS headers if origin is allowed
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  }

  const sessionToken = request.cookies.get("taptip_session")?.value;
  const kv = await getKv();
  const userId = sessionToken ? await kv.get(`session:${sessionToken}`) : null;

  if (!userId && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // "/" la man Splash + Add to Home Screen (app/page.tsx) - chi danh cho
  // nguoi chua dang nhap. Da dang nhap thi bo qua, vao thang dashboard.
  if (userId && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/_next/:path*", "/api/:path*"]
}