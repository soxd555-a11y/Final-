// หน้า catalog: ตาราง, ค้นหา, แบ่งหน้า, เพิ่ม/แก้ไข, ลบ (ใช้ JSON ไม่มีไฟล์)

const catalogState = { page: 1, limit: 10, q: '' };

const catalogEls = {
  tbody: document.getElementById('catalog-tbody'),
  pagination: document.getElementById('catalog-pagination'),
  search: document.getElementById('catalog-search'),
  dialog: document.getElementById('catalog-dialog'),
  form: document.getElementById('catalog-form'),
  title: document.getElementById('catalog-dialog-title'),
  id: document.getElementById('catalog-id'),
  name: document.getElementById('catalog-name'),
  description: document.getElementById('catalog-description'),
};

async function loadCatalogs() {
  try {
    const query = toQuery({
      q: catalogState.q,
      page: catalogState.page,
      limit: catalogState.limit,
    });
    const { data, pagination } = await api.get('/api/catalogs' + query);
    renderCatalogTable(data, pagination);
    renderPagination(catalogEls.pagination, pagination, (p) => {
      catalogState.page = p;
      loadCatalogs();
    });
  } catch (err) {
    showToast(err.message, true);
  }
}

function renderCatalogTable(rows, pagination) {
  if (!rows.length) {
    catalogEls.tbody.innerHTML = '<tr><td colspan="5" class="empty">ไม่พบข้อมูล</td></tr>';
    return;
  }
  const start = (pagination.page - 1) * pagination.limit;
  catalogEls.tbody.innerHTML = rows
    .map(
      (c, i) => `
    <tr>
      <td>${start + i + 1}</td>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.description || '-')}</td>
      <td class="num">${c.book_count}</td>
      <td>
        <button class="btn small" data-action="edit" data-id="${c.id}">แก้ไข</button>
        <button class="btn small danger" data-action="delete" data-id="${c.id}" data-name="${escapeHtml(c.name)}">ลบ</button>
      </td>
    </tr>`
    )
    .join('');
}

function openCatalogAdd() {
  catalogEls.form.reset();
  catalogEls.id.value = '';
  catalogEls.title.textContent = 'เพิ่มหมวดหมู่';
  catalogEls.dialog.showModal();
}

async function openCatalogEdit(id) {
  try {
    const { data } = await api.get('/api/catalogs/' + id);
    catalogEls.form.reset();
    catalogEls.title.textContent = 'แก้ไขหมวดหมู่';
    catalogEls.id.value = data.id;
    catalogEls.name.value = data.name;
    catalogEls.description.value = data.description || '';
    catalogEls.dialog.showModal();
  } catch (err) {
    showToast(err.message, true);
  }
}

catalogEls.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = catalogEls.id.value;
  const payload = {
    name: catalogEls.name.value.trim(),
    description: catalogEls.description.value.trim(),
  };
  try {
    if (id) {
      await api.put('/api/catalogs/' + id, payload);
      showToast('แก้ไขหมวดหมู่สำเร็จ');
    } else {
      await api.post('/api/catalogs', payload);
      showToast('เพิ่มหมวดหมู่สำเร็จ');
      catalogState.page = 1;
    }
    catalogEls.dialog.close();
    loadCatalogs();
    loadCatalogOptions(); // อัปเดต dropdown ในหน้าหนังสือ
    loadBooks();          // ชื่อหมวดในตารางหนังสืออาจเปลี่ยน
  } catch (err) {
    showToast(err.message, true);
  }
});

document.getElementById('catalog-cancel').addEventListener('click', () => catalogEls.dialog.close());
document.getElementById('catalog-add').addEventListener('click', openCatalogAdd);

catalogEls.tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.action === 'edit') return openCatalogEdit(id);

  if (btn.dataset.action === 'delete') {
    if (!confirmDelete(`ลบหมวดหมู่ "${btn.dataset.name}" ?`)) return;
    try {
      await api.del('/api/catalogs/' + id);
      showToast('ลบหมวดหมู่สำเร็จ');
      if (catalogEls.tbody.querySelectorAll('tr').length === 1 && catalogState.page > 1) {
        catalogState.page--;
      }
      loadCatalogs();
      loadCatalogOptions();
    } catch (err) {
      // เช่น 409 ลบไม่ได้เพราะยังมีหนังสืออยู่ในหมวดนี้
      showToast(err.message, true);
    }
  }
});

catalogEls.search.addEventListener(
  'input',
  debounce(() => {
    catalogState.q = catalogEls.search.value.trim();
    catalogState.page = 1;
    loadCatalogs();
  })
);
