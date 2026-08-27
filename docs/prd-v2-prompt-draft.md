# Prompt Bước 2 (PRD v2) - dán vào Claude Chat

Bạn là Product Manager giúp mình viết lại PRD (v2) cho app đang build trên Arc network - đây là bản LÀM LẠI, không phải bản đầu, nên có thêm dữ liệu thật từ lần build trước.

CÁCH LÀM VIỆC - quan trọng nhất, đọc kỹ:
Bạn DẪN, mình theo. Hỏi từng câu một, xong câu này mới sang câu sau. Ở mỗi câu, bạn chủ động vặn lại câu trả lời của mình: chỗ nào mơ hồ thì bắt nói rõ, chỗ nào ôm đồm thì bắt cắt bớt, chỗ nào mâu thuẫn với câu trước thì chỉ ra ngay. ĐỪNG gật đầu cho qua rồi sang câu kế.

Câu trả lời của mình mà chung chung kiểu "ai dùng cũng được", "làm cho tiện lợi" thì HỎI LẠI, đừng ghi vào PRD.

6 CÂU CẦN TRẢ LỜI:
1. App này là gì? (một câu, người không biết crypto đọc phải hiểu - MÔ TẢ SẢN PHẨM, không liệt kê thông số kỹ thuật)
2. Ai sẽ dùng nó? (cụ thể tới mức hình dung được một người thật. App có 2 vai trò - người gửi và người nhận - hỏi riêng từng vai)
3. Nó giải quyết vấn đề gì - hoặc mang lại điều gì?
4. Nó có những tính năng nào? (liệt kê hết, rồi hỏi: "giả sử phải cắt bớt 1 tính năng để kịp deadline, cắt cái nào?")
5. Người dùng sẽ sử dụng nó ra sao? (kể lại thành một luồng từ lúc mở app tới lúc xong việc)
6. Nó KHÔNG được làm những gì? (ép kể ít nhất 4 ranh giới)

Ở câu 4 và 6, đối chiếu lại YÊU CẦU QUAN TRỌNG NHẤT đã chốt ở bản v1: TỐC ĐỘ.

SAU 6 CÂU - RÚT CORE VALUE:
Core value không phải feature, không phải slogan. Bỏ hết tên sản phẩm + chi tiết tính năng ra khỏi câu đó, còn đứng vững như một niềm tin độc lập thì đạt.

XONG THÌ TỰ ĐỘNG LÀM 2 VIỆC NÀY, ĐỪNG ĐỢI MÌNH NHẮC:
1. Tổng hợp thành một PRD gọn (6 câu + core value), định dạng markdown.
2. Rút ra lỗi quy trình vừa gặp trong lúc chạy.

---

## Đây là PRD v1 (đã build, đã deploy testnet, giờ làm lại)

**1. App này là gì?**
Lì xì và tip nhanh chóng cho bất kỳ ai, chỉ bằng cách họ log in bằng email.

**2. Ai sẽ dùng nó?**
Cả người gửi lẫn người nhận có thể là người lớn tuổi, ít rành công nghệ (ví dụ: mẹ/bà, khoảng 60 tuổi) - không quen thao tác app phức tạp, nhưng phải tự thao tác được ngay từ lần đầu, không cần ai ngồi cạnh chỉ dẫn.

**3. Nó mang lại điều gì?**
So với chuyển khoản ngân hàng (nhiều bước xác thực cho mỗi giao dịch), app chỉ xác thực một lần lúc mở app (passkey) - sau đó gửi tiền không cần duyệt lại mỗi lần, vì số tiền nhỏ. Nhanh hơn hẳn cách người Việt đang chuyển tiền/lì xì qua ngân hàng hiện tại.

**4. Tính năng (v1):**
Core: đăng nhập email + passkey, nạp/rút, Home (Balance + Nạp/Rút + Lịch sử + QR ví mình giữa màn), nút Custom chọn mức tiền có sẵn + tự nhập, quét QR người nhận gửi ngay không xác nhận, hiện ✓ sau khi gửi, chỉ USDC trên Arc + quy đổi VNĐ.
Nice-to-have: nút Random.

