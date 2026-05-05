/* ═══════════════════════════════════════════════════════════════
   BlogArch — Core Engine  v12.1.2  (blogarch.js)
   المستودع: https://github.com/AchRafAyaOu/blogs_arch
   المسار في GitHub: /src/blogarch.js
   ────────────────────────────────────────────────────────────
   ───────────────────────────────────────────────────────────── ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     الثوابت المركزية
  ───────────────────────────────────────────────────────────── */
  const CDN_BASE   = 'https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main';
  const STORAGE    = { theme: 'ba-theme', dark: 'ba-dark', pos: 'ba-pos-' };
  const NAV_OFFSET = 80; /* ارتفاع Navbar الثابت (px) */

  const body                 = document.body;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ═══════════════════════════════════════════════════════════
     §1 — THEME ENGINE
     ─ 5 هويات × وضع داكن
     ─ يكتشف تلقائياً تفضيل النظام عند أول زيارة
  ═══════════════════════════════════════════════════════════ */
  const THEMES = {
    default:  { name: 'افتراضي',     desc: 'أخضر وأزرق هادئ',  bg: '#f8fafc', bgDark: '#0f172a' },
    ocean:    { name: 'المحيط',      desc: 'أزرق سماوي عميق',  bg: '#f0f9ff', bgDark: '#071a2e' },
    sunset:   { name: 'الغروب',      desc: 'عنبري دافئ',        bg: '#fffbf5', bgDark: '#1a0e02' },
    forest:   { name: 'الغابة',      desc: 'أخضر طبيعي',       bg: '#f2f8f5', bgDark: '#061a10' },
    midnight: { name: 'منتصف الليل', desc: 'أرجواني داكن',      bg: '#09090b', bgDark: '#09090b' },
  };

  const isFirstVisit = !localStorage.getItem(STORAGE.theme);
  const systemDark   = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let savedTheme = localStorage.getItem(STORAGE.theme) || 'default';
  let savedDark  = isFirstVisit ? systemDark : (localStorage.getItem(STORAGE.dark) === '1');

  function applyTheme(theme, dark) {
    if (theme === 'midnight') dark = true;
    body[theme === 'default' ? 'removeAttribute' : 'setAttribute']('data-theme', theme);
    body[dark ? 'setAttribute' : 'removeAttribute']('data-dark', '');

    const meta = document.getElementById('meta-theme-color');
    if (meta) meta.content = dark ? THEMES[theme].bgDark : THEMES[theme].bg;

    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';

    _syncSwitcherUI(theme, dark);
  }

  function setTheme(theme, dark) {
    if (typeof dark === 'undefined') dark = savedDark;
    if (theme === 'midnight') dark = true;
    savedTheme = theme;
    savedDark  = dark;
    localStorage.setItem(STORAGE.theme, theme);
    localStorage.setItem(STORAGE.dark,  dark ? '1' : '0');
    applyTheme(theme, dark);
  }

  function _syncSwitcherUI(theme, dark) {
    document.querySelectorAll('.theme-option').forEach(o =>
      o.classList.toggle('active', o.dataset.pick === theme));
    document.querySelectorAll('.drawer-theme-btn, .fin-sb-theme-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.pick === theme));
    document.querySelectorAll('.ts-dark-input, .drawer-dark-input').forEach(i => {
      i.checked = dark;
    });
    const darkToggleCb = document.getElementById('fin-dark-toggle');
    if (darkToggleCb) darkToggleCb.checked = dark;
    const label = document.querySelector('.ts-current-name');
    if (label) label.textContent = (THEMES[theme] || THEMES.default).name;
  }

  /* تطبيق فوري قبل DOMContentLoaded لتفادي الوميض */
  applyTheme(savedTheme, savedDark);

  /* زر تبديل dark (قديم) + checkbox fin-dark-toggle (v13) */
  document.getElementById('theme-toggle')?.addEventListener('click', () =>
    setTheme(savedTheme, !savedDark));
  document.getElementById('fin-dark-toggle')?.addEventListener('change', function () {
    setTheme(savedTheme, this.checked);
  });

  /* ── مبدّل الثيم — سطح المكتب ── */
  function _buildDesktopSwitcher() {
    const c = document.getElementById('theme-switcher-desktop');
    if (!c) return;

    const opts = Object.keys(THEMES).map(t =>
      `<button class="theme-option" data-pick="${t}" type="button" aria-label="ثيم ${THEMES[t].name}">
         <span class="to-swatch" aria-hidden="true"></span>
         <span class="to-info">
           <span class="to-name">${THEMES[t].name}</span>
           <span class="to-desc">${THEMES[t].desc}</span>
         </span>
         <i class="fas fa-check to-check" aria-hidden="true"></i>
       </button>`
    ).join('');

    c.innerHTML =
      `<button class="theme-switcher-toggle" id="ts-toggle-btn" type="button"
               aria-haspopup="listbox" aria-expanded="false">
         <span class="theme-dot" aria-hidden="true"></span>
         <span class="ts-current-name">${(THEMES[savedTheme] || THEMES.default).name}</span>
         <i class="fas fa-chevron-down" aria-hidden="true" style="font-size:.7rem;opacity:.5"></i>
       </button>
       <div class="theme-switcher-popover" role="listbox" aria-label="اختيار الثيم">
         <span class="ts-label" aria-hidden="true">اختر المظهر</span>
         <div class="theme-options">${opts}</div>
         <hr class="ts-divider" aria-hidden="true"/>
         <div class="ts-dark-row">
           <label class="ts-dark-label" for="ts-dark-cb">
             <i class="fas fa-moon" aria-hidden="true"></i> الوضع الداكن
           </label>
           <label class="ts-toggle">
             <input class="ts-dark-input" id="ts-dark-cb" type="checkbox" role="switch"
                    aria-label="تفعيل الوضع الداكن"/>
             <span class="ts-toggle-track" aria-hidden="true"></span>
             <span class="ts-toggle-thumb" aria-hidden="true"></span>
           </label>
         </div>
       </div>`;

    const toggleBtn = c.querySelector('#ts-toggle-btn');
    const popover   = c.querySelector('.theme-switcher-popover');

    toggleBtn.addEventListener('click', e => {
      e.stopPropagation();
      const open = c.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', open);
      if (open) popover.querySelector('.theme-option')?.focus();
    });
    c.querySelectorAll('.theme-option').forEach(o =>
      o.addEventListener('click', () => setTheme(o.dataset.pick)));
    c.querySelector('.ts-dark-input').addEventListener('change', function () {
      setTheme(savedTheme, this.checked);
    });
    document.addEventListener('click', e => { if (!c.contains(e.target)) c.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') c.classList.remove('open'); });
    _syncSwitcherUI(savedTheme, savedDark);
  }

  /* ── مبدّل الثيم — الدرج (موبايل) ── */
  function _buildMobileSwitcher() {
    const c = document.getElementById('drawer-theme-section');
    if (!c) return;

    const btns = Object.keys(THEMES).map(t =>
      `<button class="drawer-theme-btn" data-pick="${t}" title="${THEMES[t].name}" type="button">
         <i class="fas fa-check active-check" aria-hidden="true"></i>
       </button>`
    ).join('');

    c.innerHTML =
      `<span class="ts-label" aria-hidden="true">المظهر</span>
       <div class="drawer-theme-grid" role="listbox" aria-label="اختيار الثيم">${btns}</div>
       <div class="drawer-dark-row">
         <label class="drawer-dark-label" for="drawer-dark-cb">
           <i class="fas fa-moon" aria-hidden="true"></i> داكن
         </label>
         <label class="ts-toggle">
           <input class="drawer-dark-input" id="drawer-dark-cb" type="checkbox" role="switch"
                  aria-label="تفعيل الوضع الداكن"/>
           <span class="ts-toggle-track" aria-hidden="true"></span>
           <span class="ts-toggle-thumb" aria-hidden="true"></span>
         </label>
       </div>`;

    c.querySelectorAll('.drawer-theme-btn').forEach(b =>
      b.addEventListener('click', () => setTheme(b.dataset.pick)));
    c.querySelector('.drawer-dark-input').addEventListener('change', function () {
      setTheme(savedTheme, this.checked);
    });
    _syncSwitcherUI(savedTheme, savedDark);
  }


  /* ═══════════════════════════════════════════════════════════
     §2 — SCROLL ENGINE
     ─ requestAnimationFrame throttling
     ─ شريط القراءة + Navbar compact + زر الأعلى
  ═══════════════════════════════════════════════════════════ */
  const progressBar = document.getElementById('fin-scroll-progress');
  const bttBtn      = document.getElementById('back-to-top');
  const navbar      = document.getElementById('fin-mobile-header');

  let _rafPending = false;
  let _lastScrollY = 0;

  function _onScroll() {
    _lastScrollY = window.scrollY;
    if (_rafPending) return;
    _rafPending = true;
    requestAnimationFrame(_processScroll);
  }

  function _processScroll() {
    _rafPending = false;
    const st = _lastScrollY;
    const h  = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (progressBar) progressBar.style.width = (h > 0 ? Math.round((st / h) * 100) : 0) + '%';

    if (navbar) {
      const canScroll = h > 10 && getComputedStyle(body).overflow !== 'hidden';
      navbar.classList.toggle('scrolled', canScroll && st > 50);
    }

    if (bttBtn) bttBtn.classList.toggle('visible', st > 400);

    _updateTocActive(st);
    _saveReadPosition(st);
  }

  window.addEventListener('scroll', _onScroll, { passive: true });

  bttBtn?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));


  /* ═══════════════════════════════════════════════════════════
     §3 — وقت القراءة  (200 كلمة/دقيقة)
  ═══════════════════════════════════════════════════════════ */
  const postBody   = document.getElementById('post-body');
  const readTimeEl = document.querySelector('.read-time-val');

  if (postBody && readTimeEl) {
    const words = (postBody.innerText || postBody.textContent || '')
      .trim().split(/\s+/).filter(Boolean).length;
    readTimeEl.textContent = Math.max(1, Math.round(words / 200));
  }


  /* ═══════════════════════════════════════════════════════════
     §4 — حفظ موضع القراءة  (sessionStorage — لكل مقال)
  ═══════════════════════════════════════════════════════════ */
  const _posKey = postBody ? STORAGE.pos + window.location.pathname : null;

  function _saveReadPosition(y) {
    if (!_posKey) return;
    try { sessionStorage.setItem(_posKey, Math.round(y)); } catch (_) {}
  }

  function _restoreReadPosition() {
    if (!_posKey || !postBody) return;
    try {
      const saved = parseInt(sessionStorage.getItem(_posKey), 10);
      if (saved > 200 && !window.location.hash)
        setTimeout(() => window.scrollTo({ top: saved, behavior: 'auto' }), 120);
    } catch (_) {}
  }


  /* ═══════════════════════════════════════════════════════════
     §5 — التواريخ النسبية بالعربية
  ═══════════════════════════════════════════════════════════ */
  function _toRelativeAr(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    const s = (Date.now() - d.getTime()) / 1000;
    if (s < 60)       return 'منذ لحظات';
    if (s < 3600)     return `منذ ${Math.floor(s / 60)} دقيقة`;
    if (s < 86400)    return `منذ ${Math.floor(s / 3600)} ساعة`;
    if (s < 2592000)  return `منذ ${Math.floor(s / 86400)} يوم`;
    if (s < 31536000) return `منذ ${Math.floor(s / 2592000)} شهر`;
    return `منذ ${Math.floor(s / 31536000)} سنة`;
  }

  function _initRelativeDates() {
    const container = document.querySelector('.post-relative-date');
    const val       = document.querySelector('.relative-date-val');
    if (!container || !val) return;

    const metaDate = document.querySelector('meta[property="article:published_time"]') ||
                     document.querySelector('time[datetime]');
    const dateStr  = metaDate?.getAttribute('content') || metaDate?.getAttribute('datetime') ||
      document.querySelector('.post-meta span:first-child')
        ?.textContent?.replace(/[^\d\-\/\s]/g, '').trim();

    if (dateStr) {
      const rel = _toRelativeAr(dateStr);
      if (rel) { val.textContent = rel; container.style.display = 'flex'; }
    }
  }


  /* ═══════════════════════════════════════════════════════════
     §6 — جدول المحتويات (TOC)
     ─ يُدرك ارتفاع Navbar عند الضغط + تحديد العنوان النشط
  ═══════════════════════════════════════════════════════════ */
  let _tocHeadings = [];

  function _buildTOC() {
    const container = document.getElementById('toc-container');
    const nav       = document.getElementById('toc-nav');
    if (!container || !nav || !postBody) return;

    const headings = [...postBody.querySelectorAll('h2, h3')];
    if (headings.length < 3) return;
    _tocHeadings = headings;

    nav.innerHTML = headings.map((h, i) => {
      if (!h.id) h.id = `heading-${i}`;
      return `<a href="#${h.id}" class="${h.tagName === 'H3' ? 'toc-h3' : 'toc-h2'}"
                 data-hid="${h.id}">${h.textContent.trim()}</a>`;
    }).join('');

    container.style.display = 'block';

    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(a.dataset.hid);
        if (!target) return;
        const y = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET - 8;
        window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });

    document.getElementById('toc-toggle')?.addEventListener('click', () =>
      container.classList.toggle('collapsed'));
  }

  function _updateTocActive(scrollY) {
    if (!_tocHeadings.length) return;
    const threshold = scrollY + NAV_OFFSET + 20;
    let active = null;
    for (const h of _tocHeadings) {
      if (h.offsetTop <= threshold) active = h.id;
      else break;
    }
    document.querySelectorAll('.toc-nav a').forEach(a =>
      a.classList.toggle('toc-active', a.dataset.hid === active));
  }


  /* ═══════════════════════════════════════════════════════════
     §7 — مشاركة النص المحدد
  ═══════════════════════════════════════════════════════════ */
  function _initTextShare() {
    const tooltip  = document.getElementById('text-share-tooltip');
    const copyBtn  = document.getElementById('tst-copy');
    const shareBtn = document.getElementById('tst-share');
    if (!tooltip || !postBody) return;

    let _selected = '';

    document.addEventListener('mouseup', () => {
      setTimeout(() => {
        const sel = window.getSelection();
        _selected = sel?.toString().trim() || '';
        if (_selected.length > 10 && postBody.contains(sel.anchorNode)) {
          const rect = sel.getRangeAt(0).getBoundingClientRect();
          const top  = rect.top + window.scrollY - tooltip.offsetHeight - 10;
          const left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
          tooltip.style.cssText =
            `top:${top}px;left:${Math.max(8, Math.min(left, window.innerWidth - 164))}px`;
          tooltip.classList.add('show');
          tooltip.removeAttribute('hidden');
        } else {
          tooltip.classList.remove('show');
          tooltip.setAttribute('hidden', '');
        }
      }, 10);
    });

    document.addEventListener('mousedown', e => {
      if (!tooltip.contains(e.target)) tooltip.classList.remove('show');
    });

    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(_selected);
        copyBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> تم النسخ';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> نسخ';
        }, 2000);
      } catch (_) {}
      tooltip.classList.remove('show');
    });

    shareBtn?.addEventListener('click', () => {
      const url = location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, text: _selected, url });
      } else {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${_selected.slice(0, 200)}"`)}&url=${encodeURIComponent(url)}`,
          '_blank', 'width=600,height=400,noopener,noreferrer'
        );
      }
      tooltip.classList.remove('show');
    });
  }


  /* ═══════════════════════════════════════════════════════════
     §8 — نموذج التواصل
     ─ مُفوَّض كلياً إلى Blogarch.contact.js (Telegram)
     ─ لا يوجد كود هنا لتجنب التعارض
  ═══════════════════════════════════════════════════════════ */


  /* ═══════════════════════════════════════════════════════════
     §9 — Lazy Loading
     ─ IntersectionObserver + blur-up
     ─ retry تلقائي لصور Blogger عند الفشل
  ═══════════════════════════════════════════════════════════ */
  let _lazyObserver = null;
  let _cardObs      = null;

  function _loadImage(img) {
    const src = img.dataset.src || img.src;
    if (!src) return;

    const shell = img.closest('.card-image-wrapper, .img-shell');
    const temp  = new Image();

    temp.onload = () => {
      if (img.dataset.src) img.src = img.dataset.src;
      img.classList.add('loaded');
      if (shell) shell.classList.add('loaded');
    };

    let _retried = false;
    temp.onerror = () => {
      if (!_retried && src &&
          (src.includes('blogspot.com') || src.includes('googleusercontent.com'))) {
        _retried = true;
        const retry = new Image();
        retry.onload = () => {
          if (img.dataset.src) img.src = img.dataset.src;
          img.classList.add('loaded');
          if (shell) shell.classList.add('loaded');
        };
        retry.onerror = _markError;
        retry.src = src + (src.includes('?') ? '&' : '?') + '_t=' + Date.now();
        return;
      }
      _markError();
    };

    function _markError() {
      img.alt = img.alt || 'تعذّر تحميل الصورة';
      if (img.dataset.placeholder) img.src = img.dataset.placeholder;
      img.classList.add('loaded', 'img-error');
      if (shell) shell.classList.add('has-error', 'img-error');
    }

    temp.src = src;
  }

  function observeNewImage(img) {
    _lazyObserver ? _lazyObserver.observe(img) : _loadImage(img);
  }

  function _initLazy() {
    const imgs = document.querySelectorAll('img.lazy');

    if ('IntersectionObserver' in window) {
      _lazyObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { _loadImage(e.target); _lazyObserver.unobserve(e.target); }
        });
      }, { rootMargin: '240px', threshold: 0 });
      imgs.forEach(img => _lazyObserver.observe(img));
    } else {
      imgs.forEach(_loadImage);
    }

    postBody?.querySelectorAll('img:not(.lazy)').forEach(img => {
      img.setAttribute('loading', 'lazy');
      const mark = () => img.classList.add('loaded');
      img.complete ? mark() : img.addEventListener('load', mark, { once: true });
    });
  }


  /* ═══════════════════════════════════════════════════════════
     §10 — أنيميشن ظهور الأقسام
     ─ 2 Observers: sections (threshold 0.1) + cards (stagger)
  ═══════════════════════════════════════════════════════════ */
  function _initSectionAnimations() {
    const selector =
      '.fade-in-section,.fade-up-section,.fade-in-card,.slide-in-right,.slide-in-left';

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll(selector).forEach(el => el.classList.add('is-visible'));
      return;
    }

    const _reveal = el => el.classList.add('is-visible');

    const sectionObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { _reveal(e.target); sectionObs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    _cardObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { _reveal(e.target); _cardObs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

    document.querySelectorAll(
      '.fade-in-section,.fade-up-section,.slide-in-right,.slide-in-left'
    ).forEach(el => sectionObs.observe(el));

    document.querySelectorAll('.fade-in-card').forEach((el, i) => {
      el.style.transitionDelay = Math.min(i * 80, 500) + 'ms';
      _cardObs.observe(el);
    });
  }

  /* ── Re-observe dynamically rendered .fade-in-card elements ─────────────
     Call after any async innerHTML render (podcast, works, learn) so that
     cards injected after _initSectionAnimations() still animate in.
  ── */
  function _reobserveCards(container) {
    if (!container) return;
    container.querySelectorAll('.fade-in-card').forEach((el, i) => {
      el.style.transitionDelay = Math.min(i * 80, 400) + 'ms';
      if (_cardObs) _cardObs.observe(el);
      else el.classList.add('is-visible');
    });
  }


  /* ═══════════════════════════════════════════════════════════
     §11 — Mobile Drawer  (Focus Trap + إعادة التركيز)
  ═══════════════════════════════════════════════════════════ */
  const drawer    = document.getElementById('fin-sidebar');
  const overlay   = document.getElementById('fin-sb-overlay');
  const hamburger = document.getElementById('fin-hamburger');

  let _lastFocusBeforeDrawer = null;

  function _openDrawer() {
    _lastFocusBeforeDrawer = document.activeElement;
    drawer?.classList.add('open');
    overlay?.classList.add('active');
    hamburger?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    if (getComputedStyle(body).overflow !== 'hidden') body.style.overflow = 'hidden';
    drawer?.querySelector('a, button')?.focus();
  }

  function _closeDrawer() {
    drawer?.classList.remove('open');
    overlay?.classList.remove('active');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
    _lastFocusBeforeDrawer?.focus();
  }

  hamburger?.addEventListener('click', () =>
    drawer?.classList.contains('open') ? _closeDrawer() : _openDrawer());
  overlay?.addEventListener('click', _closeDrawer);

  document.querySelectorAll('.mobile-drawer .nav-link:not(.dropdown-toggle), .fin-sidebar .fin-sb-nav a').forEach(l =>
    l.addEventListener('click', _closeDrawer));

  const mobileDropdown = document.getElementById('mobile-dropdown');
  if (mobileDropdown) {
    mobileDropdown.querySelector('.dropdown-toggle')?.addEventListener('click', e => {
      e.preventDefault(); mobileDropdown.classList.toggle('active');
    });
    mobileDropdown.querySelectorAll('.dropdown-item').forEach(i =>
      i.addEventListener('click', _closeDrawer));
  }

  document.querySelectorAll('#about-open-mobile, #drawer-about-open, #nav-about-open').forEach(el =>
    el?.addEventListener('click', e => { e.preventDefault(); _closeDrawer(); _openAbout(); }));

  document.querySelectorAll('#drawer-contact-open, #nav-contact-open').forEach(el =>
    el?.addEventListener('click', e => { e.preventDefault(); _closeDrawer(); }));


  /* ═══════════════════════════════════════════════════════════
     §12 — لوحة البحث
     ─ بدون تشكيل (diacritic-insensitive)
     ─ debounce 220ms + "/" من لوحة المفاتيح
  ═══════════════════════════════════════════════════════════ */
  const searchPanel    = document.getElementById('search-panel');
  const searchInput    = document.getElementById('search-input');
  const searchResults  = document.getElementById('search-results');
  const searchBtn      = document.getElementById('fin-mh-search-btn');
  const searchCloseBtn = document.getElementById('search-close');

  const _normalize = str => (str || '').replace(/[\u064B-\u065F\u0670]/g, '').toLowerCase();

  function _setSearch(open) {
    if (!searchPanel) return;
    searchPanel.classList.toggle('active', open);
    searchPanel.setAttribute('aria-hidden', !open);
    if (open) searchInput?.focus();
    else      searchBtn?.focus();
  }

  searchBtn?.addEventListener('click', () =>
    _setSearch(!searchPanel.classList.contains('active')));
  searchCloseBtn?.addEventListener('click', () => _setSearch(false));

  function _renderResults(items) {
    if (!searchResults) return;
    searchResults.innerHTML = !items.length
      ? `<div class="search-empty arabic-text" role="status">لا توجد نتائج مطابقة</div>`
      : items.map(it =>
          `<a class="search-item" href="${it.url}">
             <strong class="arabic-text">${it.title}</strong>
             <span class="arabic-text">${it.snippet}</span>
           </a>`
        ).join('');
  }

  function _doSearch(q) {
    const norm = _normalize(q);
    if (norm.length < 2) { _renderResults([]); return; }
    const items = [];
    document.querySelectorAll('.post-card, .entry').forEach(card => {
      const a  = card.querySelector('h2 a, h3 a');
      const sn = card.querySelector('.card-snippet, .snippet');
      if (!a || !sn) return;
      if (_normalize(a.textContent + ' ' + sn.textContent).includes(norm)) {
        const snippet = sn.textContent.trim();
        items.push({
          title:   a.textContent.trim(),
          snippet: snippet.length > 110 ? snippet.slice(0, 110) + '...' : snippet,
          url:     a.href,
        });
      }
    });
    _renderResults(items.slice(0, 10));
  }

  let _searchTimer = null;
  searchInput?.addEventListener('input', () => {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => _doSearch(searchInput.value), 220);
  });

  searchResults?.addEventListener('click', e => {
    const item = e.target.closest('.search-item');
    if (item?.href) location.href = item.href;
  });

  document.addEventListener('click', e => {
    if (!searchPanel?.classList.contains('active')) return;
    if (!searchPanel.contains(e.target) && !searchBtn?.contains(e.target)) _setSearch(false);
  });


  /* ═══════════════════════════════════════════════════════════
     §13 — مودال "عني"  (Focus Trap)
  ═══════════════════════════════════════════════════════════ */
  const aboutModal = document.getElementById('fin-mc-about');
  let _lastFocusBeforeAbout = null;

  function _openAbout() {
    if (!aboutModal) return;
    _lastFocusBeforeAbout = document.activeElement;
    aboutModal.classList.add('open');
    aboutModal.removeAttribute('hidden');
    body.style.overflow = 'hidden';
    aboutModal.querySelector('#about-close, [aria-label="إغلاق"]')?.focus();
  }

  function _closeAbout() {
    if (!aboutModal) return;
    aboutModal.classList.remove('open');
    aboutModal.setAttribute('hidden', '');
    body.style.overflow = '';
    _lastFocusBeforeAbout?.focus();
  }

  document.getElementById('nav-about-open')?.addEventListener('click', e => {
    e.preventDefault(); _openAbout();
  });
  document.getElementById('fin-mc-about-close')?.addEventListener('click', _closeAbout);
  aboutModal?.addEventListener('click', e => { if (e.target === aboutModal) _closeAbout(); });

  aboutModal?.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !aboutModal.classList.contains('open')) return;
    const focusable = [...aboutModal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )].filter(el => !el.closest('[hidden]'));
    if (!focusable.length) return;
    const [first, last] = [focusable[0], focusable[focusable.length - 1]];
    if (e.shiftKey && document.activeElement === first)       { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last)  { e.preventDefault(); first.focus(); }
  });


  /* ═══════════════════════════════════════════════════════════
     §14 — كاروسيل الاقتباسات
     ─ يجلب CDN/data/quotes.json
     ─ swipe + نقاط التنقل + auto-rotate 6s
  ═══════════════════════════════════════════════════════════ */
  function _initQuotes() {
    const textEl   = document.getElementById('fin-quote-text');
    const sourceEl = document.getElementById('fin-quote-source');
    const dotsEl   = document.getElementById('fin-quote-dots');
    const prevBtn  = document.getElementById('fin-quote-prev');
    const nextBtn  = document.getElementById('fin-quote-next');
    if (!textEl) return;

    let quotes = [], qIdx = 0, qTimer = null;

    function _show(i) {
      if (!quotes.length) return;
      qIdx = ((i % quotes.length) + quotes.length) % quotes.length;
      textEl.style.opacity   = '0';
      if (sourceEl) sourceEl.style.opacity = '0';
      setTimeout(() => {
        const q = quotes[qIdx];
        textEl.textContent = q.text || q.quote || q.content || '';
        if (sourceEl) sourceEl.textContent = q.source || q.author || '';
        textEl.style.opacity = '1';
        if (sourceEl) sourceEl.style.opacity = '1';
        dotsEl?.querySelectorAll('.fin-quote-dot').forEach((d, di) =>
          d.classList.toggle('active', di === qIdx));
      }, prefersReducedMotion ? 0 : 350);
    }

    function _buildDots(n) {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      for (let i = 0; i < n; i++) {
        const d = document.createElement('button');
        d.className = `fin-quote-dot${i === 0 ? ' active' : ''}`;
        d.setAttribute('aria-label', `الاقتباس ${i + 1}`);
        d.addEventListener('click', () => { _show(i); _resetTimer(); });
        dotsEl.appendChild(d);
      }
    }

    function _resetTimer() {
      clearInterval(qTimer);
      qTimer = setInterval(() => _show(qIdx + 1), 6000);
    }

    prevBtn?.addEventListener('click', () => { _show(qIdx - 1); _resetTimer(); });
    nextBtn?.addEventListener('click', () => { _show(qIdx + 1); _resetTimer(); });

    let _tx = 0;
    textEl.addEventListener('touchstart', e => { _tx = e.changedTouches[0].screenX; }, { passive: true });
    textEl.addEventListener('touchend',   e => {
      const diff = _tx - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { diff > 0 ? _show(qIdx + 1) : _show(qIdx - 1); _resetTimer(); }
    }, { passive: true });

    fetch(`${CDN_BASE}/data/quotes.json`)
      .then(r => r.json())
      .then(data => {
        quotes = Array.isArray(data) ? data : (data.quotes || data.items || []);
        if (!quotes.length) { textEl.textContent = 'لا توجد اقتباسات بعد.'; return; }
        _buildDots(Math.min(quotes.length, 7));
        _show(Math.floor(Math.random() * quotes.length));
        _resetTimer();
      })
      .catch(() => { textEl.textContent = 'تعذّر تحميل الاقتباسات.'; });
  }


  /* ═══════════════════════════════════════════════════════════
     §15 — شبكة البودكاست
     ─ يجلب CDN/data/podcast.json (أحدث 4 حلقات)
  ═══════════════════════════════════════════════════════════ */
  function _initPodcast() {
    const grid = document.getElementById('fin-podcast-grid');
    if (!grid) return;

    grid.setAttribute('aria-busy', 'true');

    fetch(`${CDN_BASE}/data/podcast.json`)
      .then(r => r.json())
      .then(data => {
        const eps = Array.isArray(data) ? data : (data.episodes || data.items || []);
        grid.removeAttribute('aria-busy');
        if (!eps.length) {
          grid.innerHTML =
            '<p class="arabic-text" style="text-align:center;padding:2rem;color:var(--muted)">لا توجد حلقات بعد.</p>';
          return;
        }
        grid.innerHTML = eps.slice(0, 4).map((ep, i) => {
          const num   = ep.episode || ep.number || ep.ep || (i + 1);
          const cat   = ep.category || ep.label || 'بودكاست';
          const title = ep.title || ep.name || '';
          const desc  = (ep.description || ep.desc || '').trim().slice(0, 160);
          const dur   = ep.duration || ep.length || '';
          const url   = ep.url || ep.link || ep.audio || '#';
          return `<div class="fin-podcast-ep fade-in-card" tabindex="0">
            <div class="fin-podcast-ep-art" aria-hidden="true">
              <i class="fas fa-podcast" style="font-size:1.6rem;opacity:.9"></i>
              <span class="fin-podcast-ep-num arabic-text">الحلقة ${num}</span>
            </div>
            <div class="fin-podcast-ep-body">
              <div class="fin-podcast-ep-cat arabic-text">
                <i class="fas fa-tag" aria-hidden="true"></i> ${cat}
              </div>
              <h3 class="fin-podcast-ep-title arabic-text">${title}</h3>
              <p class="fin-podcast-ep-desc arabic-text">${desc}${desc.length === 160 ? '...' : ''}</p>
              <div class="fin-podcast-ep-footer">
                ${dur
                  ? `<span class="fin-podcast-ep-dur arabic-text">
                       <i class="far fa-clock" aria-hidden="true"></i> ${dur}
                     </span>`
                  : '<span></span>'}
                <a class="fin-podcast-ep-play arabic-text" href="${url}"
                   target="_blank" rel="noopener noreferrer">
                  استمع <i class="fas fa-arrow-left" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </div>`;
        }).join('');
        /* Re-observe new cards so intersection animation fires correctly */
        _reobserveCards(grid);
      })
      .catch(() => {
        grid.removeAttribute('aria-busy');
        grid.innerHTML =
          '<p class="arabic-text" style="text-align:center;padding:2rem;color:var(--muted)">تعذّر تحميل حلقات البودكاست.</p>';
      });
  }


  /* ═══════════════════════════════════════════════════════════
     §16 — Pills active state  (بالمسار الحالي)
  ═══════════════════════════════════════════════════════════ */
  function _initPills() {
    const path = location.pathname;
    document.querySelectorAll('.pills .pill').forEach(pill => {
      pill.classList.remove('active');
      pill.removeAttribute('aria-current');
      try {
        if (pill.href && path === new URL(pill.href, location.origin).pathname) {
          pill.classList.add('active');
          pill.setAttribute('aria-current', 'page');
        }
      } catch (_) {}
    });
  }


  /* ═══════════════════════════════════════════════════════════
     §17 — تحديد رابط التنقل النشط
  ═══════════════════════════════════════════════════════════ */
  function _initNavHighlight() {
    const path = location.pathname;
    document.querySelectorAll('.nav-menu .nav-link, .mobile-drawer .nav-link, .fin-sidebar .fin-sb-nav a').forEach(a => {
      try {
        if (a.getAttribute('href') && path === new URL(a.href, location.origin).pathname) {
          a.classList.add('active', 'fin-active');
          a.setAttribute('aria-current', 'page');
        }
      } catch (_) {}
    });
  }


  /* ═══════════════════════════════════════════════════════════
     §18 — اختصارات لوحة المفاتيح
     ─ Escape: إغلاق كل المودالات + البحث + الدرج
     ─ /     : فتح البحث سريعاً
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'Escape':
        if (searchPanel?.classList.contains('active'))   _setSearch(false);
        if (aboutModal?.classList.contains('open'))      _closeAbout();
        if (drawer?.classList.contains('open'))          _closeDrawer();
        if (document.getElementById('fin-learn-modal')?.classList.contains('open'))
          window.BlogArch?.closeLesson?.();
        break;
      case '/':
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
          e.preventDefault();
          _setSearch(true);
        }
        break;
    }
  });


  /* ═══════════════════════════════════════════════════════════
     §19 — Clickable Cards  (Enter + role="link")
  ═══════════════════════════════════════════════════════════ */
  function _initClickableCards() {
    document.querySelectorAll('.fin-clickable-card').forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'link');
      card.addEventListener('click', e => {
        if (e.target.closest('a, button')) return;
        const url = card.dataset.url;
        if (url) location.href = url;
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter') card.click();
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════
     §20 — سنة حقوق النشر تلقائية
  ═══════════════════════════════════════════════════════════ */
  const yearEl = document.getElementById('fin-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ═══════════════════════════════════════════════════════════
     §21 — Performance Hints
     ─ fetchpriority=high للصور في الشاشة الأولى
     ─ loading=lazy + decoding=async للباقي
  ═══════════════════════════════════════════════════════════ */
  function _initPerformanceHints() {
    const heroImg = document.querySelector('.fin-hero-avatar, .fin-hero img');
    if (heroImg) {
      heroImg.setAttribute('fetchpriority', 'high');
      heroImg.setAttribute('decoding', 'sync');
      heroImg.removeAttribute('loading');
    }

    const vp = window.innerHeight;
    document.querySelectorAll(
      'img:not([loading]):not(.fin-hero-avatar):not([fetchpriority])'
    ).forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.top < vp) {
        img.setAttribute('fetchpriority', 'high');
        img.setAttribute('decoding', 'async');
      } else {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      }
    });

    document.querySelectorAll('.post-body img, .post-content img').forEach(img => {
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });
  }


  /* ═══════════════════════════════════════════════════════════
     INIT — تهيئة كل الوحدات عند جاهزية DOM
  ═══════════════════════════════════════════════════════════ */
  function _init() {
    _initPerformanceHints();
    _buildDesktopSwitcher();
    _buildMobileSwitcher();
    _initLazy();
    _initSectionAnimations();
    _buildTOC();
    _initRelativeDates();
    _restoreReadPosition();
    _initTextShare();
    _initClickableCards();
    _initPills();
    _initNavHighlight();
    _initQuotes();
    _initPodcast();
    /* ربط أزرار الثيم في الـ sidebar (fin-sb-theme-btn) */
    document.querySelectorAll('.fin-sb-theme-btn').forEach(b =>
      b.addEventListener('click', () => setTheme(b.dataset.pick)));
    /* §8  contact  ← Blogarch.contact.js */
    /* §?  lessons  ← Blogarch.lessons.js */
    /* §?  sitedata ← Blogarch.data.js    */
    _syncSwitcherUI(savedTheme, savedDark);
    document.dispatchEvent(new CustomEvent('blogarch:ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }


  /* ═══════════════════════════════════════════════════════════
     PUBLIC API — window.BlogArch
     ── نمط Object.assign لحماية دوال الوحدات الأخرى ──
  ═══════════════════════════════════════════════════════════ */
  window.BlogArch = Object.assign(window.BlogArch || {}, {
    setTheme,
    observeNewImage,
    openAbout:   _openAbout,
    closeAbout:  _closeAbout,
    openDrawer:  _openDrawer,
    closeDrawer: _closeDrawer,
    setSearch:   _setSearch,
    CDN_BASE,
    VERSION: '12.1.0',
    /* openLesson / closeLesson / navigatePrevLesson / navigateNextLesson
       ← تُضيفها Blogarch.lessons.js */
    /* reloadData / clearData
       ← تُضيفها Blogarch.data.js */
  });

})();