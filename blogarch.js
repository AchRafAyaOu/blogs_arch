/* ═══════════════════════════════════════════════════════════
   BlogArch — External JavaScript v2
   Theme System: 5 Visual Identities × Dark Variant
   https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main/blogarch.js
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     THEME ENGINE
     Manages 5 themes × dark mode via data attributes
     Persists to localStorage
  ══════════════════════════════════════════════ */
  var THEMES = {
    default:  { name: 'افتراضي',  desc: 'أخضر وأزرق هادئ' },
    ocean:    { name: 'المحيط',   desc: 'أزرق وسماوي عميق' },
    sunset:   { name: 'الغروب',  desc: 'عنبري ودافئ' },
    forest:   { name: 'الغابة',  desc: 'أخضر طبيعي هادئ' },
    midnight: { name: 'منتصف الليل', desc: 'أرجواني داكن' },
  };

  var body = document.body;
  var savedTheme = localStorage.getItem('ba-theme') || 'default';
  var savedDark  = localStorage.getItem('ba-dark') === '1';

  function applyTheme(theme, dark) {
    /* set data-theme */
    if (theme === 'default') {
      body.removeAttribute('data-theme');
    } else {
      body.setAttribute('data-theme', theme);
    }
    /* midnight is always dark */
    if (theme === 'midnight') dark = true;

    /* set dark via data-dark attr + legacy class for backward compat */
    if (dark) {
      body.setAttribute('data-dark', '');
      body.classList.add('dark-mode');
    } else {
      body.removeAttribute('data-dark');
      body.classList.remove('dark-mode');
    }

    /* update theme-icon in navbar */
    var themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.className = dark ? 'fas fa-sun' : 'fas fa-moon';

    /* update theme-color meta */
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      var colors = {
        default: dark ? '#0f172a' : '#f8fafc',
        ocean:   dark ? '#0a1929' : '#f0f9ff',
        sunset:  dark ? '#1c0d00' : '#fff8f0',
        forest:  dark ? '#081a0f' : '#f1f8f4',
        midnight:'#09090b',
      };
      metaTheme.content = colors[theme] || colors.default;
    }

    /* sync all switcher UI */
    syncSwitcherUI(theme, dark);
  }

  function syncSwitcherUI(theme, dark) {
    /* Desktop popover options */
    document.querySelectorAll('.theme-option').forEach(function (opt) {
      opt.classList.toggle('active', opt.getAttribute('data-pick') === theme);
    });
    /* Mobile drawer buttons */
    document.querySelectorAll('.drawer-theme-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-pick') === theme);
    });
    /* Dark toggles */
    document.querySelectorAll('.ts-dark-input, .drawer-dark-input').forEach(function (inp) {
      inp.checked = dark;
    });
    /* Dot color in toggle button */
    document.querySelectorAll('.theme-dot').forEach(function (dot) {
      dot.style.background = 'var(--accent)';
    });
    /* Update toggle button label text */
    var label = document.querySelector('.ts-current-name');
    if (label) label.textContent = (THEMES[theme] || THEMES.default).name;
  }

  /* Load saved preferences */
  applyTheme(savedTheme, savedDark);

  function setTheme(theme, dark) {
    if (typeof dark === 'undefined') dark = savedDark;
    if (theme === 'midnight') dark = true;
    savedTheme = theme;
    savedDark  = dark;
    localStorage.setItem('ba-theme', theme);
    localStorage.setItem('ba-dark',  dark ? '1' : '0');
    applyTheme(theme, dark);
  }

  /* ── Build Desktop Theme Switcher Popover ── */
  function buildDesktopSwitcher() {
    var container = document.getElementById('theme-switcher-desktop');
    if (!container) return;

    var themeNames = Object.keys(THEMES);
    var optionsHtml = themeNames.map(function (t) {
      return '<button class="theme-option" data-pick="' + t + '" type="button">' +
        '<span class="to-swatch"></span>' +
        '<span class="to-info">' +
          '<span class="to-name">' + THEMES[t].name + '</span>' +
          '<span class="to-desc">' + THEMES[t].desc + '</span>' +
        '</span>' +
        '<i class="fas fa-check to-check"></i>' +
      '</button>';
    }).join('');

    container.innerHTML =
      '<button class="theme-switcher-toggle" id="ts-toggle-btn" type="button" aria-haspopup="true">' +
        '<span class="theme-dot"></span>' +
        '<span class="ts-current-name">' + (THEMES[savedTheme] || THEMES.default).name + '</span>' +
        '<i class="fas fa-chevron-down" style="font-size:.7rem;opacity:.5"></i>' +
      '</button>' +
      '<div class="theme-switcher-popover" role="dialog">' +
        '<span class="ts-label">اختر المظهر</span>' +
        '<div class="theme-options">' + optionsHtml + '</div>' +
        '<hr class="ts-divider"/>' +
        '<div class="ts-dark-row">' +
          '<label class="ts-dark-label"><i class="fas fa-moon"></i> الوضع الداكن</label>' +
          '<label class="ts-toggle">' +
            '<input class="ts-dark-input" type="checkbox"/>' +
            '<span class="ts-toggle-track"></span>' +
            '<span class="ts-toggle-thumb"></span>' +
          '</label>' +
        '</div>' +
      '</div>';

    /* Events */
    var switcher = container;
    var toggleBtn = container.querySelector('#ts-toggle-btn');

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      switcher.classList.toggle('open');
    });

    container.querySelectorAll('.theme-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        setTheme(opt.getAttribute('data-pick'));
      });
    });

    container.querySelector('.ts-dark-input').addEventListener('change', function () {
      setTheme(savedTheme, this.checked);
    });

    document.addEventListener('click', function (e) {
      if (!container.contains(e.target)) container.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') container.classList.remove('open');
    });

    syncSwitcherUI(savedTheme, savedDark);
  }

  /* ── Build Mobile Drawer Theme Section ── */
  function buildMobileSwitcher() {
    var container = document.getElementById('drawer-theme-section');
    if (!container) return;

    var themeNames = Object.keys(THEMES);
    var btnsHtml = themeNames.map(function (t) {
      return '<button class="drawer-theme-btn" data-pick="' + t + '" title="' + THEMES[t].name + '" type="button">' +
        '<i class="fas fa-check active-check"></i>' +
      '</button>';
    }).join('');

    container.innerHTML =
      '<span class="ts-label">المظهر</span>' +
      '<div class="drawer-theme-grid">' + btnsHtml + '</div>' +
      '<div class="drawer-dark-row">' +
        '<label class="drawer-dark-label"><i class="fas fa-moon"></i> وضع داكن</label>' +
        '<label class="ts-toggle">' +
          '<input class="drawer-dark-input" type="checkbox"/>' +
          '<span class="ts-toggle-track"></span>' +
          '<span class="ts-toggle-thumb"></span>' +
        '</label>' +
      '</div>';

    container.querySelectorAll('.drawer-theme-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTheme(btn.getAttribute('data-pick'));
      });
    });

    container.querySelector('.drawer-dark-input').addEventListener('change', function () {
      setTheme(savedTheme, this.checked);
    });

    syncSwitcherUI(savedTheme, savedDark);
  }

  /* ── Legacy theme-toggle button (dark only) ── */
  var themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      setTheme(savedTheme, !savedDark);
    });
  }

  /* ══════════════════════════════════════════════
     READING PROGRESS + BACK TO TOP + NAVBAR SCROLL
  ══════════════════════════════════════════════ */
  var bar    = document.getElementById('reading-progress');
  var btt    = document.getElementById('back-to-top');
  var navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    var st = document.documentElement.scrollTop || document.body.scrollTop || 0;
    var h  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (navbar) { navbar.classList.toggle('scrolled', st > 50); }
    if (btt)    { btt.classList.toggle('visible', st > 400); }
  }, { passive: true });

  if (btt) btt.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ══════════════════════════════════════════════
     READ TIME CALCULATOR
  ══════════════════════════════════════════════ */
  var postBody   = document.getElementById('post-body');
  var readTimeEl = document.querySelector('.read-time-val');
  if (postBody && readTimeEl) {
    var words = (postBody.innerText || postBody.textContent || '').trim().split(/\s+/).length;
    readTimeEl.textContent = Math.max(1, Math.round(words / 200));
  }

  /* ══════════════════════════════════════════════
     LAZY LOADING (IntersectionObserver)
  ══════════════════════════════════════════════ */
  function initLazy() {
    var imgs = document.querySelectorAll('img.lazy');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var img = e.target;
            img.src = img.dataset.src;
            img.onload = function () { img.classList.add('loaded'); };
            obs.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });
      imgs.forEach(function (img) { obs.observe(img); });
    } else {
      imgs.forEach(function (img) { img.src = img.dataset.src; img.classList.add('loaded'); });
    }
    document.querySelectorAll('.post-body img:not(.lazy)').forEach(function (img) {
      img.setAttribute('loading', 'lazy');
      var mark = function () { img.classList.add('loaded'); };
      if (img.complete) mark(); else img.addEventListener('load', mark, { once: true });
    });
  }

  /* ══════════════════════════════════════════════
     MOBILE DRAWER
  ══════════════════════════════════════════════ */
  var drawer    = document.getElementById('mobile-drawer');
  var overlay   = document.getElementById('menu-overlay');
  var hamburger = document.getElementById('hamburger');

  function openDrawer() {
    if (drawer)    drawer.classList.add('active');
    if (overlay)   overlay.classList.add('active');
    if (hamburger) hamburger.classList.add('active');
    body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (drawer)    drawer.classList.remove('active');
    if (overlay)   overlay.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
    body.style.overflow = '';
  }
  if (hamburger) hamburger.addEventListener('click', function () {
    drawer && drawer.classList.contains('active') ? closeDrawer() : openDrawer();
  });
  if (overlay) overlay.addEventListener('click', closeDrawer);
  document.querySelectorAll('.mobile-drawer .nav-link:not(.dropdown-toggle)').forEach(function (l) {
    l.addEventListener('click', closeDrawer);
  });

  /* ── Mobile Dropdown ── */
  var mobileDropdown = document.getElementById('mobile-dropdown');
  if (mobileDropdown) {
    var dtoggle = mobileDropdown.querySelector('.dropdown-toggle');
    if (dtoggle) dtoggle.addEventListener('click', function (e) {
      e.preventDefault();
      mobileDropdown.classList.toggle('active');
    });
    mobileDropdown.querySelectorAll('.dropdown-item').forEach(function (item) {
      item.addEventListener('click', closeDrawer);
    });
  }

  /* ══════════════════════════════════════════════
     SEARCH PANEL
  ══════════════════════════════════════════════ */
  var searchPanel    = document.getElementById('search-panel');
  var searchInput    = document.getElementById('search-input');
  var searchResults  = document.getElementById('search-results');
  var searchBtn      = document.getElementById('search-btn');
  var searchCloseBtn = document.getElementById('search-close');

  var setSearch = function (open) {
    if (!searchPanel) return;
    searchPanel.classList.toggle('active', open);
    if (open && searchInput) searchInput.focus();
  };
  if (searchBtn)      searchBtn.addEventListener('click', function () { setSearch(!searchPanel.classList.contains('active')); });
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', function () { setSearch(false); });

  var renderResults = function (items) {
    if (!searchResults) return;
    if (!items.length) {
      searchResults.innerHTML = "<div style='padding:1rem;text-align:center;color:var(--muted)'>لا توجد نتائج مطابقة</div>";
      return;
    }
    searchResults.innerHTML = items.map(function (it) {
      return "<a class='search-item' href='" + it.url + "'>" +
        "<strong class='arabic-text'>" + it.title + "</strong>" +
        "<span class='arabic-text'>" + it.snippet + "</span>" +
      "</a>";
    }).join('');
  };

  var doSearch = function (q) {
    q = (q || '').toLowerCase().trim();
    if (q.length < 2) { renderResults([]); return; }
    var items = [];
    document.querySelectorAll('.post-card,.entry').forEach(function (card) {
      var a  = card.querySelector('h2 a, h3 a');
      var sn = card.querySelector('.card-snippet, .snippet');
      if (!a || !sn) return;
      var title   = a.textContent || '';
      var snippet = (sn.textContent || '').trim();
      if ((title + ' ' + snippet).toLowerCase().indexOf(q) !== -1)
        items.push({ title: title, snippet: snippet.slice(0, 100) + (snippet.length > 100 ? '...' : ''), url: a.href });
    });
    renderResults(items.slice(0, 10));
  };

  if (searchInput) searchInput.addEventListener('input', function () { doSearch(searchInput.value); });
  if (searchResults) searchResults.addEventListener('click', function (e) {
    var item = e.target.closest('.search-item');
    if (item && item.href) window.location.href = item.href;
  });
  document.addEventListener('click', function (e) {
    if (!searchPanel || !searchPanel.classList.contains('active')) return;
    if (!searchPanel.contains(e.target) && !(searchBtn && searchBtn.contains(e.target))) setSearch(false);
  });

  /* ══════════════════════════════════════════════
     ABOUT MODAL
  ══════════════════════════════════════════════ */
  var modal = document.getElementById('about-modal');
  function openAbout()  { if (modal) { modal.classList.add('open');    body.style.overflow = 'hidden'; } }
  function closeAbout() { if (modal) { modal.classList.remove('open'); body.style.overflow = ''; } }
  var aboutOpen       = document.getElementById('about-open');
  var aboutOpenMobile = document.getElementById('about-open-mobile');
  if (aboutOpen)       aboutOpen.addEventListener('click',       function (e) { e.preventDefault(); openAbout(); });
  if (aboutOpenMobile) aboutOpenMobile.addEventListener('click', function (e) { e.preventDefault(); closeDrawer(); openAbout(); });
  var aboutClose = document.getElementById('about-close');
  if (aboutClose) aboutClose.addEventListener('click', closeAbout);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeAbout(); });

  /* ══════════════════════════════════════════════
     PILLS ACTIVE STATE (real label links)
  ══════════════════════════════════════════════ */
  var currentPath = window.location.pathname;
  document.querySelectorAll('.pills .pill').forEach(function (pill) {
    pill.classList.remove('active');
    try {
      if (pill.href && currentPath === new URL(pill.href, window.location.origin).pathname)
        pill.classList.add('active');
    } catch (e) {}
  });

  /* ══════════════════════════════════════════════
     ACTIVE NAV HIGHLIGHTING
  ══════════════════════════════════════════════ */
  document.querySelectorAll('.nav-menu .nav-link, .mobile-drawer .nav-link').forEach(function (a) {
    try {
      if (a.getAttribute('href') && currentPath === new URL(a.href, window.location.origin).pathname)
        a.classList.add('active');
    } catch (e) {}
  });

  /* ══════════════════════════════════════════════
     KEYBOARD SHORTCUTS
  ══════════════════════════════════════════════ */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (searchPanel && searchPanel.classList.contains('active')) setSearch(false);
    if (modal && modal.classList.contains('open')) closeAbout();
    if (drawer && drawer.classList.contains('active')) closeDrawer();
  });

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initLazy();
    buildDesktopSwitcher();
    buildMobileSwitcher();
    syncSwitcherUI(savedTheme, savedDark);
  });

})();
