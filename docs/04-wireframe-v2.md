# TapTip v2 — Wireframe

Platform: PWA, lưới 10 hàng, khung 375×812 (giữ nguyên v1). Chỉ vẽ lại màn có thay đổi thật — màn nào không nhắc tới ở đây thì giữ nguyên `docs/04-wireframe.md` (bản v1).

## Group A — Home ✅ đã chốt

**Trạng thái bình thường** (mỗi hàng ≈ 81px):
- **Hàng 1–2:** chia ngang 2/3–1/3. 2/3 trái: "Balance" (hàng 1, cỡ nhỏ) + số dư (hàng 2, cỡ rất lớn, font tự co nhỏ khi số dài ra, không xuống dòng/tràn). 1/3 phải: nút Options, căn giữa theo chiều dọc cả 2 hàng.
- **Hàng 3–6:** QR ví mình, căn giữa. Dưới QR: "Số tài khoản: `0x_NNNNN`" (5 số cuối) + icon copy cạnh bên. Click vào số → hiện địa chỉ đầy đủ. Click icon copy → copy thẳng vào clipboard, chỉ có toast xác nhận.
- **Hàng 7–8:** vùng thông báo. Mặc định trống hoàn toàn. Khi có thông báo: dạng bong bóng tin nhắn, chữ dài được phép tràn dòng (wrap), có nút "x" để đóng.
- **Hàng 9–10:** vùng nổi lên như 1 gờ tách biệt (shadow/bo góc riêng), nằm gọn trong 2 hàng, không tràn qua hàng 8. Chia 1/3 trái = nút "Tip Setting", 2/3 phải = nút "Tip" (to, chính).

**Trạng thái xấu:**
- Đang tải: hàng 1–2 skeleton loading; QR (hàng 3–6) vẫn hiện ngay vì không phụ thuộc balance.
- Lỗi/mất mạng khi fetch balance: hàng 1–2 hiện "—" + icon lỗi nhỏ, chạm để thử lại, không chặn phần còn lại màn hình.
- Không cần trạng thái xin quyền ở màn này.

## Group B — Màn quét QR ✅ chốt

**Trạng thái bình thường:**
- **Hàng 1:** nút thoát về Home (góc trái), nền trong suốt nổi trên camera.
- **Hàng 2–7:** khung quét camera full width, khung vuông viewfinder ở giữa để canh QR.
- **Hàng 8–9:** dải 4 ô chọn số tiền (nổi trên camera, nền card mờ đục) — luôn hiện đủ 4 ô, ô chưa có giá trị mờ/disable. 1 ô tô sáng theo mặc định đã chọn.
- **Hàng 10:** trống (safe area).

**Popup tiến độ:** khối nhỏ ở giữa màn hình (khoảng hàng 4–6), nền camera phía sau mờ đi — không che hết màn hình, không che dải chọn số tiền.

**Báo lỗi (QR không hợp lệ / số dư không đủ):** banner nhỏ ngay phía trên dải chọn số tiền (hàng 7), tự biến mất sau khoảng 2-3 giây, không cần bấm tắt.

**Trạng thái xấu — quyền camera:**
- Chưa cấp quyền/bị từ chối: thay khung camera (hàng 2–7) bằng thông báo "Cần quyền camera để quét mã" + nút "Cấp quyền"; dải chọn số tiền vẫn hiện nhưng disable hết.
- Đang chờ xin quyền (popup hệ thống lần đầu): giữ khung hàng 2–7 nhưng nền tối/placeholder, không hiện gì trong lúc chờ Allow/Deny.

## Group C — Options dropdown (nút Options ở Home) ✅ chốt
Dropdown menu nhỏ, neo góc phải-trên, xổ xuống ngay dưới nút Options (không phải popup 3/4). 2 mục: "Lịch sử giao dịch", "Đăng xuất". Chạm ra ngoài dropdown là đóng.

## Group D — Popup Tip Setting ✅ chốt
Popup 3/4 màn hình (chuẩn chung của app: click ra ngoài hoặc bấm X là đóng).
- Hàng đầu popup: tiêu đề "Tip Setting" + nút X góc phải.
- 4 hàng tiếp theo, mỗi hàng 1 ô: số tiền hiện tại (bấm vào sửa, bàn phím số hiện lên) + radio chọn ô đó làm mặc định. Ô thứ 4 trống ban đầu — chưa nhập số thì radio disable.
- Không có nút Lưu riêng — tự lưu ngay khi rời ô nhập.
- Trạng thái xấu: lưu lỗi (mất mạng) → toast nhỏ "Không lưu được, thử lại" tại ô đó, giá trị cũ giữ nguyên.

## Group E — Popup Lịch sử giao dịch ✅ chốt
Popup 3/4 màn hình, cùng chuẩn đóng.
- Hàng đầu: tiêu đề "Lịch sử giao dịch" + nút X.
- Còn lại: danh sách cuộn, mỗi dòng: icon chiều (gửi/nhận), đối tác (`0x_NNNNN` hoặc "Nạp từ ví ngoài"), số tiền, giờ:phút.
- Trạng thái xấu: đang tải (skeleton list); trống ("Chưa có giao dịch nào"); lỗi mạng ("Không tải được lịch sử" + nút thử lại).

---

Bước 4 (Wireframe) hoàn tất — đủ 5 nhóm màn thay đổi so với v1. Bước tiếp theo: Bước 5 (Setup môi trường) rồi Bước 6 (Build).
