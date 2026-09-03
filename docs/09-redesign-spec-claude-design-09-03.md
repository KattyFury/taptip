# TapTip — Spec layout để đưa cho Claude Design (09-03)

> Mục đích file này: mô tả **đúng vị trí thật** của từng phần tử trên các màn chính của TapTip (lấy thẳng từ code đang chạy production, không đoán), cộng với **yêu cầu thiết kế mới** cho vòng làm lại này. Đưa nguyên file này cho Claude Design — vị trí/tỷ lệ giữ nguyên, chỉ đổi phần "Yêu cầu MỚI" bên dưới.

---

## 1. Yêu cầu MỚI cho vòng thiết kế này

- **Font cho các yếu tố tiêu đề/header** (logo, tiêu đề màn, nhãn "Balance", tiêu đề popup): **Nunito**.
- **Font cho nội dung** (số dư, địa chỉ ví, đoạn mô tả, nút bấm, danh sách...): **Montserrat**.
- **Tông màu**: giữ đúng bộ 3 tông **trắng — vàng — đen** đang dùng, nhưng làm **dễ thương hơn một chút** — có thể bo góc rộng hơn, viền mềm hơn (bớt cảm giác cứng/kỹ thuật của bản hiện tại), không cần đổi bảng màu.
- **KHÔNG đổi vị trí/tỷ lệ bất kỳ item nào** so với mô tả ở Mục 3 — đây là yêu cầu quan trọng nhất, đã bị phá vỡ ở các bản thử trước đó.

---

## 2. Hệ thống dùng chung (hiện trạng — giữ nguyên trừ khi mục 1 nói khác)

- **Khung máy**: mô phỏng khung điện thoại, tỷ lệ tối đa 430×932px, viền đen 2px bao quanh, nền trắng cả trong lẫn ngoài khung (trên desktop, khung nổi giữa nền trắng).
- **Lưới dọc 10 hàng bằng nhau** cho MỌI màn hình toàn khung (Sign In/OTP/Home...) — mọi khoảng cách/kích thước dọc tính theo tỷ lệ phần trăm của khung, không dùng pixel cố định.
- **Lề ngang cố định 20px** hai bên, áp dụng chung cho toàn bộ nội dung.
- **Bảng màu hiện tại**:
  | Token | Giá trị | Dùng cho |
  |---|---|---|
  | nền | `#FFFFFF` | nền chính |
  | chữ chính | `#000000` | chữ/viền chính |
  | vàng thương hiệu | `#FFCC00` | nút hành động chính, chấm trên logo |
  | xám phụ | `#8E8E93` | nhãn phụ, caption, chữ mờ |
  | đỏ cảnh báo | `#FF383C` | cảnh báo mạng, lỗi |
  | xanh thành công | `#34C759` | giao dịch nhận tiền (+) |
- **Bo góc hiện tại**: 12px cho thẻ/ô nhập, bo tròn hết cỡ (pill) cho nút hành động, 10px riêng cho popup kiểu mới.
- **Nút hành động**: pill vàng, chữ/icon đen, có đổ bóng nhẹ phía dưới.
- **Ngôn ngữ**: 100% tiếng Anh, không lẫn tiếng Việt.

---

## 3. Vị trí từng màn (lấy từ code thật — giữ nguyên)

### 3.1 Màn Home (màn chính sau đăng nhập)

Lưới 10 hàng, chia theo tỷ lệ **1 / 1 / 4 / 2 / 1 / 1**:

| Hàng | Nội dung |
|---|---|
| **1** | Logo "TapTip" (trái) + icon menu hamburger ☰ (phải) |
| **2** | Nhãn "Balance" (căn giữa, phía trên) → số dư lớn **"$26"** + **"(26 USDC)"** nhỏ hơn ngay bên cạnh, cùng 1 dòng (baseline) |
| **3-6** (1 khối) | QR code vuông to, căn giữa, chiếm gần hết bề rộng khung → dưới QR: dòng cảnh báo màu đỏ **"Current available network: Arc Testnet"** → dưới nữa: **"Account Number: 0x...XXXX"** + icon copy nhỏ cạnh bên |
| **7-8** | (hiện đang trống — chỗ dành cho tối đa 3 thông báo dismiss-được, chưa có dữ liệu thật nuôi) |
| **9** | 2 nút pill vàng nằm cạnh nhau: nút trái NHỎ (1/3 bề rộng, icon "•••" — mở Tip Setting) + nút phải TO (2/3 bề rộng, chữ **"Tap to Tip"**) |
| **10** | (trống — chỉ hiện dòng chữ đỏ báo lỗi đọc số dư nếu có, căn giữa cả ngang lẫn dọc) |

### 3.2 Màn Sign In (nhập email)

Lưới dùng chung mọi màn con (Screen): đệm trên(1) / tiêu đề(1.5) / nội dung(5.5) / hành động(1) / chân(1)

- **Tiêu đề**: "Enter your email to get started"
- **Nội dung**: 1 ô nhập, placeholder "Email"
- **Hành động**: nút Back (icon mũi tên cong, 1/3 trái) + nút **"Send OTP"** (2/3 phải)
- **Chân**: dòng lỗi đỏ nếu có (vd "Enter a valid email address")

### 3.3 Màn Verify Code (nhập mã OTP)

Cùng lưới Screen ở trên.

- **Tiêu đề**: "Enter the code sent to" + dòng email hiển thị bên dưới (màu phụ)
- **Nội dung**: 6 ô nhập số, tự nhảy sang ô kế khi gõ
- **Hành động**: nút Back (1/3) + **"Continue"** (2/3)
- **Chân**: dòng lỗi đỏ nếu mã sai

### 3.4 Popup "Scan to Tip" (bấm nút "Tap to Tip")

- Hiện như 1 thẻ nổi lên TRÊN màn Home (Home mờ phía sau, không phải màn riêng)
- Popup DÀI: trải đúng từ **đỉnh hàng 2 đến đáy hàng 7** của lưới 10 hàng
- Nội dung: tiêu đề "Scan to tip" + nút X đóng ở góc phải trên → khung camera/QR vuông to có viền ống ngắm vàng → link **"Upload a QR image instead"** → lưới 2 cột các nút chọn mức tiền có sẵn ($1/$3/$10) + ô **"Custom"**

### 3.5 Popup "Tip Setting" (bấm nút "•••" ở Home)

- **Neo NGAY TRÊN nút "•••"** (không có lớp làm mờ nền phía sau — khác với các popup kia)
- Nội dung: tiêu đề "Tip amounts" → danh sách hàng dạng "Default $1 •••" / "Option $3 •••" / "Option $10 •••" → link **"+ Add more option"**

### 3.6 Popup "History"

- Popup DÀI (hàng 2-7), tiêu đề "History"
- Danh sách giao dịch, mỗi dòng: "Sent to 0x_XXXX" hoặc "Received from 0x_XXXX" + ngày bên dưới + số tiền +/- (xanh khi nhận, đỏ khi gửi) căn phải

### 3.7 Popup "Deposit"

- Popup NGẮN: **căn giữa đúng hàng 3** của lưới 10 hàng
- Nội dung: đoạn mô tả ngắn → ô địa chỉ ví (font mono, có nút copy) → nút **"Open Circle Faucet"**

### 3.8 Popup "Withdraw"

- Popup NGẮN: căn giữa hàng 3
- Nội dung: đoạn **"Withdrawals aren't available yet during the testnet phase."** → nút **"Got it"**

---

## 4. Quy tắc phân loại popup (áp dụng cho mọi popup mới nếu có)

- Nội dung NGẮN (không cần cuộn) → **căn giữa hàng 3**
- Nội dung DÀI (danh sách, camera...) → **trải từ đỉnh hàng 2 đến đáy hàng 7**, dài hơn nữa thì tự cuộn bên trong, không phình quá hàng 7
