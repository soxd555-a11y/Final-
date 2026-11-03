# Exam Starter: CRUD Books + Catalog (Node.js + Express + MySQL)

Starter สำหรับสอบ Web Contemporary: CRUD 2 ตาราง (`books`, `catalogs`) พร้อมอัปโหลดปกหนังสือ

> **ระหว่างสอบห้ามใช้ AI ทุกรูปแบบ** รวมถึง extension ใน IDE (เช่น Copilot) ให้ปิดไว้ก่อนสอบ มีการเก็บ log internet และบันทึกหน้าจอ ทุจริตติด F ทุกรายวิชา
>
> 📌 **เริ่มจาก**: อ่าน **[กฎการสอบวันจริง](#กฎการสอบวันจริง)** แล้วตามด้วย **[ในห้องสอบต้องทำอะไรบ้าง (ทีละขั้นตอน)](#ในห้องสอบต้องทำอะไรบ้าง-ทีละขั้นตอน)** — ทุกอย่างอยู่ในไฟล์นี้ไฟล์เดียว

## โครงสร้าง

```
exam-starter/
├── start-db.bat                # เปิด/ตั้งค่า MySQL อัตโนมัติ (Windows)
├── start-server.bat            # ติดตั้ง + เปิดเซิร์ฟเวอร์ (Windows)
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

**ทางลัด Windows:** ดับเบิลคลิก `start-db.bat` (ตั้งค่า MySQL + import SQL ให้เอง)
แล้วตามด้วย `start-server.bat` → เปิด http://localhost:3000/

**แบบสั่งเอง:**

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

## กฎการสอบวันจริง

### ตอน 1 — ข้อเขียน (ทำในห้อง)

- **CRUD 2 ตารางใหญ่ + อัพโหลดไฟล์** → ชุดนี้ทำได้ครบ: ตาราง `books` + `catalogs` + อัปโหลดปก
- อาจารย์มี **CSS/HTML ให้ เหลือแค่ JS** → JS ครบทุกไฟล์ที่ `frontend/js/` (วิธีต่อดูหัวข้อ "ใช้กับ HTML/CSS ของอาจารย์")
- **ข้อกา (ถูก/ผิด)**: ง่ายมาก เดาได้ ไม่ต้องทำนาน → ทำเร็ว ๆ แล้วสลับไปทำ CRUD ให้จบ **อย่าทิ้งเวลาไว้ทำข้อเขียน**

### ตอน 2 — เปิดเน็ต

- ✅ **เปิดเน็ตได้ ค้นหาได้**
- ❌ **ห้ามใช้ AI ทุกรูปแบบ**: เว็บที่เป็น AI, extension AI (Copilot, Codeium, Tabnine...), ฟีเจอร์ AI ใน Postman/VS Code/เบราว์เซอร์
- ⚠️ **ทุจริต = ติด F ทุกรายวิชา**
- มี **เก็บ log อินเทอร์เน็ต** และ **บันทึกหน้าจอ** ตลอดเวลาสอบ

### ใช้ได้ / ห้ามใช้

| ✅ ใช้ได้ | ❌ ห้ามเด็ดขาด |
|---|---|
| โค้ดที่เก็บไว้ก่อนสอบ: `past-homework/`, `backend/`, `frontend/` ชุดนี้ | เว็บ AI: ChatGPT, Gemini, Claude, Copilot, Deepseek |
| เอกสาร MDN / w3schools / เว็บ library | Extension AI ทุกตัว (ปิด/ลบก่อนเข้าสอบ) |
| Stack Overflow / เว็บค้นหาทั่วไป | ฟีเจอร์ AI ในเครื่องมืออื่น (Postman AI, GitHub Copilot) |
| Postman ฟีเจอร์ปกติ, Swagger UI | ให้คนอื่นทำแทน / แชร์จอ |

> อาจารย์แนะนำเอง: *"เก็บโค้ดการบ้านไว้ เปิดดู หรือเอามาปรับแก้ก็ได้"* → ชุดนี้คือสิ่งนั้น

## ในห้องสอบต้องทำอะไรบ้าง (ทีละขั้นตอน)

> เปิดหน้านี้ค้างไว้ตอนทำข้อเขียน — อ่านกฎก่อนที่หัวข้อ **กฎการสอบวันจริง** ด้านบน

### ก่อนเริ่ม (5 นาทีแรก)

1. **ปิด extension AI ทุกตัว** ในเบราว์เซอร์และ VS Code — ลืมปิด = ผิดกฎ = ติด F
2. เปิดโปรเจกต์ → รัน `start-db.bat` → รัน `start-server.bat`
3. เช็ก `http://localhost:3000/health` ต้องได้ `{"success":true,"message":"ok"}`
   - ถ้าขึ้น error ให้ดูตาราง **Error ที่เจอบ่อย** ใน `CHEATSHEET.md`
4. เปิด `http://localhost:3000/` แล้วลองเพิ่ม → แก้ → ลบ 1 รายการ ว่าทุกอย่างตอบสนอง

### ตอนทำข้อเขียน (CRUD 2 ตาราง + อัปโหลดไฟล์)

5. รับไฟล์ CSS/HTML ของอาจารย์ → วางแทน `frontend/index.html` และ `frontend/css/style.css`
6. ต่อ `<script>` 5 ตัวท้าย `</body>` ตามลำดับ:
   `api.js` → `ui.js` → `books.js` → `catalogs.js` → `app.js`
7. เช็ก `id` ทุกตัวให้ตรงกับรายการในหัวข้อ **"ใช้กับ HTML/CSS ของอาจารย์"** (ผิดจุดเดียว = ฟอร์ม/ตารางไม่ทำงาน)
8. เช็กชื่อ field ในฟอร์ม: `title, author, isbn, price, publish_year, cover` + `catalog_id`
   - **อัปโหลด**: ต้องเป็น `FormData` และห้ามตั้ง `Content-Type` เอง
9. ทดสอบครบทั้ง 2 ตาราง: **เพิ่ม → ดู → แก้ → ลบ** + **อัปโหลดปก** (รูปขึ้นจริง + รีเฟรชแล้วยังอยู่)
10. ถ้าโจทย์สั่งตารางใหม่/เพิ่มฟิลด์ → copy `catalogController.js` + `catalogs.js` แก้ชื่อ
    (ดู CHEATSHEET หัวข้อ **Pattern copy ตารางใหม่**)

### ข้อกา + ตอนท้าย

11. ข้อกา (ถูก/ผิด) ทำให้เร็ว — **อย่าทิ้งไว้ท้ายสุด** ถ้ายังไม่เสร็จข้อเขียน (อาจารย์บอกว่าง่าย เดาได้)
12. เช็ก endpoint / ชื่อ field / รูปแบบ response ตรงกับ swagger ของอาจารย์ใน `docs/`
13. เหลือเวลา → เปิด `CHEATSHEET.md` เช็คข้อผิดพลาดบ่อย + `git status` ว่าไฟล์ครบ

**ถ้าติดปัญหาระหว่างทาง** → ดูตาราง "Error ที่เจอบ่อย" ใน `CHEATSHEET.md` ก่อนเริ่มแก้โค้ดมั่ว

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

### รายการ `id` ที่ JS ต้องใช้ (เช็กให้ครบ)

**หน้าหนังสือ** (`books.js`): `book-tbody`, `book-pagination`, `book-search`, `book-filter-catalog`,
`book-dialog`, `book-form`, `book-dialog-title`, `book-id`, `book-catalog`, `book-cover`, `book-cover-preview`,
`book-title`, `book-author`, `book-isbn`, `book-price`, `book-year`, `book-add`, `book-cancel`

**หน้า catalog** (`catalogs.js`): `catalog-tbody`, `catalog-pagination`, `catalog-search`,
`catalog-dialog`, `catalog-form`, `catalog-dialog-title`, `catalog-id`, `catalog-name`, `catalog-description`,
`catalog-add`, `catalog-cancel`

**ทุกหน้าใช้ร่วมกัน**: `toast` + ปุ่ม `.tab` (มี `data-target` ชี้ `books-section` / `catalogs-section`)

ชื่อ field ในฟอร์มหนังสือต้องเป็น: `title, author, isbn, price, publish_year, cover` (ฟิลด์ `cover` สำหรับอัปโหลด)
และ `catalog_id` (select หมวดหมู่) — ไม่ตรง = อัปโหลดไม่เข้า/บันทึกไม่ได้

## วิธี gen โค้ดตอนอยู่ในห้องสอบ (เรียงลำดับทำตาม)

> ได้ไฟล์ swagger ของอาจารย์ตอนอยู่ในห้อง → ทำตามลำดับทีละข้อ
> ทุกคำสั่งรันใน **terminal ที่โฟลเดอร์โปรเจกต์** (VS Code: กด `` Ctrl + ` ``)

**ขั้นที่ 1 — วางไฟล์**
วางไฟล์ swagger ของอาจารย์ลงใน `docs/` (เช่น `docs/swagger.yaml` หรือ `docs/swagger.json`)

**ขั้นที่ 2 — เช็กเครื่องมือ (30 วินาที)**

```bash
java -version    # generator ต้องใช้ Java (ไม่มี → ข้ามไปขั้นที่ 4)
node -v          # ใช้เรียก npx
```

**ขั้นที่ 3 — สั่ง gen**

```bash
npx --yes @openapitools/openapi-generator-cli generate -i docs/<ชื่อไฟล์ของอาจารย์>.yaml -g nodejs-express-server -o generated/server
```

- เปลี่ยน `-g` ให้ตรงภาษาที่โจทย์กำหนด: `nodejs-express-server` / `spring` / `aspnetcore` / `python-flask`
- ⏱ ครั้งแรก ~1–3 นาที (โหลด jar) — **ถ้าค้าง/ช้าเกินไปให้ใช้ขั้นที่ 4 แทน** อย่าทิ้งเวลาไว้รอ

**ขั้นที่ 4 — ทางเลือกเมื่อไม่มี Java หรือ npx ติด**

```bash
# มี Docker:
docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate \
  -i /local/docs/<ไฟล์>.yaml -g nodejs-express-server -o /local/generated/server
```

ไม่มีอะไรเลย → เปิด **https://editor.swagger.io** → Import File → เมนู **Generate Server** → ได้ไฟล์ zip

**ขั้นที่ 5 — เติมงานช่าง (ส่วนที่ gen ยังไม่ทำ)**
เปิด `generated/server/services/BooksService.js` + `CatalogsService.js` — ฟังก์ชันทุกตัวยังคืนค่าว่าง
ให้เติม SQL / รับไฟล์อัปโหลด โดย copy จาก `backend/src/controllers/`

**ขั้นที่ 6 — รัน + ทดสอบ**

```bash
cd generated/server
npm install
npm start
```

เช็ก `http://localhost:3000/health` แล้วลองครบ 4 ฟังก์ชัน + อัปโหลดปก

**ขั้นที่ 7 — เช็กให้ตรงโจทย์ + เก็บงาน**

- endpoint / ชื่อ field / รูปแบบ response ตรงกับไฟล์ swagger ของอาจารย์ไหม
- `git add .` แล้ว `git commit -m "..."` (อย่างน้อยก็ได้เก็บไว้ดู/ใช้ต่อ)

**ถ้าโจทย์บอกให้ใช้ Postman:**
Import ไฟล์ swagger เข้า Postman → ได้ request ครบทุก endpoint ใช้ทดสอบได้ทันที
+ กดปุ่ม `</>` เพื่อได้โค้ดเรียก API (fetch / axios / cURL)
(Postman gen ได้แค่โค้ดฝั่ง client — **ไม่ได้สร้าง backend** ต้องใช้ openapi-generator ตามขั้นที่ 3)

**หมายเหตุสำคัญ:**

- โครงที่ gen ออกมาเป็นแค่ skeleton — **โค้ดที่ได้คะแนนคือส่วนที่ต่อจนรันได้จริง**
- ถ้าเวลาจำกัด: ใช้ `backend/` ของ starter นี้เป็นฐานเลย แล้วเอาไฟล์ swagger มาเช็คให้ตรง
  (เร็วกว่าและเสี่ยงน้อยกว่ารอ gen)
- `docs/example/` เป็นไฟล์ตัวอย่างของ starter นี้ ไม่ใช่ของอาจารย์ — ใช้ซ้อมขั้นตอนก่อนได้

## เช็กก่อนเข้าสอบ

- [ ] **ปิด/ลบ extension AI ทุกตัว** ในเบราว์เซอร์และ VS Code (ลืมปิด = ผิดกฎ)
- [ ] `git clone` ลงเครื่องใหม่ แล้วรันผ่านจากศูนย์: `start-db.bat` → `start-server.bat`
      → เช็ก `http://localhost:3000/health` ต้องได้ `{"success":true,"message":"ok"}`
- [ ] ซ้อมจับเวลา: ทำ CRUD 2 ตาราง + อัปโหลดปก ให้ครบ **เพิ่ม / ดู / แก้ / ลบ**
- [ ] ซ้อมต่อ HTML/CSS ของอาจารย์ + เช็ก `id` ครบทุกตัว (หัวข้อ "ใช้กับ HTML/CSS ของอาจารย์")
- [ ] ใส่โค้ดการบ้านใน `past-homework/` และเขียน `NOTES.md`
- [ ] ซ้อมขั้นตอน gen ด้วย `docs/example/openapi.yaml` จนคล่อง (หัวข้อ "วิธี gen โค้ดตอนอยู่ในห้องสอบ")
      — ไฟล์จริงของอาจารย์ได้ตอนอยู่ในห้อง จึงต้องซ้อมกับไฟล์ตัวอย่างไว้ก่อน
- [ ] ถามอาจารย์ว่าเข้า GitHub ในห้องสอบได้ไหม ถ้าไม่แน่ใจให้ clone ลงเครื่องไว้ก่อน
- [ ] ตั้ง repo เป็น private และไม่ commit `.env` จริง
