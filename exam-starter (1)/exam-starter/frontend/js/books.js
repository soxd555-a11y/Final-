// หน้าหนังสือ: ตาราง, ค้นหา, กรอง, แบ่งหน้า, เพิ่ม/แก้ไข (พร้อมอัปโหลดปก), ลบ

const bookState = { page: 1, limit: 10, q: '', catalogId: '' };

const bookEls = {
  tbody: document.getElementById('book-tbody'),
  pagination: document.getElementById('book-pagination'),
  search: document.getElementById('book-search'),
  filter: document.getElementById('book-filter-catalog'),
  dialog: document.getElementById('book-dialog'),
  form: document.getElementById('book-form'),
  title: document.getElementById('book-dialog-title'),
  id: document.getElementById('book-id'),
  catalog: document.getElementById('book-catalog'),
  cover: document.getElementById('book-cover'),
  preview: document.getElementById('book-cover-preview'),
};

// ---------- dropdown หมวดหมู่ (ใช้ทั้งตัวกรองและในฟอร์ม) ----------
async function loadCatalogOptions() {
  const { data } = await api.get('/api/catalogs?all=true');
  const options = data
    .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
    .join('');
  const currentFilter = bookEls.filter.value;
  const currentForm = bookEls.catalog.value;
  bookEls.filter.innerHTML = '<option value="">ทุกหมวดหมู่</option>' + options;
  bookEls.catalog.innerHTML = '<option value="">-- เลือกหมวดหมู่ --</option>' + options;
  bookEls.filter.value = currentFilter;
  bookEls.catalog.value = currentForm;
}

// ---------- โหลดและแสดงตาราง ----------
async function loadBooks() {
  try {
    const query = toQuery({
      q: bookState.q,
      catalog_id: bookState.catalogId,
      page: bookState.page,
      limit: bookState.limit,
    });
    const { data, pagination } = await api.get('/api/books' + query);
    renderBookTable(data);
    renderPagination(bookEls.pagination, pagination, (p) => {
      bookState.page = p;
      loadBooks();
    });
  } catch (err) {
    showToast(err.message, true);
  }
}

function renderBookTable(rows) {
  if (!rows.length) {
    bookEls.tbody.innerHTML = '<tr><td colspan="7" class="empty">ไม่พบข้อมูล</td></tr>';
    return;
  }
  bookEls.tbody.innerHTML = rows
    .map(
      (b) => `
    <tr>
      <td>${
        b.cover_url
          ? `<img class="thumb" src="${API_BASE + b.cover_url}" alt="ปก ${escapeHtml(b.title)}">`
          : '<div class="no-cover">ไม่มีปก</div>'
      }</td>
      <td>${escapeHtml(b.title)}</td>
      <td>${escapeHtml(b.author)}</td>
      <td>${escapeHtml(b.catalog_name)}</td>
      <td class="num">${formatPrice(b.price)}</td>
      <td>${b.publish_year ?? '-'}</td>
      <td>
        <button class="btn small" data-action="edit" data-id="${b.id}">แก้ไข</button>
        <button class="btn small danger" data-action="delete" data-id="${b.id}" data-title="${escapeHtml(b.title)}">ลบ</button>
      </td>
    </tr>`
    )
    .join('');
}

// ---------- เปิดฟอร์ม ----------
function resetBookForm() {
  bookEls.form.reset();
  bookEls.id.value = '';
  bookEls.preview.classList.add('hidden');
  bookEls.preview.removeAttribute('src');
}

function openBookAdd() {
  resetBookForm();
  bookEls.title.textContent = 'เพิ่มหนังสือ';
  bookEls.dialog.showModal();
}

async function openBookEdit(id) {
  try {
    const { data } = await api.get('/api/books/' + id);
    resetBookForm();
    bookEls.title.textContent = 'แก้ไขหนังสือ';
    bookEls.id.value = data.id;
    document.getElementById('book-title').value = data.title;
    document.getElementById('book-author').value = data.author;
    document.getElementById('book-isbn').value = data.isbn || '';
    document.getElementById('book-price').value = data.price;
    document.getElementById('book-year').value = data.publish_year || '';
    bookEls.catalog.value = data.catalog_id;
    if (data.cover_url) {
      bookEls.preview.src = API_BASE + data.cover_url; // แสดงปกเดิม
      bookEls.preview.classList.remove('hidden');
    }
    bookEls.dialog.showModal();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ---------- preview รูปก่อนอัปโหลด ----------
bookEls.cover.addEventListener('change', () => {
  const file = bookEls.cover.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast('ไฟล์ใหญ่เกิน 2MB', true);
    bookEls.cover.value = '';
    return;
  }
  bookEls.preview.src = URL.createObjectURL(file);
  bookEls.preview.classList.remove('hidden');
});

// ---------- บันทึก (เพิ่ม / แก้ไข) ----------
bookEls.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = bookEls.id.value;
  const formData = new FormData(bookEls.form); // รวมไฟล์ใน field "cover" ให้เอง
  try {
    if (id) {
      await api.put('/api/books/' + id, formData);
      showToast('แก้ไขหนังสือสำเร็จ');
    } else {
      await api.post('/api/books', formData);
      showToast('เพิ่มหนังสือสำเร็จ');
      bookState.page = 1;
    }
    bookEls.dialog.close();
    loadBooks();
    loadCatalogs(); // อัปเดตจำนวนหนังสือในหน้า catalog
  } catch (err) {
    showToast(err.message, true);
  }
});

document.getElementById('book-cancel').addEventListener('click', () => bookEls.dialog.close());
document.getElementById('book-add').addEventListener('click', openBookAdd);

// ---------- ปุ่มแก้ไข / ลบ ในตาราง (event delegation) ----------
bookEls.tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.action === 'edit') return openBookEdit(id);

  if (btn.dataset.action === 'delete') {
    if (!confirmDelete(`ลบหนังสือ "${btn.dataset.title}" ?`)) return;
    try {
      await api.del('/api/books/' + id);
      showToast('ลบหนังสือสำเร็จ');
      // ถ้าลบรายการสุดท้ายของหน้า ให้ถอยกลับหน้าก่อนหน้า
      if (bookEls.tbody.querySelectorAll('tr').length === 1 && bookState.page > 1) {
        bookState.page--;
      }
      loadBooks();
      loadCatalogs();
    } catch (err) {
      showToast(err.message, true);
    }
  }
});

// ---------- ค้นหา / กรอง ----------
bookEls.search.addEventListener(
  'input',
  debounce(() => {
    bookState.q = bookEls.search.value.trim();
    bookState.page = 1;
    loadBooks();
  })
);
bookEls.filter.addEventListener('change', () => {
  bookState.catalogId = bookEls.filter.value;
  bookState.page = 1;
  loadBooks();
});
