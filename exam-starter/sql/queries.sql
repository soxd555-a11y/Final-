USE exam_db;

-- 1) รายการหนังสือพร้อมชื่อหมวด (JOIN)
SELECT b.id, b.title, b.author, b.price, c.name AS catalog_name
FROM books b
JOIN catalogs c ON c.id = b.catalog_id
ORDER BY b.id DESC;

-- 2) ค้นหาด้วย LIKE (ชื่อ ผู้แต่ง หรือ ISBN)
SELECT * FROM books
WHERE title LIKE '%Java%' OR author LIKE '%Java%' OR isbn LIKE '%Java%';

-- 3) แบ่งหน้า: หน้า 2 หน้าละ 5 รายการ => LIMIT 5 OFFSET (2-1)*5
SELECT * FROM books ORDER BY id DESC LIMIT 5 OFFSET 5;

-- 4) นับจำนวนทั้งหมด (ใช้คำนวณจำนวนหน้า)
SELECT COUNT(*) AS total FROM books;

-- 5) นับหนังสือในแต่ละหมวด (LEFT JOIN เพื่อให้หมวดที่ไม่มีหนังสือแสดง 0)
SELECT c.id, c.name, COUNT(b.id) AS book_count
FROM catalogs c
LEFT JOIN books b ON b.catalog_id = c.id
GROUP BY c.id, c.name
ORDER BY book_count DESC;

-- 6) กรองตามหมวด + เรียงราคา
SELECT * FROM books WHERE catalog_id = 2 ORDER BY price ASC;

-- 7) ราคารวม / เฉลี่ย / สูงสุดของแต่ละหมวด
SELECT c.name, SUM(b.price) AS total_price, AVG(b.price) AS avg_price, MAX(b.price) AS max_price
FROM catalogs c
JOIN books b ON b.catalog_id = c.id
GROUP BY c.id, c.name;

-- 8) หนังสือที่ยังไม่มีปก
SELECT id, title FROM books WHERE cover IS NULL;

-- 9) INSERT / UPDATE / DELETE พื้นฐาน
INSERT INTO catalogs (name, description) VALUES ('ใหม่', 'ตัวอย่าง');
UPDATE catalogs SET description = 'แก้ไขแล้ว' WHERE name = 'ใหม่';
DELETE FROM catalogs WHERE name = 'ใหม่';
