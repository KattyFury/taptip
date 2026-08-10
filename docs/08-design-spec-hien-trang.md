# TapTip — Spec thiết kế hiện tại

Mô tả giao diện đang chạy trong `example/app/`. Mọi giá trị đọc trực tiếp từ code.

---

## 1. Sản phẩm

**TapTip** — app tip/lì xì bằng USDC trên **Arc Testnet**. Mobile-first PWA (`display: standalone`), người dùng mục tiêu là người lớn tuổi ~60, không rành công nghệ.

Luồng chính: mở app → bấm Tip → chọn số tiền → quét QR người nhận → xong. Không có bottom nav, không có header, không có màn cài đặt. Mọi chức năng phụ nằm trong popup sau icon ☰ ở góc dưới trái.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · lucide-react · sonner · Supabase (auth) · Circle Modular Wallets (passkey).

---

## 2. App shell

`app/layout.tsx`:

| Lớp | Class |
|---|---|
| `<html lang>` | `en` |
| `<body>` | `bg-background/5 text-foreground flex items-center justify-center min-h-svh overflow-hidden` |
| Khung điện thoại | `relative w-full max-w-[430px] h-screen max-h-[932px] flex flex-col bg-background shadow-xl overflow-hidden` |
| `<main>` | `flex-1 flex flex-col items-center overflow-hidden` |
| Provider | `Web3Provider` → `BalanceProvider` → `ThemeProvider` |
| Theme | `attribute="class"`, `defaultTheme="light"`, `enableSystem={false}` |
| Toast | `<Toaster expand />` (sonner) |

Trên desktop app hiện ra như một chiếc điện thoại 430×932 căn giữa có đổ bóng, nền ngoài khung là `--background` ở 5% opacity. Trên mobile khung chiếm trọn màn hình.

Padding cạnh do từng nhóm route tự đặt:

| Route | Padding |
|---|---|
| `app/(auth-pages)/layout.tsx` | `px-5 pb-5 mt-[66px]` |
| `app/dashboard/layout.tsx` | `px-5 pb-4` |
| `app/page.tsx` (splash) | `px-5` |
| `transaction/[id]/page.tsx` | thêm `p-4` chồng lên `px-5 pb-4` của layout cha |

---

## 3. Design tokens

`app/globals.css`, ánh xạ sang Tailwind v4 qua `@theme inline`.

### 3.1 Màu (light)

| Token | Giá trị | Dùng ở |
|---|---|---|
| `--background` | `#f3f2f2` | nền app |
| `--foreground` | `#201e1d` | chữ chính |
| `--primary` | `#ec3013` | nút chính, icon nhấn, ring focus |
| `--primary-foreground` | `#ffffff` | chữ trên nút chính |
| `--card` `--secondary` `--muted` `--accent` | `#eae9e9` | nền phụ, nút Random, hover ghost |
| `--muted-foreground` | `#201e1d` @ 60% | chữ phụ, caption |
| `--border` `--input` | `#201e1d` @ 14% | viền |
| `--destructive` | `#ec3013` | giống hệt `--primary` |
| `--ring` | `#ec3013` | vòng focus |

Bốn màu gốc hệ Modernist: nền `#f3f2f2` · chữ `#201e1d` · nhấn `#ec3013` · bề mặt `#eae9e9`.

Ngoài token, các màu sau được dùng trực tiếp bằng class Tailwind:

| Chỗ | Class |
|---|---|
| Số tiền nhận | `text-green-600` |
| Số tiền gửi | `text-red-600` |
| Icon thành công | `text-green-500` |
| Lỗi inline | `text-red-600` |
| Badge Complete | `bg-green-100 text-green-800` |
| Badge Pending | `bg-yellow-100 text-yellow-800` |
| Badge Failed | `bg-red-100 text-red-800` |
| Badge khác | `bg-gray-100 text-gray-800` |
| Hover dòng lịch sử | `hover:bg-gray-50` / `dark:hover:bg-white/5` |
| Nền thẻ QR | `bg-white` |
| Nền khung camera | `bg-black` |
| Nền lớp phủ dialog | `bg-black/55` |

### 3.2 Màu (dark)

Block `.dark` giữ bảng xanh dương/slate: `--background: hsl(222.2 84% 4.9%)`, `--foreground: hsl(210 40% 98%)`, `--primary: hsl(217.2 91.2% 59.8%)`, `--border: hsl(217.2 32.6% 17.5%)`… Không kích hoạt được vì `enableSystem={false}` + `defaultTheme="light"`, và `theme-switcher.tsx` không nơi nào render.

