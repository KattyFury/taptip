-- Migration number: 0006 	 2026-09-24T12:00:00.000Z
--
-- Phan biet loai giao dich trong lich su (user chot 09-24b): truoc day rut
-- tien ra vi ngoai (Withdraw) di chung /api/tip nen ghi y het tip, History hien
-- sai thanh "Tipped $X for 0x...". Them cot kind: 'tip' | 'withdraw'.
-- Moi dong cu mac dinh 'tip' (dung voi thuc te: truoc 09-24b chua co Withdraw).
--
-- Code (lib/db/transactions.ts) CHIU DUOC ca khi migration nay chua chay
-- tren production: ghi that bai vi thieu cot thi ghi lai khong co kind.

ALTER TABLE transactions ADD COLUMN kind TEXT NOT NULL DEFAULT 'tip';
