-- Gioi han tip moi ngay, sua duoc trong man Cai dat. NULL = khong gioi han
-- (mac dinh, giu dung ranh gioi PRD "khong gioi han so tien moi lan gui" cho
-- den khi user tu bat).
ALTER TABLE profiles ADD COLUMN daily_tip_limit DECIMAL(20, 8);