### 3.3 Font

**Archivo** (`next/font/google`), subsets `latin` + `vietnamese`, nạp **2 weight: 400 và 800**.
`--font-body` = `--font-heading` = Archivo. Không có font thứ hai.
`@layer base` đặt `h1..h6 { font-family: var(--font-heading); font-weight: 800 }`.

Vì chỉ có 400 và 800, các class weight trung gian render theo luật font-matching của CSS: `font-medium` (500) → **400**; `font-semibold` (600) → **800**; `font-bold` (700) → **800**. Thực tế app có 2 độ đậm.

### 3.4 Bo góc

| Token | Công thức | Giá trị thật |
|---|---|---|
| `--radius` | — | `0rem` |
| `--radius-sm` | `calc(0 - 4px)` | âm, trình duyệt bỏ qua → **0** |
| `--radius-md` | `calc(0 - 2px)` | âm → **0** |
| `--radius-lg` | `var(--radius)` | **0** |
| `--radius-xl` | cố định, không theo `--radius` | **12px** |

Ba mức bo góc thực tế:

1. **0** — input, ô OTP, nút mặc định shadcn (`rounded-md` → 0), badge (bị ép `rounded-none`), khối lỗi passkey.
2. **12px** (`rounded-xl`) — thẻ QR, khung camera, dialog, thẻ tóm tắt giao dịch, khối `<details>`.
3. **Pill 999px** (`rounded-full`) — nút hành động chính, chip gợi ý email, Badge base.

Nút chính bo pill là ngoại lệ có chủ đích so với Modernist gốc (radius 0), để dễ nhắm chạm.

### 3.5 Đơn vị

Màn full-screen dùng `vh` cho chữ và icon. Bên trong dialog dùng thang cố định của Tailwind (`text-sm`, `h-4 w-4`…).

---

## 4. Hệ lưới 10 hàng

Chiều dọc mỗi màn chia **10 hàng bằng nhau**, mỗi hàng = 10% chiều cao khung. Ba luật kỹ thuật:

1. **Neo theo tỷ lệ, không hardcode pixel.** Dùng `%`, `vh`, `vw`, `flex`. Chữ và icon cũng theo `vh` (`text-[4.5vh]`, `h-[2vh]`).

2. **Chia hàng bằng `style={{ flex: "N 1 0" }}`, không dùng class `flex-[N]`.** Tailwind v4 trong repo này không build `flex-[1.5]`/`flex-[3]` ra CSS. Số `0` cuối (flexBasis) bắt buộc — nếu chỉ có `flexGrow` thì trình duyệt chỉ chia phần dư sau khi trừ kích thước nội dung, hàng chứa nội dung to (QR) sẽ chiếm nhiều hơn phần của nó.

3. **Không đặt `padding` trên phần tử hàng.** Padding là kích thước tối thiểu không co được, bị cộng thêm ngoài phần chia tỷ lệ, làm phình hàng và lệch cả lưới. Muốn khoảng thở thì cho con cao theo `%` (nút `h-[80%]` + hàng `items-center`).

Hàng chứa nhiều nút cần `minWidth: 0` trên cả hàng lẫn từng nút — mặc định flex item có `min-width: auto` khiến hàng không co ngang được và tràn lề.

### 4.1 Mẫu A — màn một việc

Dùng ở: splash/add-to-home, sign-in, OTP, onboarding, passkey.

```
hàng 0–1   flex "1 1 0"    đệm trên
hàng 1–6   flex "5 1 0"    nội dung — flex-col items-center justify-center
                           w-full max-w-xs mx-auto gap-4
hàng 6–9   flex "3 1 0"    đệm dưới
hàng 9–10  flex "1 1 0"    nút hành động — items-center
```

Nút hành động một mình: `w-2/3 mx-auto h-[80%] rounded-full text-lg font-semibold`.
Hàng hai nút: hàng `flex gap-2 items-center` + `minWidth: 0`; nút phụ `flex "1 1 0"` (outline, chỉ icon), nút chính `flex "2 1 0"`.

### 4.2 Mẫu B — Home

`components/home-screen.tsx`, container có `data-home-root`.

