# TapTip — PRD v2

## 1. App này là gì?
Gửi tiền nhanh cho bất kỳ ai quanh năm, chỉ cần người nhận đăng nhập bằng email — dịp Tết Âm lịch thì gọi là lì xì.

## 2. Ai sẽ dùng nó?
- **Người gửi:** không có nhóm chính cụ thể. Ràng buộc cứng: bất kỳ ai cũng dùng được, kể cả người 60 tuổi thao tác được ngay từ lần đầu, không cần ai chỉ dẫn.
- **Người nhận:** tương tự người gửi — không có nhóm chính, cùng ràng buộc dùng được ngay lần đầu.

## 3. Nó giải quyết vấn đề gì / mang lại điều gì?
So với chuyển khoản ngân hàng (nhiều bước xác thực mỗi giao dịch), app chỉ xác thực một lần lúc mở app (passkey) — gửi tiền không cần duyệt lại mỗi lần vì số tiền nhỏ. Mục tiêu tốc độ: nhanh ngang hoặc hơn banking, gần như tiền trao tay. Cốt lõi tốc độ không đổi so với v1.

## 4. Tính năng

**Core (v2):**
- Đăng nhập: email OTP (lần đầu tạo tài khoản) + passkey (các lần đăng nhập sau)
- Nạp/rút USDC trên Arc
- Home: Balance + QR ví mình (mặc định hiện sẵn để nhận tiền) + nút **Tip Setting** (1/3 màn hình) + nút **Tip** (2/3 màn hình)
- **Tip Setting:** 4 ô số tiền mặc định có thể tùy chỉnh — 3 ô có sẵn ($1 / $3 / $10), ô thứ 4 để trống, click vào để nhập số tùy chọn (VD $30). Chọn 1 trong 4 ô làm mặc định.
- Bấm **Tip** → màn quét QR hiện ra với N nút chọn số tiền, 1 nút được tô sáng làm mặc định → quét QR đúng mạng Arc là gửi ngay theo số đang chọn, không xác nhận thêm; số dư không đủ báo ngay trước khi cho quét; QR không hợp lệ báo lỗi rõ ràng
- Định danh ví hiển thị dạng rút gọn `0x_NNNNN` (5 số cuối địa chỉ ví) — thuần đơn giản hóa hiển thị, không dùng làm dữ liệu chuyển/nhận thật. Click vào số hiện địa chỉ đầy đủ; có icon copy riêng để copy thẳng
- Lịch sử giao dịch: hiện theo định dạng rút gọn này — áp dụng cả giao dịch nội bộ app lẫn nạp/rút với ví ngoài; xem trong Settings

**Roadmap (chưa làm ở v2):**
- Quy đổi USDC ↔ VNĐ (cần nguồn tỷ giá thật, không hardcode — chưa chọn nguồn)
- Tên hiển thị (thay cho username, đặt trong Settings)
- Giới hạn tip theo ngày

**Cắt nếu gấp deadline:** quy đổi VNĐ và tên hiển thị — cả hai đã đưa sang roadmap ngay từ đầu.

## 5. Luồng sử dụng

**Gửi:**
Mở app → passkey (quét lại mỗi lần mở app hoặc quay lại từ nền) → Home → bấm Tip → màn quét QR hiện N nút chọn số tiền, 1 nút tô sáng theo mặc định đã chọn ở Tip Setting → quét QR đúng mạng Arc là gửi ngay theo số đang chọn, không xác nhận thêm → popup tiến độ hiện ngay trên màn quét (màn hình mờ đi, không quét tiếp được) → popup mất đi khi giao dịch đã xác nhận thành công trên chain (Arc finality dưới 1 giây) cộng thêm 1 giây hiển thị kết quả — tổng khoảng 2 giây trong điều kiện bình thường, không phải hẹn giờ UI cố định → quét tiếp được luôn, mức tiền vừa gửi giữ nguyên cho lần kế tiếp, không tự reset.

**Nhận:**
QR ví mình hiển thị sẵn mặc định ở Home → người khác quét là nhận tiền → thông báo hiện ở vùng riêng trên Home (xem Wireframe).

**Nạp:**
Bấm Nạp → app tự copy địa chỉ ví đầy đủ, dẫn qua trang faucet (testnet, chỉ có faucet) → thông báo "App vừa copy số tài khoản cho bạn, hãy tới trang để faucet".

**Rút:**
Chưa khả dụng ở giai đoạn testnet (roadmap).

## 6. Ranh giới — KHÔNG được làm
1. Không hủy/hoàn tiền
2. Chỉ USDC trên Arc, không quy đổi VNĐ (v2)
3. Không chat kèm giao dịch
4. Không giới hạn số tiền mỗi lần gửi, không giới hạn tip theo ngày — chấp nhận rủi ro bảo mật (điện thoại mở khoá bị người khác cầm + không giới hạn + không xác thực thêm = có thể mất ví trong một lần chạm), vì đây là app tip số tiền nhỏ.

## Core Value
Gửi tiền nên nhanh và đơn giản như trao tận tay — không phải như làm thủ tục ngân hàng.
