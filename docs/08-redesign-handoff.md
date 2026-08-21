# TapTip – Bàn giao đợt thiết kế lại giao diện

Áp `design_handoff_taptip/` (README + `TapTip Design Recreation.dc.html`) vào code thật trong `example/app/`, kèm 4 điều chỉnh do chủ dự án chốt trực tiếp (mục 2).

**Trạng thái:** `npx tsc --noEmit` sạch · `npm run build` thành công (24 route) · **đã chạy dev server và đo lưới thật bằng Chrome headless** – xem mục 7.

---

## 1. Hệ thiết kế mới

Đổi toàn bộ khỏi hệ Modernist cũ (nền xám `#f3f2f2`, nhấn đỏ `#ec3013`, font Archivo).

| Nhóm | Token | Giá trị |
|---|---|---|
| Nền / chữ | `--background` / `--foreground` | `#ffffff` / `#000000` |
| Nền chìm | `--surface` | `#f5f5f5` |
| Thương hiệu | `--primary` / `--primary-foreground` | `#FFCC00` / `#000000` |
| Nhấn (link, icon, nhãn phụ, caption) | `--accent` | `#0B53BF` |
| Chữ gợi ý | `--hint` | `rgba(0,0,0,.6)` |
| Viền | `--border` | `rgba(0,0,0,.14)` |
| Thành công | `--success` `--success-bg` `--success-fg` | `#16a34a` `#dcfce7` `#166534` |
| Lỗi | `--danger` `--danger-bg` `--danger-fg` | `#dc2626` `#fee2e2` `#991b1b` |
| Chờ | `--warning-bg` `--warning-fg` | `#fef9c3` `#854d0e` |
| Nền ngoài khung | `--page-backdrop` | `#e5e3e1` |
| Lớp tối sau modal | `--scrim` | `rgba(0,0,0,.55)` |

**Chữ:** Nunito 400/700/800 cho mọi thứ; **Comfortaa 400/700 chỉ cho con số** (số dư, số tiền, ngày, giờ, chữ số OTP) – class `font-num`. Comfortaa hết nấc ở 700, không có 800.

**Bo góc:** chỉ 2 mức – `rounded-xl` = 12px (thẻ, modal, ô nhập, khối) và `rounded-full` (nút, chip). `rounded-md`/`rounded-lg` đều được map về 12px để primitive shadcn tự rơi vào đúng mức, không phải sửa từng call-site.

**Đổ bóng:** 4 token – `shadow-btn` (nút/thẻ nổi), `shadow-modal`, `shadow-popover` (toast xử lý/thành công), `shadow-field` (lõm vào trong, cho ô nhập).

**Modal:** lớp phủ 2 tầng – màng trắng 50% rồi đen 55% chồng lên.

Tất cả nằm ở [app/globals.css](../app/globals.css), có ghi 6 quy định dùng chung ngay đầu file.

---

## 2. Bốn điều chỉnh so với bản handoff (theo chốt trực tiếp)

### 2.1 Lưới màn onboarding đổi mốc

Bản handoff để khối nội dung căn giữa vùng 1→6. Nay:

```
0.0 → 1.0    đệm trên              flex "1 1 0"
1.0 → 2.5    icon + tiêu đề        flex "1.5 1 0"   ← bám đỉnh vạch 1.0
2.5 → 8.0    nội dung              flex "5.5 1 0"   ← bám đỉnh vạch 2.5
8.0 → 9.0    hàng nút hành động    flex "1 1 0"
9.0 → 10.0   hàng phụ (Skip / lỗi) flex "1 1 0"
```

Cả hai khối đều `justify-start` để bắt đầu **đúng** tại vạch, không căn giữa. Định nghĩa **một chỗ duy nhất** ở [components/screen.tsx](../app/components/screen.tsx) – 6 màn dùng chung, sửa lưới chỉ sửa file đó.

### 2.2 Màn OTP: email là tiêu đề, không phải chữ phụ

