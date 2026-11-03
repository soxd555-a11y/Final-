# Exam Starter: CRUD Books + Catalog (Node.js + Express + MySQL)

Starter สำหรับสอบ Web Contemporary: CRUD 2 ตาราง (`books`, `catalogs`) พร้อมอัปโหลดปกหนังสือ

> **ระหว่างสอบห้ามใช้ AI ทุกรูปแบบ** รวมถึง extension ใน IDE (เช่น Copilot) ให้ปิดไว้ก่อนสอบ มีการเก็บ log internet และบันทึกหน้าจอ ทุจริตติด F ทุกรายวิชา

## โครงสร้าง

```
exam-starter/
├── backend/
│   ├── src/
│   │   ├── app.js                  # เริ่มเซิร์ฟเวอร์ + mount routes + เสิร์ฟ frontend/uploads
│   │   ├── config/db.js            # MySQL pool (อ่านจาก .env)
│   │   ├── controllers/            # bookController.js, catalogController.js
│   │   ├── routes/                 # books.js, catalogs.js
│   │   ├── middleware/             # upload.js (multer), errorHandler.js
│   │   └── utils/                  # httpError.js, asyncHandler.js
│   ├── uploads/                    # ไฟล์ปกที่อัปโหลด (ไม่ commit ไฟล์จริง)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html, css/style.css
│   └── js/ api.js, ui.js, books.js, catalogs.js, app.js
├── sql/ schema.sql, seed.sql, queries.sql
├── docs/ openapi.yaml, postman_collection.json
├── past-homework/                  # วางโค้ตการบ้านเดิม + NOTES.md
├── CHEATSHEET.md
└── README.md
```

## วิธีรัน (ครั้งแรก)

```bash
# 1) ติดตั้ง
cd backend
npm install

# 2) ตั้งค่า DB
cp .env.example .env          # แล้วแก้ DB_USER / DB_PASSWORD ให้ตรงกับเครื่อง

# 3) สร้างตาราง + ข้อมูลตัวอย่าง (รันที่รากโปรเจกต์)
cd ..
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql

# 4) รันเซิร์ฟเวอร์
cd backend
npm run dev
```

เปิด `http://localhost:3000/` จะเห็นหน้าเว็บ (backend เสิร์ฟ frontend ให้ด้วย ไม่ต้องตั้ง CORS หรือรันแยก)
เช็กสถานะ: `http://localhost:3000/health` ต้องได้ `{"success":true,"message":"ok"}`

## API

| Method | Path | หมายเหตุ |
|---|---|---|
| GET | `/api/catalogs?q=&page=&limit=` | ค้นหา + แบ่งหน้า, `?all=true` ดึงทั้งหมดไม่แบ่งหน้า |
| GET | `/api/catalogs/:id` | |
| POST | `/api/catalogs` | JSON `{name, description}` |
| PUT | `/api/catalogs/:id` | JSON |
| DELETE | `/api/catalogs/:id` | 409 ถ้ายังมีหนังสือในหมวด |
| GET | `/api/books?q=&catalog_id=&page=&limit=&sort=&order=` | JOIN ชื่อหมวด + `cover_url` |
| GET | `/api/books/:id` | |
| POST | `/api/books` | `multipart/form-data` ไฟล์ปกใน field **`cover`** |
| PUT | `/api/books/:id` | ไม่ส่ง `cover` = ใช้รูปเดิม ส่งใหม่ = ลบรูปเก่า |
| DELETE | `/api/books/:id` | ลบไฟล์ปกด้วย |

Response รูปแบบเดียวกันทุกจุด: `{ success, message?, data?, pagination? }` และ error เป็น `{ success:false, message }`

## จุดที่ต้องรู้ตอนสอบ (ที่มักผิด)

- **อัปโหลดไฟล์**: ฟอร์มต้องใช้ `FormData` และ **ห้ามตั้ง `Content-Type` เอง** ชื่อ field ใน frontend ต้องตรงกับ `upload.single('cover')` ใน `backend/src/middleware/upload.js`
- **ตารางใหม่**: copy `controllers/catalogController.js` + `routes/catalogs.js` เปลี่ยนชื่อตาราง/คอลัมน์ แล้ว `app.use('/api/xxx', ...)` ใน `app.js`
- **ลบ catalog ที่มีหนังสือ**: ใช้ FK `ON DELETE RESTRICT` + เช็กใน controller ให้ข้อความอ่านรู้เรื่อง
- **LIMIT/OFFSET**: `offset = (page - 1) * limit`
- **ชื่อไฟล์ปก**: DB เก็บแค่ชื่อไฟล์ ส่วน URL สร้างเป็น `/uploads/<ชื่อไฟล์>`

## ใช้กับ HTML/CSS ของอาจารย์

1. วางไฟล์ของอาจารย์ใน `frontend/` (แทน `index.html` / `css/style.css`)
2. ใส่ `<script>` 5 ตัวตามลำดับนี้ท้าย `<body>`: `api.js`, `ui.js`, `books.js`, `catalogs.js`, `app.js`
3. ให้ `id` ใน HTML ตรงกับที่ js ใช้ (ค้นหา `getElementById` ใน `books.js` / `catalogs.js` แล้วแก้ id ใน HTML หรือแก้ใน js ให้ตรงกัน)
4. ถ้าโครง HTML ต่างมาก ให้เก็บ `api.js` + `ui.js` ไว้ แล้วแก้เฉพาะ `books.js` / `catalogs.js`

## Gen code จาก OpenAPI / Postman (ทำไว้ก่อนสอบ)

ไฟล์ `docs/openapi.yaml` ตรงกับ API ในโปรเจกต์นี้ ถ้าอาจารย์ให้ swagger มาให้วางไว้ที่ `docs/` ด้วย

```bash
# ดูรายชื่อ generator
npx @openapitools/openapi-generator-cli list

# gen client (ฟังก์ชันเรียก API)
npx @openapitools/openapi-generator-cli generate -i docs/openapi.yaml -g javascript -o generated/client

# gen server skeleton
npx @openapitools/openapi-generator-cli generate -i docs/openapi.yaml -g nodejs-express-server -o generated/server
```

- Swagger Editor (editor.swagger.io): วางไฟล์แล้วเมนู Generate Server / Generate Client
- Postman: Import `docs/openapi.yaml` หรือ `docs/postman_collection.json` ได้เลย แล้วกด Code snippet ของ request เพื่อได้โค้ต fetch/axios
- โค้ตที่ gen ออกมาเป็นแค่ skeleton ต้องลองรันและต่อ DB เองก่อน commit

## เช็กก่อนสอบ

- [ ] `git clone` ลงโฟลเดอร์ใหม่ แล้ว `npm install` + import SQL + รันผ่านตั้งแต่ศูนย์
- [ ] ซ้อมจับเวลา: ทำ CRUD 2 ตาราง + อัปโหลดปก จาก starter
- [ ] ถามอาจารย์ว่าเข้า GitHub ในห้องสอบได้ไหม ถ้าไม่แน่ใจให้ clone ลงเครื่องไว้ก่อน
- [ ] ตั้ง repo เป็น private และไม่ commit `.env` จริง
- [ ] ปิด extension AI ทุกตัวใน IDE
- [ ] ใส่โค้ตการบ้านใน `past-homework/` และเขียน `NOTES.md`
