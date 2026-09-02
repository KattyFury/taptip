-- Migration number: 0002 	 2026-09-02T16:00:00.000Z
--
-- Luu passkey credential (CHI phan cong khai: {id, publicKey}) de dung lai
-- Circle Smart Account o lan mo app sau. Khoa bi mat cua passkey nam trong
-- secure enclave cua may, KHONG BAO GIO roi thiet bi - cot nay khong phai bi mat.
--
-- Thieu cot nay = khong dung lai duoc smart account = KHONG KY DUOC giao dich
-- (bug 09-02: setup-wallets nhan credential roi vut di, /api/get-credential
-- bi xoa, sendUSDC luon tra ve null "Account not initialized").

ALTER TABLE users ADD COLUMN passkey_credential TEXT;
