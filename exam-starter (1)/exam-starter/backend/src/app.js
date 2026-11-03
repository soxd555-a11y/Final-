require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const { UPLOAD_DIR } = require('./middleware/upload');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

// ไฟล์ปกที่อัปโหลด: http://localhost:3000/uploads/xxx.jpg
app.use('/uploads', express.static(UPLOAD_DIR));

// เช็กว่าเซิร์ฟเวอร์และ DB ทำงาน
app.get('/health', async (req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.json({ success: true, message: 'ok' });
  } catch (err) {
    next(err);
  }
});

// API
app.use('/api/catalogs', require('./routes/catalogs'));
app.use('/api/books', require('./routes/books'));

// API ที่ไม่มีอยู่จริง
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'ไม่พบ endpoint นี้' });
});

// เสิร์ฟ frontend จากโฟลเดอร์ ../frontend (เปิด http://localhost:3000/)
app.use(express.static(path.join(__dirname, '../../frontend')));

// error handler กลาง (ต้องอยู่ท้ายสุด)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;
