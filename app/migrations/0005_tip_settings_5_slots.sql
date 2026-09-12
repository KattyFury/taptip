-- Quy luat thiet ke moi 09-12: preset tien tip chuyen thang len Home (bo
-- popup Tip Setting rieng), mac dinh 3 nut $2/$10/$20 (doi tu $1/$3/$10 cu),
-- "+" mo them toi da 5 nut. SQLite khong cho sua CHECK constraint bang
-- ALTER TABLE thuong -> dung dung bai "tao bang moi, copy du lieu, doi ten"
-- de vua them slot5 vua nang gioi han default_slot len 5. Du lieu slot1-4 +
-- default_slot cua user DA CO duoc giu nguyen y nguyen (chi DEFAULT moi cho
-- user MOI tao sau nay doi).
CREATE TABLE tip_settings_new (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  slot1 REAL NOT NULL DEFAULT 2,
  slot2 REAL NOT NULL DEFAULT 10,
  slot3 REAL NOT NULL DEFAULT 20,
  slot4 REAL,
  slot5 REAL,
  default_slot INTEGER NOT NULL DEFAULT 1 CHECK (default_slot BETWEEN 1 AND 5)
);

INSERT INTO tip_settings_new (user_id, slot1, slot2, slot3, slot4, default_slot)
SELECT user_id, slot1, slot2, slot3, slot4, default_slot FROM tip_settings;

DROP TABLE tip_settings;
ALTER TABLE tip_settings_new RENAME TO tip_settings;
