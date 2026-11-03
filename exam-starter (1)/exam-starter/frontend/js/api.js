// fetch wrapper: ใช้เรียก API ทุกจุด
// ถ้า frontend กับ backend อยู่คนละ port ให้ตั้งก่อนโหลดไฟล์นี้ เช่น window.API_BASE = 'http://localhost:3000'
const API_BASE = window.API_BASE || '';

async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, options);

  let body = null;
  try {
    body = await res.json();
  } catch (_) {
    // response ไม่ใช่ JSON
  }

  if (!res.ok || (body && body.success === false)) {
    throw new Error((body && body.message) || `เกิดข้อผิดพลาด (${res.status})`);
  }
  return body;
}

function buildOptions(method, data) {
  // FormData (อัปโหลดไฟล์): ห้ามตั้ง Content-Type เอง เบราว์เซอร์จะใส่ boundary ให้
  if (data instanceof FormData) return { method, body: data };
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, buildOptions('POST', data)),
  put: (path, data) => request(path, buildOptions('PUT', data)),
  del: (path) => request(path, { method: 'DELETE' }),
};

// สร้าง query string จาก object (ข้ามค่าว่าง)
function toQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const s = qs.toString();
  return s ? '?' + s : '';
}
