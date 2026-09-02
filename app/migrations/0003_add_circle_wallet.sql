-- Migration number: 0003 	 2026-09-02T17:30:00.000Z
--
-- Chuyen sang Circle Developer-Controlled Wallets (dung theo docs/03-planning-v2.md).
-- Circle giu khoa, app ky ho -> gui tip KHONG can Face ID moi lan, dung yeu
-- cau so 1 la toc do (xem docs/01-ideation.md: ly do gat Privy).
--
-- circle_wallet_id: ID vi ben Circle - CAN de goi createTransaction. Chi co
-- dia chi la khong chuyen tien duoc.

ALTER TABLE users ADD COLUMN circle_wallet_id TEXT;