| Hàng | flex | Nội dung |
|---|---|---|
| 0.00 – 1.00 | `1 1 0` | Số dư |
| 1.00 – 1.50 | `0.5 1 0` | đệm |
| 1.50 – 4.50 | `3 1 0` | QR, vuông theo chiều cao hàng |
| 4.50 – 4.75 | `0.25 1 0` | đệm sát QR |
| 4.75 – 5.75 | `1 1 0` | caption |
| 5.75 – 8.00 | `2.25 1 0` | khoảng trống |
| 8.00 – 9.00 | `1 1 0` | 2 nút hành động, cao 80% |
| 9.00 – 10.00 | `1 1 0` | icon ☰ |

Tổng = 10.

---

## 5. Component

shadcn/ui, phần lớn nguyên bản.

| Component | File | Chi tiết |
|---|---|---|
| `Button` | `ui/button.tsx` | Base `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium` + ring focus + `disabled:opacity-50 disabled:pointer-events-none`. Variant: `default` (`bg-primary text-primary-foreground hover:bg-primary/90`), `destructive`, `outline` (`border border-input bg-background hover:bg-accent`), `secondary`, `ghost` (`hover:bg-accent`), `link`. Size: `default` (`h-10 px-4 py-2`), `sm` (`h-9 px-3`), `lg` (`h-11 px-8`), `icon` (`h-10 w-10`). Nút pill phải tự thêm `rounded-full` ở call-site. |
| `Input` | `ui/input.tsx` | `h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm`, placeholder `text-muted-foreground`, focus `ring-2 ring-ring ring-offset-2`. |
| `InputOTP` | `ui/input-otp.tsx` | Container `flex items-center gap-2`. Ô `h-10 w-10 border-y border-r border-input text-sm`, ô đầu bo trái, ô cuối bo phải, ô đang gõ `z-10 ring-2 ring-ring`. Con trỏ giả `h-4 w-px bg-foreground animate-caret-blink`. Separator là icon `Dot`. |
| `Dialog` | `ui/dialog.tsx` | Overlay `fixed inset-0 z-50 bg-black/55` + fade. Content `fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] grid w-[calc(100%-40px)] max-w-lg gap-4 border bg-background p-6 shadow-lg rounded-xl`, animate fade + zoom 95% + slide. Nút ✕ `absolute right-4 top-4` icon `h-4 w-4`. Title `text-lg font-semibold leading-none tracking-tight`. Header `flex flex-col space-y-1.5 text-center sm:text-left`. |
| `Badge` | `ui/badge.tsx` | Base `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold`. Cả hai nơi dùng đều ghi đè `rounded-none`. |
| `Toaster` | `ui/sonner.tsx` | Bám token: `bg-background text-foreground border-border shadow-lg`, description `text-muted-foreground`, actionButton `bg-primary`. |
| `Skeleton` | `ui/skeleton.tsx` | Dùng ở lịch sử và chi tiết giao dịch. |

Icon toàn bộ từ `lucide-react`. Cỡ theo `vh` ở màn full-screen (`h-[1.8vh]`, `h-[2.2vh]`, `h-[3.5vh]`, `h-[8vh]`, `h-[16vh]`), theo px trong dialog (`h-4 w-4`, `h-10 w-10`, `h-16 w-16`).

Component tồn tại nhưng không nơi nào import: `copy-button.tsx`, `theme-switcher.tsx`, và phần lớn `ui/` (table, pagination, dropdown-menu, command, popover, radio-group, checkbox, switch, tabs, avatar, card, tooltip, alert-dialog, toast, toaster).

---

## 6. Từng màn

### 6.1 Splash — `app/page.tsx`

Container `flex flex-col h-full px-5`, cụm `flex-1 items-center justify-center gap-4`:
- `<img src="/logo.png" className="h-[16vh] w-[16vh] object-contain">`
- `<h1 className="text-3xl font-bold">TapTip</h1>`

Tự chuyển sang Add-to-Home sau **1600ms**. Không có nút.

### 6.2 Add to Home Screen — `app/page.tsx`

Lưới mẫu A, container `px-5`, cụm nội dung `max-w-xs gap-6`.

- H1 `text-2xl font-bold text-center` — "Add TapTip to Home Screen"
- Mô tả `text-muted-foreground text-center` — "Opens as fast as a real app, no need to go back through the browser."
- 4 dòng `flex items-center gap-3`, icon `h-[3.5vh] w-[3.5vh] text-primary shrink-0` + `<span className="text-sm">`:

