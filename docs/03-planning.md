# PRD — App Tip & Lì Xì Nhanh trên Arc

## 1. App này là gì?
Lì xì và tip nhanh chóng cho bất kỳ ai, chỉ bằng cách họ log in bằng email.

## 2. Ai sẽ dùng nó?
Cả người gửi lẫn người nhận có thể là người lớn tuổi, ít rành công nghệ
(ví dụ: mẹ/bà, khoảng 60 tuổi) — không quen thao tác app phức tạp, nhưng
phải tự thao tác được ngay từ lần đầu, không cần ai ngồi cạnh chỉ dẫn.

## 3. Nó mang lại điều gì?
So với chuyển khoản ngân hàng (nhiều bước xác thực cho mỗi giao dịch),
app chỉ xác thực một lần lúc mở app (passkey) — sau đó gửi tiền không
cần duyệt lại mỗi lần, vì số tiền nhỏ. Nhanh hơn hẳn cách người Việt
đang chuyển tiền/lì xì qua ngân hàng hiện tại.

## 4. Tính năng

**Core (thiếu thì app vô nghĩa):**
- Đăng nhập bằng email + passkey (lần đầu: tạo tài khoản + ví + passkey;
  lần sau: chỉ cần passkey)
- Nạp / rút tiền
- Màn hình chính: Balance + nút Nạp/Rút + Lịch sử giao dịch ở top,
  QR code (ví mình, tĩnh, không đổi/không hết hạn) hiển thị mặc định
  ở giữa
- Nút Custom: mở dãy số tiền có sẵn (VD 10.000đ / 50.000đ / 200.000đ)
  + nút [+] để tự nhập số khác — nút nào vượt quá balance hiện có thì
  bị disable, không cho bấm
- Quét QR người nhận → gửi ngay, không cần bước xác nhận
- Sau khi gửi: hiện ✓ + số tiền vừa trừ, màn hình quét vẫn giữ nguyên
  để gửi tiếp/tip lại ngay
- Chỉ hỗ trợ USDC trên Arc, hiển thị quy đổi ra VNĐ real-time cho
  người dùng

**Nice-to-have (không core):**
- Nút Random (rút túi mù, số tiền ngẫu nhiên — mang tính vui/may mắn)

