-- สร้างฐานข้อมูลและตาราง (รันไฟล์นี้แล้วข้อมูลเดิมจะถูกลบ ใช้ตอนเริ่มต้นเท่านั้น)
CREATE DATABASE IF NOT EXISTS exam_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE exam_db;

DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS catalogs;

-- ตารางหมวดหมู่
CREATE TABLE catalogs (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ตารางหนังสือ (อ้างอิง catalogs ผ่าน catalog_id)
CREATE TABLE books (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  author       VARCHAR(150) NOT NULL,
  isbn         VARCHAR(20)  NULL,
  price        DECIMAL(10,2) NOT NULL DEFAULT 0,
  publish_year SMALLINT NULL,
  catalog_id   INT UNSIGNED NOT NULL,
  cover        VARCHAR(255) NULL,          -- เก็บเฉพาะชื่อไฟล์ ไฟล์จริงอยู่ที่ backend/uploads/
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_books_title (title),
  INDEX idx_books_catalog (catalog_id),
  CONSTRAINT fk_books_catalog
    FOREIGN KEY (catalog_id) REFERENCES catalogs(id)
    ON DELETE RESTRICT   -- ลบ catalog ที่ยังมีหนังสือไม่ได้
    ON UPDATE CASCADE
) ENGINE=InnoDB;
