// โยน error พร้อม status code เช่น throw new HttpError(404, 'ไม่พบข้อมูล')
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
