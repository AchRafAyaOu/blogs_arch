/* ══════════════════════════════════════════════════════════
   BlogArch Learn — script.js  v2
   يعتمد على:  lessons-data.js  (LESSONS_DATA, LESSONS_BASE_URL)
               style.css        (عبر #ba-learn-root)
               learn.html       (البنية والـ IDs)
══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══ State ══ */
  const state = {
    currentFilter : 'all',
    currentSort   : 'default',
    viewMode      : 'grid',
    searchQuery   : '',
    completed     : _load('ba_completed', []),
    currentIndex  : 0,
    context       : [],   /* الدروس المعروضة حالياً بعد الفلترة */
  };

  /* ══ Helpers ══ */
  const $  = id  => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);
  const _load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
  const _save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  /* ══ Boot ══ */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupSearch();
    setupFilters();
    setupSort();
    setupViewToggle();
    setupModal();
    setupKeyboard();
    setupTags();
    filterAndRender();
    updateStats();
  }

  /* ════════════════════════════════════════
     SEARCH
  ════════════════════════════════════════ */
  function setupSearch() {
    const input = $('lessonSearch');
    if (!input) return;
    input.addEventListener('input', () => {
      state.searchQuery = input.value.trim();
      filterAndRender();
    });
    $('clearSearch')?.addEventListener('click', () => {
      input.value = ''; state.searchQuery = '';
      filterAndRender(); input.focus();
    });
  }

  /* ════════════════════════════════════════
     QUICK TAGS
  ════════════════════════════════════════ */
  function setupTags() {
    $$('.ba-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const input = $('lessonSearch');
        if (!input) return;
        const val = tag.dataset.search || '';
        input.value = (input.value === val) ? '' : val;
        state.searchQuery = input.value;
        filterAndRender();
      });
    });
  }

  /* ════════════════════════════════════════
     LEVEL FILTERS
  ════════════════════════════════════════ */
  function setupFilters() {
    /* يعمل مع ba-filter-pill (أُضيف إليها class filter-pill في HTML) */
    $$('#levelFilters .ba-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#levelFilters .ba-filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentFilter = btn.dataset.level;
        filterAndRender();
      });
    });
  }

  /* ════════════════════════════════════════
     SORT
  ════════════════════════════════════════ */
  function setupSort() {
    $('sortSelect')?.addEventListener('change', e => {
      state.currentSort = e.target.value;
      filterAndRender();
    });
  }

  /* ════════════════════════════════════════
     VIEW TOGGLE  (grid / list)
  ════════════════════════════════════════ */
  function setupViewToggle() {
    $$('.ba-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.ba-view-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        state.viewMode = btn.dataset.view;
        const grid = $('lessonsGrid');
        if (grid) grid.classList.toggle('list-view', state.viewMode === 'list');
      });
    });
  }

  /* ════════════════════════════════════════
     FILTER + RENDER
  ════════════════════════════════════════ */
  function filterAndRender() {
    let list = LESSONS_DATA.slice();

    if (state.currentFilter !== 'all') {
      list = list.filter(l => l.level === state.currentFilter);
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.titleEn.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    }

    const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    switch (state.currentSort) {
      case 'name':      list.sort((a, b) => a.title.localeCompare(b.title, 'ar')); break;
      case 'level':     list.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]); break;
      case 'completed': list.sort((a, b) =>
        (state.completed.includes(a.id) ? 0 : 1) - (state.completed.includes(b.id) ? 0 : 1)); break;
    }

    state.context = list;
    renderLessons(list);
    updateStats();
  }

  /* ════════════════════════════════════════
     RENDER LESSONS
  ════════════════════════════════════════ */
  function renderLessons(lessons) {
    const grid  = $('lessonsGrid');
    const empty = $('emptyState');
    if (!grid) return;

    if (lessons.length === 0) {
      grid.style.display = 'none';
      if (empty) empty.style.display = '';
      return;
    }
    grid.style.display = '';
    if (empty) empty.style.display = 'none';

    const lvTxt = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

    grid.innerHTML = lessons.map((lesson, idx) => {
      const isDone = state.completed.includes(lesson.id);
      return `
        <article
          class="lesson-card${isDone ? ' completed' : ''}"
          data-idx="${idx}"
          style="animation-delay:${Math.min(idx * 46, 500)}ms"
          role="button" tabindex="0"
          aria-label="فتح درس ${lesson.title}">

          <div class="card-header">
            <div class="lesson-icon"><i class="${lesson.icon}"></i></div>
          </div>

          <div class="lesson-content">
            <h3 class="lesson-title">${lesson.title}</h3>
            <p class="lesson-title-en">${lesson.titleEn}</p>
            <p class="lesson-description">${lesson.description}</p>
          </div>

          <div class="lesson-meta">
            <span class="level-badge ${lesson.level}">
              <span class="pill-dot ${lesson.level}"></span>
              ${lvTxt[lesson.level]}
            </span>
            <span class="lesson-action">
              ابدأ الدرس <i class="fas fa-arrow-left"></i>
            </span>
          </div>
        </article>`;
    }).join('');

    /* Apply current view */
    grid.classList.toggle('list-view', state.viewMode === 'list');

    /* Card events */
    grid.querySelectorAll('.lesson-card').forEach(card => {
      card.addEventListener('click', () => openLesson(+card.dataset.idx));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLesson(+card.dataset.idx); }
      });
    });

    /* Intersection stagger */
    _stagger(grid);
  }

  function _stagger(grid) {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.animationPlayState = 'running'; io.unobserve(e.target); }
      });
    }, { threshold: 0.05 });
    grid.querySelectorAll('.lesson-card').forEach(c => {
      c.style.animationPlayState = 'paused'; io.observe(c);
    });
  }

  /* ════════════════════════════════════════
     STATS
  ════════════════════════════════════════ */
  function updateStats() {
    const total = LESSONS_DATA.length;
    const done  = state.completed.length;
    const pct   = total ? Math.round(done / total * 100) : 0;

    /* عناصر مخفية للـ HTML */
    const el = id => $(id);
    if (el('totalLessons'))     el('totalLessons').textContent     = total;
    if (el('completedLessons')) el('completedLessons').textContent = done;
    if (el('progressPct'))      el('progressPct').textContent      = pct + '%';
  }

  /* ════════════════════════════════════════
     MODAL
  ════════════════════════════════════════ */
  function setupModal() {
    $('closeModal')?.addEventListener('click', closeModal);
    $('prevLesson')?.addEventListener('click', () => navigate(-1));
    $('nextLesson')?.addEventListener('click', () => navigate(1));
    $('markCompleteBtn')?.addEventListener('click', markComplete);
    $('fullscreenBtn')?.addEventListener('click', toggleFullscreen);
    $('fontSizeBtn')?.addEventListener('click', cycleFontSize);
    $('readingModeBtn')?.addEventListener('click', toggleReadingMode);
    $('resetFiltersBtn')?.addEventListener('click', resetFilters);

    /* إغلاق عند النقر على الـ backdrop فقط (لا الـ container) */
    const backdrop = document.querySelector('#lessonModal .modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', closeModal);
    }
    const container = document.querySelector('#lessonModal .modal-container');
    if (container) {
      container.addEventListener('click', e => e.stopPropagation());
    }
  }

  /* ── openLesson ──
     index: موضع الدرس في state.context
     يُحرِّك الـ modal ليظهر بالقرب من البطاقة المضغوطة
  ── */
  function openLesson(index) {
    if (index < 0 || index >= state.context.length) return;
    state.currentIndex = index;
    const lesson = state.context[index];

    $('modalTitle').textContent    = lesson.title;
    $('modalSubtitle').textContent = lesson.titleEn;
    $('currentIndex').textContent  = index + 1;
    $('totalIndex').textContent    = state.context.length;

    _updateCompleteBtn(lesson.id);
    _updateNavBtns();

    /* ── تموضع الـ modal بجانب البطاقة المضغوطة ── */
    _positionModal(index);

    /* فتح المودال */
    const modal = $('lessonModal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    /* تحميل iframe */
    const loader = $('iframeLoader');
    const iframe = $('lessonIframe');
    loader.classList.remove('hidden');
    iframe.src = '';
    requestAnimationFrame(() => {
      setTimeout(() => { iframe.src = LESSONS_BASE_URL + lesson.githubPath; }, 40);
    });
    iframe.onload  = () => loader.classList.add('hidden');
    iframe.onerror = () => {
      loader.innerHTML = `<div style="text-align:center;padding:24px;color:#ef4444">
        <i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:10px;display:block"></i>
        <p style="font-weight:700">⚠ فشل تحميل الدرس</p>
        <p style="font-size:.85rem;opacity:.7;margin-top:6px">تحقق من اتصالك بالإنترنت</p>
      </div>`;
    };
  }

  /* تموضع ذكي للـ modal بالقرب من البطاقة المضغوطة */
  function _positionModal(idx) {
    const cards = document.querySelectorAll('#lessonsGrid .lesson-card');
    const card  = cards[idx];
    const modal = document.querySelector('#lessonModal .modal-container');
    if (!card || !modal) return;

    /* إعادة تعيين */
    modal.style.marginTop    = '';
    modal.style.marginBottom = '';
    modal.style.alignSelf    = '';

    const rect  = card.getBoundingClientRect();
    const vpH   = window.innerHeight;
    const mH    = modal.getBoundingClientRect().height || vpH * 0.88;

    /* نسبة موضع البطاقة من أعلى الشاشة */
    const cardMidY  = rect.top + rect.height / 2;
    const relPos    = cardMidY / vpH; /* 0=أعلى، 1=أسفل */

    if (relPos < 0.35) {
      /* البطاقة في أعلى الشاشة → Modal يبدأ من الأعلى */
      modal.style.alignSelf = 'flex-start';
      modal.style.marginTop = `${Math.max(rect.bottom + 8, 16)}px`;
    } else if (relPos > 0.65) {
      /* البطاقة في أسفل الشاشة → Modal يُرفع للأعلى */
      modal.style.alignSelf    = 'flex-end';
      modal.style.marginBottom = `${Math.max(vpH - rect.top + 8, 16)}px`;
    }
    /* في المنتصف → modal في المنتصف (الافتراضي) */
  }

  function closeModal() {
    const modal = $('lessonModal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    $('lessonIframe').src = '';
    document.body.classList.remove('reading-mode');
    /* إعادة تعيين تموضع الـ modal */
    const container = document.querySelector('#lessonModal .modal-container');
    if (container) {
      container.style.marginTop    = '';
      container.style.marginBottom = '';
      container.style.alignSelf    = '';
    }
    fontSizeLevel = 0;
    applyFontSize();
  }

  function navigate(dir) {
    const next = state.currentIndex + dir;
    if (next >= 0 && next < state.context.length) openLesson(next);
  }

  function _updateNavBtns() {
    const prev = $('prevLesson');
    const next = $('nextLesson');
    if (prev) prev.disabled = state.currentIndex === 0;
    if (next) next.disabled = state.currentIndex === state.context.length - 1;
  }

  function _updateCompleteBtn(id) {
    const isDone = state.completed.includes(id);
    const btn    = $('markCompleteBtn');
    if (!btn) return;
    btn.classList.toggle('completed', isDone);
    btn.innerHTML = isDone
      ? '<i class="fas fa-check"></i><span>تم الإكمال ✓</span>'
      : '<i class="fas fa-check-circle"></i><span>تحديد كمكتمل</span>';
  }

  function markComplete() {
    const lesson = state.context[state.currentIndex];
    if (!lesson || state.completed.includes(lesson.id)) return;
    state.completed.push(lesson.id);
    _save('ba_completed', state.completed);
    _updateCompleteBtn(lesson.id);
    showToast('🎉 أحسنت! تم حفظ تقدمك', 'success');
    filterAndRender();
    /* تحديث حالة البطاقة في الخلفية */
    document.querySelectorAll(`#lessonsGrid .lesson-card[data-idx="${state.currentIndex}"]`)
      .forEach(c => c.classList.add('completed'));
  }

  /* ════════════════════════════════════════
     FULLSCREEN
  ════════════════════════════════════════ */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      $('fullscreenBtn').innerHTML = '<i class="fas fa-compress"></i>';
    } else {
      document.exitFullscreen().catch(() => {});
      $('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
    }
  }
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement)
      $('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
  });

  /* ════════════════════════════════════════
     FONT SIZE
  ════════════════════════════════════════ */
  let fontSizeLevel = 0;
  const fontSizes = ['16px', '19px', '22px', '14px'];
  function cycleFontSize() {
    fontSizeLevel = (fontSizeLevel + 1) % fontSizes.length;
    applyFontSize();
    showToast('حجم الخط: ' + fontSizes[fontSizeLevel], 'info');
  }
  function applyFontSize() {
    try {
      const iframe = $('lessonIframe');
      if (iframe?.contentDocument?.body)
        iframe.contentDocument.body.style.fontSize = fontSizes[fontSizeLevel];
    } catch { /* cross-origin */ }
  }

  /* ════════════════════════════════════════
     READING MODE
  ════════════════════════════════════════ */
  function toggleReadingMode() {
    document.body.classList.toggle('reading-mode');
    const active = document.body.classList.contains('reading-mode');
    showToast(active ? '📖 وضع القراءة المركّز' : 'العودة للوضع العادي', 'info');
  }

  /* ════════════════════════════════════════
     KEYBOARD
  ════════════════════════════════════════ */
  function setupKeyboard() {
    document.addEventListener('keydown', e => {
      const open    = $('lessonModal')?.classList.contains('active');
      const isInput = ['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName);

      if (open) {
        if (e.key === 'Escape')     closeModal();
        if (e.key === 'ArrowRight') navigate(-1);
        if (e.key === 'ArrowLeft')  navigate(1);
        if (e.key === 'f')          toggleFullscreen();
        return;
      }
      if (isInput) return;
      if (e.key === 's' || e.key === 'ش') { e.preventDefault(); $('lessonSearch')?.focus(); }
    });
  }

  /* ════════════════════════════════════════
     RESET FILTERS
  ════════════════════════════════════════ */
  function resetFilters() {
    state.currentFilter = 'all';
    state.searchQuery   = '';
    state.currentSort   = 'default';

    $$('#levelFilters .ba-filter-pill').forEach((b, i) => b.classList.toggle('active', i === 0));
    const input = $('lessonSearch');
    if (input) input.value = '';
    const sort = $('sortSelect');
    if (sort) sort.value = 'default';

    filterAndRender();
  }
  window.resetFilters = resetFilters;

  /* ════════════════════════════════════════
     TOAST
  ════════════════════════════════════════ */
  function showToast(msg, type = 'info') {
    const container = $('toastContainer');
    if (!container) return;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity .36s, transform .36s';
      toast.style.opacity    = '0';
      toast.style.transform  = 'translateX(-16px)';
      setTimeout(() => toast.remove(), 380);
    }, 3200);
  }

})();
