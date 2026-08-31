-- Migration number: 0001 	 2026-08-31T12:58:38.390Z

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  wallet_address TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tip_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  slot1 REAL NOT NULL DEFAULT 1,
  slot2 REAL NOT NULL DEFAULT 3,
  slot3 REAL NOT NULL DEFAULT 10,
  slot4 REAL,
  default_slot INTEGER NOT NULL DEFAULT 1 CHECK (default_slot BETWEEN 1 AND 4)
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount REAL NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_transactions_from ON transactions(from_address);
CREATE INDEX idx_transactions_to ON transactions(to_address);