| Icon | Chữ |
|---|---|
| `MoreHorizontal` | Tap the options menu |
| `Share` | Tap the Share icon in Safari |
| `SquarePlus` | Choose "Add to Home Screen" |
| `CheckCircle2` | Tap "Add" to finish |

- Nút hàng 9: **Continue** → `/sign-in`

### 6.3 Đăng nhập email — `app/(auth-pages)/sign-in/page.tsx`

Lưới mẫu A.

- H1 `text-2xl font-bold text-center` — "Enter your email to get started"
- `Input type="email" placeholder="Email" className="text-center"`
- **Chip gợi ý domain** — hiện khi đã gõ phần trước `@` và email chưa khớp `/^\S+@\S+\.\S+$/`. Hai chip `@gmail.com`, `@icloud.com`, container `flex flex-wrap gap-2 justify-center`, mỗi chip `text-sm px-3 py-1 border rounded-full text-muted-foreground hover:bg-accent`, hiển thị đầy đủ `{phần đã gõ}{domain}`. Bấm là điền luôn vào ô.
- Nút hàng 9: **"Send OTP"**, loading đổi thành **"Sending..."**, disabled khi email không hợp lệ hoặc đang gửi
- Lỗi: `alert()` của trình duyệt

### 6.4 Nhập mã OTP — `app/(auth-pages)/code-confirmation/page.tsx`

Lưới mẫu A.

- H1 `text-2xl font-bold text-center` — "Enter the code sent to"
- Dòng email `text-muted-foreground text-center`
- `InputOTP maxLength={6}` autofocus, chia **3 ô — Dot — 3 ô**
- Lỗi inline: `<small className="text-sm text-red-600 font-medium leading-none text-center">`
- Hàng 9 hai nút: ← `variant="outline"` `flex "1 1 0"` `h-[80%] rounded-full` (chỉ icon `ArrowLeft h-4 w-4`) + **"Continue"** `flex "2 1 0"` `h-[80%] rounded-full text-lg font-semibold`, loading đổi thành **"Verifying..."**, disabled khi mã ≠ 6 số
- Sau verify: có profile → `/dashboard`, chưa có → `/onboarding`

### 6.5 Tạo hồ sơ — `app/(auth-pages)/onboarding/page.tsx`

Lưới mẫu A.

- H1 `text-2xl font-bold text-center` — "Create your profile"
- `Input placeholder="Your name" className="text-center"`
- Nút hàng 9: **"Continue"**, loading đổi thành **"Saving..."**, disabled khi tên rỗng

### 6.6 Thiết lập Passkey — `components/passkey-setup.tsx`

Route `/dashboard/setup-wallet`. Lưới mẫu A.

- Icon `ScanFace h-[8vh] w-[8vh] text-primary`
- H2 `text-xl font-semibold text-center` — "Set Up Passkey"
- Mô tả `text-muted-foreground text-center` — "Sign in with Face ID / fingerprint instead of a password. Next time you open the app, this is all you need, nothing to remember."
- Lỗi: khối `bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm text-center`
- Nút hàng 9: **"Enable passkey"**, loading đổi thành **"Setting up..."**
- Không có nút bỏ qua

### 6.7 Home — `components/home-screen.tsx`

Lưới mẫu B. Container ngoài `px-5 pb-4`.

| Vùng | Chi tiết |
|---|---|
| **Số dư** | `text-[4.5vh] font-bold text-center` — `Balance: {n} USDC`, 2 chữ số thập phân, bằng 0 thì hiện `0` |
| **QR** | Thẻ `bg-white rounded-xl border p-[1.5vh]`, `style={{ height: "100%", aspectRatio: 1 }}`; bên trong `QRCodeSVG size={260} className="w-full h-full"`. Chưa có ví → khung `border rounded-xl` rỗng, chữ "Creating wallet..." `text-[1.8vh] text-muted-foreground text-center px-4` |
| **Caption** | `text-[1.8vh] text-muted-foreground text-center px-8` — "Let others scan this to send you a tip - only receives USDC on Arc Testnet" |
| **Nút trái** | **Random** — `variant="secondary"` `flex "1 1 0"` `h-[80%] rounded-full text-[1.6vh] px-[2vw] gap-1`, icon `Shuffle h-[1.8vh] shrink-0`, **`disabled` cố định** |
| **Nút phải** | **Tip** — variant default `flex "2 1 0"` `h-[80%] rounded-full text-[2.2vh] font-semibold`, icon `Send h-[2.2vh] mr-1` |
| **Menu** | `Button variant="ghost" size="icon"`, icon `Menu h-[2.2vh]`, căn trái hàng 9–10 |

