const db = require('../config/db');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

function validate(body) {
  const name = (body.name || '').trim();
  const description = (body.description || '').trim();
  if (!name) throw new HttpError(400, 'กรุณากรอกชื่อ catalog');
  if (name.length > 100) throw new HttpError(400, 'ชื่อ catalog ยาวเกิน 100 ตัวอักษร');
  if (description.length > 255) throw new HttpError(400, 'คำอธิบายยาวเกิน 255 ตัวอักษร');
  return { name, description: description || null };
}

async function findOne(id) {
  const [rows] = await db.query(
    `SELECT c.id, c.name, c.description, c.created_at,
            COUNT(b.id) AS book_count
     FROM catalogs c
     LEFT JOIN books b ON b.catalog_id = c.id
     WHERE c.id = ?
     GROUP BY c.id`,
    [id]
  );
  return rows[0];
}

// GET /api/catalogs?q=&page=1&limit=10  หรือ ?all=true (ใช้เติม dropdown)
exports.list = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const where = q ? 'WHERE c.name LIKE ? OR c.description LIKE ?' : '';
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  if (req.query.all === 'true') {
    const [rows] = await db.query(
      `SELECT c.id, c.name, c.description FROM catalogs c ${where} ORDER BY c.name`,
      params
    );
    return res.json({ success: true, data: rows });
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM catalogs c ${where}`,
    params
  );
  const [rows] = await db.query(
    `SELECT c.id, c.name, c.description, c.created_at,
            COUNT(b.id) AS book_count
     FROM catalogs c
     LEFT JOIN books b ON b.catalog_id = c.id
     ${where}
     GROUP BY c.id
     ORDER BY c.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
});

// GET /api/catalogs/:id
exports.getById = asyncHandler(async (req, res) => {
  const row = await findOne(req.params.id);
  if (!row) throw new HttpError(404, 'ไม่พบ catalog');
  res.json({ success: true, data: row });
});

// POST /api/catalogs
exports.create = asyncHandler(async (req, res) => {
  const { name, description } = validate(req.body);
  const [result] = await db.query(
    'INSERT INTO catalogs (name, description) VALUES (?, ?)',
    [name, description]
  );
  const row = await findOne(result.insertId);
  res.status(201).json({ success: true, message: 'เพิ่ม catalog สำเร็จ', data: row });
});

// PUT /api/catalogs/:id
exports.update = asyncHandler(async (req, res) => {
  const existing = await findOne(req.params.id);
  if (!existing) throw new HttpError(404, 'ไม่พบ catalog');

  const { name, description } = validate(req.body);
  await db.query('UPDATE catalogs SET name = ?, description = ? WHERE id = ?', [
    name,
    description,
    req.params.id,
  ]);
  const row = await findOne(req.params.id);
  res.json({ success: true, message: 'แก้ไข catalog สำเร็จ', data: row });
});

// DELETE /api/catalogs/:id  (ลบไม่ได้ถ้ายังมีหนังสืออยู่ในหมวดนี้)
exports.remove = asyncHandler(async (req, res) => {
  const existing = await findOne(req.params.id);
  if (!existing) throw new HttpError(404, 'ไม่พบ catalog');
  if (existing.book_count > 0) {
    throw new HttpError(
      409,
      `ลบไม่ได้ เพราะยังมีหนังสือ ${existing.book_count} เล่มอยู่ในหมวดนี้`
    );
  }
  await db.query('DELETE FROM catalogs WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'ลบ catalog สำเร็จ' });
});
