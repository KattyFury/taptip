# TapTip v2 — Wireframe

Platform: PWA, lưới 10 hàng, khung 375×812 (giữ nguyên v1). Chỉ vẽ lại màn có thay đổi thật — màn nào không nhắc tới ở đây thì giữ nguyên `docs/04-wireframe.md` (bản v1).

Mockup trực quan đã chốt (đen + `#FFCC00`, font Comfortaa cho số/Nunito cho chữ, khớp `app/layout.tsx`): https://claude.ai/code/artifact/537d3724-a68c-4e84-a8b1-6691d7868a1f

## Group A — Home ✅ đã chốt (bản sửa 2026-08-31, khác bản đầu)

- **Hàng 1:** trái "Balance" (label nhỏ), phải icon Menu (hình vuông bo góc, nền `#FFCC00`).
- **Hàng 2:** số dư lớn, rõ (VD `$124.50`), font Comfortaa đậm.
- **Hàng 3-4-5:** QR ví mình, to full khối 3 hàng, khung bo góc đen.
- **Hàng 6:** "Số tài khoản: `0x_a91c4`" (gạch chân vàng) + icon copy.
- **Hàng 7-8:** vùng thông báo, khung bo góc nét đứt, mặc định trống.
- **Hàng 9-10:** panel nổi bo góc trên, chia 1/3 trái "Tip Setting" (outline) — 2/3 phải "Tip" (nền `#FFCC00`, chữ đen, nút chính).

## Group B — Màn quét QR (Scan) ✅ chốt (bản sửa 2026-08-31, khác bản đầu)

- **Hàng 1:** header, chữ "Tip" căn giữa (không phải nút back).
- **Hàng 2:** trống (đệm).
- **Hàng 3-4-5:** camera quét, to full khối 3 hàng, khung bo góc, viewfinder viền vàng.
- **Hàng 6-7-8:** trống.
- **Hàng 9:** dải 4 nút chọn số tiền `$1 $3 $10 $50`, nút đang chọn nền `#FFCC00`.
- **Hàng 10:** chữ "Thoát" màu đỏ, căn giữa.

## Group C — Menu dropdown (từ icon Menu ở Home) ✅ chốt

Dropdown neo góc phải-trên, xổ xuống ngay dưới icon Menu. 4 mục theo thứ tự: **Nạp → Rút → Lịch sử giao dịch → Đăng xuất** (mục cuối chữ đỏ). Chạm ra ngoài dropdown là đóng.

## Quy tắc chung cho MỌI popup nội dung (Tip Setting, Lịch sử giao dịch, và các popup Nạp/Rút sau này) ✅ chốt

- **Không phải bottom-sheet.** Popup là khối nổi giữa, **chiều ngang cố định = 3/4 chiều ngang màn hình**, chiều cao **tự co theo nội dung** (không cố định).
- **Luôn căn giữa theo chiều ngang**, và **tâm popup luôn thẳng hàng với tâm hàng 4** của lưới 10 hàng (không phải căn giữa toàn màn hình theo chiều dọc).
- Nền sau popup mờ đi (dim overlay). Bo góc lớn (~20px), shadow rõ.
- Tất cả popup nội dung dùng chung 1 khuôn dạng này — không tự vẽ kiểu riêng cho từng popup.

## Group D — Popup Tip Setting ✅ chốt (bản sửa 2026-08-31, khác bản đầu — không còn radio + không có header/nút X)

Theo đúng khuôn popup chung ở trên. Nội dung: 4 hàng, mỗi hàng:
- Số tiền (trái, Comfortaa đậm) — hàng đang là mặc định có thêm badge "Mặc định" (nền `#FFCC00`) cạnh số tiền.
- Icon chỉnh sửa (phải, hình bút chì trong vòng tròn viền đen) — bấm vào để sửa số tiền / đặt làm mặc định cho hàng đó.

Không có nút Lưu riêng — sửa xong tự lưu. Không có tiêu đề "Tip Setting" hay nút X hiển thị riêng — đóng bằng cách chạm ra ngoài popup (theo quy tắc chung).

## Group E — Popup Lịch sử giao dịch ✅ chốt (bản sửa 2026-08-31, khác bản đầu — dùng khuôn popup chung, bỏ header)

Theo đúng khuôn popup chung ở trên. Nội dung: danh sách giao dịch, mỗi dòng: icon chiều (gửi màu đỏ/nhận màu xanh, nền nhạt tương ứng), đối tác (`0x_NNNNN` hoặc "Nạp từ ví ngoài"), số tiền (Comfortaa, màu theo chiều), giờ:phút.

**Trạng thái xấu** (đã mô tả ở bản đầu, vẫn áp dụng): đang tải (skeleton list); trống ("Chưa có giao dịch nào"); lỗi mạng ("Không tải được lịch sử" + nút thử lại).

---

Bước 4 (Wireframe) hoàn tất. Bước 6 (Build) đang code UI Home/Scan/popup theo đúng mockup này.
