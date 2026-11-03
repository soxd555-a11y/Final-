// สลับแท็บ และโหลดข้อมูลครั้งแรก

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.remove('hidden');
  });
});

(async function init() {
  try {
    await loadCatalogOptions();
  } catch (err) {
    showToast(err.message, true);
  }
  loadBooks();
  loadCatalogs();
})();
