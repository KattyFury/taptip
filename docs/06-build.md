# Bước 6 — Build TapTip: nhật ký quyết định thật

Ghi lại các quyết định/lỗi thật gặp phải khi build TapTip từ fork `circlefin/arc-p2p-payments`, dùng để dựng mục Ví dụ + "prompt từng hụt chỗ nào" cho `06-build/README.md` sau này.

## Setup hạ tầng (trước Giai đoạn 1)

- Fork `circlefin/arc-p2p-payments` → `KattyFury/arc-p2p-payments`, code vào `example/app/`.
- Supabase Cloud project `taptip` — migrations push qua Management API `database/query` (CLI `supabase link` bị bug parse ngày, không dùng được).
- Circle: phải tạo **account mới** vì account cũ dính 1 Entity Secret không rõ nguồn gốc, không tìm lại được để dùng/reset.
- **Phát hiện lỗi trong sample app gốc:** `app/api/wallet-set/route.ts` import file `lib/utils/developer-controlled-wallets-client.ts` không tồn tại, package `@circle-fin/developer-controlled-wallets` cũng thiếu trong `package.json`. Tự vá cả hai.

## Giai đoạn 1 — Tính năng 1: Home

- Bỏ bottom nav 3 tab (balance/wallet/transactions) — thay bằng 1 màn Home: Balance → QR ví mình → 2 nút hành động → icon menu (☰) mở popup Số dư/Nạp/Rút/Lịch sử.
- Xoá 3 file mồ côi sau khi bỏ bottom nav: `balance-tab.tsx`, `bottom-tab-navigation.tsx`, `wallet-information-dialog.tsx`.
- Thêm `qrcode.react` để vẽ QR code (sample app gốc không có QR nào cả, vì luồng gửi gốc là tìm-người-nhận chứ không phải quét QR).

### ⚠️ Sign-in gốc dùng số điện thoại, không phải email

**Sample app gốc dùng số điện thoại + SMS OTP** (`+1`, US-only) cho sign-in, hoàn toàn khác spec TapTip (email) và không chạy được trên Supabase Cloud project mới (không có SMS provider/Twilio cấu hình). Sửa sang email:

1. Thử `signInWithOtp({email})` + `verifyOtp` 6 số — nhưng **Supabase free tier chặn tuỳ chỉnh email template mặc định**, email gửi ra chỉ có link xác nhận, không có mã số. Ban đầu định né bằng cách chuyển sang magic link (bấm link thay vì gõ mã) — **user phản đối đúng**: magic link trên mobile khi bấm từ app Mail dễ mở ra trình duyệt khác với bản PWA đã "Add to Home Screen", session không chuyển vào app đã ghim được; thêm việc chuyển qua lại giữa 2 app cũng phiền hơn gõ số tại chỗ cho người lớn tuổi.
2. Hướng đúng: tự cấu hình **SMTP riêng bằng Gmail App Password** (free, không cần domain, xong trong ~2 phút) qua Supabase Management API (`PATCH /config/auth` với `smtp_host/user/pass` + `mailer_templates_*_content` có `{{ .Token }}`). Giữ nguyên đúng luồng gõ mã OTP như wireframe gốc.

**Bài học:** hạ tầng miễn phí (free tier) có giới hạn không phải lúc nào cũng nên né bằng cách đổi UX — nhất là khi UX đó ảnh hưởng trực tiếp tới đối tượng dùng chính (ở đây là người lớn tuổi, dùng PWA). Tìm cách giữ đúng UX trước, chỉ đổi hướng khi thực sự không còn cách nào khác.

### Phát hiện thêm: sample app có 2 kiểu ví song song

- `/auth/callback` (route cho magic-link/PKCE) tạo ví qua **Developer-Controlled Wallets** (`/api/wallet-set` + `/api/wallet`, dùng Entity Secret) — tự động, không cho user thấy bước nào.
- `/dashboard/setup-wallet` (component `PasskeySetup`) tạo ví qua **Modular Wallets + Passkey** (dùng Client Key) — có màn hình riêng cho user thao tác.

TapTip cần bản passkey (đúng wireframe Màn 4 "Thiết lập Passkey" + đúng spec "ví ẩn phía sau bằng Circle Wallets" + Client Key đã tạo riêng cho việc này) — nên luồng `sign-in` → `code-confirmation` → (`onboarding` nếu chưa có profile) → `dashboard` → tự động redirect `setup-wallet` nếu chưa có ví, đúng logic gốc của sample app cho nhánh OTP, không đụng tới `/auth/callback`.
