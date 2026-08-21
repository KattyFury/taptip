# TapTip – Wireframe Spec (đủ để dựng UI mockup)

Platform: PWA
Grid: 375×812 (iPhone chuẩn), margin trái/phải 16px
Hệ lưới: chia chiều dọc thành 10 hàng (mỗi hàng ~81.2px)

## Nhóm 1 – Onboarding & Login

Nguyên tắc chung: nội dung chính luôn căn giữa trong vùng hàng 1-6.
Nút hành động luôn nằm ở hàng 9. Hàng 10 để trống, trừ màn Passkey.

**Màn 1 – Splash**
- Logo TapTip, căn giữa hàng 1-6
- Tự động chuyển màn, không cần thao tác

**Màn 2 – Add to Home Screen** (bỏ qua nếu user đã add rồi → nhảy thẳng từ Màn 1 sang Màn 3)
- Ảnh minh hoạ Safari iPhone + hướng dẫn: Option → Share → Add to Homescreen → OK
- Nội dung căn giữa hàng 1-6
- Nút "Tiếp tục" full-width, hàng 9

**Màn 3 – Đăng nhập (Email + OTP)**
- Nội dung căn giữa hàng 1-6: input email → nút "Gửi mã OTP" → 6 ô nhập OTP
- ⚠️ Supabase free tier không cho tuỳ chỉnh email template mặc định – phải tự cấu hình SMTP riêng (Gmail App Password) qua Management API mới chèn được mã `{{ .Token }}` vào email. Không cấu hình SMTP thì email chỉ có link, không có mã để gõ. Xem `example/docs/06-build.md`
- Hàng 9: nút "Quay lại" (1/3 trái) + nút "Tiếp tục" (2/3 phải)

**Màn 4 – Thiết lập Passkey**
- Icon FaceID + tiêu đề + mô tả, căn giữa hàng 1-6
- Hàng 9: nút "Quay lại" (1/3 trái) + nút "Bật passkey" (2/3 phải)
- Hàng 10: text "Bỏ qua, dùng email/OTP"

## Nhóm 2 – Home

- Hàng 1: Balance (số lớn, VD "1.250.000đ"), căn giữa
- Hàng 2-5: QR code (ví mình) hình vuông to, căn giữa
- Hàng 6: chú thích "Cho người khác quét để nhận tip"
- Hàng 9: 2 nút – "Tip ngẫu nhiên" (icon xúc xắc, 1/3 trái) + "Tip" (icon trao tiền, 2/3 phải)
- Hàng 10: icon menu (☰) bên trái → mở popup: Số dư / [Nạp][Rút] / [Lịch sử tip]
- Không có bottom nav

## Nhóm 3 – Send / Scan

**Popup chọn số tiền** (mở từ nút "Tip")
- Mỗi hàng là 1 mức tiền có sẵn, sắp xếp tăng dần (nhỏ → lớn)
- Mỗi hàng có nút X để xoá – bấm X phải confirm trước, không xoá ngay
- Có nút "+ Nhập số khác"

**Màn quét QR** (sau khi chọn số tiền)
- Khung camera quét QR, chiếm phần lớn màn hình
- Ngay dưới khung quét: nút "Nhập ảnh từ kho ảnh"
- Hàng 9: nút "Quay lại" (1/3 trái) + nút "Hoàn tất" (2/3 phải)

**Popup loading** (sau khi quét 1 QR)
- Hiện icon loading + "Đang xử lý giao dịch..."

**Popup hoàn thành**
- Icon ✓ + số tiền vừa trừ
- Tự tắt sau 2 giây, quay lại màn quét/nhập ảnh

## Nhóm 4 – Nạp / Rút / Lịch sử

**Popup Nạp** (testnet)
- App tự động copy địa chỉ ví của user
- Hướng dẫn: 1) Mở trang Circle Faucet → 2) Dán địa chỉ ví → 3) Bấm Request trên trang đó
- Nút "Mở trang Circle Faucet"

**Popup Rút**
- Thông báo "Tính năng chưa khả dụng" (rút chỉ mở ở mainnet)
- Nút "Đã hiểu"

**Popup Lịch sử tip**
- Nhóm theo ngày (header "ngày tháng năm")
- Mỗi dòng: tên giao dịch + giờ, số tiền màu đỏ nếu bị trừ (gửi), màu xanh nếu được nhận (tip về)
- Cuộn để xem thêm

## Đặc điểm chung của mọi popup
- Nền mờ (dim overlay) phía sau
- Bo góc 12px
- Chạm ngoài popup để đóng (trừ popup loading)