`Enter the code sent to` xuống dòng rồi `alice@gmail.com` – **cùng cỡ tiêu đề (28px/800)**, chỉ khác màu xanh `--accent` cho dễ đọc. Bản handoff để email là dòng phụ 21px/700.

### 2.3 Icon menu ở Home: góc trái-dưới, vạch 9.5

Hàng 9→10 đổi từ `justify-center` (kèm `margin-left:-40px` hack) sang `justify-start` + `items-center` → tâm dọc đúng vạch 9.5, sát mép trái. Nằm đè lên mảng tròn vàng trang trí (`z-10` trên `z-0`).

### 2.4 Icon lấy từ `D:\Files\Claude\icon-storage`

Toàn bộ icon inline hoá vào [components/icons.tsx](../app/components/icons.tsx) – 16 icon, viewBox 100×100, `stroke-width:10`, `currentColor`. Bộ này khớp đúng SVG trong prototype nên không lệch nét vẽ.

| Dùng ở | File nguồn |
|---|---|
| Add to Home, "Enter a different amount" | `add.svg` |
| Đăng nhập email | `signin.svg` |
| Nhập OTP | `mail.svg` |
| Tạo username | `human2.svg` |
| Passkey | `faceid.svg` |
| Nút Random | `dice.svg` |
| Nút Tip | `out.svg` |
| Menu ☰ | `menu.svg` |
| Quay lại | `back.svg` |
| Xoá mức tiền, đóng chi tiết GD | `cancel.svg` |
| Tải ảnh từ thư viện | `image.svg` |
| Đang xử lý (có `animate-spin`) | `loading.svg` |
| Gửi thành công | `check.svg` |
| Huy hiệu nhận / gửi | `down.svg` / `up.svg` |
| Báo lỗi | `warning.svg` |

**Quy định:** mọi icon phải lấy từ `icons.tsx`. Không import `lucide-react` nữa trong luồng TapTip.

---

## 3. Đơn vị chữ – điểm kỹ thuật quan trọng

Code cũ dùng `vh`. Sai khi cửa sổ trình duyệt cao hơn 932px: khung bị cap ở 932 nhưng `vh` vẫn tăng → chữ phình to hơn lưới.

Nay khung điện thoại có class `.tt-frame` đặt `container-type: size`, và thang chữ tính bằng **`cqh` = 1% chiều cao khung**:

| Token | Giá trị | Quy từ bản thiết kế 932px |
|---|---|---|
| `text-title` | `3cqh` | 28px |
| `text-lead` | `2.25cqh` | 21px |
| `text-body` | `1.82cqh` | 17px |
| `text-small` | `1.5cqh` | 14px |
| `text-figure` | `4.94cqh` | 46px (số dư) |

**Luật:** màn toàn khung dùng thang `cqh` ở trên; **trong modal dùng px cố định** như bản thiết kế – modal là thẻ tự co theo nội dung, không nằm trong lưới 10 hàng.

---

## 4. File đã đụng

**Mới:**
- `components/icons.tsx` – bộ icon
- `components/screen.tsx` – lưới 10 hàng + `PrimaryButton` / `IconButton` / `SingleAction` / `BackAction` / `TextLink` / `Field`
- `components/ui/status-pill.tsx` – `StatusPill` + `DirectionBadge`
- `components/transaction-detail.tsx` – thẻ chi tiết GD, dùng chung cho modal và trang riêng
- `public/logo-full.svg` – chữ ký TapTip cho màn splash

**Viết lại:** `app/globals.css` · `app/layout.tsx` · `app/page.tsx` · `sign-in` · `code-confirmation` · `onboarding` · `passkey-setup.tsx` · `home-screen.tsx` · `send-flow.tsx` · `transactions.tsx` · `transaction/[id]/page.tsx` · `ui/button.tsx` · `ui/input.tsx` · `ui/input-otp.tsx` · `ui/dialog.tsx` · `ui/sonner.tsx` · `transactions-tab.tsx`

**Sửa nhỏ:** `(auth-pages)/layout.tsx` · `dashboard/layout.tsx` · `app/manifest.ts` · `ui/pagination.tsx`

---