## 5. Luồng sử dụng
1. Mở app → xác thực bằng passkey (lần đầu: tạo tài khoản + ví + thiết
   lập passkey, kèm màn hình giải thích + hướng dẫn "Add to Home
   Screen"; lần sau: chỉ cần passkey, vào thẳng)
2. Màn hình chính: Balance, nút Nạp/Rút + Lịch sử ở top, QR code của
   mình hiển thị mặc định ở giữa
3. Người nhận đưa QR trên máy họ ra (face-to-face)
4. Người gửi bấm nút Custom (chọn số tiền có sẵn hoặc [+] tự nhập,
   chỉ hiện các mức trong khả năng balance) → mở máy ảnh
5. Quét QR trên máy người nhận → gửi ngay, hiện loading/đồng hồ cát
   trong lúc chờ finality
6. Giao dịch trả kết quả tức thì: thành công (✓ + số tiền vừa trừ) hoặc
   thất bại — không có trạng thái lơ lửng, không rủi ro trừ nhầm
7. Màn hình quét vẫn giữ nguyên sau khi xong, gửi tiếp/tip lại ngay
   được luôn
8. Bấm thoát → quay về màn hình chính

## 6. Ranh giới — App KHÔNG làm
- Không hủy/hoàn tiền sau khi gửi — gửi là gửi luôn
- Không hỗ trợ token nào khác ngoài USDC
- Không có chat/lời nhắn kèm theo khi gửi
- Không giới hạn số tiền mỗi lần gửi

## Core Value
Tip tiền và lì xì nhanh như trao tay.

---

# Product Discovery — Kết quả review

## Nhóm 1 — Login & Onboarding
- Khôi phục tài khoản/đăng nhập lại: qua email OTP, không phải cơ chế
  khôi phục passkey theo thiết bị. Chấp nhận rủi ro vì số tiền tip nhỏ;
  mất quyền truy cập email là trách nhiệm của người dùng.
- Lần đầu tạo ví: có màn hình giải thích, kèm bước hướng dẫn thêm app
  vào màn hình chính (Share → Add to Home Screen, 4 bước).
- Đa thiết bị: cho phép, mỗi thiết bị tự quản lý passkey riêng.

## Nhóm 2 — Ví & Nạp/Rút
- Nạp tiền: hiện trạng thái "đang xử lý" nếu dễ làm, không thì bỏ qua.
- Testnet: nạp/rút = faucet only, rút bị disable.
- Tỷ giá quy đổi VNĐ: real-time, không cần hiện số lẻ nhỏ vì USDC ổn định.
- Không giới hạn min/max nạp/rút — dựa trên khả năng nano-payment của Arc.

## Nhóm 3 — Luồng gửi/quét QR
- QR người nhận là QR tĩnh, không đổi, không hết hạn (giống số tài khoản).
- Không hiện thông tin người nhận trước khi gửi — vì quét là face-to-face.
- Yêu cầu camera focus rõ để tránh quét nhầm QR người khác ở gần.
- Chống gửi trùng: có trạng thái loading/đồng hồ cát ngay sau khi quét,
  màn hình chỉ clear để quét tiếp khi giao dịch trước đã xong.

## Nhóm 4 — Xử lý lỗi & Edge case
- Balance không đủ: nút số tiền vượt quá balance bị disable từ đầu,
  không cho bấm — không phải để quét xong mới báo lỗi.
- Giao dịch on-chain trả kết quả tức thì (thành công/thất bại), không
  có trạng thái treo giữa chừng, không rủi ro trừ tiền nhầm.
- Người nhận chưa có tài khoản: onboarding qua email đủ nhanh, không
  phải rào cản.
- Mất mạng giữa lúc quét/gửi: hiện thông báo "Mất kết nối mạng" thay vì
  màn hình đen không rõ nguyên nhân.

## Nhóm 5 — Bảo mật
- Bảo mật lưu trữ key của Circle Wallets: thuộc trách nhiệm của Circle,
  không phải thứ app tự thiết kế thêm lớp bảo vệ.
- Xác thực ký giao dịch: chỉ cần session hợp lệ là đủ để backend ký,
  không có lớp kiểm tra bổ sung nào mỗi lần ký.
- Điện thoại mở khoá bị người khác cầm: chấp nhận rủi ro có thể gửi
  tiền tự do qua quét QR mà không cần xác thực thêm — đánh đổi có chủ
  đích để giữ tốc độ.
- Email bị chiếm đoạt: thừa nhận kẻ tấn công có toàn quyền vào app và
  rút sạch ví — đây là điểm yếu bảo mật lớn nhất của hệ thống, được
  chấp nhận như một trade-off đã biết.

---

## Lỗi quy trình gặp phải khi chạy prompt này

1. Câu trả lời "để Circle/nhà cung cấp thứ ba lo" (VD bảo mật Circle
   Wallets) là hợp lệ khi đúng thật là trách nhiệm nằm ngoài phạm vi
   app — nhưng phải phân biệt với việc né tránh câu hỏi. Cách kiểm tra:
   nếu câu hỏi là "app xử lý lỗi X ra sao" thì không được đẩy hết qua
   bên thứ ba; nếu câu hỏi là "bên thứ ba có an toàn không" thì đẩy qua
   là đúng.

2. Người trả lời có xu hướng trả lời đúng 1 câu trong nhóm 4-5 câu rồi
   dừng lại, coi như cả nhóm đã xong (VD trả lời câu 1 rồi im, không
   trả lời câu 2-4). Người hỏi phải chủ động liệt kê lại câu nào chưa
   trả lời, không được để sót — im lặng không có nghĩa là "pass" hay
   "không cần quan tâm".

3. Khi 2 quyết định riêng lẻ (từng cái nghe hợp lý một mình) cộng lại
   tạo ra rủi ro lớn hơn tổng của từng phần (ở đây: "không cần xác thực
   thêm khi gửi" + "không giới hạn số tiền mỗi lần gửi" = mất sạch ví
   nếu máy bị cầm lúc mở khoá) — phải chỉ rõ ra sự kết hợp đó, không chỉ
   đánh giá từng quyết định độc lập.

4. Với câu hỏi rủi ro/bảo mật, khi người trả lời nói "chấp nhận, không
   care" — đây là câu trả lời hợp lệ và đủ, không cần thuyết phục họ đổi
   ý. Việc của người review là đảm bảo họ *nhìn thấy* rủi ro trước khi
   chấp nhận, không phải ép họ tránh rủi ro.

5. Ở cuối buổi discovery nhiều nhóm, nên chủ động hỏi có muốn tổng hợp
   toàn bộ (PRD + Discovery) thành 1 file duy nhất không — người dùng
   thường không nhắc, nhưng đây là bước cần thiết trước khi chuyển qua
   giai đoạn build.
