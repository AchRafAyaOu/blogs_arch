/* ═══════════════════════════════════════════════════════════════
   BlogArch v4 — Complete JavaScript
   Features: Theme Engine × 5 · TOC · Relative Dates · Text Share
             Contact Form (Web3Forms) · Read Time · Lazy Load
             Mobile Drawer · Search · About Modal · Scroll FX
   https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main/blogarch_v4.js
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var body = document.body;

  /* ══════════════════════════════════════════════════════
     1. THEME ENGINE — 5 identities × dark variant
  ══════════════════════════════════════════════════════ */
  var THEMES = {
    default:  { name: 'افتراضي',       desc: 'أخضر وأزرق هادئ',       bg: '#f8fafc', bgDark: '#0f172a' },
    ocean:    { name: 'المحيط',        desc: 'أزرق سماوي عميق',        bg: '#f0f9ff', bgDark: '#0a1929' },
    sunset:   { name: 'الغروب',       desc: 'عنبري دافئ',             bg: '#fff8f0', bgDark: '#1c0d00' },
    forest:   { name: 'الغابة',        desc: 'أخضر طبيعي',            bg: '#f1f8f4', bgDark: '#081a0f' },
    midnight: { name: 'منتصف الليل',   desc: 'أرجواني داكن',           bg: '#09090b', bgDark: '#09090b' },
  };

  var savedTheme = localStorage.getItem('ba-theme') || 'default';
  var savedDark  = localStorage.getItem('ba-dark') === '1';

  function applyTheme(theme, dark) {
    if (theme === 'midnight') dark = true;
    if (theme === 'default')  body.removeAttribute('data-theme');
    else                      body.setAttribute('data-theme', theme);
    if (dark) { body.setAttribute('data-dark', ''); body.classList.add('dark-mode'); }
    else      { body.removeAttribute('data-dark');   body.classList.remove('dark-mode'); }

    // Update theme-color meta
    var meta = document.getElementById('meta-theme-color');
    if (meta) meta.content = dark ? THEMES[theme].bgDark : THEMES[theme].bg;

    // Update theme icon
    var icon = document.getElementById('theme-icon');
    if (icon) icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';

    syncSwitcherUI(theme, dark);
  }

  function setTheme(theme, dark) {
    if (typeof dark === 'undefined') dark = savedDark;
    if (theme === 'midnight') dark = true;
    savedTheme = theme; savedDark = dark;
    localStorage.setItem('ba-theme', theme);
    localStorage.setItem('ba-dark',  dark ? '1' : '0');
    applyTheme(theme, dark);
  }

  function syncSwitcherUI(theme, dark) {
    document.querySelectorAll('.theme-option').forEach(function (o) {
      o.classList.toggle('active', o.getAttribute('data-pick') === theme);
    });
    document.querySelectorAll('.drawer-theme-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-pick') === theme);
    });
    document.querySelectorAll('.ts-dark-input, .drawer-dark-input').forEach(function (i) {
      i.checked = dark;
    });
    var label = document.querySelector('.ts-current-name');
    if (label) label.textContent = (THEMES[theme] || THEMES.default).name;
  }

  // Apply on load
  applyTheme(savedTheme, savedDark);

  // Legacy dark toggle button
  var themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', function () {
    setTheme(savedTheme, !savedDark);
  });

  // Build Desktop Switcher
  function buildDesktopSwitcher() {
    var c = document.getElementById('theme-switcher-desktop');
    if (!c) return;
    var opts = Object.keys(THEMES).map(function (t) {
      return '<button class="theme-option" data-pick="' + t + '" type="button">' +
        '<span class="to-swatch"></span>' +
        '<span class="to-info"><span class="to-name">' + THEMES[t].name + '</span>' +
        '<span class="to-desc">' + THEMES[t].desc + '</span></span>' +
        '<i class="fas fa-check to-check"></i></button>';
    }).join('');
    c.innerHTML =
      '<button class="theme-switcher-toggle" id="ts-toggle-btn" type="button">' +
        '<span class="theme-dot"></span>' +
        '<span class="ts-current-name">' + (THEMES[savedTheme] || THEMES.default).name + '</span>' +
        '<i class="fas fa-chevron-down" style="font-size:.7rem;opacity:.5"></i>' +
      '</button>' +
      '<div class="theme-switcher-popover">' +
        '<span class="ts-label">اختر المظهر</span>' +
        '<div class="theme-options">' + opts + '</div>' +
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

    document.getElementById('ts-toggle-btn').addEventListener('click', function (e) {
      e.stopPropagation(); c.classList.toggle('open');
    });
    c.querySelectorAll('.theme-option').forEach(function (o) {
      o.addEventListener('click', function () { setTheme(o.getAttribute('data-pick')); });
    });
    c.querySelector('.ts-dark-input').addEventListener('change', function () {
      setTheme(savedTheme, this.checked);
    });
    document.addEventListener('click', function (e) { if (!c.contains(e.target)) c.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') c.classList.remove('open'); });
    syncSwitcherUI(savedTheme, savedDark);
  }

  // Build Mobile Drawer Switcher
  function buildMobileSwitcher() {
    var c = document.getElementById('drawer-theme-section');
    if (!c) return;
    var btns = Object.keys(THEMES).map(function (t) {
      return '<button class="drawer-theme-btn" data-pick="' + t + '" title="' + THEMES[t].name + '" type="button">' +
        '<i class="fas fa-check active-check"></i></button>';
    }).join('');
    c.innerHTML =
      '<span class="ts-label">المظهر</span>' +
      '<div class="drawer-theme-grid">' + btns + '</div>' +
      '<div class="drawer-dark-row">' +
        '<label class="drawer-dark-label"><i class="fas fa-moon"></i> داكن</label>' +
        '<label class="ts-toggle">' +
          '<input class="drawer-dark-input" type="checkbox"/>' +
          '<span class="ts-toggle-track"></span>' +
          '<span class="ts-toggle-thumb"></span>' +
        '</label>' +
      '</div>';
    c.querySelectorAll('.drawer-theme-btn').forEach(function (b) {
      b.addEventListener('click', function () { setTheme(b.getAttribute('data-pick')); });
    });
    c.querySelector('.drawer-dark-input').addEventListener('change', function () {
      setTheme(savedTheme, this.checked);
    });
    syncSwitcherUI(savedTheme, savedDark);
  }

  /* ══════════════════════════════════════════════════════
     2. READING PROGRESS + BACK TO TOP + NAVBAR SCROLL
  ══════════════════════════════════════════════════════ */
  var bar    = document.getElementById('reading-progress');
  var btt    = document.getElementById('back-to-top');
  var navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    var st = document.documentElement.scrollTop || document.body.scrollTop || 0;
    var h  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (navbar) navbar.classList.toggle('scrolled', st > 50);
    if (btt)    btt.classList.toggle('visible', st > 400);
    updateTocActiveHeading();
  }, { passive: true });

  if (btt) btt.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ══════════════════════════════════════════════════════
     3. READ TIME CALCULATOR
  ══════════════════════════════════════════════════════ */
  var postBody   = document.getElementById('post-body');
  var readTimeEl = document.querySelector('.read-time-val');
  if (postBody && readTimeEl) {
    var words = (postBody.innerText || postBody.textContent || '').trim().split(/\s+/).length;
    readTimeEl.textContent = Math.max(1, Math.round(words / 200));
  }

  /* ══════════════════════════════════════════════════════
     4. RELATIVE DATES
  ══════════════════════════════════════════════════════ */
  function toRelativeArabic(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d)) return null;
    var diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60)         return 'منذ لحظات';
    if (diff < 3600)       return 'منذ ' + Math.floor(diff / 60) + ' دقيقة';
    if (diff < 86400)      return 'منذ ' + Math.floor(diff / 3600) + ' ساعة';
    if (diff < 2592000)    return 'منذ ' + Math.floor(diff / 86400) + ' يوم';
    if (diff < 31536000)   return 'منذ ' + Math.floor(diff / 2592000) + ' شهر';
    return 'منذ ' + Math.floor(diff / 31536000) + ' سنة';
  }

  function initRelativeDates() {
    var metaDate = document.querySelector('meta[property="article:published_time"]') ||
                   document.querySelector('time[datetime]');
    var relContainer = document.querySelector('.post-relative-date');
    var relVal       = document.querySelector('.relative-date-val');
    if (!relContainer || !relVal) return;

    var dateStr = metaDate ? (metaDate.getAttribute('content') || metaDate.getAttribute('datetime')) : null;
    // Fallback: try to parse from the displayed date in post-meta
    if (!dateStr) {
      var metaSpan = document.querySelector('.post-meta span:first-child');
      if (metaSpan) dateStr = metaSpan.textContent.replace(/[^\d\-\/\s]/g, '').trim();
    }
    if (dateStr) {
      var rel = toRelativeArabic(dateStr);
      if (rel) { relVal.textContent = rel; relContainer.style.display = 'flex'; }
    }
  }

  /* ══════════════════════════════════════════════════════
     5. TABLE OF CONTENTS (TOC)
  ══════════════════════════════════════════════════════ */
  var tocHeadings = [];

  function buildTOC() {
    var container = document.getElementById('toc-container');
    var nav       = document.getElementById('toc-nav');
    if (!container || !nav || !postBody) return;

    var headings = postBody.querySelectorAll('h2, h3');
    if (headings.length < 3) return; // Only show TOC for longer posts

    tocHeadings = [];
    var html = '';
    headings.forEach(function (h, idx) {
      if (!h.id) h.id = 'heading-' + idx;
      var isH3   = h.tagName === 'H3';
      var cls    = isH3 ? 'toc-h3' : 'toc-h2';
      var text   = h.textContent || h.innerText || '';
      html += '<a href="#' + h.id + '" class="' + cls + '" data-heading-id="' + h.id + '">' + text + '</a>';
      tocHeadings.push(h);
    });
    nav.innerHTML = html;
    container.style.display = 'block';

    // Smooth scroll on TOC click
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById(a.getAttribute('data-heading-id'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Toggle button
    var toggleBtn = document.getElementById('toc-toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', function () {
      container.classList.toggle('collapsed');
    });
  }

  function updateTocActiveHeading() {
    if (!tocHeadings.length) return;
    var scrollY = window.scrollY + 120;
    var active  = null;
    for (var i = 0; i < tocHeadings.length; i++) {
      if (tocHeadings[i].offsetTop <= scrollY) active = tocHeadings[i].id;
      else break;
    }
    document.querySelectorAll('.toc-nav a').forEach(function (a) {
      a.classList.toggle('toc-active', a.getAttribute('data-heading-id') === active);
    });
  }

  /* ══════════════════════════════════════════════════════
     6. TEXT SHARE TOOLTIP
  ══════════════════════════════════════════════════════ */
  function initTextShare() {
    var tooltip = document.getElementById('text-share-tooltip');
    var copyBtn = document.getElementById('tst-copy');
    var shareBtn= document.getElementById('tst-share');
    if (!tooltip || !postBody) return;

    var selectedText = '';

    document.addEventListener('mouseup', function (e) {
      setTimeout(function () {
        var sel = window.getSelection();
        selectedText = sel ? sel.toString().trim() : '';
        if (selectedText.length > 10 && postBody.contains(sel.anchorNode)) {
          var range  = sel.getRangeAt(0).getBoundingClientRect();
          var top    = range.top + window.scrollY - tooltip.offsetHeight - 10;
          var left   = range.left + (range.width / 2) - (tooltip.offsetWidth / 2);
          tooltip.style.top  = top + 'px';
          tooltip.style.left = Math.max(8, Math.min(left, window.innerWidth - 160)) + 'px';
          tooltip.classList.add('show');
        } else {
          tooltip.classList.remove('show');
        }
      }, 10);
    });

    document.addEventListener('mousedown', function (e) {
      if (!tooltip.contains(e.target)) tooltip.classList.remove('show');
    });

    if (copyBtn) copyBtn.addEventListener('click', function () {
      navigator.clipboard && navigator.clipboard.writeText(selectedText).then(function () {
        copyBtn.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
        setTimeout(function () { copyBtn.innerHTML = '<i class="fas fa-copy"></i> نسخ'; }, 2000);
      });
      tooltip.classList.remove('show');
    });

    if (shareBtn) shareBtn.addEventListener('click', function () {
      var url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, text: selectedText, url: url });
      } else {
        var twitterUrl = 'https://twitter.com/intent/tweet?text=' +
          encodeURIComponent('"' + selectedText.slice(0, 200) + '"') +
          '&url=' + encodeURIComponent(url);
        window.open(twitterUrl, '_blank', 'width=600,height=400');
      }
      tooltip.classList.remove('show');
    });
  }

  /* ══════════════════════════════════════════════════════
     7. CONTACT FORM — Web3Forms
  ══════════════════════════════════════════════════════ */
  function initContactForm() {
    var form   = document.getElementById('contact-form');
    var status = document.getElementById('contact-status');
    var btn    = document.getElementById('contact-btn');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var key = form.querySelector('[name="access_key"]');
      if (key && key.value === 'YOUR_WEB3FORMS_KEY') {
        if (status) { status.textContent = 'أضف مفتاح Web3Forms في ملف القالب'; status.className = 'contact-note contact-status-error'; }
        return;
      }
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      }).then(function (r) { return r.json(); }).then(function (data) {
        if (data.success) {
          if (status) { status.textContent = '✓ تم إرسال رسالتك بنجاح!'; status.className = 'contact-note contact-status-success'; }
          form.reset();
        } else {
          if (status) { status.textContent = 'حدث خطأ، حاول مجدداً.'; status.className = 'contact-note contact-status-error'; }
        }
      }).catch(function () {
        if (status) { status.textContent = 'تعذّر الاتصال، تحقق من الإنترنت.'; status.className = 'contact-note contact-status-error'; }
      }).finally(function () {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الرسالة';
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     8. LAZY LOADING
  ══════════════════════════════════════════════════════ */
  function initLazy() {
    var imgs = document.querySelectorAll('img.lazy');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var img = e.target;
            img.src = img.dataset.src;
            img.onload = function () {
              img.classList.add('loaded');
              var wrapper = img.closest('.card-image-wrapper');
              if (wrapper) wrapper.classList.add('loaded');
            };
            obs.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });
      imgs.forEach(function (img) { obs.observe(img); });
    } else {
      imgs.forEach(function (img) { img.src = img.dataset.src; img.classList.add('loaded'); });
    }
    // Post body images
    document.querySelectorAll('.post-body img:not(.lazy)').forEach(function (img) {
      img.setAttribute('loading', 'lazy');
      var mark = function () { img.classList.add('loaded'); };
      if (img.complete) mark(); else img.addEventListener('load', mark, { once: true });
    });
  }

  /* ══════════════════════════════════════════════════════
     9. MOBILE DRAWER
  ══════════════════════════════════════════════════════ */
  var drawer    = document.getElementById('mobile-drawer');
  var overlay   = document.getElementById('menu-overlay');
  var hamburger = document.getElementById('hamburger');

  function openDrawer()  {
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

  // Mobile dropdown
  var mobileDropdown = document.getElementById('mobile-dropdown');
  if (mobileDropdown) {
    var dtoggle = mobileDropdown.querySelector('.dropdown-toggle');
    if (dtoggle) dtoggle.addEventListener('click', function (e) {
      e.preventDefault(); mobileDropdown.classList.toggle('active');
    });
    mobileDropdown.querySelectorAll('.dropdown-item').forEach(function (i) {
      i.addEventListener('click', closeDrawer);
    });
  }

  // About from drawer
  var aboutOpenMobile = document.getElementById('about-open-mobile');
  if (aboutOpenMobile) aboutOpenMobile.addEventListener('click', function (e) {
    e.preventDefault(); closeDrawer(); openAbout();
  });

  /* ══════════════════════════════════════════════════════
     10. SEARCH PANEL
  ══════════════════════════════════════════════════════ */
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
    if (!items.length) { searchResults.innerHTML = "<div style='padding:1rem;text-align:center;color:var(--muted)'>لا توجد نتائج</div>"; return; }
    searchResults.innerHTML = items.map(function (it) {
      return '<a class="search-item" href="' + it.url + '"><strong class="arabic-text">' + it.title + '</strong><span class="arabic-text">' + it.snippet + '</span></a>';
    }).join('');
  };

  var doSearch = function (q) {
    q = (q || '').toLowerCase().trim();
    if (q.length < 2) { renderResults([]); return; }
    var items = [];
    document.querySelectorAll('.post-card, .entry').forEach(function (card) {
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

  /* ══════════════════════════════════════════════════════
     11. ABOUT MODAL
  ══════════════════════════════════════════════════════ */
  var modal = document.getElementById('about-modal');
  function openAbout()  { if (modal) { modal.classList.add('open');    body.style.overflow = 'hidden'; } }
  function closeAbout() { if (modal) { modal.classList.remove('open'); body.style.overflow = ''; } }
  var aboutOpen  = document.getElementById('about-open');
  var aboutClose = document.getElementById('about-close');
  if (aboutOpen)  aboutOpen.addEventListener('click',  function (e) { e.preventDefault(); openAbout(); });
  if (aboutClose) aboutClose.addEventListener('click',  closeAbout);
  if (modal)      modal.addEventListener('click', function (e) { if (e.target === modal) closeAbout(); });

  /* ══════════════════════════════════════════════════════
     12. PILLS ACTIVE STATE
  ══════════════════════════════════════════════════════ */
  var currentPath = window.location.pathname;
  document.querySelectorAll('.pills .pill').forEach(function (pill) {
    pill.classList.remove('active');
    try {
      if (pill.href && currentPath === new URL(pill.href, window.location.origin).pathname)
        pill.classList.add('active');
    } catch (e) {}
  });

  /* ══════════════════════════════════════════════════════
     13. ACTIVE NAV HIGHLIGHTING
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.nav-menu .nav-link, .mobile-drawer .nav-link').forEach(function (a) {
    try {
      if (a.getAttribute('href') && currentPath === new URL(a.href, window.location.origin).pathname)
        a.classList.add('active');
    } catch (e) {}
  });

  /* ══════════════════════════════════════════════════════
     14. KEYBOARD SHORTCUTS
  ══════════════════════════════════════════════════════ */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (searchPanel && searchPanel.classList.contains('active')) setSearch(false);
    if (modal && modal.classList.contains('open')) closeAbout();
    if (drawer && drawer.classList.contains('active')) closeDrawer();
  });

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initLazy();
    buildDesktopSwitcher();
    buildMobileSwitcher();
    buildTOC();
    initRelativeDates();
    initTextShare();
    initContactForm();
    syncSwitcherUI(savedTheme, savedDark);
  });

})();