## 5. Thay đổi về hành vi / cấu trúc

- **Chi tiết giao dịch giờ là modal** nổi trên Lịch sử tip, đúng bản thiết kế. Không cần gọi API riêng – dữ liệu đã có sẵn trong dòng danh sách. Route `/dashboard/transaction/[id]` vẫn còn cho link trực tiếp, và **dùng chung** component `TransactionDetail` nên hai chỗ không thể lệch nhau.
- **Bỏ dark mode.** Đã xoá `ThemeProvider` và block `.dark` (vốn còn nguyên bảng xanh dương của sample app và không bật được). `sonner` đặt cứng `theme="light"`.
- **Bỏ sạch `alert()`** ở màn đăng nhập và OTP – lỗi giờ hiện inline ở hàng 9-10, thống nhất với các màn khác.
- **Padding cạnh gom về một mức.** Xoá `mt-[66px]` ở layout auth (pixel cứng, làm "10 hàng" của màn auth lệch thang đo so với Home). Giờ layout **chỉ đặt `px-5`**, không màn nào có padding dọc – lưới 10 hàng của mọi màn đều neo đúng đỉnh 0 / đáy 10 của khung (xem mục 7.2).
- **Sửa lỗi hook có sẵn** ở `code-confirmation`: `useState` nằm sau một `return` có điều kiện – vi phạm Rules of Hooks, sẽ crash khi `email` rỗng rồi có. Đã đưa hook lên trước.
- Modal Lịch sử tip **bỏ header "Activity" + nút logout** (không có trong bản thiết kế, và trông sai khi nằm trong modal).

---

## 6. Ba chỗ chệch bản thiết kế – cần chốt

1. **Nút "Sign out"** – bản thiết kế không có chỗ nào đăng xuất, mà đây là lối ra duy nhất của app. Đang để tạm làm link chữ xám dưới "Close" trong menu. Cần designer chốt chỗ chính thức.
2. **"Skip for now" ở màn Passkey** – có trong bản thiết kế, đã làm, trỏ về `/dashboard`. Nhưng `dashboard/page.tsx` thấy chưa có ví sẽ đá ngược lại `/dashboard/setup-wallet` → bấm Skip hiện tại **sẽ quay vòng**. Muốn Skip chạy thật thì phải sửa logic điều hướng ví, không phải việc của giao diện.
3. **Cỡ tiêu đề màn Passkey** – bản thiết kế ghi 24px trong khi 5 màn kia 28px. Đã thống nhất về 28px cho cả 6 màn. Muốn giữ 24px thì báo.

---

## 7. Kết quả đo lưới thật

Chạy `next dev` với env giả (Supabase/Circle placeholder – các màn onboarding và Home không cần gọi API thật), rồi dựng một route tạm `/preview` để đo `getBoundingClientRect()` từng khối, quy ra đơn vị hàng. Route tạm **đã xoá** sau khi đo xong.

**Khung `<Screen>` (6 màn onboarding) – khớp tuyệt đối:**

```
[0] 0.00 -> 1.00   đệm trên
[1] 1.00 -> 2.50   icon + tiêu đề
[2] 2.50 -> 8.00   nội dung
[3] 8.00 -> 9.00   hàng nút
[4] 9.00 -> 10.00  hàng phụ
h1 font-size = 25.11px  (= 3cqh của khung cao 837px; ra đúng 28px ở khung 932px)
```

**Màn Home – khớp tuyệt đối, icon menu đúng vạch 9.5:**

```
[0] 0.00 -> 1.00   số dư
[1] 1.00 -> 1.50   đệm
[2] 1.50 -> 4.50   QR
[3] 4.50 -> 4.75   đệm
[4] 4.75 -> 5.75   chú thích
[5] 5.75 -> 8.00   khoảng trống
[6] 8.00 -> 9.00   nút Random + Tip
[8] 9.00 -> 10.00  hàng menu
MENU centerY = 9.50   left = 20px   size = 25px (= 3cqh)
```

### Ba lỗi thật tìm ra nhờ đo, đã sửa