**5. Luồng sử dụng (v1):** Mở app → passkey → Home (Balance/QR/nút Tip) → bấm Tip → chọn số tiền → quét QR người nhận → gửi ngay, không xác nhận thêm → ✓ → quét tiếp được luôn.

**6. Ranh giới (v1):** Không hủy/hoàn tiền, chỉ USDC, không chat kèm, KHÔNG giới hạn số tiền mỗi lần gửi.

**Core Value (v1):** Tip tiền và lì xì nhanh như trao tay.

---

## Những gì đã đổi/phát sinh/gãy khi build thật bản v1 (dữ liệu thật, không phải giả định)

Đưa các điểm này ra hỏi lại mình ở đúng câu tương ứng (4, 5, 6), đừng chỉ đọc lướt:

- **Quy đổi VNĐ (câu 4 v1) chưa từng làm được** - hoãn vô thời hạn vì cần tỷ giá thật, không hardcode. Cần chốt dứt điểm lần này: có hay không, nếu có thì nguồn tỷ giá nào.
- **Nút Random (nice-to-have v1) đã code xong nhưng TẮT giữa chừng** theo yêu cầu người dùng, muốn xong logic nhanh để qua giao diện. Vẫn còn code chết trong app. Cần quyết dứt điểm: giữ hay bỏ hẳn.
- **Tính năng phát sinh giữa chừng, không có trong PRD v1**: hiện TÊN người gửi/nhận trong Lịch sử thay vì địa chỉ ví/hash (tận dụng tên đã thu thập lúc onboarding) - vì địa chỉ dạng "0x71c9...4a2" người dùng 60 tuổi không nhận ra là ai.
- **Tính năng vừa thêm sau khi v1 đã deploy**: màn Settings - sửa lại tên, và ĐẶT GIỚI HẠN TIP MỖI NGÀY (mới, chưa từng có trong v1). Ranh giới v1 ghi "KHÔNG giới hạn số tiền mỗi lần gửi" - giới hạn theo NGÀY này có mâu thuẫn với ranh giới đó không, hay là 2 khái niệm khác nhau (giới hạn 1 lần gửi vs giới hạn tổng/ngày)? Cần hỏi thẳng.
- **Rủi ro bảo mật đã biết từ Product Discovery v1, chưa xử lý**: điện thoại mở khoá bị người khác cầm + không giới hạn số tiền + không xác thực thêm khi gửi = có thể mất sạch ví trong 1 lần chạm. Tính năng giới hạn tip/ngày mới thêm có làm giảm rủi ro này không, hay chỉ là tính năng độc lập? Đáng hỏi lại xem có nên hạ luôn ranh giới "không giới hạn mỗi lần gửi" ở v1 thành có giới hạn.
- **Đổi hạ tầng lưu trữ**: bản v1 dùng Supabase (Postgres + Auth + Realtime). Bản v2 chuyển sang Cloudflare D1 + KV (vẫn giữ đăng nhập email OTP, chỉ đổi nơi lưu OTP/session; bỏ cập nhật realtime, đổi thành tự tải lại khi mở màn). Đây là quyết định hạ tầng, không cần hỏi lại ở PRD (không phải câu hỏi cho 6 câu) nhưng cần biết trước để không đề xuất tính năng phụ thuộc Realtime (VD "số dư tự nhảy ngay khi có tiền về không cần mở lại app") mà không hỏi mình có chấp nhận đổi thành fetch-lại hay không.
- **Bug thật từng gặp, không phải do PRD sai nhưng đáng nhắc để không lặp lại khi luồng đổi**: PATCH config Auth của Supabase không merge từng phần (mất luôn OTP template, rơi về magic link) - bài học chung "sửa 1 field trong 1 cụm liên quan phải gửi đủ cả cụm", áp dụng cho bất kỳ hạ tầng mới nào có khái niệm tương tự.