### 6.8 Popup menu ☰

Một `Dialog className="sm:max-w-md"`, 4 view qua state `menuView`. Đóng dialog thì reset về `main`.

**`main`**
- Title "Balance & Wallet"
- Số dư `text-2xl font-bold text-center py-2` — `{n} USDC`
- 3 nút `variant="outline" w-full`: **Deposit** · **Withdraw** · **Tip history**
- Nút `variant="ghost" w-full`: **Close**

**`deposit`** — vào view này tự copy địa chỉ ví + toast "Wallet address copied"
- Title "Deposit USDC (testnet)"
- `<p className="text-sm text-muted-foreground">` — "Your wallet address has been copied:"
- `<code className="text-xs break-all bg-muted p-2 rounded block">` chứa địa chỉ ví
- `<ol className="text-sm list-decimal list-inside space-y-1">` — Open the Circle Faucet page / Paste the wallet address you just copied / Click Request on that page
- Nút chính `w-full` **"Open Circle Faucet"** → `https://faucet.circle.com/` tab mới
- Nút `ghost w-full` **Back**

**`withdraw`**
- Title "Withdraw"
- `<p className="text-sm text-muted-foreground">` — "This feature isn't available yet - withdrawals only open on mainnet."
- Nút chính `w-full` **"Got it"**

**`history`**
- Title "Tip history"
- `<Transactions>` bọc trong `max-h-[60vh] overflow-y-auto`

### 6.9 Luồng gửi tiền — `components/send-flow.tsx`

Một `Dialog className="sm:max-w-md flex flex-col h-[600px] max-h-[80vh]"`, 4 bước qua state `step`.

**Bước 1 · `amount`** — Title "Choose an amount"

- Danh sách mức tiền từ `localStorage["taptip_presets"]`, mặc định `["1","5","10"]`, thêm mới thì sắp xếp tăng dần
- Vùng danh sách `flex-1 overflow-y-auto flex flex-col gap-2`
- Mỗi dòng `flex items-center gap-2`:
  - Nút `variant="outline" flex-1 justify-between py-6` — trái `{value} USDC`, phải `<span className="text-xs text-muted-foreground">Not enough balance</span>` khi mức > số dư (kèm `disabled`)
  - Nút `ghost size="icon"` icon `X h-4 w-4`
  - Bấm ✕ → dòng đổi thành **Delete** (`variant="destructive" size="sm"`) + **Cancel** (`ghost sm`)
- Cuối danh sách: nút `ghost justify-start` icon `Plus mr-2 h-4 w-4` + **"Enter a different amount"** → đổi thành `Input type="number" placeholder="USDC amount"` autofocus + nút **Add**. Nhập sai → toast "Enter a valid amount"
- Chọn mức tiền là sang bước `scan` ngay, không có nút Next

**Bước 2 · `scan`** — Title `Scan QR to send {amount} USDC`

- Khung camera `<div id="taptip-qr-region" className="w-full aspect-square bg-black rounded-xl overflow-hidden">`
- `globals.css` ép `#taptip-qr-region video { width: 100% !important; height: 100% !important; object-fit: cover }` để không bị letterbox, và ẩn ảnh/thông báo mặc định của thư viện
- Cấu hình quét: `fps: 10`, `aspectRatio: 1`, `facingMode: "environment"`, `qrbox` = **70% cạnh ngắn**
- Lỗi quét `<p className="text-sm text-red-600 text-center">`:
  - "Couldn't open camera. Try uploading a photo instead."
  - "Couldn't read a QR code in this image."
  - "Invalid QR - wrong network, wrong currency, or not a TapTip QR code."
  - "Missing amount, go back and choose an amount."
- Nút `variant="outline" w-2/3 mx-auto` icon `ImageIcon mr-2 h-4 w-4` + **"Upload photo from gallery"**
- Hàng cuối `flex gap-2`: ← `outline flex-1 rounded-full` (icon `ArrowLeft h-4 w-4`) → về bước `amount`; **"Done"** `flex-[2] rounded-full` → đóng dialog

**Bước 3 · `sending`** — không có Title

`flex-1 flex flex-col items-center justify-center gap-4`:
- `Loader2 h-10 w-10 animate-spin text-primary`
- `<p>Processing transaction...</p>`

