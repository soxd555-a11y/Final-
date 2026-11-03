// helper ฝั่งหน้าจอ: escape HTML, toast, แบ่งหน้า, debounce

// กัน XSS เวลาเอาข้อมูลไปต่อเป็น HTML string
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(n) {
  return Number(n).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

let toastTimer;
function showToast(message, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

// ยืนยันก่อนลบ
function confirmDelete(message) {
  return window.confirm(message || 'ยืนยันการลบ?');
}

function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// วาดปุ่มแบ่งหน้า  pagination = { page, totalPages }
function renderPagination(container, pagination, onPage) {
  const { page, totalPages } = pagination;
  container.innerHTML = '';
  if (totalPages <= 1) return;

  const add = (label, target, opts = {}) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.disabled = !!opts.disabled;
    if (opts.active) b.classList.add('active');
    b.addEventListener('click', () => onPage(target));
    container.appendChild(b);
  };

  add('«', page - 1, { disabled: page <= 1 });
  for (let p = 1; p <= totalPages; p++) {
    add(String(p), p, { active: p === page });
  }
  add('»', page + 1, { disabled: page >= totalPages });
}
