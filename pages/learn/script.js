/* ═══════════════════════════════════════════════════════════
   BlogArch Learn — Main Script [FIXED]
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const state = {
    currentFilter: 'all',
    currentSort: 'default',
    viewMode: 'grid',
    searchQuery: '',
    favorites: loadStorage('ba_favorites'),
    completed: loadStorage('ba_completed'),
    currentLessonIndex: 0,
    filteredLessons: [],
  };

  let currentLessonsContext = [];
  let fontSizeLevel = 0;
  const fontSizes = ['16px', '18px', '20px', '14px'];

  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    if (typeof LESSONS_DATA === 'undefined' || !Array.isArray(LESSONS_DATA)) {
      console.error('LESSONS_DATA not loaded');
      showToast('⚠ خطأ في تحميل بيانات الدروس', 'error');
      return;
    }

    setupTopBar();
    setupFilters();
    setupSortSelect();
    setupViewToggle();
    setupModal();
    setupKeyboard();
    setupSearchTags();
    setupScrollCollapse();
    setupCardLoader();
    filterAndRender();
    detectTheme();
    updateStats();

    console.log('✅ BlogArch Learn ready:', LESSONS_DATA.length, 'lessons');
  }

  /* ── Storage ─────────────────────────────────────────────── */
  function loadStorage(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }
  function saveStorage(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }

  /* ════════ TOP BAR ════════ */
  function setupTopBar() {
    const searchInput = $('lessonSearch');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = searchInput.value.trim().toLowerCase();
        filterAndRender();
      }, 150);
    });

    $('clearSearch')?.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      filterAndRender();
      searchInput.focus();
    });
  }

  /* ════════ SEARCH TAGS ════════ */
  function setupSearchTags() {
    $$('#searchTags .ba-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const val = tag.dataset.search;
        const input = $('lessonSearch');
        if (!input) return;
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
    $$('#levelFilters .ba-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#levelFilters .ba-filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentFilter = btn.dataset.level;
        filterAndRender();
      });
    });
  }

  /* ════════ SORT ════════ */
  function setupSortSelect() {
    $('sortSelect')?.addEventListener('change', (e) => {
      state.currentSort = e.target.value;
      filterAndRender();
    });
  }

  /* ════════ VIEW TOGGLE ════════ */
  function setupViewToggle() {
    $$('#viewToggle .ba-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#viewToggle .ba-view-btn').forEach(b => {
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

  /* ════════ SCROLL COLLAPSE ════════ */
  function setupScrollCollapse() {
    const searchBar = $('baSearchBar');
    const filtersBar = $('baFiltersBar');
    const root = $('ba-learn-root');
    if (!searchBar || !filtersBar || !root) return;

    let ticking = false;
    const update = () => {
      const rootTop = root.getBoundingClientRect().top;
      const searchH = searchBar.scrollHeight || 72;
      if (rootTop < -searchH * 0.5) {
        searchBar.classList.add('ba-collapsed');
        filtersBar.classList.add('ba-at-top');
      } else {
        searchBar.classList.remove('ba-collapsed');
        filtersBar.classList.remove('ba-at-top');
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* ════════ CARD LOADER ════════ */
  function setupCardLoader() {
    const grid = $('lessonsGrid');
    if (!grid) return;

    let activeCard = null;
    let loadingTimer = null;

    function ensureLoader(card) {
      if (!card || card.querySelector('.card-loader-overlay')) return;
      const overlay = document.createElement('div');
      overlay.className = 'card-loader-overlay';
      overlay.innerHTML = `
        <div class="card-loader-spinner" aria-hidden="true"></div>
        <div class="card-loader-text">جاري التحميل...</div>
      `;
      card.appendChild(overlay);
    }

    function clearLoading() {
      if (loadingTimer) { clearTimeout(loadingTimer); loadingTimer = null; }
      document.querySelectorAll('.lesson-card.card-loading').forEach(c => {
        c.classList.remove('card-loading');
        c.removeAttribute('aria-busy');
      });
      activeCard = null;
    }

    function setLoading(card) {
      if (!card) return;
      clearLoading();
      ensureLoader(card);
      activeCard = card;
      card.classList.add('card-loading');
      card.setAttribute('aria-busy', 'true');
      loadingTimer = setTimeout(clearLoading, 12000);
    }

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.lesson-card');
      if (!card || e.target.closest('.favorite-btn')) return;
      setLoading(card);
    }, true);

    const iframe = $('lessonIframe');
    const modal = $('lessonModal');
    const closeBtn = $('closeModal');
    const backdrop = modal?.querySelector('.modal-backdrop');

    iframe?.addEventListener('load', () => requestAnimationFrame(clearLoading));
    closeBtn?.addEventListener('click', clearLoading, true);
    backdrop?.addEventListener('click', clearLoading, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') clearLoading(); }, true);

    if (modal) {
      const observer = new MutationObserver(() => {
        if (!modal.classList.contains('active')) clearLoading();
      });
      observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* ════════ FILTER + RENDER ════════ */
  function filterAndRender() {
    let list = LESSONS_DATA.slice();

    if (state.currentFilter !== 'all') {
      list = list.filter(l => l.level === state.currentFilter);
    }

    if (state.searchQuery) {
      const q = state.searchQuery;
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.titleEn.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    }

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
    const grid = $(gridId);
    const empty = $(emptyId);
    if (!grid) return;

    if (lessons.length === 0) {
      grid.style.display = 'none';
      if (empty) empty.style.display = '';
      return;
    }

    grid.style.display = 'grid';
    if (empty) empty.style.display = 'none';

    const levelText = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

    grid.innerHTML = lessons.map((lesson, idx) => {
      const isFav = state.favorites.includes(lesson.id);
      const isDone = state.completed.includes(lesson.id);

      return `
        <article class="lesson-card ${isDone ? 'completed' : ''}"
                 data-idx="${idx}"
                 data-id="${lesson.id}"
                 style="animation-delay:${idx * 40}ms"
                 role="button"
                 tabindex="0"
                 aria-label="فتح درس ${escapeHtml(lesson.title)}">
          <div class="card-header">
            <div class="lesson-icon" aria-hidden="true">
              <i class="fas fa-book"></i>
            </div>
            <button class="favorite-btn ${isFav ? 'active' : ''}"
                    data-id="${lesson.id}"
                    aria-label="${isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}"
                    type="button">
              <i class="fas fa-heart" aria-hidden="true"></i>
            </button>
          </div>
          <div class="lesson-content">
            <h3 class="lesson-title">${escapeHtml(lesson.title)}</h3>
            <p class="lesson-title-en">${escapeHtml(lesson.titleEn)}</p>
            <p class="lesson-description">${escapeHtml(lesson.description)}</p>
          </div>
          <div class="lesson-meta">
            <span class="level-badge ${lesson.level}">
              <span class="pill-dot ${lesson.level}" aria-hidden="true"></span>
              ${levelText[lesson.level]}
            </span>
            <span class="lesson-action" aria-hidden="true">
              <span>ابدأ الدرس</span>
              <i class="fas fa-arrow-left"></i>
            </span>
          </div>
        </article>
      `;
    }).join('');

    grid.classList.toggle('list-view', state.viewMode === 'list');

    // Events
    grid.querySelectorAll('.lesson-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) {
          toggleFavorite(parseInt(card.dataset.id));
          return;
        }
        openLesson(parseInt(card.dataset.idx), lessons);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (e.target.closest('.favorite-btn')) {
            toggleFavorite(parseInt(card.dataset.id));
            return;
          }
          openLesson(parseInt(card.dataset.idx), lessons);
        }
      });
    });

    staggerCards(grid);
  }

  function staggerCards(grid) {
    const cards = grid.querySelectorAll('.lesson-card');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    cards.forEach(card => {
      card.style.animationPlayState = 'paused';
      io.observe(card);
    });
  }

  /* ════════ FAVORITE ════════ */
  function toggleFavorite(id) {
    const idx = state.favorites.indexOf(id);
    if (idx > -1) {
      state.favorites.splice(idx, 1);
      showToast('❤️ تمت الإزالة من المفضلة', 'info');
    } else {
      state.favorites.push(id);
      showToast('❤️ تمت الإضافة للمفضلة', 'success');
    }
    saveStorage('ba_favorites', state.favorites);
    filterAndRender();
  }

  /* ════════ MODAL ════════ */
  function setupModal() {
    $('closeModal')?.addEventListener('click', closeModal);
    document.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
    $('prevLesson')?.addEventListener('click', () => navigate(-1));
    $('nextLesson')?.addEventListener('click', () => navigate(1));
    $('markCompleteBtn')?.addEventListener('click', markCurrentComplete);
    $('fullscreenBtn')?.addEventListener('click', toggleFullscreen);
    $('fontSizeBtn')?.addEventListener('click', cycleFontSize);
    $('readingModeBtn')?.addEventListener('click', toggleReadingMode);
    $('resetFiltersBtn')?.addEventListener('click', resetFilters);
  }

  function openLesson(index, lessonsCtx) {
    if (lessonsCtx) currentLessonsContext = lessonsCtx;
    state.currentLessonIndex = index;
    const lesson = currentLessonsContext[index];
    if (!lesson) return;

    // ✅ FIX: Check if elements exist before accessing
    const modalTitle = $('modalTitle');
    const modalSubtitle = $('modalSubtitle');
    const currentIndexEl = $('currentIndex');
    const totalIndexEl = $('totalIndex');

    if (modalTitle) modalTitle.textContent = lesson.title;
    if (modalSubtitle) modalSubtitle.textContent = lesson.titleEn;
    if (currentIndexEl) currentIndexEl.textContent = index + 1;
    if (totalIndexEl) totalIndexEl.textContent = currentLessonsContext.length;

    updateCompleteBtn(lesson.id);
    updateNavBtns();

    const fullUrl = LESSONS_BASE_URL + lesson.githubPath;

    const modal = $('lessonModal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';

    const loader = $('iframeLoader');
    // ✅ FIX: Check if loader exists
    if (loader) {
      loader.classList.remove('hidden');
    }

    const iframe = $('lessonIframe');
    if (iframe) {
      iframe.src = '';
      setTimeout(() => { iframe.src = fullUrl; }, 50);

      iframe.onload = () => {
        if (loader) loader.classList.add('hidden');
        applyFontSize();
      };
      iframe.onerror = () => {
        if (loader) {
          loader.innerHTML = '<p style="color:var(--error);padding:20px;text-align:center">⚠ فشل تحميل الدرس. تحقق من اتصالك بالإنترنت.</p>';
        }
      };
    }
  }

  function closeModal() {
    const modal = $('lessonModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
    const iframe = $('lessonIframe');
    if (iframe) iframe.src = '';
    document.body.classList.remove('reading-mode');
    fontSizeLevel = 0;
  }

  function navigate(dir) {
    const newIdx = state.currentLessonIndex + dir;
    if (newIdx >= 0 && newIdx < currentLessonsContext.length) {
      openLesson(newIdx);
    }
  }

  function updateNavBtns() {
    // ✅ FIX: Check if elements exist before accessing
    const prevBtn = $('prevLesson');
    const nextBtn = $('nextLesson');
    if (prevBtn) prevBtn.disabled = state.currentLessonIndex === 0;
    if (nextBtn) nextBtn.disabled = state.currentLessonIndex === currentLessonsContext.length - 1;
  }

  function updateCompleteBtn(id) {
    const isDone = state.completed.includes(id);
    const btn = $('markCompleteBtn');
    if (!btn) return;
    btn.classList.toggle('completed', isDone);
    btn.innerHTML = isDone
      ? '<i class="fas fa-check" aria-hidden="true"></i><span>تم الإكمال</span>'
      : '<i class="fas fa-check-circle" aria-hidden="true"></i><span>تحديد كمكتمل</span>';
    btn.disabled = isDone;
  }

  function markCurrentComplete() {
    const lesson = currentLessonsContext[state.currentLessonIndex];
    if (!lesson || state.completed.includes(lesson.id)) return;
    state.completed.push(lesson.id);
    saveStorage('ba_completed', state.completed);
    updateCompleteBtn(lesson.id);
    showToast('🎉 أحسنت! تم تحديد الدرس كمكتمل', 'success');
    filterAndRender();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
  document.addEventListener('fullscreenchange', () => {
    const btn = $('fullscreenBtn');
    if (!btn) return;
    btn.innerHTML = document.fullscreenElement
      ? '<i class="fas fa-compress" aria-hidden="true"></i>'
      : '<i class="fas fa-expand" aria-hidden="true"></i>';
  });

  function cycleFontSize() {
    fontSizeLevel = (fontSizeLevel + 1) % fontSizes.length;
    applyFontSize();
    showToast('حجم الخط: ' + fontSizes[fontSizeLevel], 'info');
  }
  function applyFontSize() {
    try {
      const iframe = $('lessonIframe');
      if (iframe?.contentDocument?.body) {
        iframe.contentDocument.body.style.fontSize = fontSizes[fontSizeLevel];
      }
    } catch {}
  }

  function toggleReadingMode() {
    document.body.classList.toggle('reading-mode');
    const active = document.body.classList.contains('reading-mode');
    showToast(active ? '📖 وضع القراءة' : 'وضع عادي', 'info');
  }

  function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      const modal = $('lessonModal');
      const modalOpen = modal?.classList.contains('active');
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT');

      if (modalOpen) {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') navigate(-1);
        if (e.key === 'ArrowLeft') navigate(1);
        return;
      }

      if (isInput) return;
      if ((e.key === 's' || e.key === 'ش') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        $('lessonSearch')?.focus();
      }
    });
  }

  function resetFilters() {
    state.currentFilter = 'all';
    state.searchQuery = '';
    state.currentSort = 'default';

    $$('#levelFilters .ba-filter-pill').forEach((b, i) => b.classList.toggle('active', i === 0));
    const input = $('lessonSearch');
    if (input) input.value = '';
    const sort = $('sortSelect');
    if (sort) sort.value = 'default';

    filterAndRender();
  }

  function updateStats() {
    const totalEl = $('totalLessons');
    const doneEl = $('completedLessons');
    const favEl = $('favCount');
    if (totalEl) totalEl.textContent = LESSONS_DATA.length;
    if (doneEl) doneEl.textContent = state.completed.length;
    if (favEl) favEl.textContent = state.favorites.length;
  }

  function showToast(msg, type = 'info') {
    const container = $('toastContainer');
    if (!container) return;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <span aria-hidden="true">${icons[type] || 'ℹ'}</span>
      <span>${escapeHtml(msg)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function detectTheme() {
    const root = $('ba-learn-root');
    if (!root) return;
    try {
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      const match = bodyBg.match(/\d+/g);
      if (!match || match.length < 3) return;
      const [r, g, b] = match.map(Number);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      root.dataset.theme = luminance < 0.5 ? 'dark' : 'light';
    } catch {}
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.resetFilters = resetFilters;

})();