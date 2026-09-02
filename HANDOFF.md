# HANDOFF – TapTip

> Tip & Lì xì nhanh trên Arc. Gửi tip bất cứ lúc nào + lì xì dịp Tết, đăng nhập bằng email + passkey, ví ẩn phía sau bằng Circle Wallets, app trả gas thay user. Yêu cầu số một là **tốc độ**.

**Repo này tách ra ngày 2026-08-22** từ [`KattyFury/build-on-arc`](https://github.com/KattyFury/build-on-arc) (series hướng dẫn build app trên Arc) – TapTip từng là dự án mẫu build song song với series đó, xem lịch sử `git log` để thấy nguyên vẹn quá trình build (giữ qua `git subtree split`, 39 commit gốc). Lý do tách: dự án khiến việc viết guide bị xao nhãng, tạm gác để quay lại sau. Guide series (prompt, lý thuyết) vẫn ở repo `build-on-arc`, không di chuyển theo.

- Docs gốc (PRD, Product Discovery, wireframe...): [`docs/`](docs/) – sinh ra từ đúng các bước của series `build-on-arc`.
- Code: [`app/`](app/) – fork [`circlefin/arc-p2p-payments`](https://github.com/circlefin/arc-p2p-payments) (Next.js + Supabase + Circle Modular Wallets/Passkey).
- Gói bàn giao thiết kế: [`design_handoff_taptip/`](design_handoff_taptip/), [`TapTip Design Spec.dc.html`](TapTip%20Design%20Spec.dc.html).
- Deploy thật: https://taptip.kattyfury1403.workers.dev (Cloudflare Workers, qua `@opennextjs/cloudflare`)

---

## Trạng thái 09-02 – đọc trước khi làm gì tiếp (MỚI NHẤT, đọc mục này trước)

**Áp thiết kế Figma mới vào toàn bộ code (thay hẳn wireframe v2 08-31 cũ).** User tự vẽ lại UI trong Figma (`Taptip`, file key `rLGoWK4AHhqov9CKHXJqqE`) + đưa quy định lưới/font-size/màu bằng lời trong chat, đưa sẵn logo + bộ icon mới ở `C:\Users\Dell\Desktop\taptip\`. Quy trình: kéo `get_design_context` thật cho 7 frame đại diện (không đoán từ ảnh) → viết plan (`EnterPlanMode`) → code → verify bằng Chrome headless thật qua CDP (tự tạo session KV giả trong D1/KV `--local` để chụp ảnh Home/popup có đăng nhập, không cần user test tay) → build production sạch → deploy thật.

**Đổi cốt lõi so với 08-31:**
- **Token** (`globals.css`): màu rút về đúng 4 tông + 2 trạng thái - vàng `#FFCC00`, đen, xám `#8E8E93` (đổi từ xanh dương `--accent` cũ), xám nhạt `#EDEDED`, đỏ `#FF383C`, xanh lá `#34C759`. Viền chuyển từ xám mờ 14% sang **đen đặc 1px**. Thêm `--radius-card: 10px` riêng cho card popup (khác `--radius-xl` 12px cũ). Thang chữ quy đổi thẳng từ khung Figma 390×844 (title 27/lead 22/body 17/small 15/figure 32, vẫn dùng đơn vị `cqh` như cũ).
- **Font: Nunito + Comfortaa → Inter duy nhất** (kể cả số - Figma dùng Inter cho mọi chữ, không tách font riêng).
- **`screen.tsx`** (dùng chung cho Add-to-Home/Sign-in/OTP/Passkey Setup): bỏ hẳn khối icon lớn đầu màn, nút Back đổi từ viền sang **pill vàng cùng kiểu nút chính** (icon tam giác đặc mới), `Field` đổi từ nền xám chìm sang viền đen trong suốt.
- **Home**: "Balance" xếp DỌC trên số dư lớn (trước nằm ngang cùng "USDC"). Nút "Tip Setting" đổi thành icon "•••" (Option), mở **popup neo ngay phía trên nó** (`AnchoredCard`) thay vì popup giữa màn - đúng ý user "popup nằm ngay chỗ nút". Copy địa chỉ ví đổi từ toast sang **icon Copy→Check xanh lá tại chỗ** (`copy-button.tsx` mới, dùng chung Home + Deposit).
- **`content-popup.tsx`**: `ContentPopup` cũ (center 50%, 3/4 màn) tách thành `CenteredCard` (Scan/History/Deposit/Withdraw - neo gần đỉnh, rộng gần full trừ margin 20px) và `AnchoredCard` (Tip Setting - neo tại nút trigger).
- **Send flow → "Scan to tip"**: đổi từ full-screen sang card giữa màn (Home dim phía sau), **giữ nguyên 100% logic gửi tiền thật** (sendUSDC/ghi transactions/refreshBalances) - chỉ đổi khung + thêm nút "Upload a QR image instead" bấm được (input file vốn có sẵn nhưng trước đó KHÔNG có nút bấm nào trigger nó - bug ẩn từ trước, giờ mới lộ ra và sửa luôn).
- **Tip Setting**: đổi từ 4 ô luôn hiện sang danh sách hàng "Default/Option $X •••", "+ Add more option" chỉ hiện khi còn slot trống (vẫn giới hạn 4 slot D1, không đổi schema).
- **Toàn bộ UI chuyển hẳn sang tiếng Anh** (khớp Figma 100% tiếng Anh) - giải quyết luôn vấn đề "lẫn ngôn ngữ" đã ghi nhận trước đó (Home từng lẫn cả Anh lẫn Việt trong cùng 1 màn).
- **Nạp/Rút** giờ đã qua khuôn `CenteredCard` đồng bộ với Scan/History, không còn là "nội dung tạm" như trước.

**Kỹ thuật đáng nhớ:** dùng `wrangler kv key put --local` tạo session giả cho 1 user test có sẵn trong D1 local, rồi Chrome headless `--remote-debugging-port` + CDP `Network.setCookie` (httpOnly, JS thường không set được) để chụp ảnh màn hình ĐÃ đăng nhập mà không cần user tự test tay - cách này bắt được 1 lỗi thật ngay lập tức (chữ "Balance"/"$0" 2 dòng tràn đè lên khung QR do thiếu flex cho hàng 2), sửa xong verify lại bằng ảnh thật chứ không chỉ đọc code.

### CÒN LẠI sau đợt redesign 09-02
1. **Cần USER tự làm** – test passkey thật + quét QR camera thật + gửi tip thật trên điện thoại tại bản production (giờ đã lên giao diện mới) - vẫn chưa tự động hoá được vì cần tương tác WebAuthn/camera thật.
2. `components/web3-provider.tsx` (+ chưa rà `app/api/webhooks/circle/route.ts`) – vẫn còn 2 hàm chết `registerPasskey`/`loginWithPasskey` từ trước, CHƯA đụng trong đợt redesign này (chỉ sửa phần gọi `sendUSDC` gián tiếp qua `useWeb3()`, không sửa file này) – vẫn cần đọc kỹ toàn bộ trước khi tách.
3. Khung thông báo hàng 7-8 ở Home đã dựng UI (pill dismiss-được, đúng khuôn Figma) nhưng CHƯA có nguồn dữ liệu thật nào nuôi nó – đang render mảng rỗng, chờ tính năng thật ở phiên sau.

## Trạng thái 09-01 – lịch sử, không còn là trạng thái hiện tại

**PRD v2 + Product Discovery v2 + Stack v2 + Wireframe v2 đã chốt xong hết** (chạy qua Claude Chat theo quy trình `build-on-arc`, lưu ở `docs/02-v2-hoan-thien-y-tuong.md` / `docs/03-planning-v2.md` / `docs/04-wireframe-v2.md`). Đổi lớn nhất so với v1: thêm Tip Setting (4 ô số tiền tùy chỉnh), chọn số tiền ngay trên màn quét QR thay vì popup riêng, định danh ví hiển thị rút gọn `0x_NNNNN` (5 số cuối), bỏ Supabase sang Cloudflare D1 + KV.

### Hạ tầng – đã dựng xong, ĐANG SỐNG, domain production đã khai
- D1 `taptip-db` + KV `taptip_kv` – đã tạo, migrate (bảng `users`/`tip_settings`/`transactions`), khai báo binding trong `app/wrangler.jsonc`. Nhớ migrate cả `--local` lẫn `--remote` (2 D1 tách biệt – `next dev` dùng bản `--local`).
- Circle account MỚI (account thứ 3 sau 2 lần "brick" thật do lỗi ghi file recovery của Claude Code – xem cảnh báo dưới) – Entity Secret đã đăng ký thành công, recovery file lưu ở `C:\Users\Dell\CircleRecovery\taptip-v2-recovery.dat`, KHÔNG được mất lần nữa.
- Client Key (Modular Wallets): Allowed Domain **và** Passkey Domain (Modular Wallets → Configurator → Passkey) đã khai `taptip.kattyfury1403.workers.dev` (09-01) – 2 chỗ này phải khớp nhau (bài học v1: thiếu 1 chỗ là passkey lỗi "Invalid credentials" trên domain thật).
- `app/.env.local` đầy đủ Circle (API key + Entity Secret + Client Key/URL) + Resend, đã bỏ hết Supabase.

### ⚠️ Push GitHub KHÔNG tự deploy site production
`taptip.kattyfury1403.workers.dev` chạy qua Cloudflare Workers, deploy bằng `npm run cf:deploy` (trong `app/`) – **thủ công hoàn toàn, không có CI/CD nào theo dõi push lên `KattyFury/taptip`**. Đã dính thật (09-01→09-02): sửa code, commit, push xong xuôi nhưng user mở site thấy y như cũ vì quên chạy `cf:deploy`. Sau mỗi lần sửa code trong `app/` mà muốn user thấy trên site thật, PHẢI tự chạy `npm run cf:deploy` (không chỉ push GitHub) rồi verify bằng `curl` thật lên domain production.

**Bẫy phát sinh thêm:** `npm run build`/`cf:deploy` chạy `next build` production, type-check NGHIÊM hơn hẳn `next dev` (dev bỏ qua nhiều lỗi type ở route/file chưa được request tới) – lỗi TS ở code chết cũ (Supabase, chưa dọn) từng nằm im vô hại qua bao lần `tsc --noEmit`/`next dev` nhưng chặn đứng `cf:deploy`. Trước khi tin "tsc sạch = deploy được", thử build production thật 1 lần.

### ⚠️ 3 bài học đau (đừng lặp lại)
1. SDK `registerEntitySecretCiphertext` của Circle, khi `recoveryFileDownloadPath` trỏ sai (VD đưa tên file thay vì thư mục), vẫn đăng ký ciphertext THÀNH CÔNG với server trước khi bước ghi file thất bại – tức entity secret đã "chốt" phía Circle mà recovery file không có, account coi như hỏng vĩnh viễn (giống hệt lỗi account 08-08). Cách an toàn: đừng dựa vào tham số `recoveryFileDownloadPath` của SDK, tự lấy `response.data.recoveryFile` rồi `fs.writeFileSync` bằng tay ngay lập tức.
2. `taskkill /IM chrome.exe` tắt **TOÀN BỘ** Chrome trên máy, không chỉ tiến trình debug vừa mở – nếu cần dọn 1 Chrome headless cụ thể (VD dùng để chụp ảnh app qua CDP), phải tắt đúng PID của chính nó, không dùng taskkill theo tên process.
3. (09-01) Dính lại ĐÚNG lỗi y hệt mục 2 nhưng với `node.exe`: `taskkill //F //IM node.exe` sau khi test `npm run dev` đã tắt **TOÀN BỘ** tiến trình Node trên máy, không chỉ riêng dev server vừa mở. Cách đúng: dùng PowerShell `Get-NetTCPConnection -LocalPort <port> -State Listen | Select -ExpandProperty OwningProcess` để tìm đúng PID đang lắng nghe cổng dev server, rồi `Stop-Process -Id <PID>` — không bao giờ taskkill theo tên process dùng chung (chrome.exe, node.exe, v.v.).

### Bước 6 (Build) – luồng auth + tạo ví: verify thật qua `next dev`, không chỉ đoán
Toàn bộ chuỗi đăng nhập lần đầu hoạt động end-to-end: `/sign-in` → gửi OTP thật qua Resend → verify → tạo user D1 → session KV → `/dashboard/setup-wallet` (tạo ví qua passkey, hoặc nút "Skip for now" test nhanh) → `/dashboard` render OK. Đã dọn Supabase khỏi: middleware, auth actions, `(auth-pages)` layout, dashboard layout/page, setup-wallet, home-screen.tsx, send-flow.tsx, use-wallet-balances.ts, api/wallet/balance, api/auth-status, api/setup-wallets. Đã xoá `(auth-pages)/onboarding/` (v2 không thu thập tên lúc onboarding – tên hiển thị là Roadmap).

### UI Home + Scan + popup – đã dựng lại theo Wireframe v2, ĐÃ QUA 2 VÒNG THIẾT KẾ + VERIFY BẰNG ẢNH CHỤP THẬT
Quy trình: (1) wireframe low-fi (Claude Design canvas) → user duyệt bố cục/hàng → (2) hi-fi polish (màu đen + `#FFCC00`, font Comfortaa/Nunito, đúng token `app/globals.css`) → user duyệt hình → (3) code vào app → **tự chụp ảnh trình duyệt thật qua Chrome DevTools Protocol (có cookie đăng nhập session KV thật, không phải chỉ đọc code)** để verify, phát hiện + sửa 2 lỗi ẩn:
1. 2 nút Tip Setting/Tip render thành hình tròn thay vì viên thuốc (do `h-[66.6%]` của hàng 2 đơn vị quá cao so với bề ngang) → đổi sang `h-[6.8cqh]` cố định.
2. Dropdown Menu bị đẩy lệch ra NGOÀI khung nhìn thấy (thiếu `position: relative` ở hàng chứa nút Menu, khiến `absolute top-full` neo nhầm vào toàn khung 10 hàng) → thêm `relative`.

Kết quả hiện tại (ảnh chụp thật đã xác nhận đúng):
- **Home**: hàng 1 "Balance" + nút Menu tròn viền đen; hàng 2 số dư lớn + nhãn USDC; hàng 3-5 thẻ QR bo góc/đổ bóng/chấm vàng góc; hàng 6 chip "Số TK 0x_NNNNN" + icon copy; hàng 7-8 trống thật (không viền); hàng 9-10 hai nút viên thuốc riêng (Tip Setting viền đen, Tip vàng có icon).
- **Dropdown Menu** (từ icon Menu): Nạp (icon mũi tên xuống) / Rút (mũi tên lên) / Lịch sử giao dịch (icon đồng hồ) / Đăng xuất (icon logout, chữ đỏ) – icon Nạp/Rút dùng lại đúng `Icon.ArrowDown`/`Icon.ArrowUp` đã có sẵn (nhận=xuống=xanh, gửi=lên=đỏ) để nhất quán ngữ nghĩa với Lịch sử; `Icon.Clock` và `Icon.Logout` mới thêm vào `icons.tsx`.
- **Popup nội dung** (`content-popup.tsx`, dùng chung cho Tip Setting/Lịch sử/Nạp/Rút): rộng 3/4 màn hình, cao tự co theo nội dung, **tâm luôn nằm giữa hàng 5-6 (= chính giữa màn hình theo chiều dọc, top: 50%)** – đã đổi từ "tâm hàng 4" (bản đầu) sang mốc mới này theo yêu cầu.
- **Tip Setting**: đọc/ghi D1 `tip_settings` thật qua `api/tip-settings` (đã verify GET/PATCH bằng cả curl lẫn thao tác thật trên trình duyệt).
- **Send flow** (màn quét): bỏ hẳn bước "chọn số tiền" riêng của v1 (Dialog + preset localStorage) – giờ full-screen, 4 nút chọn số tiền lấy thẳng từ Tip Setting.

Xem mockup đã duyệt: link low-fi + hi-fi nằm trong lịch sử hội thoại (không lưu lại trong file – nếu cần xem lại thiết kế gốc, hỏi user hoặc `/artifacts` trong Claude Code).

### CÒN LẠI, ưu tiên tiếp theo
1. **Cần USER tự làm** – test passkey thật + quét QR thật (camera) + xem lịch sử giao dịch thật, trên điện thoại, tại bản production `https://taptip.kattyfury1403.workers.dev` (domain đã khai xong nên test thẳng bản thật, không cần qua mạng LAN dev server nữa). Việc này cần tương tác WebAuthn thật, không tự động hoá được.
2. `components/web3-provider.tsx` (+ chưa rà `app/api/webhooks/circle/route.ts`) – còn 2 hàm chết `registerPasskey`/`loginWithPasskey` (không nơi nào gọi, gọi tới route `/api/update-passkey` còn không tồn tại) trộn chung với `sendUSDC`/balance đang chạy thật trong CÙNG 1 file – phải đọc kỹ toàn bộ trước khi tách, đừng đụng vội vì đây là code ký giao dịch thật.
3. Nạp/Rút trong dropdown Menu hiện vẫn dùng nội dung tạm (copy từ v1) trong `home-screen.tsx` – chưa qua thiết kế hi-fi riêng, chỉ mới bọc lại bằng `ContentPopup` cho đồng bộ khuôn.

**Đã xong trong phiên 09-01** (chi tiết xem lịch sử `git log`, tóm tắt commit `4075b55`/`4d9264c`/`8de281d`): khai domain production trên Circle Console; nối `history-popup.tsx` đọc D1 `transactions` thật qua `app/api/transactions` (ghi trực tiếp lúc `sendUSDC` thành công, không qua webhook); dọn sạch toàn bộ cụm code chết v1 còn Supabase (lịch sử giao dịch cũ, route debug/test nội bộ, passkey-credential + callback Supabase, cụm quên-mật-khẩu – v2 dùng OTP nên không còn ý nghĩa). Tất cả đã verify `tsc --noEmit` sạch + dev server không lỗi 500, commit + push xong.

---

## Trạng thái nghỉ 08-27 – lịch sử, không còn là trạng thái hiện tại

**Đang giữa chừng viết lại v2 – KHÔNG phải bug, là quyết định chủ động.** Đừng hoảng khi thấy `.env.local` trống và code vẫn còn gọi Supabase – đúng như vậy, chưa xong.

**Vì sao viết lại (2 lý do cộng dồn, không phải 1):**
1. Circle account cũ **mất cả entity secret lẫn file recovery**, không tìm thấy ở đâu trên máy này. Tra lại Circle docs xác nhận: mất cả hai thì **hết đường phục hồi** – không đăng ký được entity secret mới cho account cũ (giới hạn theo account, không phải theo API key). Bắt buộc phải tạo account Circle mới bất kể có viết lại gì khác hay không.
2. Nhân tiện phải động vào Circle, quyết định luôn bỏ Supabase – lý do thật: **free tier tự pause sau ~7 ngày không hoạt động**, lần nghỉ 08-11 → 08-27 (16 ngày) đã bị pause, unpause được nhưng gây khó chịu lặp lại mỗi lần tạm gác dự án. Chuyển sang **Cloudflare D1 + KV** (cùng hạ tầng với nơi đang deploy, không có khái niệm pause). Vẫn giữ đăng nhập email OTP (viết lại thủ công, gửi qua Resend đã setup sẵn), bỏ Supabase Realtime (2 chỗ đang dùng – `components/transactions.tsx`, `hooks/use-wallet-balances.ts` – đổi thành fetch lại khi mở màn thay vì tự đẩy).

**Đã đi xa hơn: không chỉ đổi hạ tầng, làm luôn PRD v2.** Lý do: đằng nào cũng viết lại code, tận dụng luôn để rà lại toàn bộ luồng sản phẩm dựa trên bài học thật từ v1 (xem danh sách 6 điểm mâu thuẫn/phát sinh trong `docs/prd-v2-prompt-draft.md`, bản Desktop `TapTip_PRD_v2_PROMPT.md`) – gồm cả câu hỏi day dứt: tính năng "giới hạn tip/ngày" mới thêm (xem dưới) có mâu thuẫn với ranh giới v1 "KHÔNG giới hạn số tiền mỗi lần gửi" không.

**Đang chờ:** user chạy prompt PRD v2 ở Claude Chat (đã đưa sẵn, đúng quy ước "Chat để nghĩ, Code để giữ và để làm" của series `build-on-arc`), mang bản chốt về lưu `docs/02-v2-hoan-thien-y-tuong.md`. Sau đó mới tới Bước 3 (Planning 2 vòng – vòng 2 lần này phải chốt tường minh D1+KV thay Supabase) rồi Bước 4 (Wireframe nếu luồng đổi), rồi mới code lại thật.

**Việc đã làm hôm nay KHÔNG bị bỏ phí dù đổi hạ tầng** – tính năng Settings (sửa tên + đặt giới hạn tip/ngày, xem mục "Tính năng mới (08-27)" bên dưới) vẫn là quyết định sản phẩm đúng, chỉ cần port từ Supabase sang D1 khi viết lại, không phải nghĩ lại từ đầu. Riêng migration `daily_tip_limit` đã chạy thật trên Supabase project `taptip` (`kekdoqyehyozqvuhwsoh`) qua SQL Editor – **project đó sắp bị bỏ luôn**, đừng tưởng nhầm đây là nguồn sự thật cho schema D1 sau này, chỉ là lịch sử.

**`.env.local` hiện tại:** chỉ có khung (`app/.env.local`), toàn bộ giá trị còn trống – account Circle mới + Supabase URL/anon key chưa điền vì đang tạm dừng để làm PRD v2 trước, tránh code 2 lần.

---

## Trạng thái nghỉ 08-11 – lịch sử, không còn là trạng thái hiện tại

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

## Tính năng mới (08-27): Sửa tên + giới hạn tip/ngày trong Cài đặt

Thêm màn "Settings" vào popup Menu (Menu → Settings), sửa được 2 thứ:
- **Tên** (`profiles.name`) – đã có sẵn từ lúc onboarding, giờ sửa lại được.
- **Giới hạn tip mỗi ngày** (`profiles.daily_tip_limit`, cột mới, migration
  `20260827080000_add_daily_tip_limit_to_profiles.sql`) – để trống = không
  giới hạn (mặc định, giữ đúng ranh giới PRD gốc "không giới hạn số tiền mỗi
  lần gửi" cho tới khi user tự bật).

**Cách tính "đã tip bao nhiêu hôm nay":** đọc tổng `amount` trong bảng
`transactions` (`transaction_type = USDC_TRANSFER_OUT`, `created_at` từ đầu
ngày local) mỗi lần mở popup Tip, cộng thêm phần **gửi thật trong chính
phiên popup đang mở** (`sentThisSession`, cộng dồn ngay sau mỗi lần gửi
thành công). Lý do cần cộng thêm phần session: `transactions` được ghi vào
DB qua webhook Circle (xem `app/api/webhooks/circle/route.ts`), có độ trễ
vài giây so với lúc gửi thật – nếu chỉ tin số đọc từ DB, gửi liên tiếp nhanh
trong cùng 1 lần mở popup có thể lách qua giới hạn.

**Giới hạn đã biết – chưa xử lý:** kiểm tra chỉ nằm ở client (không có RLS,
không có check phía server khi gọi Circle gửi tiền – toàn bộ luồng gửi vẫn
100% client-side qua WebAuthn passkey như cũ). Người dùng mở 2 thiết bị cùng
lúc, hoặc tự sửa code JS, đều lách được giới hạn. Chấp nhận được ở mức hiện
tại vì đúng tinh thần bảo mật đã chấp nhận từ Product Discovery (ưu tiên tốc
độ, tiền testnet) – nhưng nếu sau này cần giới hạn "cứng" thật sự, phải kiểm
tra lại tổng đã gửi ở phía server ngay trước khi ký giao dịch, không chỉ ở
UI.

**File đã sửa:** `supabase/migrations/20260827080000_...sql`,
`types/database.types.ts`, `components/icons.tsx` (icon `Settings` mới),
`components/home-screen.tsx`, `components/send-flow.tsx`,
`app/dashboard/page.tsx` (đổi prop `accountName` string → `profile` object
đầy đủ). `npx tsc --noEmit` sạch sau khi sửa.

## Git

Remote `origin` = GitHub `KattyFury/taptip`, branch `main`. Xong việc là commit + push ngay.
