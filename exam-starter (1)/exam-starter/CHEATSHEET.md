# Cheatsheet

## Git

```bash
git init
git add .
git commit -m "ข้อความ"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main

git clone https://github.com/<user>/<repo>.git
git status
git log --oneline
git pull
```

## npm

```bash
npm install                 # ติดตั้งตาม package.json
npm i <package>             # เพิ่ม package
npm run dev                 # รันแบบ auto-reload (node --watch)
npm start                   # รันปกติ
```

## MySQL

```bash
mysql -u root -p                          # เข้า shell
mysql -u root -p < sql/schema.sql         # import ไฟล์ SQL
mysql -u root -p exam_db -e "SHOW TABLES;"
```

```sql
SHOW DATABASES;
USE exam_db;
DESCRIBE books;
SELECT * FROM books LIMIT 5;
```

## Port ชนกัน (EADDRINUSE)

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# macOS / Linux
lsof -i :3000
kill -9 <pid>
```

หรือเปลี่ยน `PORT` ใน `.env`

## Error ที่เจอบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| `ER_ACCESS_DENIED_ERROR` | `DB_USER` / `DB_PASSWORD` ใน `.env` ไม่ตรง |
| `ER_BAD_DB_ERROR` | ยังไม่ได้ import `sql/schema.sql` หรือ `DB_NAME` ผิด |
| `ECONNREFUSED 3306` | MySQL ยังไม่ได้เปิด service |
| อัปโหลดแล้ว `req.file` เป็น undefined | ชื่อ field ไม่ใช่ `cover` / ตั้ง `Content-Type` เองตอนส่ง FormData / ฟอร์มไม่ได้ใช้ multipart |
| `req.body` ว่างตอนส่ง FormData | ต้องผ่าน multer ก่อน (route ต้องมี `uploadCover`) |
| รูปไม่ขึ้น | เช็ก URL `/uploads/<ไฟล์>` เปิดตรงๆ ได้ไหม และ `app.use('/uploads', ...)` |
| CORS error | เปิดหน้าเว็บผ่าน `http://localhost:3000/` หรือเช็ก `app.use(cors())` |
| `Cannot GET /` | path โฟลเดอร์ `frontend` ใน `app.js` ผิด |
| ลบ catalog ไม่ได้ (409) | ยังมีหนังสืออ้างอิงอยู่ ต้องลบ/ย้ายหนังสือก่อน |

## Pattern copy ตารางใหม่

1. `sql/schema.sql` เพิ่ม `CREATE TABLE`
2. `controllers/xxxController.js` ก๊อปจาก `catalogController.js` แก้ validate + SQL
3. `routes/xxx.js` ก๊อปจาก `catalogs.js`
4. `app.js` เพิ่ม `app.use('/api/xxx', require('./routes/xxx'))`
5. frontend ก๊อป `catalogs.js` แก้ field และ id ใน HTML