`onInteractOutside` và `onEscapeKeyDown` đều `preventDefault()` ở bước này — không đóng được.

**Bước 4 · `success`** — không có Title

`flex-1 flex flex-col items-center justify-center gap-4`:
- `CheckCircle2 h-16 w-16 text-green-500`
- `<p className="text-xl font-semibold">-{amount} USDC</p>`

Tự quay lại bước `scan` sau **2000ms**, dialog không đóng. Gửi thất bại → toast "Send failed, try again" + về `scan`.

### 6.10 Lịch sử tip — `components/transactions.tsx`

Hiển thị trong popup `history`.

- Trên cùng `Input placeholder="Search transactions..." className="w-full mb-2"`, lọc theo mã giao dịch
- **Rỗng:** giữ ô tìm kiếm + `<p className="text-xl text-muted-foreground">No transactions yet</p>`
- **Đang tải:** `<Skeleton className="w-full h-[30px] rounded-md" />`
- **Lỗi:** khối `p-4 border border-destructive bg-destructive/10 text-destructive` + nút **Retry** (`destructive sm mt-2`)
- **Có dữ liệu:** nhóm theo ngày, các nhóm cách nhau `space-y-8`
  - Tiêu đề ngày `<h2 className="text-xl font-bold mb-2">`, định dạng `MM/DD/YYYY` locale `en-US`
  - Các dòng cách nhau `space-y-4`, mỗi dòng `p-4 pl-0 hover:bg-gray-50 dark:hover:bg-white/5`, bấm → `/dashboard/transaction/{hash}`
  - Bố cục dòng `flex items-start gap-2`:
    - Cột trái `flex-1`: nhãn `font-medium` + `Badge className="ml-2 rounded-none"` trạng thái; dòng 2 `text-sm text-muted-foreground` loại GD; dòng 3 `text-sm text-muted-foreground` giờ `hh:mm`
    - Cột phải `ml-auto font-medium`: số tiền
  - **Nhãn:** ưu tiên `Tip: {tên người}` (tra ngược địa chỉ ví → profile), không tra được thì rút gọn hash `{6 đầu}...{4 cuối}`, không có thì "Unknown address"
  - **Loại GD:** `USDC_TRANSFER_IN` → "Received", `USDC_TRANSFER_OUT` → "Sent"
  - **Số tiền:** nhận `+` `text-green-600`, gửi `-` `text-red-600`, 2 chữ số thập phân, không kèm đơn vị
  - **Trạng thái:** Complete / Pending / Failed. Arc đi thẳng PENDING → COMPLETE, không có CONFIRMED

### 6.11 Chi tiết giao dịch — `app/dashboard/transaction/[id]/page.tsx`

Route riêng, không phải popup. Container `flex flex-col p-4 max-w-full overflow-y-auto h-full`.

- **Header dính** `sticky top-0 bg-background z-10 pb-2 mb-4 flex items-center`: nút `ghost size="icon" mr-2` icon **`X h-4 w-4`** → `/dashboard`, rồi `<h2 className="text-lg font-bold">Transaction Details</h2>`
- **Thẻ tóm tắt** `bg-muted/30 rounded-xl p-3 mb-4`:
  - Hàng 1 `flex justify-between items-center mb-3`: `Badge` trạng thái `rounded-none px-2 py-1` + `<span className="text-xs text-muted-foreground">` loại GD ("Tip received" / "Tip sent")
  - Hàng 2: nhãn `text-xs text-muted-foreground` / giá trị `text-sm` — **Amount** (`{n} USDC`) và **Network** ("Arc Testnet")
  - Hàng 3 `flex justify-between text-xs`: cột trái **Created:** + ngày + giờ, cột phải căn phải **Last updated:** + ngày + giờ
- **Hai khối gập** `<details className="group rounded-xl border p-2">`, summary `flex cursor-pointer list-none items-center justify-between font-medium` với `<span className="text-sm font-medium">` + `ChevronDown h-4 w-4 transition-transform group-open:rotate-180`:
  - **"Transaction IDs"** — Transaction ID, Transaction Hash
  - **"Addresses"** — From, To, Wallet ID, Wallet Address, Token Address
  - Nhãn `text-xs text-muted-foreground`, giá trị `text-xs break-all mt-1`
