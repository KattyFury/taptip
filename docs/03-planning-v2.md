# TapTip v2 — Product Discovery: Quyết định (chỉ phần mới/đổi so với v1)

## Nhóm 1 — Login & Onboarding
- Ví lần đầu (chưa từng tạo) do Circle sinh — trong lúc chờ, màn hình hiện **loading** cho tới khi ví sẵn sàng, không cho vào Home trước đó.
- Định danh ví (dạng `0x_XXXXX`, xem nhóm 3) chỉ để hiển thị (Home + Lịch sử) — không dùng để chuyển/nhận. Cách tip duy nhất là quét QR.
- Rủi ro trùng đoạn rút gọn giữa 2 người: chấp nhận được, không phải rủi ro bảo mật thật vì không dùng làm dữ liệu giao dịch — thuần là đơn giản hóa hiển thị địa chỉ dài, khó đọc.

## Nhóm 2 — Ví & Nạp/Rút
- **Nạp:** bấm Nạp → app tự copy địa chỉ ví đầy đủ, dẫn qua trang faucet (đang testnet, chỉ có faucet) → thông báo "App vừa copy số tài khoản cho bạn, hãy tới trang để faucet".
- **Rút:** chưa khả dụng ở giai đoạn testnet — ghi CHƯA CHỌN, không thiết kế tech cho phần này ở v2.
- Định danh rút gọn dùng nhất quán cho cả giao dịch nội bộ app lẫn nạp/rút với ví ngoài.

## Nhóm 3 — Luồng gửi & quét QR
- Tip Setting: cả 4 ô (kể cả 3 ô có sẵn $1/$3/$10) đều sửa được. Trong Settings chọn 1 trong 4 ô làm mặc định — không bắt buộc là ô $1.
- Sau khi gửi, mức tiền vừa chọn **giữ nguyên** cho lần quét kế tiếp, không tự reset về mặc định ban đầu.
- Quét trúng QR không hợp lệ (sai mạng / QR rác) → **báo lỗi rõ ràng**, không im lặng.
- Popup "✓" chỉ hiện **sau khi giao dịch đã xác nhận thành công trên chain** (không phải ngay lúc bấm gửi) — Arc finality dưới 1 giây nên độ trễ không đáng lo.
- Ô thứ 4 (Tip Setting) chưa nhập số thì **không thể chọn làm mặc định**.

## Nhóm 4 — Xử lý lỗi & Edge case
- Số dư không đủ: báo ngay trên màn quét, chặn trước khi cho quét.
- App bị đóng/mất mạng giữa lúc chờ finality: không có cơ chế "đang xử lý" ở app khi mở lại — người dùng tự vào **Lịch sử trong Settings** để kiểm tra giao dịch đã thành công hay chưa.
- Cửa sổ chặn quét tiếp: không phải hẹn giờ UI cố định — popup tiến độ hiện ngay trên màn quét, khoá thao tác quét cho tới khi popup mất đi (tức đến khi giao dịch xử lý xong), không phải chỉ là hiệu ứng UI.
- Ô Tip Setting trống không cho chọn làm mặc định (trùng với quyết định ở Nhóm 3).

**Cảnh báo kết hợp rủi ro (đã nêu trong quá trình, không phải chặn):** không giới hạn/không xác nhận giao dịch (đã chấp nhận ở PRD) + không báo lỗi QR rác từng là rủi ro cộng dồn lớn hơn từng phần — đã giải quyết bằng quyết định "báo lỗi rõ ràng" ở Nhóm 3, nên rủi ro kết hợp này coi như đã xử lý.

## Nhóm 5 — Bảo mật
- Passkey xác thực lại **mỗi lần mở app hoặc quay lại từ nền** (không chỉ 1 lần duy nhất lúc đăng nhập ban đầu).
- Session lưu bằng **httpOnly, Secure cookie** (không dùng localStorage) — giảm rủi ro bị đọc trộm qua lỗ hổng XSS; dù session có lộ, thao tác gửi tiền thật vẫn cần passkey xác nhận lại nên không mất tiền ngay, chỉ lộ dữ liệu đọc (số dư, lịch sử).
- Private key nằm ở phía Circle (Developer-Controlled Wallets), không xuất được — không có rủi ro lộ key phía app.

## Đầu ra
File PRD v2 đã được cập nhật để khớp các quyết định ở Nhóm 1–3 (định danh ví, luồng gửi/nạp/rút, timing popup) — xem `docs/02-v2-hoan-thien-y-tuong.md`. Nhóm 4–5 là quyết định vận hành/bảo mật, dùng làm input trực tiếp cho Vòng 2 (chốt stack).

---

# Vòng 2 — Stack v2

## Bảng stack theo luồng

| Luồng | Tech |
|---|---|
| **Khung dùng chung** | Cloudflare Workers qua `@opennextjs/cloudflare` (giữ nguyên v1) + Cloudflare D1 (SQL) + Cloudflare KV (thay Supabase) + Circle Developer-Controlled Wallets (Entity Secret mới) + Resend (mail, domain có sẵn từ v1) |
| **Login & Onboarding** | D1 `users` (`id`, `email`, `wallet_address`, `created_at`); KV `otp:{email}` TTL 5 phút; KV `session:{token}` TTL 15 phút |
| **Home** | Circle API lấy balance (fetch mỗi lần mở Home); QR lib có sẵn trong fork; D1 `tip_settings` (`user_id`, `slot1-4`, `default_slot`) |
| **Nạp tiền** | Clipboard API trình duyệt; link ngoài `https://faucet.circle.com` (chọn Arc Testnet) |
| **Gửi tiền / quét QR** | QR-scan lib có sẵn trong fork; Circle API submit transfer; polling trạng thái giao dịch (300–500ms/lần, có timeout); ghi D1 `transactions` (`from`, `to`, `amount`, `tx_hash`, `status`, `created_at`) sau khi confirm |
| **Nhận tiền** | Không tech mới — fetch lại balance khi mở Home |
| **Lịch sử giao dịch** | Query D1 `transactions` |
| **Settings / Tip Setting** | D1 `tip_settings` (đã tạo ở Home) |
| **Rút tiền** | CHƯA CHỌN |

## Thứ cần cài
- `@opennextjs/cloudflare` (có sẵn từ fork v1)
- Circle SDK (Developer-Controlled Wallets)
- Resend SDK
- QR lib có sẵn trong fork — kiểm tra tên gói cụ thể trong code v1 khi bắt đầu build

## Thứ cần đăng ký tài khoản
- Cloudflare (đã có từ v1)
- Circle Developer Console — tài khoản mới (account cũ mất Entity Secret + recovery file)
- Resend (đã có từ v1)

## Chỗ phải khai báo/cấu hình trước khi chạy được
- Circle: sinh Entity Secret mới
- Camera: bắt buộc HTTPS — production có sẵn; dev/test điện thoại thật cần tunnel HTTPS (VD ngrok) nếu chạy local
- PWA: icon + manifest — đã có từ v1

## Quyết định khó đổi
- Custody Circle Developer-Controlled Wallets — đổi nghĩa là ví cũ user không tự chuyển theo được
- Cơ chế passkey/Circle Modular Wallets — gắn liền cách user cũ truy cập lại ví
- Cloudflare D1 — đổi DB khác cần viết lại query/migration
- Cloudflare Workers hosting — đổi nền tảng nếu vượt khả năng Workers
