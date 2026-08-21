# PRD – App Tip & Lì Xì Nhanh trên Arc

## 1. App này là gì?
Lì xì và tip nhanh chóng cho bất kỳ ai, chỉ bằng cách họ log in bằng email.

## 2. Ai sẽ dùng nó?
Cả người gửi lẫn người nhận có thể là người lớn tuổi, ít rành công nghệ
(ví dụ: mẹ/bà, khoảng 60 tuổi) – không quen thao tác app phức tạp, nhưng
phải tự thao tác được ngay từ lần đầu, không cần ai ngồi cạnh chỉ dẫn.

## 3. Nó mang lại điều gì?
So với chuyển khoản ngân hàng (nhiều bước xác thực cho mỗi giao dịch),
app chỉ xác thực một lần lúc mở app (passkey) – sau đó gửi tiền không
cần duyệt lại mỗi lần, vì số tiền nhỏ. Nhanh hơn hẳn cách người Việt
đang chuyển tiền/lì xì qua ngân hàng hiện tại.

## 4. Tính năng

**Core (thiếu thì app vô nghĩa):**
- Đăng nhập bằng email + passkey (lần đầu: tạo tài khoản + ví + passkey;
  lần sau: chỉ cần passkey)
- Nạp / rút tiền
- Màn hình chính: Balance + nút Nạp/Rút + Lịch sử giao dịch ở top,
  QR code (ví mình) hiển thị mặc định ở giữa
- Nút Custom: mở dãy số tiền có sẵn (VD 10.000đ / 50.000đ / 200.000đ)
  + nút [+] để tự nhập số khác
- Quét QR người nhận → gửi ngay, không cần bước xác nhận
- Sau khi gửi: hiện ✓ + số tiền vừa trừ, màn hình quét vẫn giữ nguyên
  để gửi tiếp/tip lại ngay
- Chỉ hỗ trợ USDC trên Arc, hiển thị quy đổi ra VNĐ cho người dùng

**Nice-to-have (không core):**
- Nút Random (rút túi mù, số tiền ngẫu nhiên – mang tính vui/may mắn)

## 5. Luồng sử dụng
1. Mở app → xác thực bằng passkey (lần đầu: tạo tài khoản + ví + thiết
   lập passkey; lần sau: chỉ cần passkey, vào thẳng)
2. Màn hình chính: Balance, nút Nạp/Rút + Lịch sử ở top, QR code của
   mình hiển thị mặc định ở giữa
3. Người nhận đưa QR trên máy họ ra
4. Người gửi bấm nút Custom (chọn số tiền có sẵn hoặc [+] tự nhập)
   → mở máy ảnh
5. Quét QR trên máy người nhận → gửi ngay, không cần xác nhận thêm
6. Hiện ✓ + số tiền vừa trừ, màn hình quét vẫn giữ nguyên
7. Muốn gửi tiếp (người khác, hoặc tip lại) → quét tiếp luôn
8. Bấm thoát → quay về màn hình chính

## 6. Ranh giới – App KHÔNG làm
- Không hủy/hoàn tiền sau khi gửi – gửi là gửi luôn
- Không hỗ trợ token nào khác ngoài USDC
- Không có chat/lời nhắn kèm theo khi gửi
- Không giới hạn số tiền mỗi lần gửi

## Core Value
Tip tiền và lì xì nhanh như trao tay.

---

## Lỗi quy trình gặp phải khi chạy prompt này

1. Câu 1 (mô tả app) dễ bị chung chung hoặc lẫn chi tiết kỹ thuật
   (VD "dưới 1s") – người viết PRD hay nhầm giữa "mô tả sản phẩm cho
   người ngoài hiểu" với "liệt kê thông số kỹ thuật". Phải tách riêng.

2. Câu 2 (đối tượng dùng) dễ bị trả lời một chiều – chỉ mô tả người
   NHẬN mà quên mô tả người GỬI, dù cả hai đều là user thật của app.
   Với app có 2 vai trò (gửi/nhận), phải hỏi rõ cả hai bên, không mặc
   định vai còn lại giống nhau.

3. Khi liệt kê tính năng ở Câu 4, người trả lời dễ nói "tất cả đều
   core" khi được hỏi cắt bớt – phải ép bằng tình huống cụ thể
   ("giả sử phải cắt 1 cái để kịp deadline") thay vì hỏi trừu tượng
   ("cái nào core"), mới ép ra được câu trả lời thật.

4. Câu 6 (ranh giới) hay bị né bằng cách trả lời sang chi tiết thiết
   kế khác (VD được hỏi "giới hạn số tiền không" thì trả lời về UI
   chọn số tiền) – phải kéo lại đúng câu hỏi gốc, không để câu trả
   lời lạc đề tính vào ranh giới.

5. Core value: người trả lời có xu hướng nhét thông số kỹ thuật hiện
   tại (VD "1s", "instant") vào làm niềm tin – phải test bằng cách hỏi
   "nếu con số này đổi, niềm tin có đổi theo không" để phân biệt niềm
   tin thật với chi tiết implementation tạm thời.

---

## Cập nhật khi build (08-08)

Phát sinh ý tưởng lúc build Tính năng 4 (Lịch sử): thay vì hiện địa chỉ
ví/hash giao dịch, hiện **tên người gửi/nhận** (VD "Tip: Minh Béo –
20 USDC") – vì onboarding đã thu thập tên (`profiles.name`) sẵn rồi,
tận dụng luôn thay vì hiện chuỗi hex khó đọc. Người dùng chính (60 tuổi)
sẽ khó nhận ra "0x71c9...4a2" là ai, nhưng nhận ra ngay tên quen thuộc.
