const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const HttpError = require('../utils/httpError');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // ตั้งชื่อใหม่ไม่ให้ซ้ำ: timestamp + random
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new HttpError(400, 'อนุญาตเฉพาะไฟล์ jpg, png, webp'));
    }
    cb(null, true);
  },
});

// ลบไฟล์ปกออกจากดิสก์ (เงียบถ้าไม่มีไฟล์)
function removeFile(filename) {
  if (!filename) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(filename)), () => {});
}

module.exports = {
  uploadCover: upload.single('cover'), // ชื่อ field ในฟอร์มต้องเป็น "cover"
  removeFile,
  UPLOAD_DIR,
};
