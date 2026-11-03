const db = require('../config/db');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { removeFile } = require('../middleware/upload');

const SELECT_BOOK = `
  SELECT b.id, b.title, b.author, b.isbn, b.price, b.publish_year,
         b.catalog_id, b.cover, b.created_at,
         c.name AS catalog_name
  FROM books b
  JOIN catalogs c ON c.id = b.catalog_id`;

const SORT_COLUMNS = {
  id: 'b.id',
  title: 'b.title',
  price: 'b.price',
  created_at: 'b.created_at',
};

// เพิ่ม cover_url ให้ frontend ใช้ใน <img src>
function withCoverUrl(row) {
  return { ...row, cover_url: row.cover ? `/uploads/${row.cover}` : null };
}

// ตรวจข้อมูลจากฟอร์ม (multipart ส่งมาเป็น string ทั้งหมด)
function validate(body) {
  const title = (body.title || '').trim();
  const author = (body.author || '').trim();
  const isbn = (body.isbn || '').trim();
  const price = Number(body.price);
  const catalogId = parseInt(body.catalog_id);
  const publishYear =
    body.publish_year === undefined || body.publish_year === ''
      ? null
      : parseInt(body.publish_year);

  if (!title) throw new HttpError(400, 'กรุณากรอกชื่อหนังสือ');
  if (title.length > 255) throw new HttpError(400, 'ชื่อหนังสือยาวเกิน 255 ตัวอักษร');
  if (!author) throw new HttpError(400, 'กรุณากรอกชื่อผู้แต่ง');
  if (body.price === undefined || body.price === '' || Number.isNaN(price) || price < 0) {
    throw new HttpError(400, 'ราคาต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป');
  }
  if (!catalogId) throw new HttpError(400, 'กรุณาเลือก catalog');
  if (publishYear !== null && (Number.isNaN(publishYear) || publishYear < 1000 || publishYear > 3000)) {
    throw new HttpError(400, 'ปีที่พิมพ์ไม่ถูกต้อง');
  }

  return { title, author, isbn: isbn || null, price, catalogId, publishYear };
}

async function findOne(id) {
  const [rows] = await db.query(`${SELECT_BOOK} WHERE b.id = ?`, [id]);
  return rows[0];
}

// GET /api/books?q=&catalog_id=&page=1&limit=10&sort=id&order=desc
exports.list = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const catalogId = parseInt(req.query.catalog_id) || null;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const offset = (page - 1) * limit;
  const sortCol = SORT_COLUMNS[req.query.sort] || 'b.id';
  const order = String(req.query.order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const conditions = [];
  const params = [];
  if (q) {
    conditions.push('(b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (catalogId) {
    conditions.push('b.catalog_id = ?');
    params.push(catalogId);
  }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM books b JOIN catalogs c ON c.id = b.catalog_id ${where}`,
    params
  );
  const [rows] = await db.query(
    `${SELECT_BOOK} ${where} ORDER BY ${sortCol} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    success: true,
    data: rows.map(withCoverUrl),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
});

// GET /api/books/:id
exports.getById = asyncHandler(async (req, res) => {
  const row = await findOne(req.params.id);
  if (!row) throw new HttpError(404, 'ไม่พบหนังสือ');
  res.json({ success: true, data: withCoverUrl(row) });
});

// POST /api/books  (multipart/form-data, ไฟล์ปกใน field "cover")
exports.create = asyncHandler(async (req, res) => {
  try {
    const b = validate(req.body);
    const cover = req.file ? req.file.filename : null;
    const [result] = await db.query(
      `INSERT INTO books (title, author, isbn, price, publish_year, catalog_id, cover)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [b.title, b.author, b.isbn, b.price, b.publishYear, b.catalogId, cover]
    );
    const row = await findOne(result.insertId);
    res.status(201).json({ success: true, message: 'เพิ่มหนังสือสำเร็จ', data: withCoverUrl(row) });
  } catch (err) {
    if (req.file) removeFile(req.file.filename); // ไม่ให้มีไฟล์ค้างถ้า insert ไม่ผ่าน
    throw err;
  }
});

// PUT /api/books/:id  (ไม่เลือกรูปใหม่ = ใช้รูปเดิม)
exports.update = asyncHandler(async (req, res) => {
  try {
    const existing = await findOne(req.params.id);
    if (!existing) throw new HttpError(404, 'ไม่พบหนังสือ');

    const b = validate(req.body);
    const cover = req.file ? req.file.filename : existing.cover;
    await db.query(
      `UPDATE books
       SET title = ?, author = ?, isbn = ?, price = ?, publish_year = ?, catalog_id = ?, cover = ?
       WHERE id = ?`,
      [b.title, b.author, b.isbn, b.price, b.publishYear, b.catalogId, cover, req.params.id]
    );

    if (req.file) removeFile(existing.cover); // ลบรูปเก่าเมื่อเปลี่ยนรูปใหม่สำเร็จ
    const row = await findOne(req.params.id);
    res.json({ success: true, message: 'แก้ไขหนังสือสำเร็จ', data: withCoverUrl(row) });
  } catch (err) {
    if (req.file) removeFile(req.file.filename);
    throw err;
  }
});

// DELETE /api/books/:id
exports.remove = asyncHandler(async (req, res) => {
  const existing = await findOne(req.params.id);
  if (!existing) throw new HttpError(404, 'ไม่พบหนังสือ');
  await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
  removeFile(existing.cover);
  res.json({ success: true, message: 'ลบหนังสือสำเร็จ' });
});