1. **Nút không hiện chữ.** `PrimaryButton` / `IconButton` / `TextLink` destructure `children` ra khỏi props rồi chỉ spread `{...props}` vào `<button />` – `children` bị rơi mất. Nút "Continue", "Skip", mũi tên Quay lại đều render thành ô rỗng. Đã trả `{children}` vào trong thẻ.
2. **Home lệch lưới, menu rơi về vạch 9.32.** Container lưới có `pb-4` (theo prototype gốc). Padding ăn vào chiều cao → 10 hàng không còn chia trọn khung. Đã bỏ `pb-4`; đây là **chệch có chủ ý so với prototype** để lưới neo đúng đỉnh 0 / đáy 10 theo yêu cầu.
3. **Toaster nằm trong container căn giữa.** `sonner` render một `<section>` tham gia layout; để nó làm con của flex căn giữa thì nó ăn mất một phần bề ngang. Đã tách ra ngoài, khung điện thoại được bọc trong div căn giữa riêng.

> Lưu ý khi tự chụp lại: Chrome headless trên Windows ép `innerWidth` tối thiểu **500px**, `--window-size=430` không cho viewport 430. Chụp ở `--window-size=520,940` thì khung 430 nằm giữa, không bị cắt.

Đã xem ảnh chụp thật của: Add to Home, Sign in, Home, modal menu "Balance & Wallet", modal "Choose an amount". Màu/font/bo góc/đổ bóng/scrim đều đúng bản thiết kế.

---

## 8. Chưa kiểm tra được với dữ liệu thật

Các màn còn lại (Lịch sử tip, chi tiết giao dịch, luồng gửi sau khi quét) cần dữ liệu ví thật. Máy này **không có `.env.local`** – file bị gitignore, không theo repo về. Quét cả cây `build_on_arc` không thấy. Thư mục recovery Circle entity-secret `C:\tmp\taptip-entity-secret-recovery2` cũng đã bị dọn mất.

Nên chỉ verify được tới mức: typecheck sạch, build production thành công, và CSS build ra có đủ token (`#fc0`, `#0b53bf`, `container:screen/size`, `3cqh`, `4.94cqh`, `shadow-btn`, `font-num`, `tt-caret`).

**Muốn xem thật cần:**
1. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` – lấy lại từ Supabase dashboard
2. `CIRCLE_API_KEY`, `NEXT_PUBLIC_CIRCLE_CLIENT_KEY` – lấy lại từ Circle console
3. `CIRCLE_ENTITY_SECRET` – mất recovery file thì phải đăng ký entity secret mới bên Circle

Có `.env.local` rồi thì `npm run dev`, sau đó chụp từng màn:

```bash
chrome.exe --headless=new --disable-gpu --hide-scrollbars \
  --window-size=430,932 --screenshot="C:/tmp/shot.png" \
  --virtual-time-budget=8000 "http://localhost:3000/<route>"
```

Chụp ở đúng 430×932 để `cqh` khớp 1:1 với bản thiết kế gốc.

---

## 9. Lưu ý khi sửa tiếp

Ba luật lưới **giữ nguyên**, đã ghi đầy đủ trong docblock đầu [components/screen.tsx](../app/components/screen.tsx):

1. Neo theo tỷ lệ, không hardcode pixel cho chiều dọc.
2. Chia hàng bằng `style={{ flex: "N 1 0" }}`, **không** dùng class `flex-[N]` – Tailwind v4 trong repo này không build class đó ra CSS. Số `0` cuối bắt buộc.
3. Không đặt `padding` trên phần tử hàng – cho con cao theo `%` thay vì.

Hàng nhiều nút cần `minWidth: 0` trên cả hàng lẫn từng nút.

Ngoài ra: đừng viết màu trực tiếp trong component (`text-green-600`, `#fff`…) – thêm token vào `globals.css` trước rồi mới dùng.

> Tài liệu [08-design-spec-hien-trang.md](08-design-spec-hien-trang.md) mô tả giao diện **trước** đợt này, giờ đã lỗi thời.