- Cuối: nút `variant="outline" w-full py-2 text-sm` **"View on ArcScan"** → `https://testnet.arcscan.app/tx/{txHash}`
- **Đang tải:** 7 khối `Skeleton` xếp dọc (`h-12 w-3/4`, rồi 3 cặp `h-8 w-1/2` + `h-6 w-full`)
- **Lỗi:** khối `p-4 border border-destructive bg-destructive/10`, H2 `text-2xl font-semibold tracking-tight text-destructive` "Error loading transaction"
- **Không tìm thấy:** `<h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">Invalid transaction</h2>`

---

## 7. Trạng thái & phản hồi

| Kiểu | Thể hiện | Nơi dùng |
|---|---|---|
| Loading trên nút | đổi label: "Sending..." / "Verifying..." / "Saving..." / "Setting up..." | các màn auth |
| Loading toàn bước | `Loader2` xoay + câu mô tả | send-flow `sending` |
| Loading danh sách | `Skeleton` | lịch sử, chi tiết GD |
| Thành công | `CheckCircle2` xanh + số tiền, tự tắt sau 2s | send-flow `success` |
| Toast | sonner `toast.success` / `toast.error` | copy địa chỉ, gửi lỗi, số tiền không hợp lệ |
| Lỗi inline nhỏ | `text-sm text-red-600 text-center` | OTP, quét QR |
| Lỗi dạng khối | `border-destructive bg-destructive/10 text-destructive` | passkey, lịch sử, chi tiết GD |
| Lỗi hệ điều hành | `alert()` | sign-in, code-confirmation |
| Disabled | `disabled:opacity-50 disabled:pointer-events-none` | Random, nút chính khi form chưa hợp lệ, mức tiền vượt số dư |

---

## 8. Nội dung

Toàn bộ UI **tiếng Anh**. `<html lang="en">`, ngày giờ theo locale `en-US` (`MM/DD/YYYY`, `hh:mm`).

Giọng văn: câu ngắn, chủ động, không thuật ngữ blockchain ở luồng chính — dùng "tip", "balance", "wallet address"; không có "gas", "chain", "signature".

Số tiền hiển thị thẳng bằng USDC, chưa có quy đổi VNĐ.

Phạm vi sản phẩm: không hoàn tiền/huỷ giao dịch · chỉ USDC · không chat/lời nhắn kèm · không giới hạn số tiền mỗi lần gửi · nút Random luôn tắt.

---

## 9. PWA

`app/manifest.ts`:

| Trường | Giá trị |
|---|---|
| `name` / `short_name` | TapTip |
| `description` | Tip and gift money as fast as a handshake |
| `start_url` | `/` |
| `display` | `standalone` |
| `background_color` | `#ffffff` |
| `theme_color` | `#000000` |
| `icons` | `/icon-192x192.png`, `/icon-512x512.png` |

`metadata` trong `app/layout.tsx`: title "TapTip", description "Tip and gift money as fast as a handshake".
`viewport`: `interactiveWidget: "resizes-content"`.

---

## 10. Bản đồ file

| Màn / vai trò | File |
|---|---|
| Shell, font, theme, khung điện thoại | `app/layout.tsx` |
| Design tokens | `app/globals.css` |
| Splash + Add to Home | `app/page.tsx` |
| Layout nhóm auth | `app/(auth-pages)/layout.tsx` |
| Đăng nhập email | `app/(auth-pages)/sign-in/page.tsx` |
| Nhập OTP | `app/(auth-pages)/code-confirmation/page.tsx` |
| Tạo hồ sơ | `app/(auth-pages)/onboarding/page.tsx` |
| Layout dashboard | `app/dashboard/layout.tsx` |
| Home (route) | `app/dashboard/page.tsx` |
| Home (UI) + popup menu | `components/home-screen.tsx` |
| Luồng gửi 4 bước | `components/send-flow.tsx` |
| Passkey | `components/passkey-setup.tsx` → `app/dashboard/setup-wallet/page.tsx` |
| Lịch sử tip | `components/transactions.tsx` ← `components/transactions-tab.tsx` |
| Chi tiết giao dịch | `app/dashboard/transaction/[id]/page.tsx` |
| PWA manifest | `app/manifest.ts` |
| Primitive UI | `components/ui/` |

Không thuộc luồng TapTip: `components/copy-button.tsx`, `components/theme-switcher.tsx`, `app/(auth-pages)/forgot-password/`, `app/dashboard/reset-password/`, `app/auth/callback/route.ts`, `app/api/wallet-set/`, `app/api/wallet/`.
