const multer = require('multer');

// error handler กลาง (ต้อง app.use เป็นตัวสุดท้าย)
module.exports = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof multer.MulterError) {
    status = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'ไฟล์ใหญ่เกิน 2MB'
        : 'อัปโหลดไฟล์ไม่สำเร็จ: ' + err.message;
  } else if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'ข้อมูลซ้ำ มีรายการนี้อยู่แล้ว';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 400;
    message = 'ไม่พบ catalog ที่ระบุ';
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    status = 409;
    message = 'ลบไม่ได้ เพราะยังมีข้อมูลอื่นอ้างอิงอยู่';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'JSON ไม่ถูกต้อง';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message });
};
