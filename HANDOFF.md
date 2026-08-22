# HANDOFF – TapTip

> Tip & Lì xì nhanh trên Arc. Gửi tip bất cứ lúc nào + lì xì dịp Tết, đăng nhập bằng email + passkey, ví ẩn phía sau bằng Circle Wallets, app trả gas thay user. Yêu cầu số một là **tốc độ**.

**Repo này tách ra ngày 2026-08-22** từ [`KattyFury/build-on-arc`](https://github.com/KattyFury/build-on-arc) (series hướng dẫn build app trên Arc) – TapTip từng là dự án mẫu build song song với series đó, xem lịch sử `git log` để thấy nguyên vẹn quá trình build (giữ qua `git subtree split`, 39 commit gốc). Lý do tách: dự án khiến việc viết guide bị xao nhãng, tạm gác để quay lại sau. Guide series (prompt, lý thuyết) vẫn ở repo `build-on-arc`, không di chuyển theo.

- Docs gốc (PRD, Product Discovery, wireframe...): [`docs/`](docs/) – sinh ra từ đúng các bước của series `build-on-arc`.
- Code: [`app/`](app/) – fork [`circlefin/arc-p2p-payments`](https://github.com/circlefin/arc-p2p-payments) (Next.js + Supabase + Circle Modular Wallets/Passkey).
- Gói bàn giao thiết kế: [`design_handoff_taptip/`](design_handoff_taptip/), [`TapTip Design Spec.dc.html`](TapTip%20Design%20Spec.dc.html).
- Deploy thật: https://taptip.kattyfury1403.workers.dev (Cloudflare Workers, qua `@opennextjs/cloudflare`)

---

## Trạng thái nghỉ 08-11 – đọc trước khi làm gì tiếp

**Repo sạch, đã qua hết Giai đoạn 1 (logic/flow) + Giai đoạn 2 (giao diện theo `TapTip Design Spec.dc.html`) + một loạt fix UI/bug theo phản hồi thật.** Link thật đang chạy đúng.

**Dev server:** `npm run dev` trong `app/` (Next 16 khoá không cho `dev` và `build` production chạy cùng lúc trên 1 project).

**3 việc còn treo, chưa ai làm, không khẩn:**
1. Key Resend `RESEND_API_KEY_ADMIN` (Full access) đang KHÔNG dùng cho SMTP nữa (đã đổi sang key Sending access riêng) – an toàn, không phải nợ nữa.
2. `public/logo.png` (logo tay vẽ cũ) không còn code nào tham chiếu – an toàn xoá, để user tự quyết.
3. `public/favicon.svg` vẫn là file SVG cũ của Circle sample app, chưa thay bằng logo TapTip (chỉ thay bản PNG/ICO).
4. Dọn rác file tạm: `C:\tmp\taptip-supabase-dbpass.txt`, `C:\tmp\taptip-entity-secret-recovery\` (bản cũ vô dụng), `C:\tmp\register-entity-secret.mjs`; backup recovery file entity secret MỚI (`C:\tmp\taptip-entity-secret-recovery2\`) ra chỗ an toàn hơn `C:\tmp`.

**Nếu quay lại làm tiếp:** đọc mục "BUG MAGIC LINK THAY VÌ OTP" để hiểu bài học PATCH Supabase (không merge từng phần, luôn gửi đủ cụm field liên quan) trước khi đụng vào `config/auth` lần nữa.

## Setup backend – đã xong hết, sẵn sàng code tiếp

1. ✅ Fork `circlefin/arc-p2p-payments` → `KattyFury/arc-p2p-payments` → code nằm ở `app/` (giữ `LICENSE` Apache-2.0 + `ORIGINAL-README.md` để attribution).
2. ✅ Đối chiếu code sample app với spec – 4 chỗ lệch cần sửa: (a) sample dùng tìm-người-nhận, TapTip cần **quét QR** – build mới hoàn toàn; (b) sample có bottom nav, wireframe TapTip **không có**, dùng icon menu (☰); (c) chưa có nút Random (nice-to-have, làm cuối); (d) kiểm tra luồng Nạp có link Circle Faucet theo đúng wireframe chưa.
3. ✅ Backend: giữ **Supabase Cloud**, không đổi Cloudflare KV (lý do: đổi KV mất phần lớn giá trị của việc fork – viết lại auth + data layer + realtime).
4. ✅ Supabase project **`taptip`** (ref `kekdoqyehyozqvuhwsoh`) đã tạo + **migrations đã push xong** (verify: bảng `profiles`/`wallets`/`transactions` có thật). Cách push: KHÔNG dùng được `supabase link` (bug CLI 2.112.0 parse ngày `+00:00`) – dùng thẳng Management API `POST /v1/projects/{ref}/database/query` với toàn bộ SQL nối lại, hiệu quả hơn.
5. ✅ **Circle: đã có account MỚI (08-08)** – account cũ có Entity Secret active từ trước không rõ nguồn gốc (không phải từ ezwallet, không tìm ra recovery file cũ), nên tạo account khác cho sạch thay vì cố reset. Entity Secret mới đã sinh + đăng ký thành công qua SDK (`generateEntitySecret` + `registerEntitySecretCiphertext`).
6. ✅ Vá lỗ hổng của sample app gốc: `app/api/wallet-set/route.ts` import `@/lib/utils/developer-controlled-wallets-client` nhưng file này KHÔNG tồn tại trong repo gốc, package `@circle-fin/developer-controlled-wallets` cũng thiếu trong `package.json`. Đã cài package + tự viết file client (`initiateDeveloperControlledWalletsClient`).
7. ✅ `app/.env.local` đầy đủ Supabase + `CIRCLE_API_KEY` + `CIRCLE_ENTITY_SECRET` (KHÔNG commit, đã confirm gitignore). Recovery file: `C:\tmp\taptip-entity-secret-recovery2\recovery_file_....dat` – PHẢI backup ra chỗ khác an toàn hơn `C:\tmp` (dễ bị dọn mất), chưa làm.
8. ✅ `npm run dev` chạy thành công, `/sign-in` trả 200, không lỗi runtime – xác nhận app sống được với backend thật.
9. ⚠️ `npm run build` (production) từng lỗi type ở `app/api/webhooks/circle/route.ts:232` – bug có sẵn của sample app gốc (Supabase query thiếu field `status` trong select nhưng code vẫn đọc). Đã sửa (xem mục Giai đoạn 2 bên dưới).
10. ✅ **Client Key** tạo xong (Web, Allowed Domain đã cập nhật sang domain thật), điền `NEXT_PUBLIC_CIRCLE_CLIENT_KEY` vào `.env.local`.

## Build Giai đoạn 1 (logic/flow, 5 tính năng)

**Tính năng 1 (Home) ĐÃ XONG VÀ VERIFY THẬT** – không chỉ "chắc là được", có bằng chứng từ log server: `POST /api/setup-wallets 201` (tạo ví qua passkey thành công) → `GET /dashboard 200` → `POST /api/wallet/balance 200` (Home tự fetch balance). Toàn bộ pipeline auth (email OTP) → passkey → ví → Home chạy thật end-to-end.

Phát hiện + sửa thêm trong lúc làm: sign-in gốc dùng phone+SMS (đổi sang email), Supabase free tier chặn custom email template (cấu hình SMTP qua Management API để giữ đúng OTP gõ tay thay vì magic link), thiếu Passkey Domain Config trên Circle Console (khác với Client Key's Allowed Domain, phải cấu hình riêng ở mục Modular Wallets → Configurator → Passkey), lỗi tự gây (`useRouter` sót lại sau khi xoá import – bài học: chạy `tsc --noEmit` NGAY sau mỗi lần sửa, không gộp lại). Rebuild lại layout sign-in/code-confirmation/passkey-setup theo đúng grid wireframe thay vì giữ style mặc định sample app.

**Tính năng 2 (quét QR gửi tiền):** `components/send-flow.tsx` mới – popup chọn số tiền (preset lưu localStorage, xoá có confirm, thêm số tuỳ ý) → quét QR (`html5-qrcode`, camera + upload ảnh) → loading → success tự tắt sau 2s. Tái sử dụng `sendUSDC()` có sẵn trong `web3-provider.tsx` (`sendUserOperation` + `paymaster: true`). Nối vào nút "Tip" ở Home.

**Đơn giản hoá có chủ đích:** số tiền hiển thị thẳng bằng USDC, chưa làm quy đổi VNĐ như PRD nhắc tới (`docs/02-hoan-thien-y-tuong.md`) – để dành Giai đoạn 2 vì cần tỷ giá thật, không hardcode.

**Tính năng 3, 4, 5:**
- **Nạp/Rút:** menu Home tách 2 nút riêng. "Nạp" tự copy địa chỉ ví + hướng dẫn 3 bước + nút mở Circle Faucet. "Rút" hiện thông báo "chưa khả dụng" + nút "Đã hiểu".
- **Lịch sử:** `components/transactions.tsx` – nhóm theo **NGÀY** (không phải THÁNG như code gốc), thêm màu đỏ/xanh theo chiều gửi/nhận.
- **Random:** `SendFlow` thêm prop `initialAmount` – có giá trị thì nhảy thẳng vào bước quét QR. Nút "Ngẫu nhiên" ở Home tự random 0.1–5 USDC (không vượt quá balance).

**Tính năng phát sinh giữa chừng (đã hỏi user trước khi thêm) – hiện tên người thay vì địa chỉ/hash trong Lịch sử.** `loadCounterpartyNames()`: lookup `circle_contract_address` → bảng `wallets` → bảng `profiles` → lấy `name`, hiện `"Tip: <tên>"` thay vì hash nếu tìm thấy, fallback về hash cũ nếu không. **PRD từ đó không còn khớp 100% với bản gốc.**

**User đổi hướng giữa chừng – hoàn thiện lẹ để chuyển qua Giai đoạn 2, bớt test kỹ trên PC** (app mobile, camera QR test trên PC không tối ưu, tốt hơn nên test thật trên điện thoại sau khi có UI thật). Đã tắt nút "Ngẫu nhiên", sửa race condition camera QR (`HTML Element with id=taptip-qr-region not found` – `startScanner()` đợi 1 frame nếu DOM chưa kịp commit).

**Mẹo test camera thật không cần deploy:** điện thoại chung WiFi với PC, mở Network URL mà dev server tự log ra – camera thật hoạt động, khỏi cần đụng Cloudflare.

## Giai đoạn 1 chốt → chuyển Giai đoạn 2 (giao diện)

**Layout Home đã khớp lưới 10 hàng CHÍNH XÁC** (đo bằng `getBoundingClientRect` qua Chrome headless, không đoán): balance `0→1`, gap `1→1.5`, QR `1.5→4.5`, gap `4.5→4.75`, chú thích `4.75→5.75`, gap `5.75→8`, nút `8→9` (tâm 8.50), menu `9→10`. Ba cái bẫy tìm ra trên đường – xem mục "Layout phải neo theo tỷ lệ" bên dưới.

**Khung quét QR** sửa xong: `flex-1` → `aspect-square` (hết dải đen letterbox), CSS ép video `object-fit:cover`, `qrbox` đổi từ 250px cố định sang 70% cạnh ngắn.

**Dọn 5 component mồ côi:** `wallet-tab.tsx` (màn gửi cũ, thay bằng `send-flow.tsx`) + 3 file chỉ phục vụ nó (`recipient-search.input`, `transaction-result-dialog`, `virtual-keyboard`) + `wallet-balance.tsx`.

**Gói bàn giao Giai đoạn 2:** [`docs/07-design-handoff.md`](docs/07-design-handoff.md) – liệt kê 8 màn cần làm giao diện kèm trạng thái từng màn, 3 luật kỹ thuật bắt buộc giữ (lưới tỷ lệ / `flex: "N 1 0"` / không padding trên hàng), cách tự verify bằng Chrome headless.

**Logo (08-09):** user tự vẽ, bàn tay vàng cầm đồng USDC xanh trên nền cyan bo góc. Đã sinh đủ bộ icon PWA + `favicon.ico` bằng `sharp` cài tạm rồi gỡ. Đổi tên PWA từ "Arc Pay" (sample app) sang "TapTip".

## Giai đoạn 2 hoàn tất – đã code theo `TapTip Design Spec.dc.html`

User tự viết spec thiết kế Modernist (màu, font Archivo, luật bo góc). Đã áp hết vào code: token màu/font, Home, sign-in/code-confirmation/passkey-setup, onboarding, send-flow 4 bước, transactions + chi tiết giao dịch, màn Splash + Add to Home Screen, sửa lỗi build production.

**Bug thật tìm được, cùng loại "token âm thầm sai" như 3 bẫy flexbox ở Giai đoạn 1 – đọc CSS đã build ra để xác nhận, không đoán:**
- `--radius-xl` bị định nghĩa `calc(var(--radius) + 4px)` (công thức chuẩn shadcn, giả định `--radius` gốc là 8px). Sau khi đổi `--radius: 0rem` cho đúng Modernist, công thức cho ra **4px thay vì 12px** – mọi chỗ dùng `rounded-xl` bị bo góc sai. Sửa tận gốc: `--radius-xl: 12px` cố định.
- Route `/` chưa từng render được `app/page.tsx` (Splash) – `proxy.ts` có rule cứng redirect `/` → `/sign-in` bất kể trạng thái đăng nhập. Phát hiện bằng `curl -w "%{http_code}"` thấy 307.
- `npm run build` production fail do thiếu field `status` trong `.select()` ở `app/api/webhooks/circle/route.ts:232` (bug sample app gốc) – thêm field vào là qua.
- `tailwind.config.ts` sót lại từ sample app gốc (kiểu Tailwind v3), dự án đã chuyển hẳn sang v4 CSS-first – xoá hẳn, `components.json` trỏ `tailwind.config` về rỗng theo convention shadcn v4.

**Verify:** `npx tsc --noEmit` sạch sau mỗi file sửa. `npm run build` production thành công, `next start` phục vụ `/` và `/sign-in` trả 200. Chrome headless xác nhận trực quan splash + Add to Home Screen. `/onboarding` và `send-flow.tsx` không verify được bằng Chrome headless (cần WebAuthn, không giả lập được ở headless) – đối chiếu code với cấu trúc đã xác nhận đúng thay vì tự dựng hạ tầng auth giả.

## Fix UI/bug theo phản hồi thật (08-10, 08-11)

**Bug nghiêm trọng: mọi email OTP fail 100%.** Chẩn đoán bằng cách gọi thẳng `POST /auth/v1/otp` qua API, tái hiện lỗi `500 unexpected_failure`, test trực tiếp key Resend với API Resend → `"API key is invalid"`. Sửa tạm bằng key khác đã xác nhận hoạt động.

**Bug thật thứ 2: PATCH config Auth của Supabase KHÔNG merge từng phần cho khối SMTP.** Gọi `PATCH .../config/auth` chỉ với `{"smtp_pass": "..."}` đã xoá sạch luôn `smtp_host`/`smtp_port`/`smtp_user`/`smtp_admin_email` về `null`. Phải gửi lại TOÀN BỘ field liên quan SMTP trong 1 lần PATCH. **Bug này dính LẦN 2** khi sửa `smtp_pass` sau đó – lần này còn xoá luôn `mailer_templates_magic_link_content` (template email tuỳ chỉnh chứa `{{ .Token }}`), khiến OTP tự động rơi về magic link mặc định của Supabase, làm hỏng toàn bộ luồng đăng nhập một thời gian. Đã khôi phục + verify bằng gọi thẳng API, không chỉ tin build/log. **Bài học: PATCH endpoint này không an toàn để sửa "một field" – luôn tự biết field nào cùng "cụm" rồi gửi đủ cả cụm.**

**Đổi hạ tầng gửi email OTP: Gmail cá nhân → Resend + domain riêng `taptip.0xhieu.xyz`** (subdomain riêng, không dùng domain gốc – cô lập uy tín gửi mail). 3 DNS record qua Cloudflare API, verify gần như ngay lập tức. 2 API key Resend quyền khác nhau – đừng lẫn: `RESEND_API_KEY_SENDING` (mật khẩu SMTP) vs `RESEND_API_KEY_ADMIN` (Full access, dùng một lần tạo/verify domain).

**Rate limit email của Supabase** (`rate_limit_email_sent`) – tách biệt với SMTP, mặc định = 2/giờ dù dùng SMTP riêng hay không. Đã tăng lên 100 qua Management API (nhiều lượt vì debug).

**Passkey lỗi "Invalid credentials" trên link thật:** nguyên nhân Client Key's Allowed Domain vẫn khai `localhost` – khác với Passkey Domain (Modular Wallets → Configurator → Passkey). Hai cài đặt tách biệt hoàn toàn dù cùng nằm trong Circle Console, dễ nhầm là một.

**8 fix UI đã code + verify:** bỏ "your" ở tiêu đề Add to Home Screen, tách riêng bước iOS (Safari)/Android (Chrome) theo user agent, Balance đổi format `Balance: $XXXX` 4 chữ số độ rộng cố định, câu chú thích QR tách 2 dòng, icon Random to bằng icon Back, nút Tip đổi icon, mảng tròn trang trí góc trái-dưới chuyển vào trong hàng 10 + `overflow-hidden`, vùng bấm icon Menu tăng bằng padding + margin âm, popup Menu redesign toàn bộ.

**Bug "Balance luôn hiện 0" – ĐÃ SỬA + VERIFY THẬT.** Root cause: `useWalletBalances()` chỉ fetch khi `isConnected === true` từ `Web3Context` – mà `isConnected` chỉ bật sau khi TOÀN BỘ pipeline WebAuthn/passkey phía client chạy xong không lỗi, trục trặc nào bị `console.error` nuốt mất, số dư kẹt vĩnh viễn ở 0. Sửa: `useWalletBalances(knownAddress?)` ưu tiên fetch thẳng bằng `primaryWallet.wallet_address` (đã biết sẵn từ server) thay vì chờ `account.address` từ Web3Context.

**Đổi giao diện sang English hoàn toàn** (11 file) – verify bằng script gác cổng (grep ký tự có dấu tiếng Việt), không soát mắt.

**Bug thật: mọi popup rộng đúng bằng bề ngang màn hình** (`w-full` trên viewport 430px, `max-w-lg` không kích hoạt) – chạm sát lề. Sửa `w-[calc(100%-40px)]`.

**Bug thật: số dư cập nhật chậm sau khi gửi.** App có 2 hệ theo dõi số dư tách rời – `web3-provider.tsx` đọc on-chain trực tiếp, nhưng Home hiển thị từ `balanceContext` (đọc cache DB + Realtime), không được refresh sau khi user tự gửi tiền. Sửa: `send-flow.tsx` gọi `refreshBalances()` ngay sau khi `sendUSDC` thành công.

## Deploy Cloudflare

**Bug đã gặp và sửa xong:** màn trắng, `Uncaught ReferenceError: __name is not defined` – `next-themes` convert script thành string, esbuild của Wrangler bật `keep-names` mặc định làm hàm `__name` sai scope lúc eval runtime. Sửa: thêm `"keep_names": false` vào `wrangler.jsonc`.

**Bài học verify:** `curl -w "%{http_code}"` trả 200 KHÔNG có nghĩa trang chạy đúng – layout chờ `getUser()` xong mới render (client component), curl không chạy JS nên không thấy lỗi. Phải dùng Chrome headless đọc DOM/console thật.

**Đừng đụng WSL/Ubuntu** – thử hướng đó giữa chừng để né lỗi Windows, sai hướng, bug `__name` không liên quan gì tới WSL. Sửa thẳng trên Windows native (Git Bash) là đủ.

**Setup Cloudflare đã xong:**
- Đổi `proxy.ts` → `middleware.ts` (Next 16's `proxy.ts` bắt buộc Node.js runtime, `@opennextjs/cloudflare` chưa hỗ trợ).
- Next.js nâng lên 16.3.0.
- Bỏ hết `NEXT_PUBLIC_VERCEL_URL` khỏi code thật đang dùng – client fetch chuyển sang path tương đối, server-side đổi sang `NEXT_PUBLIC_SITE_URL`/`SITE_URL`.
- 6 secret đã đẩy lên Cloudflare Worker `taptip`: `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `NEXT_PUBLIC_CIRCLE_CLIENT_KEY/URL`, `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`.
- Domain đã được thêm vào Circle Console → Modular Wallets → Configurator → Passkey.

## Layout phải neo theo tỷ lệ màn hình, KHÔNG dùng pixel cố định

Bài học đau thật (chỉnh layout Home theo grid 10 hàng): dùng `h-40`, `h-20`, `mt-10` (px cố định) tưởng đúng vị trí nhưng chỉ đúng trên đúng 1 kích thước màn hình lúc test – khách xài màn hình khác kích thước là vỡ layout ngay.

**Quy tắc:** mọi khoảng cách/kích thước xuất phát từ hệ lưới N-hàng phải quy đổi thành **tỷ lệ co giãn** (`flex`, `%`, `vh`/`vw`), không bao giờ hardcode px. Ví dụ thật đã sửa ở `app/components/home-screen.tsx`: toàn bộ trang dùng đúng 1 hệ flex cộng lại bằng tổng số hàng của hệ lưới, **kể cả các hàng "trống"/spacer cũng phải có flex riêng** – nếu không khối content sẽ tự nuốt hết phần dư.

### 3 cái bẫy đã thật sự làm hỏng layout

1. **`flexGrow` một mình KHÔNG chia theo tỷ lệ tuyệt đối.** Nó chỉ chia phần *dư* sau khi trừ kích thước nội dung, nên hàng nào nội dung to (QR) tự chiếm nhiều hơn phần của nó. **Bắt buộc dùng `style={{ flex: "N 1 0" }}`** (flexBasis = 0) thì mỗi hàng mới đúng `N/tổng` chiều cao.
2. **Padding trên hàng bị CỘNG THÊM ngoài phần chia tỷ lệ.** Padding là kích thước tối thiểu không co được. **Tuyệt đối không đặt padding trên phần tử hàng** – muốn khoảng thở thì cho phần tử con cao theo `%`.
3. **Phần tử kích thước cố định (ảnh, QR) làm tràn hàng.** Cách sửa: `height: 100%` + `aspectRatio: "1"` để lấp đúng chiều cao hàng, và `minHeight: 0` cho hàng chứa nó.

### Cách tự verify layout – đừng bao giờ đoán bằng mắt

Chrome headless (`chrome.exe --headless=new --disable-gpu --hide-scrollbars --window-size=W,H --screenshot=... --virtual-time-budget=8000 URL`) để chụp ảnh tự xem, hoặc `--dump-dom` để đo `getBoundingClientRect()` qua route tạm render kèm client component in kết quả ra `<pre id="measurements">`.

> 🔴 **QUAN TRỌNG – Tailwind v4 không build class `flex-[N]`.** Repo dùng `tailwindcss@4.2.1`. Class kiểu `flex-[1.5]`, `flex-[3]` (arbitrary value trên utility `flex`) **không sinh ra rule CSS nào cả** – các arbitrary value khác như `w-[50vw]` vẫn build bình thường, chỉ riêng `flex-[N]` bị bỏ qua. Hậu quả: đặt tỷ lệ đúng trên giấy nhưng layout không nhích, dễ tưởng lầm là tính sai công thức. **Giải pháp:** dùng `style={{ flexGrow: N }}` inline thay vì class Tailwind cho mọi giá trị flex-grow phân số.

## Tiêu chí "xong" ở giai đoạn logic – đừng lo giao diện

Một tính năng coi là XONG khi **nút bấm đúng vị trí mong muốn + flow chạy đúng** – hết. Không tự ý chỉnh màu, spacing, font, bo góc "cho đẹp hơn chút" giữa lúc đang làm logic – dồn hết việc đó cho giai đoạn giao diện làm một lượt nhanh hơn nhiều so với sửa lắt nhắt từng cái.

## Trước khi đụng Circle/Arc – đừng tự mò

Trước khi viết bất kỳ code nào đụng tới Circle Wallets hoặc Arc, **load đúng skill/tài nguyên tương ứng trước, đừng tự mò qua docs search rồi thử-sai**. Bài học đau: mất cả buổi vật lộn Entity Secret + Passkey Domain + WebAuthn error vì không load skill `circle:use-modular-wallets` trước khi code – skill đó có sẵn bảng lỗi + rule "ALWAYS complete Console Setup (client key, passkey domain, client URL) before using SDK" ngay từ đầu.

- **Circle Modular Wallets (Passkey, gasless)** → load skill `circle:use-modular-wallets` TRƯỚC.
- **Circle Developer-Controlled Wallets (Entity Secret)** → load skill `circle:use-developer-controlled-wallets` TRƯỚC.
- **Bất kỳ thứ gì khác của Circle** → xem danh sách skill tại https://docs.arc.io/ai/skills.
- **Câu hỏi chung về Arc** → Arc MCP (`docs.arc.io/mcp`), dùng `search_arc_docs`/`query_docs_filesystem_arc_docs` trước khi đoán.

## Git

Remote `origin` = GitHub `KattyFury/taptip`, branch `main`. Xong việc là commit + push ngay.
