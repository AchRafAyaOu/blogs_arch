/* ═══════════════════════════════════════════════════════════════
   BlogArch — Lessons Module  v2.0  (blogarch.lessons.js)
   يُحمَّل بعد blogarch.js مباشرةً

   ميزات v2.0:
     • iframe.src مباشرة — GitHub Pages — لا srcdoc ولا fetch للمحتوى
     • فلتر المستويات (beg / mid / adv / all)
     • تبديل العرض grid ↔ list
     • نظام المفضلة (localStorage)
     • تحديد الدروس كمكتملة (localStorage)
     • إحصائيات مباشرة (إجمالي / مكتملة)
     • سبينر تحميل حقيقي داخل إطار المودال
     • تنقل لوحة المفاتيح ← →  Esc
     • Swipe على الموبايل
     • تكامل كامل مع Theme Engine في blogarch.js
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── GitHub Pages base URL — صفحات HTML حقيقية (لا CDN text) ── */
  var LESSONS_BASE_URL = 'https://achrafayaou.github.io/english-lessons/lessons/';

  /* ── CDN_BASE من blogarch.js إن وُجد ── */
  var CDN_BASE = (window.BlogArch && window.BlogArch.CDN_BASE)
    || 'https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main';

  /* ══════════════════════════════════════════════════════
     الحالة الداخلية
  ══════════════════════════════════════════════════════ */
  var state = {
    all:       [],
    filtered:  [],
    current:   0,
    filter:    'all',
    view:      'grid',
    favorites: [],
    completed: []
  };

  /* ══════════════════════════════════════════════════════
     localStorage helpers
  ══════════════════════════════════════════════════════ */
  function loadStorage() {
    try {
      state.favorites = JSON.parse(localStorage.getItem('ba_fav')  || '[]');
      state.completed = JSON.parse(localStorage.getItem('ba_done') || '[]');
    } catch (e) {
      state.favorites = [];
      state.completed = [];
    }
  }

  function saveStorage() {
    try {
      localStorage.setItem('ba_fav',  JSON.stringify(state.favorites));
      localStorage.setItem('ba_done', JSON.stringify(state.completed));
    } catch (e) {}
  }

  function isFav(id)  { return state.favorites.indexOf(id) !== -1; }
  function isDone(id) { return state.completed.indexOf(id) !== -1; }

  function toggleFav(id) {
    var idx = state.favorites.indexOf(id);
    if (idx > -1) state.favorites.splice(idx, 1);
    else          state.favorites.push(id);
    saveStorage();
  }

  function markDone(id) {
    if (!isDone(id)) {
      state.completed.push(id);
      saveStorage();
    }
  }

  /* ══════════════════════════════════════════════════════
     Spinner CSS — يُضاف مرة واحدة فقط
  ══════════════════════════════════════════════════════ */
  function ensureStyles() {
    if (document.getElementById('ba-lessons-style')) return;
    var s = document.createElement('style');
    s.id = 'ba-lessons-style';
    s.textContent = [
      /* spinner */
      '@keyframes ba-spin{to{transform:rotate(360deg)}}',
      '.ba-spinner{display:flex;align-items:center;justify-content:center;',
        'height:100%;flex-direction:column;gap:1rem}',
      '.ba-spinner-ring{width:48px;height:48px;',
        'border:4px solid var(--border,#e2e8f0);',
        'border-top-color:var(--primary-color,#4361ee);',
        'border-radius:50%;animation:ba-spin .8s linear infinite}',
      '.ba-spinner-text{color:var(--muted,#94a3b8);font-size:.9rem;font-family:var(--font-ui)}',

      /* بطاقة الدرس — نشرة مشتركة */
      '.fin-learn-card{position:relative;cursor:pointer}',

      /* شارة المكتمل */
      '.ba-done-badge{position:absolute;top:.55rem;left:.55rem;',
        'background:var(--accent,#059669);color:var(--accent-fg,#fff);',
        'border-radius:50%;width:22px;height:22px;',
        'display:flex;align-items:center;justify-content:center;',
        'font-size:.7rem;z-index:2}',

      /* زر المفضلة */
      '.ba-fav-btn{position:absolute;top:.5rem;right:.5rem;',
        'background:transparent;border:none;cursor:pointer;',
        'color:var(--muted,#94a3b8);font-size:1rem;',
        'transition:color .2s,transform .2s;z-index:2;padding:.25rem}',
      '.ba-fav-btn:hover{transform:scale(1.2)}',
      '.ba-fav-btn.active{color:#ef4444}',

      /* شارات الفلتر (إن لم تكن في CSS الرئيسي) */
      '.ba-stats-bar{display:flex;gap:.75rem;align-items:center;',
        'margin-bottom:1rem;flex-wrap:wrap}',
      '.ba-stat{font-size:.85rem;color:var(--muted);',
        'display:flex;align-items:center;gap:.35rem}',
      '.ba-stat strong{color:var(--primary-color)}',

      /* view toggle */
      '.ba-view-btn{background:transparent;border:1px solid var(--border);',
        'border-radius:var(--radius-xs,6px);padding:.35rem .6rem;cursor:pointer;',
        'color:var(--muted);transition:all .2s}',
      '.ba-view-btn.active{background:var(--primary-light);',
        'color:var(--primary-color);border-color:var(--primary-color)}',

      /* list view */
      '#fin-learn-grid.ba-list-view{grid-template-columns:1fr !important}',
      '#fin-learn-grid.ba-list-view .fin-learn-card{',
        'display:flex;align-items:center;gap:1rem}',
      '#fin-learn-grid.ba-list-view .fin-learn-icon{',
        'flex-shrink:0;width:52px;height:52px}',

      /* controls toolbar */
      '.ba-toolbar{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;',
        'margin-bottom:1.25rem}',
      '.ba-toolbar-spacer{flex:1}',

      /* تأثير عند اكتمال الدرس */
      '.fin-learn-card.ba-completed{opacity:.75}',
      '.fin-learn-card.ba-completed .fin-learn-title{text-decoration:line-through}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════
     إحصائيات
  ══════════════════════════════════════════════════════ */
  function renderStats(container) {
    var old = container.querySelector('.ba-stats-bar');
    if (old) old.parentNode.removeChild(old);

    var bar = document.createElement('div');
    bar.className = 'ba-stats-bar';
    bar.innerHTML =
      '<span class="ba-stat"><i class="fas fa-book-open"></i>' +
        'الدروس: <strong>' + state.all.length + '</strong></span>' +
      '<span class="ba-stat"><i class="fas fa-check-circle" style="color:var(--accent)"></i>' +
        'مكتملة: <strong>' + state.completed.length + '</strong></span>' +
      '<span class="ba-stat"><i class="fas fa-heart" style="color:#ef4444"></i>' +
        'مفضلة: <strong>' + state.favorites.length + '</strong></span>';
    container.insertBefore(bar, container.firstChild);
  }

  /* ══════════════════════════════════════════════════════
     شريط التحكم (فلتر + view toggle)
  ══════════════════════════════════════════════════════ */
  function buildToolbar(container) {
    if (container.querySelector('.ba-toolbar')) return;

    var toolbar = document.createElement('div');
    toolbar.className = 'ba-toolbar';

    /* أزرار الفلتر */
    var filters = [
      { key: 'all', label: 'الكل' },
      { key: 'beg', label: 'مبتدئ' },
      { key: 'mid', label: 'متوسط' },
      { key: 'adv', label: 'متقدم' }
    ];
    filters.forEach(function (f) {
      var btn = document.createElement('button');
      btn.className = 'pill' + (f.key === state.filter ? ' active' : '');
      btn.textContent = f.label;
      btn.dataset.filter = f.key;
      btn.addEventListener('click', function () {
        state.filter = f.key;
        toolbar.querySelectorAll('[data-filter]').forEach(function (b) {
          b.classList.toggle('active', b.dataset.filter === f.key);
        });
        renderGrid(container.querySelector('#fin-learn-grid') || container);
      });
      toolbar.appendChild(btn);
    });

    /* مسافة */
    var spacer = document.createElement('span');
    spacer.className = 'ba-toolbar-spacer';
    toolbar.appendChild(spacer);

    /* أزرار العرض */
    var viewGrid = document.createElement('button');
    viewGrid.className = 'ba-view-btn' + (state.view === 'grid' ? ' active' : '');
    viewGrid.innerHTML = '<i class="fas fa-th-large"></i>';
    viewGrid.title = 'عرض شبكي';

    var viewList = document.createElement('button');
    viewList.className = 'ba-view-btn' + (state.view === 'list' ? ' active' : '');
    viewList.innerHTML = '<i class="fas fa-list"></i>';
    viewList.title = 'عرض قائمة';

    viewGrid.addEventListener('click', function () {
      state.view = 'grid';
      viewGrid.classList.add('active');
      viewList.classList.remove('active');
      var grid = container.querySelector('#fin-learn-grid') || container;
      grid.classList.remove('ba-list-view');
    });
    viewList.addEventListener('click', function () {
      state.view = 'list';
      viewList.classList.add('active');
      viewGrid.classList.remove('active');
      var grid = container.querySelector('#fin-learn-grid') || container;
      grid.classList.add('ba-list-view');
    });

    toolbar.appendChild(viewGrid);
    toolbar.appendChild(viewList);
    container.insertBefore(toolbar, container.firstChild);
  }

  /* ══════════════════════════════════════════════════════
     عرض الشبكة
  ══════════════════════════════════════════════════════ */
  function renderGrid(grid) {
    if (!grid) return;

    /* تطبيق الفلتر */
    state.filtered = state.filter === 'all'
      ? state.all.slice()
      : state.all.filter(function (l) { return l.level === state.filter; });

    if (!state.filtered.length) {
      grid.innerHTML =
        '<p style="text-align:center;padding:2.5rem;color:var(--muted)">لا توجد دروس في هذا المستوى.</p>';
      return;
    }

    var levelClass = { beg: 'beg', mid: 'mid', adv: 'adv' };
    var levelLabel = { beg: 'مبتدئ', mid: 'متوسط', adv: 'متقدم' };

    grid.innerHTML = state.filtered.map(function (lesson, idx) {
      var done = isDone(lesson.id);
      var fav  = isFav(lesson.id);
      var lc   = levelClass[lesson.level] || 'beg';
      var ll   = lesson.levelLabel || levelLabel[lesson.level] || '';
      var delay = Math.min(idx * 70, 420);

      return (
        '<div class="fin-learn-card fade-in-card' + (done ? ' ba-completed' : '') + '"' +
          ' data-lesson-id="' + lesson.id + '"' +
          ' style="transition-delay:' + delay + 'ms">' +

          /* شارة مكتمل */
          (done ? '<span class="ba-done-badge" title="مكتمل"><i class="fas fa-check"></i></span>' : '') +

          /* زر المفضلة */
          '<button class="ba-fav-btn' + (fav ? ' active' : '') + '"' +
            ' data-fav-id="' + lesson.id + '" title="' + (fav ? 'إزالة من المفضلة' : 'إضافة للمفضلة') + '">' +
            '<i class="' + (fav ? 'fas' : 'far') + ' fa-heart"></i>' +
          '</button>' +

          '<span class="fin-learn-level ' + lc + '">' + ll + '</span>' +
          '<div class="fin-learn-icon"><i class="' + (lesson.icon || 'fas fa-book') + '"></i></div>' +
          '<h3 class="fin-learn-title arabic-text">' + (lesson.title || '') + '</h3>' +
          '<p class="fin-learn-sub arabic-text">' + (lesson.description || lesson.sub || '') + '</p>' +
          '<span class="fin-learn-link arabic-text">ابدأ الدرس <i class="fas fa-arrow-left"></i></span>' +
        '</div>'
      );
    }).join('');

    /* أحداث النقر على البطاقات */
    grid.querySelectorAll('[data-lesson-id]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        /* زر المفضلة */
        var favBtn = e.target.closest('[data-fav-id]');
        if (favBtn) {
          e.stopPropagation();
          var id = parseInt(favBtn.dataset.favId, 10);
          toggleFav(id);
          var icon = favBtn.querySelector('i');
          var active = isFav(id);
          favBtn.classList.toggle('active', active);
          favBtn.title = active ? 'إزالة من المفضلة' : 'إضافة للمفضلة';
          if (icon) icon.className = (active ? 'fas' : 'far') + ' fa-heart';
          return;
        }
        /* فتح الدرس */
        var id  = parseInt(card.dataset.lessonId, 10);
        var idx = state.filtered.findIndex(function (l) { return l.id === id; });
        if (idx !== -1) openLessonModal(state.filtered[idx], idx);
      });
    });

    /* IntersectionObserver للأنيميشن */
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

    /* تطبيق view mode الحالي */
    if (state.view === 'list') grid.classList.add('ba-list-view');
    else                        grid.classList.remove('ba-list-view');
  }

  /* ══════════════════════════════════════════════════════
     تحديث أزرار التنقل في المودال
  ══════════════════════════════════════════════════════ */
  function updateNavBtns() {
    var prevBtn = document.getElementById('lesson-prev-btn');
    var nextBtn = document.getElementById('lesson-next-btn');
    var atFirst = state.current === 0;
    var atLast  = state.current === state.filtered.length - 1;

    if (prevBtn) {
      prevBtn.disabled      = atFirst;
      prevBtn.style.opacity = atFirst ? '0.35' : '1';
    }
    if (nextBtn) {
      nextBtn.disabled      = atLast;
      nextBtn.style.opacity = atLast ? '0.35' : '1';
    }

    /* مؤشر الترقيم */
    var counter = document.getElementById('fin-learn-counter');
    if (counter)
      counter.textContent = (state.current + 1) + ' / ' + state.filtered.length;
  }

  /* ══════════════════════════════════════════════════════
     زر "تحديد كمكتمل" داخل المودال
  ══════════════════════════════════════════════════════ */
  function syncCompleteBtn(lesson) {
    var btn = document.getElementById('fin-learn-complete-btn');
    if (!btn) return;
    var done = isDone(lesson.id);
    btn.classList.toggle('active', done);
    btn.innerHTML = done
      ? '<i class="fas fa-check"></i> مكتمل'
      : '<i class="fas fa-check-circle"></i> تحديد كمكتمل';
    btn.title = done ? 'تم تحديده كمكتمل' : 'حدّده كمكتمل';
  }

  /* ══════════════════════════════════════════════════════
     فتح المودال وتحميل الصفحة داخل iframe مباشرة
  ══════════════════════════════════════════════════════ */
  function openLessonModal(lesson, index) {
    state.current = index;

    var lessonModal = document.getElementById('fin-learn-modal');
    if (!lessonModal) return;

    var titleEl  = document.getElementById('fin-learn-modal-label');
    var iframe   = document.getElementById('fin-learn-iframe');
    var extLink  = document.getElementById('fin-learn-modal-ext');

    /* بناء URL الصفحة الحقيقية على GitHub Pages */
    var fullUrl = lesson.url || (LESSONS_BASE_URL + lesson.githubPath);

    /* عنوان المودال */
    if (titleEl)
      titleEl.textContent = lesson.title + (lesson.titleEn ? ' — ' + lesson.titleEn : '');

    /* رابط خارجي */
    if (extLink) extLink.href = fullUrl;

    /* ── تحميل الصفحة داخل iframe مباشرة ── */
    if (iframe) {
      /* سبينر مؤقت */
      var spinner = document.getElementById('ba-iframe-spinner');
      if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'ba-iframe-spinner';
        spinner.className = 'ba-spinner';
        spinner.innerHTML =
          '<div class="ba-spinner-ring"></div>' +
          '<span class="ba-spinner-text">جاري تحميل الدرس...</span>';
        iframe.parentNode.insertBefore(spinner, iframe);
      }
      spinner.style.display = 'flex';
      iframe.style.display  = 'none';
      iframe.src = '';

      /* ─── iframe.src مباشرة — GitHub Pages — صفحة HTML حقيقية ─── */
      iframe.src = fullUrl;

      iframe.onload = function () {
        var sp = document.getElementById('ba-iframe-spinner');
        if (sp) sp.style.display = 'none';
        iframe.style.display = 'block';
        /* تحديد تلقائي كمكتمل عند الفتح لمدة كافية */
        clearTimeout(iframe._doneTimer);
        iframe._doneTimer = setTimeout(function () {
          if (document.getElementById('fin-learn-modal') &&
              document.getElementById('fin-learn-modal').classList.contains('open')) {
            markDone(lesson.id);
            syncCompleteBtn(lesson);
            updateStats();
          }
        }, 30000);
      };

      iframe.onerror = function () {
        var sp = document.getElementById('ba-iframe-spinner');
        if (sp) {
          sp.innerHTML =
            '<i class="fas fa-exclamation-triangle" style="font-size:2rem;color:#ef4444"></i>' +
            '<span class="ba-spinner-text" style="color:#ef4444">تعذّر تحميل الدرس. تحقق من الاتصال.</span>';
        }
      };
    }

    /* فتح المودال */
    lessonModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    updateNavBtns();
    syncCompleteBtn(lesson);
  }

  /* ══════════════════════════════════════════════════════
     إغلاق المودال
  ══════════════════════════════════════════════════════ */
  function closeLessonModal() {
    var lessonModal = document.getElementById('fin-learn-modal');
    if (!lessonModal) return;

    lessonModal.classList.remove('open');
    document.body.style.overflow = '';

    var iframe = document.getElementById('fin-learn-iframe');
    if (iframe) {
      clearTimeout(iframe._doneTimer);
      iframe.src = '';
      iframe.style.display = 'none';
    }
    var sp = document.getElementById('ba-iframe-spinner');
    if (sp) sp.style.display = 'none';
  }

  /* ══════════════════════════════════════════════════════
     التنقل بين الدروس
  ══════════════════════════════════════════════════════ */
  function navigatePrev() {
    if (state.current > 0)
      openLessonModal(state.filtered[state.current - 1], state.current - 1);
  }

  function navigateNext() {
    if (state.current < state.filtered.length - 1)
      openLessonModal(state.filtered[state.current + 1], state.current + 1);
  }

  /* ══════════════════════════════════════════════════════
     تحديث الإحصائيات في الصفحة
  ══════════════════════════════════════════════════════ */
  function updateStats() {
    var wrapper = document.getElementById('fin-learn-section') ||
                  (document.getElementById('fin-learn-grid') &&
                   document.getElementById('fin-learn-grid').parentElement);
    if (wrapper) renderStats(wrapper);
  }

  /* ══════════════════════════════════════════════════════
     ربط أحداث المودال
  ══════════════════════════════════════════════════════ */
  function initLessonsViewer() {
    var lessonModal = document.getElementById('fin-learn-modal');
    if (!lessonModal) return;

    /* إغلاق بالنقر خارج */
    lessonModal.addEventListener('click', function (e) {
      if (e.target === lessonModal) closeLessonModal();
    });

    /* زر الإغلاق */
    var closeBtn = document.getElementById('fin-learn-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeLessonModal);

    /* التنقل */
    var prevBtn = document.getElementById('lesson-prev-btn');
    var nextBtn = document.getElementById('lesson-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', navigatePrev);
    if (nextBtn) nextBtn.addEventListener('click', navigateNext);

    /* زر تحديد كمكتمل */
    var completeBtn = document.getElementById('fin-learn-complete-btn');
    if (completeBtn) {
      completeBtn.addEventListener('click', function () {
        var lesson = state.filtered[state.current];
        if (!lesson) return;
        markDone(lesson.id);
        syncCompleteBtn(lesson);
        updateStats();
        /* تحديث بصري في الشبكة */
        var card = document.querySelector('[data-lesson-id="' + lesson.id + '"]');
        if (card) {
          card.classList.add('ba-completed');
          var t = card.querySelector('.fin-learn-title');
          if (t) t.style.textDecoration = 'line-through';
          if (!card.querySelector('.ba-done-badge')) {
            var badge = document.createElement('span');
            badge.className = 'ba-done-badge';
            badge.innerHTML = '<i class="fas fa-check"></i>';
            card.insertBefore(badge, card.firstChild);
          }
        }
      });
    }

    /* Swipe على الموبايل */
    var touchStartX = 0;
    lessonModal.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lessonModal.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) navigateNext();
        else          navigatePrev();
      }
    }, { passive: true });

    /* لوحة المفاتيح */
    document.addEventListener('keydown', function (e) {
      if (!lessonModal.classList.contains('open')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp')    navigatePrev();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown')   navigateNext();
      /* Esc تُعالَج في blogarch.js عبر window.BlogArch.closeLesson */
    });
  }

  /* ══════════════════════════════════════════════════════
     تهيئة الشبكة الرئيسية
  ══════════════════════════════════════════════════════ */
  function initLessonsGrid() {
    var grid = document.getElementById('fin-learn-grid');
    if (!grid) return;

    var wrapper = grid.parentElement;

    function boot(lessons) {
      state.all      = Array.isArray(lessons) ? lessons : (lessons.lessons || []);
      state.filtered = state.all.slice();

      loadStorage();
      ensureStyles();

      if (wrapper) {
        buildToolbar(wrapper);
        renderStats(wrapper);
      }
      renderGrid(grid);
    }

    /* استخدم البيانات المحلية إن وُجدت */
    if (window.lessonsData && window.lessonsData.length) {
      boot(window.lessonsData);
    } else {
      /* جلب lessons.json من CDN */
      fetch(CDN_BASE + '/data/lessons.json')
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(function (data) { boot(data); })
        .catch(function () {
          grid.innerHTML =
            '<p style="text-align:center;padding:2.5rem;color:var(--muted)">' +
            'تعذّر تحميل الدروس. تحقق من اتصالك بالإنترنت.</p>';
        });
    }
  }

  /* ══════════════════════════════════════════════════════
     التهيئة عند جاهزية DOM
  ══════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initLessonsViewer();
    initLessonsGrid();
  });

  /* ══════════════════════════════════════════════════════
     واجهة عامة — تُوسِّع window.BlogArch
  ══════════════════════════════════════════════════════ */
  window.BlogArch = window.BlogArch || {};
  window.BlogArch.openLesson         = openLessonModal;
  window.BlogArch.closeLesson        = closeLessonModal;
  window.BlogArch.navigatePrevLesson = navigatePrev;
  window.BlogArch.navigateNextLesson = navigateNext;
  window.BlogArch.LESSONS_BASE_URL   = LESSONS_BASE_URL;

})();