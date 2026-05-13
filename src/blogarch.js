/* ═══════════════════════════════════════════════════════════════
   BlogArch — Lessons Module  v2.1  (blogarch.lessons.js)

   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     الثوابت
  ───────────────────────────────────────────────────────────── */
  const LESSONS_BASE_URL = 'https://achrafayaou.github.io/english-lessons/lessons/';
  const CDN_BASE = window.BlogArch?.CDN_BASE
    || 'https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main';

  const STORAGE_FAV  = 'ba_fav';
  const STORAGE_DONE = 'ba_done';
  const STORAGE_VIEW = 'ba_view';
  const AUTO_DONE_MS = 30000; /* مدة الانتظار قبل التحديد التلقائي كمكتمل */

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────────────────────
     الحالة الداخلية
  ───────────────────────────────────────────────────────────── */
  const state = {
    all:       [],
    filtered:  [],
    current:   0,
    filter:    'all',
    view:      localStorage.getItem(STORAGE_VIEW) || 'grid',
    favorites: [],
    completed: [],
  };


  /* ═══════════════════════════════════════════════════════════
     localStorage Helpers
  ═══════════════════════════════════════════════════════════ */
  function _loadStorage() {
    try {
      state.favorites = JSON.parse(localStorage.getItem(STORAGE_FAV)  || '[]');
      state.completed = JSON.parse(localStorage.getItem(STORAGE_DONE) || '[]');
    } catch (_) {
      state.favorites = [];
      state.completed = [];
    }
  }

  function _saveStorage() {
    try {
      localStorage.setItem(STORAGE_FAV,  JSON.stringify(state.favorites));
      localStorage.setItem(STORAGE_DONE, JSON.stringify(state.completed));
    } catch (_) {}
  }

  const isFav  = id => state.favorites.includes(id);
  const isDone = id => state.completed.includes(id);

  function _toggleFav(id) {
    const idx = state.favorites.indexOf(id);
    if (idx > -1) state.favorites.splice(idx, 1);
    else          state.favorites.push(id);
    _saveStorage();
  }

  function _markDone(id) {
    if (!isDone(id)) {
      state.completed.push(id);
      _saveStorage();
    }
  }


  /* ═══════════════════════════════════════════════════════════
     CSS الداخلي — يُضاف مرة واحدة فقط
  ═══════════════════════════════════════════════════════════ */
  function _ensureStyles() {
    if (document.getElementById('ba-lessons-style')) return;

    const s = document.createElement('style');
    s.id = 'ba-lessons-style';
    s.textContent = `
      /* Spinner */
      @keyframes ba-spin { to { transform: rotate(360deg); } }

      .ba-spinner {
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        height: 100%; gap: 1rem; padding: 2rem;
      }
      .ba-spinner-ring {
        width: 48px; height: 48px;
        border: 4px solid var(--border, #e2e8f0);
        border-top-color: var(--primary-color, #4361ee);
        border-radius: 50%;
        animation: ba-spin .8s linear infinite;
      }
      .ba-spinner-text {
        color: var(--muted, #94a3b8);
        font-size: .9rem;
        font-family: var(--font-ui);
      }
      .ba-spinner-error .ba-spinner-ring {
        border-top-color: #ef4444;
        animation: none;
        border-color: #ef4444;
      }

      /* بطاقة الدرس */
      .fin-learn-card { position: relative; cursor: pointer; }

      /* شارة المكتمل */
      .ba-done-badge {
        position: absolute; top: .55rem; left: .55rem;
        background: var(--accent, #059669); color: var(--accent-fg, #fff);
        border-radius: 50%; width: 22px; height: 22px;
        display: flex; align-items: center; justify-content: center;
        font-size: .7rem; z-index: 2;
        box-shadow: 0 2px 6px rgba(5,150,105,.3);
      }

      /* زر المفضلة */
      .ba-fav-btn {
        position: absolute; top: .5rem; right: .5rem;
        background: transparent; border: none; cursor: pointer;
        color: var(--muted, #94a3b8); font-size: 1rem;
        transition: color .2s, transform .2s; z-index: 2; padding: .3rem;
        border-radius: 50%;
      }
      .ba-fav-btn:hover  { transform: scale(1.25); }
      .ba-fav-btn:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
      .ba-fav-btn.active { color: #ef4444; }

      /* شريط الإحصائيات */
      .ba-stats-bar {
        display: flex; gap: .75rem; align-items: center;
        margin-bottom: 1rem; flex-wrap: wrap;
      }
      .ba-stat {
        font-size: .85rem; color: var(--muted);
        display: flex; align-items: center; gap: .35rem;
      }
      .ba-stat strong { color: var(--primary-color); }

      /* شريط التقدم */
      .ba-progress-wrap {
        margin-bottom: 1.25rem;
        display: flex; flex-direction: column; gap: .3rem;
      }
      .ba-progress-label {
        font-size: .8rem; color: var(--muted);
        display: flex; justify-content: space-between;
      }
      .ba-progress-track {
        height: 6px; border-radius: 99px;
        background: var(--border); overflow: hidden;
      }
      .ba-progress-fill {
        height: 100%; border-radius: 99px;
        background: linear-gradient(to left, var(--accent), var(--primary-color));
        transition: width .5s ease;
      }

      /* View toggle */
      .ba-view-btn {
        background: transparent; border: 1px solid var(--border);
        border-radius: var(--radius-xs, 6px); padding: .35rem .6rem;
        cursor: pointer; color: var(--muted); transition: all .2s;
      }
      .ba-view-btn:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
      .ba-view-btn.active {
        background: var(--primary-light);
        color: var(--primary-color); border-color: var(--primary-color);
      }

      /* List view */
      #fin-learn-grid.ba-list-view { grid-template-columns: 1fr !important; }
      #fin-learn-grid.ba-list-view .fin-learn-card { display: flex; align-items: center; gap: 1rem; }
      #fin-learn-grid.ba-list-view .fin-learn-icon  { flex-shrink: 0; width: 52px; height: 52px; }
      #fin-learn-grid.ba-list-view .fin-learn-sub   { display: none; }

      /* شريط التحكم */
      .ba-toolbar {
        display: flex; gap: .5rem; align-items: center;
        flex-wrap: wrap; margin-bottom: 1.25rem;
      }
      .ba-toolbar-spacer { flex: 1; }

      /* تأثير الدرس المكتمل */
      .fin-learn-card.ba-completed { opacity: .75; }
      .fin-learn-card.ba-completed .fin-learn-title {
        text-decoration: line-through;
        text-decoration-color: var(--accent);
      }

      /* مؤشر الترقيم في المودال */
      #fin-learn-counter {
        font-size: .85rem; color: var(--muted); font-variant-numeric: tabular-nums;
      }

      /* زر الإكمال */
      #fin-learn-complete-btn.active {
        background: var(--accent);
        color: var(--accent-fg);
        border-color: var(--accent);
      }
    `;
    document.head.appendChild(s);
  }


  /* ═══════════════════════════════════════════════════════════
     شريط الإحصائيات
  ═══════════════════════════════════════════════════════════ */
  function _renderStats(container) {
    container.querySelector('.ba-stats-bar')?.remove();

    const bar = document.createElement('div');
    bar.className   = 'ba-stats-bar';
    bar.setAttribute('aria-live', 'polite');
    bar.innerHTML =
      `<span class="ba-stat">
         <i class="fas fa-book-open" aria-hidden="true"></i>
         الدروس: <strong>${state.all.length}</strong>
       </span>
       <span class="ba-stat">
         <i class="fas fa-check-circle" style="color:var(--accent)" aria-hidden="true"></i>
         مكتملة: <strong>${state.completed.length}</strong>
       </span>
       <span class="ba-stat">
         <i class="fas fa-heart" style="color:#ef4444" aria-hidden="true"></i>
         مفضلة: <strong>${state.favorites.length}</strong>
       </span>`;
    container.insertBefore(bar, container.firstChild);
  }

  /* ─ شريط التقدم ─ */
  function _renderProgress(container) {
    container.querySelector('.ba-progress-wrap')?.remove();
    if (!state.all.length) return;

    const pct  = Math.round((state.completed.length / state.all.length) * 100);
    const wrap  = document.createElement('div');
    wrap.className = 'ba-progress-wrap';
    wrap.innerHTML =
      `<div class="ba-progress-label">
         <span class="arabic-text">تقدّمك</span>
         <span aria-live="polite">${state.completed.length} من ${state.all.length} (${pct}%)</span>
       </div>
       <div class="ba-progress-track" role="progressbar"
            aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
         <div class="ba-progress-fill" style="width:${pct}%"></div>
       </div>`;
    container.insertBefore(wrap, container.firstChild);
  }


  /* ═══════════════════════════════════════════════════════════
     شريط التحكم (فلتر + view toggle)
  ═══════════════════════════════════════════════════════════ */
  function _buildToolbar(container, grid) {
    if (container.querySelector('.ba-toolbar')) return;

    const toolbar = document.createElement('div');
    toolbar.className   = 'ba-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'فلترة الدروس');

    /* أزرار الفلتر */
    const filters = [
      { key: 'all', label: 'الكل' },
      { key: 'beg', label: 'مبتدئ' },
      { key: 'mid', label: 'متوسط' },
      { key: 'adv', label: 'متقدم' },
    ];

    filters.forEach(f => {
      const btn = document.createElement('button');
      btn.className   = `pill${f.key === state.filter ? ' active' : ''}`;
      btn.textContent = f.label;
      btn.dataset.filter = f.key;
      btn.setAttribute('aria-pressed', f.key === state.filter ? 'true' : 'false');
      btn.setAttribute('type', 'button');

      btn.addEventListener('click', () => {
        state.filter = f.key;
        toolbar.querySelectorAll('[data-filter]').forEach(b => {
          b.classList.toggle('active', b.dataset.filter === f.key);
          b.setAttribute('aria-pressed', b.dataset.filter === f.key ? 'true' : 'false');
        });
        _renderGrid(grid);
      });
      toolbar.appendChild(btn);
    });

    /* مسافة */
    const spacer = document.createElement('span');
    spacer.className = 'ba-toolbar-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    toolbar.appendChild(spacer);

    /* أزرار العرض */
    const viewGrid = document.createElement('button');
    viewGrid.type      = 'button';
    viewGrid.className = `ba-view-btn${state.view === 'grid' ? ' active' : ''}`;
    viewGrid.innerHTML = '<i class="fas fa-th-large" aria-hidden="true"></i>';
    viewGrid.title     = 'عرض شبكي';
    viewGrid.setAttribute('aria-label', 'عرض شبكي');

    const viewList = document.createElement('button');
    viewList.type      = 'button';
    viewList.className = `ba-view-btn${state.view === 'list' ? ' active' : ''}`;
    viewList.innerHTML = '<i class="fas fa-list" aria-hidden="true"></i>';
    viewList.title     = 'عرض قائمة';
    viewList.setAttribute('aria-label', 'عرض قائمة');

    viewGrid.addEventListener('click', () => {
      state.view = 'grid';
      localStorage.setItem(STORAGE_VIEW, 'grid');
      viewGrid.classList.add('active');
      viewList.classList.remove('active');
      grid.classList.remove('ba-list-view');
    });

    viewList.addEventListener('click', () => {
      state.view = 'list';
      localStorage.setItem(STORAGE_VIEW, 'list');
      viewList.classList.add('active');
      viewGrid.classList.remove('active');
      grid.classList.add('ba-list-view');
    });

    toolbar.appendChild(viewGrid);
    toolbar.appendChild(viewList);
    container.insertBefore(toolbar, container.firstChild);
  }


  /* ═══════════════════════════════════════════════════════════
     عرض الشبكة
  ═══════════════════════════════════════════════════════════ */
  const LEVEL_CLASS = { beg: 'beg', mid: 'mid', adv: 'adv' };
  const LEVEL_LABEL = { beg: 'مبتدئ', mid: 'متوسط', adv: 'متقدم' };

  function _renderGrid(grid) {
    if (!grid) return;

    state.filtered = state.filter === 'all'
      ? state.all.slice()
      : state.all.filter(l => l.level === state.filter);

    if (!state.filtered.length) {
      grid.innerHTML =
        `<p class="arabic-text" style="text-align:center;padding:2.5rem;color:var(--muted)"
            role="status">لا توجد دروس في هذا المستوى.</p>`;
      return;
    }

    grid.innerHTML = state.filtered.map((lesson, idx) => {
      const done  = isDone(lesson.id);
      const fav   = isFav(lesson.id);
      const lc    = LEVEL_CLASS[lesson.level] || 'beg';
      const ll    = lesson.levelLabel || LEVEL_LABEL[lesson.level] || '';
      const delay = prefersReducedMotion ? 0 : Math.min(idx * 70, 420);

      return `<div class="fin-learn-card fade-in-card${done ? ' ba-completed' : ''}"
                   data-lesson-id="${lesson.id}"
                   style="transition-delay:${delay}ms"
                   role="article"
                   aria-label="${lesson.title}${done ? ' — مكتمل' : ''}${fav ? ' — مفضّل' : ''}">

        ${done
          ? `<span class="ba-done-badge" aria-label="مكتمل"><i class="fas fa-check" aria-hidden="true"></i></span>`
          : ''}

        <button class="ba-fav-btn${fav ? ' active' : ''}"
                data-fav-id="${lesson.id}"
                type="button"
                aria-label="${fav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}"
                aria-pressed="${fav ? 'true' : 'false'}">
          <i class="${fav ? 'fas' : 'far'} fa-heart" aria-hidden="true"></i>
        </button>

        <span class="fin-learn-level ${lc}">${ll}</span>
        <div class="fin-learn-icon" aria-hidden="true">
          <i class="${lesson.icon || 'fas fa-book'}"></i>
        </div>
        <h3 class="fin-learn-title arabic-text">${lesson.title || ''}</h3>
        <p class="fin-learn-sub arabic-text">${lesson.description || lesson.sub || ''}</p>
        <span class="fin-learn-link arabic-text" aria-hidden="true">
          ابدأ الدرس <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </span>
      </div>`;
    }).join('');

    /* أحداث البطاقات */
    grid.querySelectorAll('[data-lesson-id]').forEach(card => {
      card.addEventListener('click', e => {
        /* زر المفضلة */
        const favBtn = e.target.closest('[data-fav-id]');
        if (favBtn) {
          e.stopPropagation();
          const id     = parseInt(favBtn.dataset.favId, 10);
          _toggleFav(id);
          const active = isFav(id);
          favBtn.classList.toggle('active', active);
          favBtn.setAttribute('aria-label',   active ? 'إزالة من المفضلة' : 'إضافة للمفضلة');
          favBtn.setAttribute('aria-pressed',  active ? 'true' : 'false');
          const icon = favBtn.querySelector('i');
          if (icon) icon.className = `${active ? 'fas' : 'far'} fa-heart`;
          _updateStatsAndProgress();
          return;
        }

        /* فتح الدرس */
        const id  = parseInt(card.dataset.lessonId, 10);
        const idx = state.filtered.findIndex(l => l.id === id);
        if (idx !== -1) _openLessonModal(state.filtered[idx], idx);
      });

      /* Enter/Space يفتحان الدرس */
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });

    /* IntersectionObserver للأنيميشن */
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
      grid.querySelectorAll('.fade-in-card').forEach(c => obs.observe(c));
    } else {
      grid.querySelectorAll('.fade-in-card').forEach(c => c.classList.add('is-visible'));
    }

    /* تطبيق وضع العرض الحالي */
    grid.classList.toggle('ba-list-view', state.view === 'list');
  }


  /* ═══════════════════════════════════════════════════════════
     تحديث الإحصائيات والتقدم
  ═══════════════════════════════════════════════════════════ */
  function _updateStatsAndProgress() {
    const wrapper = _getWrapper();
    if (!wrapper) return;
    _renderStats(wrapper);
    _renderProgress(wrapper);
  }

  function _getWrapper() {
    return document.getElementById('fin-learn-section') ||
           document.getElementById('fin-learn-grid')?.parentElement;
  }


  /* ═══════════════════════════════════════════════════════════
     أزرار التنقل في المودال
  ═══════════════════════════════════════════════════════════ */
  function _updateNavBtns() {
    const prevBtn = document.getElementById('lesson-prev-btn');
    const nextBtn = document.getElementById('lesson-next-btn');
    const counter = document.getElementById('fin-learn-counter');

    const atFirst = state.current === 0;
    const atLast  = state.current === state.filtered.length - 1;

    if (prevBtn) { prevBtn.disabled = atFirst; prevBtn.style.opacity = atFirst ? '0.35' : '1'; }
    if (nextBtn) { nextBtn.disabled = atLast;  nextBtn.style.opacity = atLast  ? '0.35' : '1'; }
    if (counter) counter.textContent = `${state.current + 1} / ${state.filtered.length}`;
  }


  /* ═══════════════════════════════════════════════════════════
     زر "تحديد كمكتمل"
  ═══════════════════════════════════════════════════════════ */
  function _syncCompleteBtn(lesson) {
    const btn = document.getElementById('fin-learn-complete-btn');
    if (!btn) return;
    const done = isDone(lesson.id);
    btn.classList.toggle('active', done);
    btn.setAttribute('aria-pressed', done ? 'true' : 'false');
    btn.innerHTML = done
      ? '<i class="fas fa-check" aria-hidden="true"></i> مكتمل'
      : '<i class="fas fa-check-circle" aria-hidden="true"></i> تحديد كمكتمل';
  }


  /* ═══════════════════════════════════════════════════════════
     فتح المودال — iframe مباشر
  ═══════════════════════════════════════════════════════════ */
  let _autoDoneTimer = null;

  function _openLessonModal(lesson, index) {
    state.current = index;

    const lessonModal = document.getElementById('fin-learn-modal');
    if (!lessonModal) return;

    const titleEl = document.getElementById('fin-learn-modal-label');
    const iframe  = document.getElementById('fin-learn-iframe');
    const extLink = document.getElementById('fin-learn-modal-ext');

    const fullUrl = lesson.url || (LESSONS_BASE_URL + lesson.githubPath);

    if (titleEl) titleEl.textContent = lesson.title + (lesson.titleEn ? ` — ${lesson.titleEn}` : '');
    if (extLink)  extLink.href = fullUrl;

    /* تحميل iframe */
    if (iframe) {
      let spinner = document.getElementById('ba-iframe-spinner');
      if (!spinner) {
        spinner = document.createElement('div');
        spinner.id        = 'ba-iframe-spinner';
        spinner.className = 'ba-spinner';
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-label', 'جاري تحميل الدرس');
        spinner.innerHTML =
          '<div class="ba-spinner-ring"></div>' +
          '<span class="ba-spinner-text arabic-text">جاري تحميل الدرس...</span>';
        iframe.parentNode.insertBefore(spinner, iframe);
      } else {
        spinner.className = 'ba-spinner';
        spinner.innerHTML =
          '<div class="ba-spinner-ring"></div>' +
          '<span class="ba-spinner-text arabic-text">جاري تحميل الدرس...</span>';
      }

      spinner.style.display = 'flex';
      iframe.style.display  = 'none';
      iframe.src = '';

      /* تأخير قصير ليتم reset الـ src قبل إعادة التعيين */
      requestAnimationFrame(() => {
        iframe.src = fullUrl;
      });

      iframe.onload = () => {
        document.getElementById('ba-iframe-spinner').style.display = 'none';
        iframe.style.display = 'block';
        iframe.focus();

        /* تحديد تلقائي كمكتمل بعد AUTO_DONE_MS */
        clearTimeout(_autoDoneTimer);
        _autoDoneTimer = setTimeout(() => {
          if (lessonModal.classList.contains('open')) {
            _markDone(lesson.id);
            _syncCompleteBtn(lesson);
            _updateStatsAndProgress();
            /* تحديث بصري في الشبكة */
            _markCardDone(lesson.id);
          }
        }, AUTO_DONE_MS);
      };

      iframe.onerror = () => {
        const sp = document.getElementById('ba-iframe-spinner');
        if (sp) {
          sp.className = 'ba-spinner ba-spinner-error';
          sp.setAttribute('role', 'alert');
          sp.innerHTML =
            '<div class="ba-spinner-ring"></div>' +
            '<span class="ba-spinner-text arabic-text" style="color:#ef4444">تعذّر تحميل الدرس. تحقق من الاتصال.</span>' +
            `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer"
                class="arabic-text" style="font-size:.9rem;color:var(--primary-color);margin-top:.5rem">
               افتح في نافذة جديدة <i class="fas fa-external-link-alt" aria-hidden="true"></i>
             </a>`;
        }
      };
    }

    lessonModal.classList.add('open');
    lessonModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    _updateNavBtns();
    _syncCompleteBtn(lesson);

    /* التركيز على زر الإغلاق */
    setTimeout(() => {
      document.getElementById('fin-learn-modal-close')?.focus();
    }, 50);
  }


  /* ═══════════════════════════════════════════════════════════
     إغلاق المودال
  ═══════════════════════════════════════════════════════════ */
  let _lastFocusBeforeLesson = null;

  function _closeLessonModal() {
    const lessonModal = document.getElementById('fin-learn-modal');
    if (!lessonModal) return;

    clearTimeout(_autoDoneTimer);
    lessonModal.classList.remove('open');
    lessonModal.setAttribute('hidden', '');
    document.body.style.overflow = '';

    const iframe = document.getElementById('fin-learn-iframe');
    if (iframe) { iframe.src = ''; iframe.style.display = 'none'; }

    const sp = document.getElementById('ba-iframe-spinner');
    if (sp) sp.style.display = 'none';

    _lastFocusBeforeLesson?.focus();
  }


  /* ═══════════════════════════════════════════════════════════
     التنقل بين الدروس
  ═══════════════════════════════════════════════════════════ */
  function _navigatePrev() {
    if (state.current > 0)
      _openLessonModal(state.filtered[state.current - 1], state.current - 1);
  }

  function _navigateNext() {
    if (state.current < state.filtered.length - 1)
      _openLessonModal(state.filtered[state.current + 1], state.current + 1);
  }


  /* ═══════════════════════════════════════════════════════════
     تحديث بصري للبطاقة كمكتملة
  ═══════════════════════════════════════════════════════════ */
  function _markCardDone(id) {
    const card = document.querySelector(`[data-lesson-id="${id}"]`);
    if (!card) return;
    card.classList.add('ba-completed');
    card.setAttribute('aria-label', (card.getAttribute('aria-label') || '') + ' — مكتمل');

    const title = card.querySelector('.fin-learn-title');
    if (title) title.style.textDecoration = 'line-through';

    if (!card.querySelector('.ba-done-badge')) {
      const badge = document.createElement('span');
      badge.className   = 'ba-done-badge';
      badge.setAttribute('aria-label', 'مكتمل');
      badge.innerHTML   = '<i class="fas fa-check" aria-hidden="true"></i>';
      card.insertBefore(badge, card.firstChild);
    }
  }


  /* ═══════════════════════════════════════════════════════════
     ربط أحداث المودال + Focus Trap + Swipe + Keyboard
  ═══════════════════════════════════════════════════════════ */
  function _initLessonsViewer() {
    const lessonModal = document.getElementById('fin-learn-modal');
    if (!lessonModal) return;

    /* إغلاق بالنقر خارج */
    lessonModal.addEventListener('click', e => {
      if (e.target === lessonModal) _closeLessonModal();
    });

    /* زر الإغلاق */
    document.getElementById('fin-learn-modal-close')?.addEventListener('click', _closeLessonModal);

    /* التنقل */
    document.getElementById('lesson-prev-btn')?.addEventListener('click', _navigatePrev);
    document.getElementById('lesson-next-btn')?.addEventListener('click', _navigateNext);

    /* زر "تحديد كمكتمل" */
    document.getElementById('fin-learn-complete-btn')?.addEventListener('click', () => {
      const lesson = state.filtered[state.current];
      if (!lesson) return;
      _markDone(lesson.id);
      _syncCompleteBtn(lesson);
      _updateStatsAndProgress();
      _markCardDone(lesson.id);
    });

    /* حصر التركيز (Focus Trap) */
    lessonModal.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || !lessonModal.classList.contains('open')) return;
      const focusable = [...lessonModal.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )].filter(el => !el.closest('[hidden]') && getComputedStyle(el).display !== 'none');
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* Swipe على الموبايل */
    let _tx = 0;
    lessonModal.addEventListener('touchstart', e => {
      _tx = e.changedTouches[0].screenX;
    }, { passive: true });
    lessonModal.addEventListener('touchend', e => {
      const diff = _tx - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { diff > 0 ? _navigateNext() : _navigatePrev(); }
    }, { passive: true });

    /* لوحة المفاتيح */
    document.addEventListener('keydown', e => {
      if (!lessonModal.classList.contains('open')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   _navigatePrev();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown')  _navigateNext();
      /* Esc تُعالَج في blogarch.v12.js عبر window.BlogArch.closeLesson */
    });
  }


  /* ═══════════════════════════════════════════════════════════
     تهيئة الشبكة الرئيسية
  ═══════════════════════════════════════════════════════════ */
  function _initLessonsGrid() {
    const grid = document.getElementById('fin-learn-grid');
    if (!grid) return;

    const wrapper = grid.parentElement;

    function _boot(data) {
      state.all      = Array.isArray(data) ? data : (data.lessons || []);
      state.filtered = state.all.slice();

      _loadStorage();
      _ensureStyles();

      if (wrapper) {
        _buildToolbar(wrapper, grid);
        _renderStats(wrapper);
        _renderProgress(wrapper);
      }

      _renderGrid(grid);
    }

    /* بيانات محلية إن وُجدت (window.lessonsData) */
    if (Array.isArray(window.lessonsData) && window.lessonsData.length) {
      _boot(window.lessonsData);
      return;
    }

    /* جلب lessons.json من CDN */
    grid.innerHTML =
      `<div class="ba-spinner" role="status" aria-label="جاري تحميل الدروس">
         <div class="ba-spinner-ring"></div>
         <span class="ba-spinner-text arabic-text">جاري تحميل الدروس...</span>
       </div>`;

    fetch(`${CDN_BASE}/data/lessons.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(_boot)
      .catch(err => {
        console.warn('[BlogArch Lessons] Failed to load:', err);
        grid.innerHTML =
          `<div style="text-align:center;padding:2.5rem" role="alert">
             <i class="fas fa-exclamation-circle" style="font-size:2rem;color:#ef4444" aria-hidden="true"></i>
             <p class="arabic-text" style="margin-top:.75rem;color:var(--muted)">
               تعذّر تحميل الدروس. تحقق من اتصالك بالإنترنت.
             </p>
             <button type="button" onclick="location.reload()"
                     class="pill arabic-text" style="margin-top:.75rem">
               <i class="fas fa-redo" aria-hidden="true"></i> إعادة المحاولة
             </button>
           </div>`;
      });
  }


  /* ═══════════════════════════════════════════════════════════
     التهيئة عند جاهزية DOM
  ═══════════════════════════════════════════════════════════ */
  function _init() {
    _initLessonsViewer();
    _initLessonsGrid();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }


  /* ═══════════════════════════════════════════════════════════
     PUBLIC API — تُوسِّع window.BlogArch
  ═══════════════════════════════════════════════════════════ */
  window.BlogArch = Object.assign(window.BlogArch || {}, {
    openLesson:          _openLessonModal,
    closeLesson:         _closeLessonModal,
    navigatePrevLesson:  _navigatePrev,
    navigateNextLesson:  _navigateNext,
    markLessonDone:      _markDone,
    LESSONS_BASE_URL,
    LESSONS_VERSION:     '2.1.0',
  });

})();