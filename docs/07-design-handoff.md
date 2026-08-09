# Bàn giao Giai đoạn 2 (Giao diện) — TapTip

Giai đoạn 1 xong: toàn bộ logic/flow chạy đúng, UI để mộc. Tài liệu này là gói bàn giao cho bước làm giao diện.

## Sản phẩm là gì

**TapTip** — app tip & lì xì bằng USDC trên Arc Testnet. Mobile PWA (thêm vào màn hình chính), người dùng chính là **người lớn tuổi ~60 tuổi, không rành công nghệ**, phải tự thao tác được ngay lần đầu.

Core value: *Tip tiền và lì xì nhanh như trao tay.*

Spec đầy đủ: [`02-hoan-thien-y-tuong.md`](02-hoan-thien-y-tuong.md) (PRD) · [`03-planning.md`](03-planning.md) (quyết định UX/bảo mật) · [`04-wireframe.md`](04-wireframe.md) (hệ lưới + từng màn).

## Stack

Next.js (App Router) + TypeScript + **Tailwind CSS v4** + shadcn/ui + Supabase + Circle Modular Wallets.

## 🔴 3 luật kỹ thuật BẮT BUỘC giữ khi làm giao diện

Đây là 3 thứ đã tốn rất nhiều thời gian mới tìm ra — đổi bừa là vỡ layout ngay.

1. **Hệ lưới 10 hàng neo theo tỷ lệ, không dùng pixel cố định.** Mỗi hàng = 10% chiều cao màn hình. Người dùng có màn hình đủ kích cỡ, hardcode px là vỡ.
2. **Chia hàng phải dùng `style={{ flex: "N 1 0" }}`, KHÔNG dùng class `flex-[N]`.** Tailwind v4 **không build** class `flex-[1.5]`/`flex-[3]` thành CSS (đã kiểm chứng bằng cách đọc file CSS build ra) → đặt tỷ lệ mà layout không nhích. Số `0` cuối (flexBasis) cũng bắt buộc: chỉ `flexGrow` thì trình duyệt chỉ chia phần *dư* sau khi trừ nội dung, hàng nào nội dung to sẽ tự chiếm nhiều hơn phần của nó.
3. **Không đặt `padding` trên phần tử hàng.** Padding là kích thước tối thiểu không co được → bị cộng thêm ngoài phần chia tỷ lệ, làm phình hàng đó và đẩy lệch toàn bộ các hàng khác. Muốn khoảng thở thì cho phần tử con cao theo `%` (VD nút `h-[80%]` + hàng `items-center`).

Chữ và icon cũng nên dùng `vh` (`text-[4.5vh]`, `h-[2vh]`) để co theo chiều cao hàng.

## Cách tự kiểm tra layout (đừng đoán bằng mắt)

Máy có sẵn Chrome, chạy headless để tự chụp và tự đo:

```bash
# Chụp ảnh (đọc lại bằng tool Read)
chrome.exe --headless=new --disable-gpu --hide-scrollbars \
  --window-size=560,932 --screenshot="C:/tmp/shot.png" \
  --virtual-time-budget=8000 "http://localhost:3000/<route>"

# Đo chính xác: tạo route tạm render component + client component chạy
# getBoundingClientRect() cho từng con của [data-home-root], quy ra đơn vị
# "hàng", in vào <pre id="measurements">, rồi --dump-dom và parse bằng node
```

`HomeScreen` đã có sẵn `data-home-root` trên container để script đo bám vào. Chi tiết đầy đủ ở `HANDOFF.md` mục 4.8.

## Các màn cần làm giao diện

| Màn | File | Trạng thái |
|---|---|---|
| Đăng nhập (nhập email) | `app/(auth-pages)/sign-in/page.tsx` | Đã theo lưới, chưa trau chuốt |
| Nhập mã OTP 6 số | `app/(auth-pages)/code-confirmation/page.tsx` | Đã theo lưới, chưa trau chuốt |
| Tạo hồ sơ (tên) | `app/(auth-pages)/onboarding/page.tsx` | **Còn nguyên style sample app** |
| Thiết lập Passkey | `components/passkey-setup.tsx` | Đã theo lưới, chưa trau chuốt |
| **Home** (Balance + QR + Tip/Ngẫu nhiên + menu) | `components/home-screen.tsx` | ✅ Đã khớp lưới chính xác — **giữ nguyên tỷ lệ**, chỉ đổi màu/font/bo góc |
| Luồng gửi (chọn tiền → quét QR → loading → xong) | `components/send-flow.tsx` | Chạy đúng, giao diện thô |
| Lịch sử giao dịch | `components/transactions.tsx` | **Còn nguyên style sample app** |
| Chi tiết giao dịch | `app/dashboard/transaction/[id]/page.tsx` | **Còn nguyên style sample app** |

## Lưu ý nội dung (không phải thẩm mỹ)

- **Toàn bộ chữ hiển thị phải là tiếng Việt.** Vài màn còn sót tiếng Anh từ sample app (onboarding, lịch sử, chi tiết giao dịch).
- Lịch sử: nhóm theo **ngày**, số tiền **đỏ khi gửi / xanh khi nhận**, hiện **tên người** thay vì địa chỉ ví nếu có.
- Nút **"Ngẫu nhiên" đang bị tắt (disabled)** theo yêu cầu — giữ nguyên trạng thái tắt, logic làm sau.
- Số tiền đang hiển thị thẳng bằng USDC. PRD có nhắc quy đổi VNĐ — **chưa làm**, cần tỷ giá thật, không hardcode.

## Code dư từ sample app (chưa xoá, không thuộc luồng TapTip)

Không cần làm giao diện cho mấy thứ này, và có thể xoá nếu chắc chắn không dùng:

- `components/copy-button.tsx`, `components/theme-switcher.tsx` — không nơi nào gọi.
- `app/(auth-pages)/forgot-password/`, `app/dashboard/reset-password/` — luồng mật khẩu, TapTip không có mật khẩu.
- `app/auth/callback/route.ts` + `app/api/wallet-set/`, `app/api/wallet/` — nhánh Developer-Controlled Wallets, TapTip dùng Modular Wallets (passkey) nên không đi qua đây.
- `app/api/webhooks/circle/route.ts` — có lỗi type sẵn từ sample app gốc (dòng 232), làm `npm run build` fail; `npm run dev` vẫn chạy bình thường. Cần sửa trước khi deploy production.
