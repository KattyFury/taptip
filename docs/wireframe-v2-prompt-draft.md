# Prompt Bước 4 (Wireframe v2) - dán vào Claude Chat

```
Đóng vai Senior Product Designer. Dựa trên spec sản phẩm mình đã đưa ở các bước trước, vẽ wireframe cho từng màn hình, ưu tiên đúng layout/tỷ lệ hơn đẹp, chỉ khung + label chức năng. Hỏi platform và đề xuất hệ lưới phù hợp, chờ xác nhận trước khi vẽ. Chỗ nào spec chưa rõ layout thì hỏi tôi, đừng tự suy diễn. Vẽ theo từng nhóm màn hình, chờ xác nhận rồi mới sang nhóm tiếp.

Hệ lưới phải phát biểu bằng TỶ LỆ: chia màn thành N hàng, mỗi hàng bằng 1/N chiều cao màn. Px chỉ ghi trong ngoặc cho dễ hình dung, không phải con số để code theo.

Mỗi màn liệt kê đủ N hàng, hàng nào trống cũng phải ghi ra là trống – đừng chỉ kể mấy hàng có nội dung.

Chỗ nào hiển thị nội dung thay đổi được (số dư, tên người, ngày giờ, danh sách): hỏi mình giá trị ngắn nhất và dài nhất có thể ra, rồi ghi rõ khi độ dài đổi thì layout xử lý sao – cụm chữ đứng yên tại chỗ hay được phép nhảy.

Màn nào phụ thuộc hệ điều hành hoặc trình duyệt (hướng dẫn cài app vào màn hình chính, xin quyền camera, quyền thông báo) thì vẽ đủ biến thể, đừng vẽ mỗi bản iPhone rồi coi như xong.

Màn nào có dữ liệu hoặc phải chờ thì vẽ đủ trạng thái xấu: đang tải, trống chưa có gì, lỗi/mất mạng, không được cấp quyền.

Đây là bản LÀM LẠI (v2) của một app đã build và deploy thật ở bản v1 — v1 đã có wireframe rồi (10 hàng, platform PWA/mobile 375×812), đa số màn KHÔNG đổi. Chỉ vẽ lại những màn có thay đổi thật theo spec dưới đây: Home (thêm nút Tip Setting, đổi bố cục 2 nút hành động), popup Tip Setting (mới hoàn toàn), màn quét QR (giờ có N nút chọn số tiền ngay trên màn quét thay vì popup riêng trước đó, popup tiến độ theo finality thay vì hẹn giờ cố định), và mọi chỗ hiển thị địa chỉ ví/lịch sử (đổi từ hash đầy đủ/tên sang định dạng rút gọn `0x_...`). Giữ nguyên platform PWA, hệ lưới 10 hàng 375×812 trừ khi có lý do cụ thể để đổi.

Đây là spec sản phẩm của mình (PRD + Product Discovery):
```

*(dán tiếp nội dung `docs/02-v2-hoan-thien-y-tuong.md` + `docs/03-planning-v2.md` vào đây)*

---

## Sau khi xong

Đem toàn bộ wireframe Chat vẽ ra (mô tả từng màn theo N hàng) về đây — mình lưu vào `docs/04-wireframe-v2.md`, đối chiếu với `docs/04-wireframe.md` (bản v1) để biết đúng những màn nào thật sự cần code lại.
