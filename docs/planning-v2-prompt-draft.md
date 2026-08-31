# Prompt Bước 3 (Planning v2) - dán vào Claude Chat, 2 vòng cùng 1 cửa sổ

## Vòng 1 — Product Discovery (dán trước)

```
Đóng vai một Senior Product Consultant. Đừng giải pháp ngay. Hãy review ý tưởng của tôi như một buổi Product Discovery, chia thành các nhóm logic và hỏi 3–5 câu hỏi thực tế cho từng nhóm về UX, logic hệ thống, xử lý lỗi, edge cases và bảo mật. Chỉ hỏi một nhóm mỗi lần và đợi tôi trả lời trước khi sang nhóm tiếp theo.

Sau mỗi nhóm tôi trả lời xong, trước khi sang nhóm tiếp: liệt kê lại đúng những câu trong nhóm tôi CHƯA trả lời (im lặng không có nghĩa là pass hay không cần quan tâm), hỏi lại riêng mấy câu đó.

Khi câu trả lời của tôi là "để bên thứ ba lo" (vd nhà cung cấp ví, nhà cung cấp hạ tầng): chỉ chấp nhận nếu câu hỏi gốc là về ĐỘ AN TOÀN của bên thứ ba đó. Nếu câu hỏi gốc là app xử lý tình huống X ra sao, không được để tôi đẩy hết trách nhiệm qua bên thứ ba – hỏi lại.

Khi tôi trả lời "chấp nhận rủi ro, không cần xử lý" cho một câu về bảo mật/rủi ro: đây là câu trả lời hợp lệ và đủ, đừng cố thuyết phục tôi đổi ý – chỉ cần đảm bảo tôi đã THẤY rõ rủi ro trước khi chấp nhận.

Cuối mỗi nhóm, nếu phát hiện 2 quyết định riêng lẻ tôi vừa chấp nhận (mỗi cái nghe hợp lý một mình) khi cộng lại tạo ra rủi ro lớn hơn tổng từng phần, phải chỉ rõ ra sự kết hợp đó ngay, đừng chỉ đánh giá từng quyết định độc lập.

Đây là bản LÀM LẠI (v2) của một app đã build và deploy thật ở bản v1 — Product Discovery của v1 đã chạy xong rồi (5 nhóm: Login & Onboarding / Ví & Nạp-Rút / Luồng gửi-quét QR / Xử lý lỗi & Edge case / Bảo mật). Lần này tập trung đào sâu vào những gì MỚI hoặc ĐỔI so với v1 trong PRD dưới đây (đặc biệt: nút Tip Setting, định danh bằng STK 8 số, luồng "quét QR là gửi ngay theo số đang chọn" thay vì chọn số tiền ở popup riêng trước khi quét) — đừng hỏi lại từ đầu những phần không đổi, nhưng vẫn phải đi đủ cả 5 nhóm để không sót edge case mới phát sinh từ tính năng mới.

Đây là PRD v2 vừa chốt:
```

*(dán tiếp nội dung `docs/02-v2-hoan-thien-y-tuong.md` ngay sau đây)*

Xong hết các nhóm, chủ động hỏi Chat: "Tổng hợp toàn bộ quyết định ở đây thành 1 file duy nhất giúp mình."

---

## Vòng 2 — Chốt stack từng luồng (dán ngay sau khi Vòng 1 xong, cùng cửa sổ)

