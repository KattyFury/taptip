# TapTip

Tip & Lì xì nhanh trên Arc. Gửi tip bất cứ lúc nào + lì xì dịp Tết, đăng nhập bằng email + passkey, ví ẩn phía sau bằng Circle Wallets, app trả gas thay user. Yêu cầu số một là **tốc độ**.

Fork [`circlefin/arc-p2p-payments`](https://github.com/circlefin/arc-p2p-payments) (Next.js + Supabase + Circle Modular Wallets/Passkey).

**Trạng thái:** logic + giao diện đã xong (Giai đoạn 1 + 2), đã deploy testnet. Tạm gác, quay lại sau. Chi tiết đầy đủ: [`HANDOFF.md`](HANDOFF.md).

## Cấu trúc

- [`app/`](app/) – code Next.js
- [`docs/`](docs/) – PRD, Product Discovery, wireframe... (sinh ra từ series [build-on-arc](https://github.com/KattyFury/build-on-arc))
- [`design_handoff_taptip/`](design_handoff_taptip/), [`TapTip Design Spec.dc.html`](TapTip%20Design%20Spec.dc.html) – gói bàn giao thiết kế

## Chạy local

```bash
cd app
npm install
npm run dev
```

Cần `.env.local` (Supabase + Circle credentials) – không commit, xem `HANDOFF.md` để biết cần key gì.
