// assets/app.js - Vanilla JavaScript for the main site
// Handles theme toggle, navigation, sidebar, copy buttons, search, checklist, back-to-top

(function () {
  'use strict';

  var STORAGE_THEME_KEY = 'theme';
  var STORAGE_CHECKLIST_KEY = 'qa-playbook-checklist-v1';

  var MOON_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20.5 14.2A8.4 8.4 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/></svg>';
  var SUN_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function showToast(msg) {
    var toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch (err) {
      return false;
    }
  }

  /* ---------- Theme ---------- */
  function initTheme() {
    var themeToggle = $('theme-toggle');
    if (!themeToggle) return;

    var savedTheme = null;
    try { savedTheme = localStorage.getItem(STORAGE_THEME_KEY); } catch (e) { /* ignore */ }

    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var currentTheme = savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light';

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      themeToggle.innerHTML = theme === 'dark' ? SUN_ICON : MOON_ICON;
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด');
      themeToggle.setAttribute('title', theme === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด');
    }
    applyTheme(currentTheme);

    themeToggle.addEventListener('click', function () {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(currentTheme);
      try { localStorage.setItem(STORAGE_THEME_KEY, currentTheme); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- Copy buttons (delegated) ---------- */
  function initCopyButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.copy-btn');
      if (!btn) return;
      e.preventDefault();
      var container = btn.closest('code-block, .code-wrap, pre, .copy-target') || btn.parentElement;
      var codeEl = container ? container.querySelector('pre code, code, pre') : null;
      var text = btn.getAttribute('data-copy');
      if (text === null || text === undefined || text === '') {
        text = codeEl ? codeEl.textContent : '';
      }
      if (!text) { showToast('ไม่มีข้อความให้ copy'); return; }
      var original = btn.textContent;
      copyText(text).then(function (ok) {
        btn.classList.add('copied');
        btn.textContent = ok ? 'Copied!' : 'Copied?';
        showToast(ok ? 'คัดลอกแล้ว' : 'คัดลอกไม่สำเร็จ');
        setTimeout(function () { btn.classList.remove('copied'); btn.textContent = original || 'Copy'; }, 1500);
      });
    });
  }

  /* ---------- Site-wide search ---------- */
  function initSearch() {
    var input = $('search-input');
    if (!input) return;

    var index = window.QA_SEARCH_INDEX || [];
    var host = document.querySelector('.navbar') || input.closest('.nav-actions') || document.body;
    var panel = document.createElement('div');
    panel.id = 'search-results';
    panel.className = 'search-results';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'ผลการค้นหาทั้งเว็บ');
    panel.hidden = true;
    host.appendChild(panel);

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'search-results-list');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');

    var results = [];
    var activeIndex = -1;

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }
    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    }
    function escapeRegExp(value) {
      return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function highlight(value, query) {
      var safe = escapeHtml(value);
      var tokens = normalize(query).split(' ').filter(Boolean);
      if (!tokens.length) return safe;
      var re = new RegExp('(' + tokens.map(escapeRegExp).join('|') + ')', 'gi');
      return safe.replace(re, '<mark>$1</mark>');
    }
    function pageLabel(entry) {
      if (entry.page === 'index.html') return 'Home';
      return String(entry.pageTitle || entry.page || '')
        .replace(/\s*[-|–]\s*QA Playbook.*$/i, '')
        .trim() || entry.page;
    }
    function resultUrl(entry) {
      return entry.page + (entry.id ? '#' + entry.id : '');
    }
    function snippet(entry, query) {
      var text = entry.text || entry.subheads || '';
      var first = normalize(query).split(' ')[0] || '';
      var at = first ? text.toLowerCase().indexOf(first) : -1;
      if (at > 70) text = '…' + text.slice(at - 45);
      if (text.length > 200) text = text.slice(0, 200).replace(/\s+\S*$/, '') + '…';
      return text;
    }

    function scoreEntry(entry, tokens) {
      var title = normalize(entry.title);
      var pageTitle = normalize(entry.pageTitle);
      var subheads = normalize(entry.subheads);
      var keywords = normalize(entry.keywords);
      var text = normalize(entry.text);
      var code = normalize(entry.code);
      var haystack = title + ' ' + pageTitle + ' ' + subheads + ' ' + keywords + ' ' + text + ' ' + code;
      var score = 0;
      var matched = 0;

      tokens.forEach(function (token) {
        if (haystack.indexOf(token) === -1) return;
        matched++;
        if (title === token) score += 120;
        else if (title.indexOf(token) === 0) score += 90;
        else if (title.indexOf(token) !== -1) score += 70;
        if (pageTitle.indexOf(token) !== -1) score += 35;
        if (keywords.indexOf(token) !== -1) score += 120;
        if (subheads.indexOf(token) !== -1) score += 30;
        if (code.indexOf(token) !== -1) score += 25;
        if (text.indexOf(token) !== -1) score += 12;
        var occurrences = haystack.match(new RegExp(escapeRegExp(token), 'g')) || [];
        score += Math.min(occurrences.length, 6) * 2;
      });

      if (!matched) return 0;
      if (matched < tokens.length) score *= 0.35;
      if (entry.kind === 'page') score += 4;
      return score;
    }

    function buildResults(query) {
      var tokens = normalize(query).split(' ').filter(Boolean);
      if (!tokens.length) return [];
      var scored = [];
      index.forEach(function (entry) {
        var score = scoreEntry(entry, tokens);
        if (score > 0) scored.push({ entry: entry, score: score });
      });
      scored.sort(function (a, b) { return b.score - a.score; });

      var seen = {};
      var out = [];
      for (var i = 0; i < scored.length && out.length < 10; i++) {
        var entry = scored[i].entry;
        var key = entry.page + '|' + entry.id + '|' + entry.title;
        if (seen[key]) continue;
        seen[key] = true;
        out.push(entry);
      }
      return out;
    }

    function positionPanel() {
      if (window.innerWidth <= 720) {
        panel.style.right = '';
        return;
      }
      var navbar = document.querySelector('.navbar');
      if (!navbar) return;
      var navRect = navbar.getBoundingClientRect();
      var inputRect = input.getBoundingClientRect();
      panel.style.right = Math.max(12, Math.round(navRect.right - inputRect.right)) + 'px';
    }
    function openPanel() {
      positionPanel();
      panel.hidden = false;
      panel.classList.add('is-open');
      input.setAttribute('aria-expanded', 'true');
    }
    function closePanel() {
      panel.hidden = true;
      panel.classList.remove('is-open');
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      activeIndex = -1;
    }
    function setActive(nextIndex) {
      var links = panel.querySelectorAll('.search-result');
      if (!links.length) return;
      activeIndex = (nextIndex + links.length) % links.length;
      links.forEach(function (link, i) {
        var active = i === activeIndex;
        link.classList.toggle('is-active', active);
        link.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      var active = links[activeIndex];
      if (active) {
        input.setAttribute('aria-activedescendant', active.id);
        if (active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
      }
    }
    function bindResultEvents() {
      panel.querySelectorAll('.search-result').forEach(function (link) {
        link.addEventListener('mouseenter', function () {
          setActive(Number(link.getAttribute('data-index')));
        });
      });
    }

    function resultMarkup(entry, i, query) {
      var title = query ? highlight(entry.title, query) : escapeHtml(entry.title);
      var body = query ? highlight(snippet(entry, query), query) : '';
      return '<a class="search-result" role="option" id="search-result-' + i + '" data-index="' + i + '" href="' + resultUrl(entry) + '" aria-selected="false">' +
        '<span class="search-result-icon" aria-hidden="true">' + (entry.kind === 'page' ? '↗' : '§') + '</span>' +
        '<span class="search-result-body">' +
          '<span class="search-result-top"><span class="search-result-title">' + title + '</span>' +
          '<span class="search-result-page">' + escapeHtml(pageLabel(entry)) + '</span></span>' +
          (body ? '<span class="search-result-snippet">' + body + '</span>' : '') +
        '</span></a>';
    }

    function renderQuickLinks() {
      var quick = [
        { title: 'Playwright Syntax & Usage', page: 'playwright.html', id: 'pw-syntax', pageTitle: 'Playwright' },
        { title: 'Locators', page: 'playwright.html', id: '5-5-4', pageTitle: 'Playwright' },
        { title: 'Assertions', page: 'playwright.html', id: '5-5-6', pageTitle: 'Playwright' },
        { title: 'Recipes', page: 'playwright-recipes.html', id: '', pageTitle: 'Playwright Recipes' },
        { title: 'Tools', page: 'tools.html', id: '', pageTitle: 'Tools' },
        { title: 'Checklist', page: 'checklist.html', id: '', pageTitle: 'Checklist' }
      ];
      results = [];
      activeIndex = -1;
      panel.innerHTML = '<div class="search-results-head"><span>ค้นหาด่วน</span><span class="search-results-count">ไปที่</span></div>' +
        '<div class="search-results-list" id="search-results-list" role="listbox" aria-label="ลิงก์ด่วน">' +
        quick.map(function (entry, i) { return resultMarkup(entry, i, ''); }).join('') +
        '</div>';
      openPanel();
      bindResultEvents();
      setActive(0);
    }

    function render(query) {
      var normalized = normalize(query);
      if (!normalized) {
        renderQuickLinks();
        return;
      }
      results = buildResults(normalized);
      activeIndex = -1;

      if (!results.length) {
        panel.innerHTML = '<div class="search-results-head"><span>ค้นหาทั้งเว็บ</span><span class="search-results-count">0 ผลลัพธ์</span></div>' +
          '<div class="search-results-empty">ไม่พบผลลัพธ์สำหรับ <strong>' + escapeHtml(query) + '</strong><br><span>ลองใช้คำสั้นลง เช่น “locator”, “assertion”, “mock”</span></div>';
        openPanel();
        input.removeAttribute('aria-activedescendant');
        return;
      }

      var countLabel = results.length >= 10 ? '10 รายการแรก' : results.length + ' รายการ';
      panel.innerHTML = '<div class="search-results-head"><span>ค้นหาทั้งเว็บ</span><span class="search-results-count">' + countLabel + '</span></div>' +
        '<div class="search-results-list" id="search-results-list" role="listbox" aria-label="ผลการค้นหาทั้งเว็บ">' +
        results.map(function (entry, i) { return resultMarkup(entry, i, query); }).join('') +
        '</div>' +
        '<div class="search-results-foot"><span><kbd>↑</kbd><kbd>↓</kbd> เลือก</span><span><kbd>↵</kbd> เปิด</span><span><kbd>Esc</kbd> ปิด</span></div>';
      openPanel();
      bindResultEvents();
      setActive(0);
    }

    window.addEventListener('resize', function () {
      if (!panel.hidden) positionPanel();
    });
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('focus', function () {
      document.querySelectorAll('.nav-more details[open]').forEach(function (details) {
        details.removeAttribute('open');
      });
      if (normalize(input.value)) render(input.value);
      else renderQuickLinks();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (panel.hidden) render(input.value);
        setActive(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (panel.hidden) render(input.value);
        setActive(activeIndex - 1);
      } else if (e.key === 'Enter') {
        if (!panel.hidden && activeIndex >= 0) {
          var link = panel.querySelectorAll('.search-result')[activeIndex];
          if (link) {
            e.preventDefault();
            window.location.href = link.getAttribute('href');
          }
        }
      } else if (e.key === 'Escape') {
        closePanel();
        input.blur();
      }
    });

    document.addEventListener('click', function (e) {
      if (panel.hidden) return;
      if (e.target.closest('.search-field') || panel.contains(e.target)) return;
      closePanel();
    });

    // keyboard shortcuts: "/" or Ctrl/Cmd+K focuses site search
    document.addEventListener('keydown', function (e) {
      var typing = /input|textarea|select/i.test(document.activeElement && document.activeElement.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.focus();
        input.select();
        return;
      }
      if (e.key === '/' && document.activeElement !== input && !typing) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  /* ---------- Sidebar / navigation ---------- */
  function initSidebar() {
    var sidebar = $('sidebar');
    if (!sidebar) return;

    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

    // active page in navbar
    navAnchors.forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });

    // if the active link lives in the "More" menu, mark the trigger
    var activeNavLink = document.querySelector('.nav-links a.active');
    if (activeNavLink) {
      var more = activeNavLink.closest('.nav-more');
      if (more) {
        var summary = more.querySelector('summary');
        if (summary) {
          summary.classList.add('active');
          var caret = summary.querySelector('svg');
          summary.textContent = activeNavLink.textContent.trim() + ' ';
          if (caret) summary.appendChild(caret);
        }
      }
    }

    // Site map (visible on mobile, where the top nav is hidden)
    var siteSection = document.createElement('div');
    siteSection.className = 'sidebar-section sidebar-site';
    var siteLabel = document.createElement('p');
    siteLabel.className = 'sidebar-label';
    siteLabel.innerHTML = 'หน้าเว็บ <span>Site map</span>';
    var siteList = document.createElement('ul');
    navAnchors.forEach(function (a) {
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      if (a.classList.contains('active')) link.classList.add('active');
      li.appendChild(link);
      siteList.appendChild(li);
    });
    siteSection.appendChild(siteLabel);
    siteSection.appendChild(siteList);

    // On-page table of contents
    var headings = document.querySelectorAll('main h2[id]');
    var tocSection = document.createElement('div');
    tocSection.className = 'sidebar-section sidebar-toc';
    var tocLabel = document.createElement('p');
    tocLabel.className = 'sidebar-label';
    tocLabel.innerHTML = 'ในหน้านี้ <span>On this page</span>';
    var list = document.createElement('ul');
    headings.forEach(function (heading) {
      if (heading.classList.contains('sr-only')) return;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + heading.id;
      a.textContent = heading.textContent.trim();
      li.appendChild(a);
      list.appendChild(li);
    });
    tocSection.appendChild(tocLabel);
    tocSection.appendChild(list);

    sidebar.innerHTML = '';
    sidebar.appendChild(siteSection);
    if (list.children.length) sidebar.appendChild(tocSection);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'sidebar-close';
    closeBtn.setAttribute('aria-label', 'ปิดเมนู');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    closeBtn.addEventListener('click', closeMenu);
    sidebar.appendChild(closeBtn);

    var links = Array.prototype.slice.call(list.querySelectorAll('a'));

    var menuToggle = $('menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', function () {
        var open = sidebar.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
        toggleOverlay(open);
        document.documentElement.classList.toggle('menu-open', open);
      });
    }

    links.concat(Array.prototype.slice.call(siteList.querySelectorAll('a'))).forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    function closeMenu() {
      sidebar.classList.remove('open');
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'เปิดเมนู');
      }
      toggleOverlay(false);
      document.documentElement.classList.remove('menu-open');
    }

    function toggleOverlay(show) {
      var overlay = document.querySelector('.sidebar-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeMenu);
      }
      overlay.classList.toggle('show', show);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    if ('IntersectionObserver' in window && links.length) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) { l.classList.remove('active'); });
          var active = links.find(function (l) { return l.getAttribute('href') === '#' + entry.target.id; });
          if (active) active.classList.add('active');
        });
      }, { rootMargin: '-8% 0px -78% 0px', threshold: 0 });
      links.forEach(function (link) {
        var id = (link.getAttribute('href') || '').replace(/^#/, '');
        var target = id ? document.getElementById(id) : null;
        if (target) observer.observe(target);
      });
    }
  }

  /* ---------- Close the "More" dropdown when clicking outside ---------- */
  function initDropdowns() {
    document.addEventListener('click', function (e) {
      document.querySelectorAll('.nav-more details[open]').forEach(function (details) {
        if (!details.contains(e.target)) details.removeAttribute('open');
      });
    });
  }

  /* ---------- Checklist ---------- */
  function initChecklist() {
    var container = $('checklist');
    if (!container) return;
    var STORAGE_KEY = STORAGE_CHECKLIST_KEY;
    var resetBtn = $('checklist-reset');

    function loadState() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        var parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (e) { return {}; }
    }
    function saveState(state) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    }

    var state = loadState();
    var items = container.querySelectorAll('input[type="checkbox"][data-key]');

    // progress bar (placed just below the section title)
    var progressWrap = document.createElement('div');
    progressWrap.className = 'checklist-progress';
    var progressFill = document.createElement('div');
    progressWrap.appendChild(progressFill);
    var progressLabel = document.createElement('p');
    progressLabel.className = 'muted mb-2';
    var checklistHeading = container.querySelector('h2');
    if (checklistHeading) {
      checklistHeading.insertAdjacentElement('afterend', progressWrap);
      checklistHeading.insertAdjacentElement('afterend', progressLabel);
    } else {
      container.insertBefore(progressLabel, container.firstChild);
      container.insertBefore(progressWrap, progressLabel.nextSibling);
    }

    function updateProgress() {
      var total = items.length;
      var done = 0;
      items.forEach(function (i) { if (i.checked) done++; });
      var pct = total ? Math.round((done / total) * 100) : 0;
      progressFill.style.width = pct + '%';
      progressLabel.textContent = 'ความคืบหน้า: ' + done + ' / ' + total + ' (' + pct + '%)';
    }

    items.forEach(function (input) {
      var key = input.getAttribute('data-key');
      if (state[key]) input.checked = true;
      input.addEventListener('change', function () {
        state[key] = input.checked;
        saveState(state);
        updateProgress();
      });
    });
    updateProgress();

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state = {};
        saveState(state);
        items.forEach(function (input) { input.checked = false; });
        updateProgress();
        showToast('รีเซ็ต checklist แล้ว');
      });
    }

    // style groups
    container.querySelectorAll('h3').forEach(function (h) {
      var ul = h.nextElementSibling;
      if (ul && ul.tagName === 'UL') {
        var group = document.createElement('div');
        group.className = 'checklist-group';
        var title = h.cloneNode(true);
        group.appendChild(title);
        group.appendChild(ul);
        h.parentNode.replaceChild(group, h);
      }
    });
  }

  /* ---------- Restore deep links after late font/layout shifts ---------- */
  function scrollToHash() {
    if (!location.hash) return;
    var id = '';
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) { id = location.hash.slice(1); }
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    var html = document.documentElement;
    var previousBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    target.scrollIntoView({ block: 'start' });
    html.style.scrollBehavior = previousBehavior;

    document.querySelectorAll('.sidebar-toc a').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'กลับขึ้นด้านบน');
    btn.textContent = '↑';
    document.body.appendChild(btn);
    function onScroll() {
      btn.classList.toggle('show', window.scrollY > 320);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }

  /* ---------- Enhance bare pre with copy button ---------- */
  function enhancePre() {
    document.querySelectorAll('pre').forEach(function (pre) {
      if (pre.dataset.enhanced) return;
      // code-block/code-wrap already has a copy button in its header
      if (pre.closest('code-block, .code-wrap')) { pre.dataset.enhanced = '1'; return; }
      if (pre.querySelector('.copy-btn, .copy-btn-float')) { pre.dataset.enhanced = '1'; return; }
      var btn = document.createElement('button');
      btn.className = 'copy-btn copy-btn-float';
      btn.textContent = 'Copy';
      pre.style.position = pre.style.position || 'relative';
      pre.appendChild(btn);
      pre.dataset.enhanced = '1';
    });
  }

  /* ---------- Boot ---------- */
  function initAll() {
    initTheme();
    try { initCopyButtons(); } catch (e) { console.error('initCopyButtons failed', e); }
    try { initSearch(); } catch (e) { console.error('initSearch failed', e); }
    try { initSidebar(); } catch (e) { console.error('initSidebar failed', e); }
    try { initDropdowns(); } catch (e) { console.error('initDropdowns failed', e); }
    try { initChecklist(); } catch (e) { console.error('initChecklist failed', e); }
    try { initBackToTop(); } catch (e) { console.error('initBackToTop failed', e); }
    try { enhancePre(); } catch (e) { console.error('enhancePre failed', e); }
    try {
      setTimeout(scrollToHash, 200);
      window.addEventListener('load', function () { setTimeout(scrollToHash, 120); });
    } catch (e) { /* ignore */ }

    // toast container
    if (!document.querySelector('.toast')) {
      var t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }

    // re-enhance after dynamic DOM changes (tools page outputs)
    var obs = new MutationObserver(function () {
      try { enhancePre(); } catch (e) { /* ignore */ }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