```
Đóng vai Solution Architect. Mình vừa chốt xong logic sản phẩm, giờ cần chốt stack.

Cách làm việc: bạn dẫn, mình theo.

BƯỚC 0 – trước khi bàn tech: đọc plan của mình rồi liệt kê ra danh sách các luồng bạn thấy, theo thứ tự người dùng gặp chúng. Đợi mình chốt hoặc bổ sung xong mới đi tiếp. Đừng tự đi thẳng vào luồng đầu tiên.

BƯỚC 1 – chốt phần KHUNG DÙNG CHUNG trước: app chạy bằng gì, host ở đâu, dữ liệu người dùng lưu ở đâu. Mấy thứ này không thuộc luồng nào nhưng luồng nào cũng dính, và sau này đổi là đau nhất – nên soi riêng, đừng để nó lọt vào giữa lúc đang bàn luồng đầu tiên.

BƯỚC 2 – đi TỪNG LUỒNG một, hỏi xong luồng này đợi mình chốt rồi mới sang luồng sau. Đừng xổ hết một lượt.

Ràng buộc của mình, tính vào mọi lựa chọn chứ đừng bỏ qua:
- Mình không có nền lập trình, code là AI viết. Cái gì cần tự debug sâu bằng tay thì coi như mình không làm được.
- Chain: Arc testnet. Giai đoạn: đang chạy testnet.
- Đang test/demo trên testnet nên mặc định free tier, khỏi hỏi câu ngân sách.
- Mình làm một mình, không có team.
- ĐÃ CHỐT SẴN, đừng đề xuất lại — chỉ hỏi mình chi tiết cụ thể (bảng nào, khoá KV nào, TTL bao lâu...) cho từng luồng cần tới nó:
  - Data storage: Cloudflare D1 (SQL) + Cloudflare KV — thay cho Supabase của bản v1 (lý do đổi: free tier Supabase tự pause sau ~7 ngày không hoạt động, gây phiền mỗi lần tạm gác dự án).
  - Hosting: Cloudflare Workers qua `@opennextjs/cloudflare` — đã deploy thật ở v1, giữ nguyên cho v2.
  - Custody ví: Circle Developer-Controlled Wallets (Entity Secret) — giữ nguyên cách v1 đã làm, chỉ đổi sang account Circle mới (account cũ mất entity secret + recovery file).
  - Đăng nhập: email + passkey (Circle Modular Wallets) — giữ nguyên cơ chế v1, chỉ đổi nơi lưu OTP/session từ Supabase Auth sang tự viết trên D1/KV, gửi mail qua Resend (đã setup domain riêng từ v1).
  - Bỏ Supabase Realtime — 2 chỗ v1 đang dùng (danh sách giao dịch, số dư ví) đổi thành fetch lại khi mở màn thay vì tự đẩy real-time.

Với khung chung và với MỖI luồng, trả lời đủ 4 phần:
1. Tech chọn. Ghi tên gói/dịch vụ cụ thể, không nói chung chung kiểu "một database".
2. Vì sao chọn nó. Lý do phải gắn với ĐÚNG chỗ này và ràng buộc của mình ở trên. Không nhận lý do kiểu "phổ biến", "chuẩn ngành", "cộng đồng lớn".
3. Ít nhất 2 thứ khác cũng làm được việc này, kèm lý do loại từng cái. Loại vì gì thì nói thẳng cái đó, đừng bịa phương án dở tệ ra cho có. Nếu thật sự chỉ có 1 lựa chọn khả dụng, hoặc chỗ này không cần tech gì (chỉ là một cái link, một màn hình tĩnh), thì nói thẳng như vậy – đừng nặn cho đủ số. (Với các mục ĐÃ CHỐT SẴN ở trên thì bỏ qua phần "loại phương án khác" — chỉ cần mục 4.)
4. Quyết định này về sau đổi dễ hay khó: đổi lúc nào cũng được, hay đổi là phải làm lại phần lớn? Khó đổi thì nói rõ khó ở chỗ nào.

Mình có quyền nói "luồng này bản đầu chưa làm". Nghe vậy thì ghi lại là CHƯA CHỌN rồi đi tiếp – đừng chọn sẵn tech cho thứ mình chưa định làm.

Bốn việc bắt buộc làm trong lúc đi:
- Có sample app hoặc template chính chủ nào bao được NHIỀU luồng cùng lúc không? Có thì đặt thẳng lên bàn cân: fork nguyên nó vs tự ghép từng mảnh – kèm link, và kèm cái mình MẤT khi fork. (Lưu ý: bản v1 đã fork `circlefin/arc-p2p-payments`, đang giữ nguyên fork đó cho v2, chỉ đổi tầng data — không cần đề xuất fork khác.)
- Cái nào tốn tiền thì nói rõ: free tới mức nào, quá mức đó thì bao nhiêu, có bắt gắn thẻ ngay không.
- Cái nào KHÔNG chạy được trên chain mình chọn, hoặc chạy được nhưng thiếu tính năng, phải cảnh báo ngay lúc đề xuất – đừng để mình cài xong mới biết.
- Cái nào đòi điều kiện môi trường mới chạy được – bắt buộc HTTPS, phải khai báo trước domain trên console của nhà cung cấp, phải xin quyền thiết bị (camera, thông báo), không chạy được trên localhost – nói ngay lúc đề xuất, kèm chỗ phải vào khai báo.

Đi hết rồi thì tổng hợp thành một file duy nhất: bảng stack theo luồng, danh sách thứ cần cài, thứ cần đăng ký tài khoản, mục những chỗ phải khai báo/cấu hình trước khi chạy được, và mục riêng liệt kê các quyết định khó đổi.

Đây là plan sản phẩm của mình (kết quả Vòng 1 vừa xong):
```

*(dán tiếp bản tổng hợp Vòng 1 mà Chat vừa tạo ra)*

---

## Sau khi xong cả 2 vòng

Copy toàn bộ 2 file tổng hợp (Vòng 1 + Vòng 2) mà Chat đưa ra, đem về đây — mình sẽ lưu vào `docs/03-planning-v2.md`. Xong bước này mới qua Bước 4 (Wireframe/layout).
