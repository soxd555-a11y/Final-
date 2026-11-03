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
├── docs/                           # วาง swagger/postman ของอาจารย์ที่นี่
│   └── example/                    # ตัวอย่างของ starter นี้ (ใช้ซ้อม gen เท่านั้น ไม่ใช่ของอาจารย์)
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

โฟลเดอร์ `docs/` เว้นไว้ให้วางไฟล์ swagger/postman ของอาจารย์ (ข้อสอบน่าจะอิง endpoint ตามไฟล์นั้น) ส่วน `docs/example/openapi.yaml` เป็นตัวอย่างที่ตรงกับ API ของ starter นี้ ใช้ซ้อม gen ได้ แต่ไม่ใช่ของอาจารย์ ให้ลบทิ้งหรือเก็บไว้ก็ได้ ถ้าได้ไฟล์ของอาจารย์มาแล้วให้ gen จากไฟล์ของอาจารย์เป็นหลัก

### ขั้นตอน (ทำก่อนสอบ ไม่ใช่ในห้องสอบ)

1. วางไฟล์ swagger ของอาจารย์ใน `docs/`
2. เช็กว่ามี Java 11 ขึ้นไป (generator ต้องใช้): `java -version`
3. gen โค้ต:

```bash
# ดูรายชื่อ generator ทั้งหมด
npx @openapitools/openapi-generator-cli list

# gen server skeleton (เลือก -g ให้ตรงภาษาที่ใช้ เช่น nodejs-express-server, spring, aspnetcore, python-flask)
npx @openapitools/openapi-generator-cli generate -i docs/<ไฟล์ของอาจารย์>.yaml -g nodejs-express-server -o generated/server

# gen client (ฟังก์ชันเรียก API ฝั่ง frontend)
npx @openapitools/openapi-generator-cli generate -i docs/<ไฟล์ของอาจารย์>.yaml -g javascript -o generated/client
```

ถ้าไม่มี Java แต่มี Docker:

```bash
docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate \
  -i /local/docs/<ไฟล์>.yaml -g nodejs-express-server -o /local/generated/server
```

4. เปิดดูผลลัพธ์ ปกติจะเป็นโครง route/controller ที่ยังว่าง ยังไม่ต่อ DB
5. เติมโค้ตต่อ DB + อัปโหลดไฟล์ให้รันได้จริงเอง (copy ส่วนที่ใช้ได้จาก `backend/` ของ starter นี้)
6. เทสด้วย Postman: Import ไฟล์ swagger จะได้ request ครบทุก endpoint

### สิ่งที่ต้อง commit ลง git

- [ ] ไฟล์ swagger ของอาจารย์ (`docs/`)
- [ ] โฟลเดอร์ `generated/` ที่ gen แล้ว
- [ ] โค้ตที่เติมจนรันได้จริง 1 ชุด (ตัวนี้สำคัญสุด เอา copy ในห้องสอบได้)
- [ ] Postman collection ที่ export แล้ว
- [ ] โน้ตสั้นๆ: ใช้คำสั่งอะไร gen, แก้ตรงไหนบ้าง (ใส่ใน `past-homework/NOTES.md` ก็ได้)

### เครื่องมืออื่น

- Swagger Editor (editor.swagger.io): วางไฟล์แล้วเมนู Generate Server / Generate Client
- Postman: Import ไฟล์ OpenAPI แล้วกด Code snippet ของ request เพื่อได้โค้ต fetch/axios (Postman gen ได้แค่ฝั่ง client และใช้ทดสอบ API ไม่ได้ gen backend)

### ข้อควรระวัง

- **อย่า gen ในห้องสอบ**: ต้องโหลด jar และต้องมี Java ถ้าติดจะเสียเวลา ให้ gen และ commit ผลไว้ก่อน
- โค้ตที่ gen ออกมาเป็นแค่ skeleton ถ้ายังไม่เคยเติมจนรันได้ อาจเสียเวลาแก้มากกว่าเขียนเอง
- สำหรับ Node/Express แนะนำใช้ starter นี้เป็นฐาน แล้วใช้ swagger ของอาจารย์เช็กว่า endpoint, ชื่อ field และรูปแบบ response ตรงครบหรือยัง ส่วน Spring / .NET การ gen โครงมีประโยชน์มากกว่า

## เช็กก่อนสอบ

- [ ] `git clone` ลงโฟลเดอร์ใหม่ แล้ว `npm install` + import SQL + รันผ่านตั้งแต่ศูนย์
- [ ] ซ้อมจับเวลา: ทำ CRUD 2 ตาราง + อัปโหลดปก จาก starter
- [ ] ถามอาจารย์ว่าเข้า GitHub ในห้องสอบได้ไหม ถ้าไม่แน่ใจให้ clone ลงเครื่องไว้ก่อน
- [ ] ตั้ง repo เป็น private และไม่ commit `.env` จริง
- [ ] ปิด extension AI ทุกตัวใน IDE
- [ ] ใส่โค้ตการบ้านใน `past-homework/` และเขียน `NOTES.md`
