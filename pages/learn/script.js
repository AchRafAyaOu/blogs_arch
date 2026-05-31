(function () {
  'use strict';

  /* ── State ── */
  const state = {
    currentFilter: 'all',
    currentSort: 'default',
    viewMode: 'grid',
    searchQuery: '',
    favorites: JSON.parse(localStorage.getItem('ba_favorites') || '[]'),
    completed: JSON.parse(localStorage.getItem('ba_completed') || '[]'),
    currentSection: 'lessons',
    currentLessonIndex: 0,
    filteredLessons: [],
  };

  /* ── DOM references (lazy) ── */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupTopBar();
    setupFilters();
    setupSortSelect();
    setupViewToggle();
    setupModal();
    setupKeyboard();
    setupSearchTags();
    filterAndRender();
  }

  /* ════════ TOP BAR ════════ */
  function setupTopBar() {
    // Search inline
    const searchInput = $('lessonSearch');
    searchInput.addEventListener('input', () => {
      state.searchQuery = searchInput.value.trim();
      filterAndRender();
    });

    // Clear search
    $('clearSearch').addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      filterAndRender();
      searchInput.focus();
    });

    // Scroll shadow
    window.addEventListener('scroll', () => {
      const bar = $('topBar');
      if (bar) bar.style.boxShadow = window.scrollY > 10 ? 'var(--shadow-md)' : '';
    });
  }

  /* ════════ SEARCH TAGS ════════ */
  function setupSearchTags() {
    $$('#searchTags .tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const val = tag.dataset.search;
        const input = $('lessonSearch');
        if (input.value === val) {
          input.value = '';
          state.searchQuery = '';
        } else {
          input.value = val;
          state.searchQuery = val;
        }
        filterAndRender();
      });
    });
  }

  /* ════════ LEVEL FILTERS ════════ */
  function setupFilters() {
    $$('#levelFilters .filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#levelFilters .filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentFilter = btn.dataset.level;
        filterAndRender();
      });
    });
  }

  /* ════════ SORT ════════ */
  function setupSortSelect() {
    $('sortSelect').addEventListener('change', (e) => {
      state.currentSort = e.target.value;
      filterAndRender();
    });
  }

  /* ════════ VIEW TOGGLE ════════ */
  function setupViewToggle() {
    $$('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.viewMode = btn.dataset.view;
        const grid = $('lessonsGrid');
        if (grid) grid.classList.toggle('list-view', state.viewMode === 'list');
      });
    });
  }

  /* ════════ FILTER + RENDER ════════ */
  function filterAndRender() {
    let list = LESSONS_DATA.slice();

    // Level filter
    if (state.currentFilter !== 'all') {
      list = list.filter(l => l.level === state.currentFilter);
    }

    // Search
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.titleEn.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (state.currentSort) {
      case 'name':
        list.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        break;
      case 'level': {
        const order = { beginner: 0, intermediate: 1, advanced: 2 };
        list.sort((a, b) => order[a.level] - order[b.level]);
        break;
      }
      case 'completed':
        list.sort((a, b) => {
          const ac = state.completed.includes(a.id) ? 0 : 1;
          const bc = state.completed.includes(b.id) ? 0 : 1;
          return ac - bc;
        });
        break;
    }

    state.filteredLessons = list;
    renderLessons(list, 'lessonsGrid', 'emptyState');
  }

  /* ════════ RENDER LESSONS ════════ */
  function renderLessons(lessons, gridId, emptyId) {
    const grid  = $(gridId);
    const empty = $(emptyId);
    if (!grid) return;

    if (lessons.length === 0) {
      grid.style.display  = 'none';
      if (empty) empty.style.display = '';
      return;
    }

    grid.style.display  = 'grid';
    if (empty) empty.style.display = 'none';

    const levelText = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

    grid.innerHTML = lessons.map((lesson, idx) => {
      const isFav  = state.favorites.includes(lesson.id);
      const isDone = state.completed.includes(lesson.id);

      return `
        <article class="lesson-card ${isDone ? 'completed' : ''}"
                 data-idx="${idx}"
                 style="animation-delay:${idx * 0.048}s"
                 role="button"
                 tabindex="0"
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
              ${levelText[lesson.level]}
            </span>
            <span class="lesson-action">
              ابدأ الدرس <i class="fas fa-arrow-left"></i>
            </span>
          </div>
        </article>
      `;
    }).join('');

    // Apply current view mode
    grid.classList.toggle('list-view', state.viewMode === 'list');

    // Events
    grid.querySelectorAll('.lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        openLesson(parseInt(card.dataset.idx), lessons);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLesson(parseInt(card.dataset.idx), lessons);
        }
      });
    });
  }

  /* ════════ MODAL ════════ */
  function setupModal() {
    $('closeModal').addEventListener('click', closeModal);
    document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    $('prevLesson').addEventListener('click', () => navigate(-1));
    $('nextLesson').addEventListener('click', () => navigate(1));
    $('markCompleteBtn').addEventListener('click', markCurrentComplete);
    $('fullscreenBtn').addEventListener('click', toggleFullscreen);
    $('fontSizeBtn').addEventListener('click', cycleFontSize);
    $('readingModeBtn').addEventListener('click', toggleReadingMode);
    $('resetFiltersBtn')?.addEventListener('click', resetFilters);
  }

  let currentLessonsContext = [];

  function openLesson(index, lessonsCtx) {
    if (lessonsCtx) currentLessonsContext = lessonsCtx;
    state.currentLessonIndex = index;
    const lesson = currentLessonsContext[index];
    if (!lesson) return;

    $('modalTitle').textContent    = lesson.title;
    $('modalSubtitle').textContent = lesson.titleEn;
    $('currentIndex').textContent  = index + 1;
    $('totalIndex').textContent    = currentLessonsContext.length;

    updateCompleteBtn(lesson.id);
    updateNavBtns();

    const fullUrl = LESSONS_BASE_URL + lesson.githubPath;

    const modal = $('lessonModal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Load iframe
    const loader = $('iframeLoader');
    loader.classList.remove('hidden');
    const iframe = $('lessonIframe');
    iframe.src = '';
    setTimeout(() => {
      iframe.src = fullUrl;
    }, 50);

    iframe.onload = () => loader.classList.add('hidden');
    iframe.onerror = () => {
      loader.innerHTML = '<p style="color:var(--danger);padding:20px;text-align:center">⚠ فشل تحميل الدرس. تحقق من اتصالك بالإنترنت.</p>';
    };
  }

  function closeModal() {
    const modal = $('lessonModal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    $('lessonIframe').src = '';
    document.body.classList.remove('reading-mode');
    fontSizeLevel = 0;
    applyFontSize();
  }

  function navigate(dir) {
    const newIdx = state.currentLessonIndex + dir;
    if (newIdx >= 0 && newIdx < currentLessonsContext.length) {
      openLesson(newIdx);
    }
  }

  function updateNavBtns() {
    $('prevLesson').disabled = state.currentLessonIndex === 0;
    $('nextLesson').disabled = state.currentLessonIndex === currentLessonsContext.length - 1;
  }

  function updateCompleteBtn(id) {
    const isDone = state.completed.includes(id);
    const btn = $('markCompleteBtn');
    btn.classList.toggle('completed', isDone);
    btn.innerHTML = isDone
      ? '<i class="fas fa-check"></i><span>تم الإكمال</span>'
      : '<i class="fas fa-check-circle"></i><span>تحديد كمكتمل</span>';
  }

  function markCurrentComplete() {
    const lesson = currentLessonsContext[state.currentLessonIndex];
    if (!lesson || state.completed.includes(lesson.id)) return;
    state.completed.push(lesson.id);
    localStorage.setItem('ba_completed', JSON.stringify(state.completed));
    updateCompleteBtn(lesson.id);
    showToast('🎉 أحسنت! تم تحديد الدرس كمكتمل', 'success');
    filterAndRender();
  }

  /* Fullscreen */
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
    if (!document.fullscreenElement) {
      $('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
    }
  });

  /* Font size cycling */
  let fontSizeLevel = 0;
  const fontSizes = ['16px', '18px', '20px', '14px'];
  function cycleFontSize() {
    fontSizeLevel = (fontSizeLevel + 1) % fontSizes.length;
    applyFontSize();
    showToast('حجم الخط: ' + fontSizes[fontSizeLevel], 'info');
  }
  function applyFontSize() {
    const iframe = $('lessonIframe');
    try {
      if (iframe.contentDocument?.body) {
        iframe.contentDocument.body.style.fontSize = fontSizes[fontSizeLevel];
      }
    } catch { /* cross-origin */ }
  }

  /* Reading mode */
  function toggleReadingMode() {
    document.body.classList.toggle('reading-mode');
    const active = document.body.classList.contains('reading-mode');
    showToast(active ? '📖 وضع القراءة' : 'وضع عادي', 'info');
  }

  /* ════════ KEYBOARD ════════ */
  function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      const modalOpen = $('lessonModal').classList.contains('active');
      const activeEl  = document.activeElement;
      const isInput   = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT');

      if (modalOpen) {
        if (e.key === 'Escape')      closeModal();
        if (e.key === 'ArrowRight')  navigate(-1);
        if (e.key === 'ArrowLeft')   navigate(1);
        if (e.key === 'f')           toggleFullscreen();
        return;
      }

      if (isInput) return;

      if (e.key === 's' || e.key === 'ش') {
        e.preventDefault();
        $('lessonSearch')?.focus();
      }
    });
  }

  /* ════════ RESET FILTERS ════════ */
  function resetFilters() {
    state.currentFilter = 'all';
    state.searchQuery   = '';
    state.currentSort   = 'default';

    $$('#levelFilters .filter-pill').forEach((b, i) => b.classList.toggle('active', i === 0));
    const input = $('lessonSearch');
    if (input) input.value = '';
    const sort = $('sortSelect');
    if (sort) sort.value = 'default';

    filterAndRender();
  }

  /* ════════ TOAST ════════ */
  function showToast(msg, type = 'info') {
    const container = $('toastContainer');
    if (!container) return;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s, transform 0.4s';
      toast.style.opacity    = '0';
      toast.style.transform  = 'translateX(-110%)';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // Expose for HTML onclick
  window.resetFilters = resetFilters;

})();
