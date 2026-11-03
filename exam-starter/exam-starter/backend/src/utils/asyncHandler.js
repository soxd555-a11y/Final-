// ครอบ async controller เพื่อส่ง error ไปที่ error handler กลางอัตโนมัติ
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
