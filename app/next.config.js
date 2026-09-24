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

// Chan build som neu thieu key that su dung (route /api/wallet/balance).
// (CIRCLE_ENTITY_SECRET duoc lib/circle/wallets.ts tu kiem tra khi tao vi /
// gui tien - Developer-Controlled Wallets, server ky.)
if (!process.env.CIRCLE_API_KEY?.trim()) {
  throw new Error("CIRCLE_API_KEY environment variable is missing or empty");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tat badge "N" cua Next dev (lot vao anh chup so sanh voi Figma)
  devIndicators: false,
};

module.exports = nextConfig;

const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev();
