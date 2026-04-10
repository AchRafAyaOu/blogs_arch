/* ═══════════════════════════════════════════════════════════════
   BlogArch v10 — Complete JavaScript
   Features: Theme Engine × 5 · TOC · Relative Dates · Text Share
             Contact Form (Web3Forms) · Read Time · Lazy Load (Enhanced)
             Mobile Drawer · Search · About Modal · Scroll FX
             Lessons Viewer (iframe) · Quotes Carousel · Podcast Grid
             Prev/Next Nav · Swipe Support
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

    if (dark) { body.setAttribute('data-dark', ''); }
    else      { body.removeAttribute('data-dark'); }

    var meta = document.getElementById('meta-theme-color');
    if (meta) meta.content = dark ? THEMES[theme].bgDark : THEMES[theme].bg;

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

  applyTheme(savedTheme, savedDark);

  var themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', function () {
    setTheme(savedTheme, !savedDark);
  });

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

    /* شريط القراءة */
    if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';

    /* ✅ FIX: scrolled فقط إذا كانت الصفحة قابلة للتمرير فعلاً
       — يستخدم getComputedStyle لقراءة overflow الحقيقي (CSS rules + inline)
       — يمنع التأثير على الصفحات الثابتة (iframe) حيث body overflow=hidden
       — يمنع الخط الجزئي على الكمبيوتر عند عدم وجود محتوى كافٍ للتمرير */
    if (navbar) {
      var bodyOverflow    = window.getComputedStyle(document.body).overflow;
      var pageIsScrollable = h > 10 && bodyOverflow !== 'hidden';
      navbar.classList.toggle('scrolled', pageIsScrollable && st > 50);
      if (!pageIsScrollable) navbar.classList.remove('scrolled');
    }

    if (btt) btt.classList.toggle('visible', st > 400);
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
    if (headings.length < 3) return;

    tocHeadings = [];
    var html = '';
    headings.forEach(function (h, idx) {
      if (!h.id) h.id = 'heading-' + idx;
      var isH3 = h.tagName === 'H3';
      var cls  = isH3 ? 'toc-h3' : 'toc-h2';
      var text = h.textContent || h.innerText || '';
      html += '<a href="#' + h.id + '" class="' + cls + '" data-heading-id="' + h.id + '">' + text + '</a>';
      tocHeadings.push(h);
    });
    nav.innerHTML = html;
    container.style.display = 'block';

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById(a.getAttribute('data-heading-id'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

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

    document.addEventListener('mouseup', function () {
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
        window.open(
          'https://twitter.com/intent/tweet?text=' +
          encodeURIComponent('"' + selectedText.slice(0, 200) + '"') +
          '&url=' + encodeURIComponent(url),
          '_blank', 'width=600,height=400'
        );
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
     8. LAZY LOADING — Enhanced
  ══════════════════════════════════════════════════════ */
  var lazyObserver = null;

  function observeImage(img) {
    if (lazyObserver) {
      lazyObserver.observe(img);
    } else {
      loadImage(img);
    }
  }

  function loadImage(img) {
    var src = img.dataset.src;
    if (!src) return;

    img.style.filter = 'blur(8px)';
    img.style.transition = 'filter 0.4s ease';

    var tempImg = new Image();
    tempImg.onload = function () {
      img.src = src;
      img.style.filter = '';
      img.classList.add('loaded');
      var wrapper = img.closest('.card-image-wrapper');
      if (wrapper) wrapper.classList.add('loaded');
    };
    tempImg.onerror = function () {
      img.style.filter = '';
      img.classList.add('loaded', 'img-error');
      img.alt = img.alt || 'تعذّر تحميل الصورة';
      var placeholder = img.dataset.placeholder;
      if (placeholder) img.src = placeholder;
      var wrapper = img.closest('.card-image-wrapper');
      if (wrapper) wrapper.classList.add('loaded', 'img-error');
    };
    tempImg.src = src;
  }

  function initLazy() {
    var imgs = document.querySelectorAll('img.lazy');

    if ('IntersectionObserver' in window) {
      lazyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            loadImage(e.target);
            lazyObserver.unobserve(e.target);
          }
        });
      }, {
        rootMargin: '200px',
        threshold: 0.01
      });
      imgs.forEach(function (img) { lazyObserver.observe(img); });
    } else {
      imgs.forEach(loadImage);
    }

    document.querySelectorAll('.post-body img:not(.lazy)').forEach(function (img) {
      img.setAttribute('loading', 'lazy');
      var mark = function () { img.classList.add('loaded'); };
      if (img.complete) mark(); else img.addEventListener('load', mark, { once: true });
    });
  }

  /* ══════════════════════════════════════════════════════
     9. SECTION ANIMATIONS
  ══════════════════════════════════════════════════════ */
  function initSectionAnimations() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(
        '.fade-in-section, .fade-up-section, .fade-in-card, .slide-in-right, .slide-in-left'
      ).forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          sectionObs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    document.querySelectorAll('.fade-in-section, .fade-up-section').forEach(function (el) {
      sectionObs.observe(el);
    });

    document.querySelectorAll('.slide-in-right, .slide-in-left').forEach(function (el) {
      sectionObs.observe(el);
    });

    var cardObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          cardObs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

    document.querySelectorAll('.fade-in-card').forEach(function (el, idx) {
      el.style.transitionDelay = Math.min(idx * 80, 500) + 'ms';
      cardObs.observe(el);
    });
  }

  /* ══════════════════════════════════════════════════════
     10. MOBILE DRAWER
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

  var aboutOpenMobile = document.getElementById('about-open-mobile');
  if (aboutOpenMobile) aboutOpenMobile.addEventListener('click', function (e) {
    e.preventDefault(); closeDrawer(); openAbout();
  });

  /* ══════════════════════════════════════════════════════
     11. SEARCH PANEL
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
     12. ABOUT MODAL
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
     13. LESSONS VIEWER
     ✅ يستخدم IDs الموجودة في XML: fin-learn-modal
     ✅ URL كامل من GitHub CDN
     ✅ Spinner أثناء التحميل
     ✅ التنقل prev/next بين الدروس
     ✅ Swipe support على الموبايل
  ══════════════════════════════════════════════════════ */
  var LESSONS_BASE_URL = 'https://cdn.jsdelivr.net/gh/AchRafAyaOu/english-lessons@main/lessons/';

  var currentLessonIndex   = 0;
  var filteredLessonsCache = [];
  var lessonTouchStartX    = 0;
  var lessonTouchEndX      = 0;

  /* --- Spinner CSS --- */
  (function ensureSpinnerStyle() {
    if (document.getElementById('ba-spinner-style')) return;
    var s = document.createElement('style');
    s.id = 'ba-spinner-style';
    s.textContent = '@keyframes ba-spin{to{transform:rotate(360deg)}}' +
      '.ba-spinner{display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:1rem}' +
      '.ba-spinner-ring{width:48px;height:48px;border:4px solid var(--border,#e2e8f0);border-top-color:var(--primary-color,#4361ee);border-radius:50%;animation:ba-spin 0.8s linear infinite}' +
      '.ba-spinner-text{color:var(--muted,#94a3b8);font-size:.9rem}';
    document.head.appendChild(s);
  })();

  /* ✅ FIX: يستخدم fin-learn-iframe و fin-learn-modal-label الموجودَين في XML */
  function openLessonModal(lesson, index) {
    currentLessonIndex = index;

    var lessonModal = document.getElementById('fin-learn-modal');
    if (!lessonModal) return;

    var titleEl = document.getElementById('fin-learn-modal-label');
    var iframe  = document.getElementById('fin-learn-iframe');
    var extLink = document.getElementById('fin-learn-modal-ext');

    var fullUrl = LESSONS_BASE_URL + lesson.githubPath;

    if (titleEl) titleEl.textContent = lesson.title + (lesson.titleEn ? ' — ' + lesson.titleEn : '');
    if (extLink) extLink.href = fullUrl;

    /* عرض spinner مؤقت قبل تحميل الـ iframe */
    if (iframe) {
      var spinnerDiv = document.createElement('div');
      spinnerDiv.className = 'ba-spinner';
      spinnerDiv.id = 'ba-iframe-spinner';
      spinnerDiv.innerHTML = '<div class="ba-spinner-ring"></div><span class="ba-spinner-text">جاري تحميل الدرس...</span>';
      iframe.parentNode.insertBefore(spinnerDiv, iframe);

      iframe.style.display = 'none';
      iframe.src = '';
      /* تأخير بسيط لإعطاء فرصة للـ spinner يظهر أولاً */
      setTimeout(function () { iframe.src = fullUrl; }, 30);

      iframe.onload = function () {
        var sp = document.getElementById('ba-iframe-spinner');
        if (sp) sp.parentNode.removeChild(sp);
        iframe.style.display = 'block';
      };
    }

    lessonModal.classList.add('open');
    body.style.overflow = 'hidden';
    updateLessonNavButtons();

    /* Swipe support */
    lessonModal.addEventListener('touchstart', function (e) {
      lessonTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lessonModal.addEventListener('touchend', function (e) {
      lessonTouchEndX = e.changedTouches[0].screenX;
      var diff = lessonTouchStartX - lessonTouchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) navigateToNextLesson();
        else          navigateToPrevLesson();
      }
    }, { passive: true });
  }

  function closeLessonModal() {
    var lessonModal = document.getElementById('fin-learn-modal');
    if (lessonModal) {
      lessonModal.classList.remove('open');
      body.style.overflow = '';
      /* تحرير الـ iframe من الذاكرة */
      var iframe = document.getElementById('fin-learn-iframe');
      if (iframe) { iframe.src = ''; iframe.style.display = 'none'; }
      var sp = document.getElementById('ba-iframe-spinner');
      if (sp) sp.parentNode.removeChild(sp);
    }
  }

  function navigateToPrevLesson() {
    if (currentLessonIndex > 0)
      openLessonModal(filteredLessonsCache[currentLessonIndex - 1], currentLessonIndex - 1);
  }

  function navigateToNextLesson() {
    if (currentLessonIndex < filteredLessonsCache.length - 1)
      openLessonModal(filteredLessonsCache[currentLessonIndex + 1], currentLessonIndex + 1);
  }

  function updateLessonNavButtons() {
    var prevBtn = document.getElementById('lesson-prev-btn');
    var nextBtn = document.getElementById('lesson-next-btn');
    if (prevBtn) {
      prevBtn.disabled      = currentLessonIndex === 0;
      prevBtn.style.opacity = currentLessonIndex === 0 ? '0.4' : '1';
    }
    if (nextBtn) {
      var atEnd = currentLessonIndex === filteredLessonsCache.length - 1;
      nextBtn.disabled      = atEnd;
      nextBtn.style.opacity = atEnd ? '0.4' : '1';
    }
  }

  /* ✅ FIX: يستخدم fin-learn-modal بدل lesson-modal */
  function initLessonsViewer() {
    var lessonModal = document.getElementById('fin-learn-modal');
    if (!lessonModal) return;

    lessonModal.addEventListener('click', function (e) {
      if (e.target === lessonModal) closeLessonModal();
    });

    var closeBtn = document.getElementById('fin-learn-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeLessonModal);

    var prevBtn = document.getElementById('lesson-prev-btn');
    var nextBtn = document.getElementById('lesson-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', navigateToPrevLesson);
    if (nextBtn) nextBtn.addEventListener('click', navigateToNextLesson);
  }

  /* ══════════════════════════════════════════════════════
     13b. LESSONS GRID — الرئيسية ← lessons.json
     ✅ يملأ #fin-learn-grid بأول 6 دروس
     ✅ يعرض بطاقات بالمستوى والأيقونة
     ✅ عند النقر يفتح الـ modal بالدرس المطلوب
  ══════════════════════════════════════════════════════ */
  function initLessonsGrid() {
    var grid = document.getElementById('fin-learn-grid');
    if (!grid) return;

    function renderGrid(lessons) {
      filteredLessonsCache = lessons;
      window.lessonsData   = lessons;

      var display = lessons.slice(0, 6);
      grid.innerHTML = display.map(function (lesson, idx) {
        var levelClass = lesson.level === 'beginner' ? 'beg' : lesson.level === 'intermediate' ? 'mid' : 'adv';
        var levelLabel = lesson.level === 'beginner' ? 'مبتدئ' : lesson.level === 'intermediate' ? 'متوسط' : 'متقدم';
        return '<div class="fin-learn-card fade-in-card" data-lesson-id="' + lesson.id + '" style="cursor:pointer;transition-delay:' + Math.min(idx * 80, 400) + 'ms">' +
          '<span class="fin-learn-level ' + levelClass + '">' + levelLabel + '</span>' +
          '<div class="fin-learn-icon"><i class="' + (lesson.icon || 'fas fa-book') + '"></i></div>' +
          '<h3 class="fin-learn-title arabic-text">' + (lesson.title || '') + '</h3>' +
          '<p class="fin-learn-sub arabic-text">' + (lesson.description || '') + '</p>' +
          '<span class="fin-learn-link arabic-text">ابدأ الدرس <i class="fas fa-arrow-left"></i></span>' +
        '</div>';
      }).join('');

      /* ربط أحداث النقر */
      grid.querySelectorAll('[data-lesson-id]').forEach(function (card) {
        card.addEventListener('click', function () {
          var id  = parseInt(card.getAttribute('data-lesson-id'), 10);
          var idx = lessons.findIndex(function (l) { return l.id === id; });
          if (idx !== -1) openLessonModal(lessons[idx], idx);
        });
      });

      /* تفعيل animation */
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
          });
        }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
        grid.querySelectorAll('.fade-in-card').forEach(function (c) { obs.observe(c); });
      } else {
        grid.querySelectorAll('.fade-in-card').forEach(function (c) { c.classList.add('is-visible'); });
      }
    }

    /* استخدام window.lessonsData إذا كانت متوفرة محلياً، وإلا جلب من JSON */
    if (window.lessonsData && window.lessonsData.length) {
      renderGrid(window.lessonsData);
    } else {
      fetch('https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main/data/lessons.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          renderGrid(Array.isArray(data) ? data : (data.lessons || []));
        })
        .catch(function () {
          grid.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--muted)">تعذّر تحميل الدروس. تحقق من اتصالك.</p>';
        });
    }
  }

  /* ══════════════════════════════════════════════════════
     13c. QUOTES CAROUSEL — quotes.json
     ✅ يجلب الاقتباسات من JSON
     ✅ كاروسيل بأزرار prev/next ونقاط
     ✅ دوران تلقائي كل 6 ثوانٍ
  ══════════════════════════════════════════════════════ */
  function initQuotes() {
    var textEl   = document.getElementById('fin-quote-text');
    var sourceEl = document.getElementById('fin-quote-source');
    var dotsEl   = document.getElementById('fin-quote-dots');
    var prevBtn  = document.getElementById('fin-quote-prev');
    var nextBtn  = document.getElementById('fin-quote-next');
    if (!textEl) return;

    var quotes = [];
    var qIdx   = 0;
    var qTimer = null;

    function showQuote(i) {
      if (!quotes.length) return;
      qIdx = ((i % quotes.length) + quotes.length) % quotes.length;

      textEl.style.opacity   = '0';
      if (sourceEl) sourceEl.style.opacity = '0';

      setTimeout(function () {
        var q = quotes[qIdx];
        textEl.textContent   = q.text || q.quote || q.content || '';
        if (sourceEl) sourceEl.textContent = q.source || q.author || '';
        textEl.style.opacity   = '1';
        if (sourceEl) sourceEl.style.opacity = '1';

        if (dotsEl) dotsEl.querySelectorAll('.fin-quote-dot').forEach(function (d, di) {
          d.classList.toggle('active', di === qIdx);
        });
      }, 350);
    }

    function buildDots(count) {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      for (var i = 0; i < count; i++) {
        var d = document.createElement('button');
        d.className = 'fin-quote-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'اقتباس ' + (i + 1));
        (function (idx) {
          d.addEventListener('click', function () { showQuote(idx); resetTimer(); });
        })(i);
        dotsEl.appendChild(d);
      }
    }

    function resetTimer() {
      clearInterval(qTimer);
      qTimer = setInterval(function () { showQuote(qIdx + 1); }, 6000);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { showQuote(qIdx - 1); resetTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { showQuote(qIdx + 1); resetTimer(); });

    fetch('https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main/data/quotes.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        quotes = Array.isArray(data) ? data : (data.quotes || data.items || []);
        if (!quotes.length) { if (textEl) textEl.textContent = 'لا توجد اقتباسات بعد.'; return; }
        buildDots(Math.min(quotes.length, 7));
        showQuote(0);
        resetTimer();
      })
      .catch(function () {
        if (textEl) textEl.textContent = 'تعذّر تحميل الاقتباسات.';
      });
  }

  /* ══════════════════════════════════════════════════════
     13d. PODCAST GRID — podcast.json
     ✅ يجلب الحلقات من JSON
     ✅ يعرض أول 4 حلقات في #fin-podcast-grid
  ══════════════════════════════════════════════════════ */
  function initPodcast() {
    var grid = document.getElementById('fin-podcast-grid');
    if (!grid) return;

    fetch('https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main/data/podcast.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var episodes = Array.isArray(data) ? data : (data.episodes || data.items || []);
        if (!episodes.length) { grid.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem">لا توجد حلقات بعد.</p>'; return; }

        grid.innerHTML = episodes.slice(0, 4).map(function (ep, i) {
          var epNum = ep.episode || ep.number || ep.ep || (i + 1);
          var cat   = ep.category || ep.label || ep.cat || 'بودكاست';
          var title = ep.title || ep.name || '';
          var desc  = ep.description || ep.desc || ep.summary || '';
          var dur   = ep.duration || ep.length || '';
          var url   = ep.url || ep.link || ep.audio || '#';

          return '<div class="fin-podcast-ep fade-in-card">' +
            '<div class="fin-podcast-ep-art">' +
              '<i class="fas fa-podcast" style="font-size:1.6rem;opacity:.9"></i>' +
              '<span class="fin-podcast-ep-num arabic-text">الحلقة ' + epNum + '</span>' +
            '</div>' +
            '<div class="fin-podcast-ep-body">' +
              '<div class="fin-podcast-ep-cat arabic-text"><i class="fas fa-tag"></i> ' + cat + '</div>' +
              '<h3 class="fin-podcast-ep-title arabic-text">' + title + '</h3>' +
              '<p class="fin-podcast-ep-desc arabic-text">' + desc + '</p>' +
              '<div class="fin-podcast-ep-footer">' +
                (dur ? '<span class="fin-podcast-ep-dur arabic-text"><i class="far fa-clock"></i> ' + dur + '</span>' : '<span></span>') +
                '<a class="fin-podcast-ep-play arabic-text" href="' + url + '" target="_blank" rel="noopener">استمع <i class="fas fa-arrow-left"></i></a>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      })
      .catch(function () {
        grid.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem">تعذّر تحميل حلقات البودكاست.</p>';
      });
  }

  /* ══════════════════════════════════════════════════════
     14. PILLS ACTIVE STATE
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
     15. ACTIVE NAV HIGHLIGHTING
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.nav-menu .nav-link, .mobile-drawer .nav-link').forEach(function (a) {
    try {
      if (a.getAttribute('href') && currentPath === new URL(a.href, window.location.origin).pathname)
        a.classList.add('active');
    } catch (e) {}
  });

  /* ══════════════════════════════════════════════════════
     16. KEYBOARD SHORTCUTS
  ══════════════════════════════════════════════════════ */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (searchPanel && searchPanel.classList.contains('active')) setSearch(false);
    if (modal && modal.classList.contains('open')) closeAbout();
    if (drawer && drawer.classList.contains('active')) closeDrawer();
    var lessonModal = document.getElementById('fin-learn-modal');
    if (lessonModal && lessonModal.classList.contains('open')) closeLessonModal();
  });

  /* ══════════════════════════════════════════════════════
     17. CLICKABLE POST CARDS
  ══════════════════════════════════════════════════════ */
  function initClickableCards() {
    document.querySelectorAll('.fin-clickable-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a') || e.target.closest('button')) return;
        var url = card.getAttribute('data-url');
        if (url) window.location.href = url;
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     18. FOOTER YEAR AUTO-UPDATE
  ══════════════════════════════════════════════════════ */
  var yearEl = document.getElementById('fin-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initLazy();
    initSectionAnimations();
    buildDesktopSwitcher();
    buildMobileSwitcher();
    buildTOC();
    initRelativeDates();
    initTextShare();
    initContactForm();
    initClickableCards();
    initLessonsViewer();
    /* ✅ NEW: تهيئة الأقسام الديناميكية */
    initLessonsGrid();
    initQuotes();
    initPodcast();
    syncSwitcherUI(savedTheme, savedDark);
  });

  /* ══════════════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════════════ */
  window.BlogArch = {
    openLesson:      function (lesson, index, cache) {
      if (cache) filteredLessonsCache = cache;
      openLessonModal(lesson, index);
    },
    closeLesson:     closeLessonModal,
    observeNewImage: observeImage,
    setTheme:        setTheme,
  };

})();