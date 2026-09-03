-- Migration number: 0004 	 2026-09-03T12:00:00.000Z
--
-- Passkey "khoa cua app" (xac thuc lai moi lan mo app / quay lai tu nen -
-- docs/03-planning-v2.md Nhom 5, ghi no trong HANDOFF 09-02). TACH BIET
-- HOAN TOAN voi vi Circle Developer-Controlled Wallets: passkey nay KHONG
-- ky giao dich gi ca, chi la cong xac thuc cuc bo truoc khi cho xem man
-- Home (so du/lich su/QR) - Circle van tu ky gui tien phia server nhu cu,
-- toc do gui tip khong doi.
--
-- Bang rieng, KHONG dung lai cot passkey_credential cu tren users: cot do
-- luu JSON {id,publicKey} tho theo dinh dang vi passkey MSCA da bo (xem
-- migration 0002 + ghi chu trong lib/db/users.ts), khong co counter/khong
-- qua xac minh WebAuthn that su - khong du de dung cho mot co che xac thuc
-- doc lap nhu the nay. Bang moi luu dung chuan WebAuthn (credential_id,
-- public_key COSE, counter chong replay) va cho phep 1 user co NHIEU thiet
-- bi (dien thoai + tablet...) thay vi ep 1-1 nhu cot cu.

CREATE TABLE applock_credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  transports TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_applock_credentials_user_id ON applock_credentials(user_id);
