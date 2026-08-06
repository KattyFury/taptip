# Bước 1 — Lên ý tưởng

> Kết quả chạy prompt của [`01-ideation/`](../../01-ideation/README.md) với Claude Chat.
> Ngày: 2026-08-06 · Kết luận: **pass cả 4 câu, sẵn sàng qua Bước 2 (PRD)**.

**Ý tưởng: Tip & Lì xì nhanh trên Arc.**

## Câu 0 — Định hướng Arc

Peer-to-peer payments.

## Câu 1 — Thật, và đúng đối tượng

Gửi **tip** (bất cứ lúc nào) và **lì xì** (dịp Tết) — hai hành vi có thật trong đời sống người Việt.

Yêu cầu quan trọng nhất: **tốc độ**.

Người gửi lẫn người nhận đều không cần biết gì về crypto — chỉ đăng nhập bằng email. Người gửi nạp tiền qua on-ramp thường, người nhận có thể off-ramp sau. Ví được tạo tự động phía sau bằng **Circle Wallets (developer-controlled)** — không dùng Privy, vì Privy cần user tự ký, làm chậm giao dịch, ngược mục tiêu tốc độ.

## Câu 2 — Dẫn đầu hay cạnh tranh

Chưa ai làm mảng này trên Arc — quá nhỏ để dự án lớn để ý. Các app tip tương tự ở nước khác (ví dụ Ấn Độ) không gắn với văn hoá lì xì Việt Nam.

**Lợi thế cạnh tranh là tính đặc thù văn hoá, không phải công nghệ.**

## Câu 3 — Khả thi

Đã kiểm chứng qua Arc docs AI chat.

| Hạng mục | Kết quả |
|---|---|
| Ví | Circle Wallets (dev-controlled), tích hợp qua `@circle-fin/adapter-circle-wallets`. Backend giữ API key + entity secret, user không thấy seed phrase. |
| Gas | Arc hỗ trợ ERC-4337 + Paymaster (Biconomy / Pimlico / ZeroDev) — app tự trả gas thay user hoàn toàn. |
| Tốc độ | Finality dưới 1 giây, benchmark thực tế **<350ms** — đủ nhanh cho tip/lì xì. |
| Gas cost | ~$0.01/giao dịch (target), max $0.20 — hợp lý với giao dịch nhỏ $0.50–$20 nếu dùng Paymaster. |
| Off-ramp | Không cần lo trong app — thuộc trách nhiệm Circle ở tầng mainnet. |

**Thứ KHÔNG có sẵn:** không có UI dựng sẵn cho luồng "gửi qua email" — chỉ có hàm `kit.send()` ở tầng SDK. Phần giao diện đăng nhập email + gửi tới email người khác **phải tự build**.

---

## Lỗi quy trình rút ra khi chạy Bước 1

Đã đem sửa vào prompt của `01-ideation/`, chi tiết ở mục *"Prompt này từng hụt chỗ nào"*.

1. **Câu hỏi feasibility gửi vào Arc docs chat phải viết bằng tiếng Anh** — AI docs trả lời chính xác và đầy đủ hơn khi hỏi bằng ngôn ngữ gốc của docs.
2. **Câu hỏi feasibility đầu tiên không được hời hợt.** Hỏi chung chung kiểu "có hỗ trợ X không" thì ra câu trả lời chung chung. Phải hỏi đúng vào cơ chế kỹ thuật cụ thể: tên SDK, tên pattern kiến trúc (account abstraction, Paymaster, gas sponsorship).
3. **Câu trả lời liệt kê nhiều lựa chọn kiến trúc song song thì không được gộp là "cả hai đều được".** Phải đối chiếu ngược lại yêu cầu gốc (ở đây là "nhanh") để loại bớt — các lựa chọn có thể xung đột nhau dù đều khả thi trên giấy.
4. **Sai lầm lớn nhất: AI để người dùng tự dẫn dắt toàn bộ, chỉ ngồi phản ứng lại từng câu trả lời.** Đúng cách là ở mỗi câu 0–3, AI chủ động đặt câu hỏi thách thức, chỉ ra chỗ chưa hợp lý, ép người dùng làm rõ — không đợi người dùng nói hết rồi mới góp ý. Người dùng đến để **được dẫn**, không phải để tự dẫn AI đi theo mình.
5. **Xong câu 3 phải chủ động tổng hợp thành case study** sẵn để đưa vào repo, và chủ động rút lỗi quy trình — không đợi người dùng nhắc hai lần.
