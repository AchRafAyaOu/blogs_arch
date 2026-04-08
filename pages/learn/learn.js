(function () {
  'use strict';

  const CDN = 'https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main/data/lessons.json';
  const state = {
    allLessons: [],
    visibleLessons: [],
    currentFilter: 'all',
    searchTerm: '',
    currentIdx: -1,
    lastFocusedElement: null,
    touchStartX: 0
  };

  const dom = {
    body: document.body,
    loader: document.getElementById('fin-loader'),
    darkBtn: document.getElementById('pg-dark-btn'),
    grid: document.getElementById('pg-grid'),
    empty: document.getElementById('pg-empty'),
    resetFilters: document.getElementById('reset-filters'),
    search: document.getElementById('lesson-search'),
    clearSearch: document.getElementById('clear-search'),
    filterButtons: Array.from(document.querySelectorAll('.pg-filter-btn')),
    resultsSummary: document.getElementById('results-summary'),
    stats: {
      total: document.getElementById('stat-total'),
      beg: document.getElementById('stat-beg'),
      mid: document.getElementById('stat-mid'),
      adv: document.getElementById('stat-adv')
    },
    counts: {
      all: document.getElementById('fc-all'),
      beg: document.getElementById('fc-beg'),
      mid: document.getElementById('fc-mid'),
      adv: document.getElementById('fc-adv')
    },
    modal: document.getElementById('lm-modal'),
    modalTitle: document.getElementById('lm-label'),
    modalIframe: document.getElementById('lm-iframe'),
    modalLoading: document.getElementById('lm-loading'),
    modalExt: document.getElementById('lm-ext'),
    modalPrev: document.getElementById('lm-prev'),
    modalNext: document.getElementById('lm-next'),
    modalCounter: document.getElementById('lm-counter'),
    modalClose: document.getElementById('lm-close')
  };

  function init() {
    initTheme();
    bindEvents();
    loadLessons();
    window.addEventListener('load', () => setTimeout(hideLoader, 1000), { once: true });
  }

  function initTheme() {
    const isDark = localStorage.getItem('fin-dark') === '1';
    dom.body.classList.toggle('dark-mode', isDark);
    updateThemeIcon(isDark);
  }

  function bindEvents() {
    if (dom.darkBtn) {
      dom.darkBtn.addEventListener('click', toggleTheme);
    }

    dom.filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setFilter(button.dataset.level || 'all');
      });
    });

    if (dom.search) {
      dom.search.addEventListener('input', handleSearch);
    }

    if (dom.clearSearch) {
      dom.clearSearch.addEventListener('click', clearSearch);
    }

    if (dom.resetFilters) {
      dom.resetFilters.addEventListener('click', resetAllFilters);
    }

    if (dom.modalClose) {
      dom.modalClose.addEventListener('click', closeModal);
    }

    if (dom.modal) {
      dom.modal.addEventListener('click', (event) => {
        if (event.target === dom.modal) {
          closeModal();
        }
      });

      dom.modal.addEventListener('touchstart', (event) => {
        state.touchStartX = event.changedTouches[0].screenX;
      }, { passive: true });

      dom.modal.addEventListener('touchend', (event) => {
        const diff = state.touchStartX - event.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            goToNextLesson();
          } else {
            goToPrevLesson();
          }
        }
      }, { passive: true });
    }

    if (dom.modalPrev) {
      dom.modalPrev.addEventListener('click', goToPrevLesson);
    }

    if (dom.modalNext) {
      dom.modalNext.addEventListener('click', goToNextLesson);
    }

    document.addEventListener('keydown', handleGlobalKeys);
  }

  function toggleTheme() {
    const nextState = !dom.body.classList.contains('dark-mode');
    dom.body.classList.toggle('dark-mode', nextState);
    localStorage.setItem('fin-dark', nextState ? '1' : '0');
    updateThemeIcon(nextState);
  }

  function updateThemeIcon(isDark) {
    const icon = dom.darkBtn ? dom.darkBtn.querySelector('i') : null;
    if (icon) {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  function handleSearch(event) {
    state.searchTerm = (event.target.value || '').trim().toLowerCase();
    if (dom.clearSearch) {
      dom.clearSearch.hidden = !state.searchTerm;
    }
    applyFilters();
  }

  function clearSearch() {
    state.searchTerm = '';
    if (dom.search) {
      dom.search.value = '';
      dom.search.focus();
    }
    if (dom.clearSearch) {
      dom.clearSearch.hidden = true;
    }
    applyFilters();
  }

  function setFilter(level) {
    state.currentFilter = level;
    dom.filterButtons.forEach((button) => {
      const isActive = button.dataset.level === level;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    applyFilters();
  }

  function resetAllFilters() {
    state.currentFilter = 'all';
    clearSearch();
    setFilter('all');
  }

  async function loadLessons() {
    try {
      const response = await fetch(CDN, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      state.allLessons = Array.isArray(data) ? data.map(normalizeLesson) : [];
      updateCounts(state.allLessons);
      applyFilters();
    } catch (error) {
      console.error('Failed to load lessons:', error);
      renderErrorState();
    } finally {
      hideLoader();
    }
  }

  function normalizeLesson(lesson, index) {
    const normalizedLevel = ['beg', 'mid', 'adv'].includes(lesson.level) ? lesson.level : 'beg';
    return {
      ...lesson,
      id: lesson.id || index + 1,
      level: normalizedLevel,
      levelLabel: lesson.levelLabel || getLevelLabel(normalizedLevel),
      title: lesson.title || 'درس بدون عنوان',
      titleEn: lesson.titleEn || 'Untitled Lesson',
      description: lesson.description || 'لا يوجد وصف متاح لهذا الدرس حالياً.',
      icon: lesson.icon || 'fas fa-book-open',
      url: lesson.url || '#'
    };
  }

  function getLevelLabel(level) {
    if (level === 'beg') return 'مبتدئ';
    if (level === 'mid') return 'متوسط';
    return 'متقدم';
  }

  function getLevelEmoji(level) {
    if (level === 'beg') return '🔰';
    if (level === 'mid') return '🌟';
    return '⚡';
  }

  function updateCounts(lessons) {
    const counts = { beg: 0, mid: 0, adv: 0 };
    lessons.forEach((lesson) => {
      if (counts[lesson.level] !== undefined) {
        counts[lesson.level] += 1;
      }
    });

    if (dom.stats.total) dom.stats.total.textContent = String(lessons.length);
    if (dom.stats.beg) dom.stats.beg.textContent = String(counts.beg);
    if (dom.stats.mid) dom.stats.mid.textContent = String(counts.mid);
    if (dom.stats.adv) dom.stats.adv.textContent = String(counts.adv);

    if (dom.counts.all) dom.counts.all.textContent = String(lessons.length);
    if (dom.counts.beg) dom.counts.beg.textContent = String(counts.beg);
    if (dom.counts.mid) dom.counts.mid.textContent = String(counts.mid);
    if (dom.counts.adv) dom.counts.adv.textContent = String(counts.adv);
  }

  function applyFilters() {
    const query = state.searchTerm;
    state.visibleLessons = state.allLessons.filter((lesson) => {
      const levelMatch = state.currentFilter === 'all' || lesson.level === state.currentFilter;
      const searchMatch = !query || [lesson.title, lesson.titleEn, lesson.description, lesson.levelLabel]
        .join(' ')
        .toLowerCase()
        .includes(query);
      return levelMatch && searchMatch;
    });

    renderLessons(state.visibleLessons);
    updateSummary();
  }

  function updateSummary() {
    if (!dom.resultsSummary) return;

    const visible = state.visibleLessons.length;
    const total = state.allLessons.length;
    const filterLabel = state.currentFilter === 'all' ? 'كل المستويات' : getLevelLabel(state.currentFilter);
    const searchLabel = state.searchTerm ? ` — البحث: “${state.searchTerm}”` : '';

    dom.resultsSummary.textContent = `يعرض ${visible} من أصل ${total} درساً — ${filterLabel}${searchLabel}`;
  }

  function renderLessons(lessons) {
    if (!dom.grid) return;

    dom.grid.innerHTML = '';

    if (!lessons.length) {
      toggleEmptyState(true);
      return;
    }

    toggleEmptyState(false);

    const fragment = document.createDocumentFragment();

    lessons.forEach((lesson, index) => {
      const card = document.createElement('article');
      card.className = 'lc-card arabic-text';
      card.tabIndex = 0;
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', `${lesson.title} - ${lesson.levelLabel}`);
      card.dataset.index = String(index);

      const badge = document.createElement('span');
      badge.className = `lc-level ${lesson.level}`;
      badge.textContent = `${getLevelEmoji(lesson.level)} ${lesson.levelLabel}`;

      const icon = document.createElement('div');
      icon.className = 'lc-icon';
      icon.innerHTML = `<i class="${lesson.icon}" aria-hidden="true"></i>`;

      const title = document.createElement('h2');
      title.className = 'lc-title';
      title.textContent = lesson.title;

      const titleEn = document.createElement('p');
      titleEn.className = 'lc-title-en';
      titleEn.textContent = lesson.titleEn;

      const desc = document.createElement('p');
      desc.className = 'lc-desc';
      desc.textContent = lesson.description;

      const link = document.createElement('span');
      link.className = 'lc-link';
      link.innerHTML = 'افتح الدرس <i class="fas fa-arrow-left" aria-hidden="true"></i>';

      card.append(badge, icon, title, titleEn, desc, link);
      card.addEventListener('click', () => openLesson(index, card));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLesson(index, card);
        }
      });

      fragment.appendChild(card);
    });

    dom.grid.appendChild(fragment);
  }

  function toggleEmptyState(show) {
    if (dom.empty) {
      dom.empty.hidden = !show;
    }
  }

  function renderErrorState() {
    if (!dom.grid) return;

    toggleEmptyState(false);
    dom.grid.innerHTML = `
      <div class="pg-empty arabic-text" style="display:block;max-width:100%;">
        <div class="pg-empty-icon"><i class="fas fa-exclamation-circle"></i></div>
        <h2>تعذّر تحميل الدروس</h2>
        <p>حدثت مشكلة أثناء جلب البيانات. يرجى المحاولة لاحقاً أو فتح الصفحة من جديد.</p>
      </div>
    `;

    if (dom.resultsSummary) {
      dom.resultsSummary.textContent = 'تعذّر تحميل البيانات حالياً';
    }
  }

  function openLesson(index, triggerElement) {
    const lesson = state.visibleLessons[index];
    if (!lesson || !dom.modal) return;

    state.currentIdx = index;
    state.lastFocusedElement = triggerElement || document.activeElement;

    if (dom.modalTitle) {
      dom.modalTitle.textContent = `${lesson.title} — ${lesson.titleEn}`;
    }

    if (dom.modalExt) {
      dom.modalExt.href = lesson.url;
    }

    if (dom.modalLoading) {
      dom.modalLoading.hidden = false;
    }

    if (dom.modalIframe) {
      dom.modalIframe.src = lesson.url;
      dom.modalIframe.onload = () => {
        if (dom.modalLoading) {
          dom.modalLoading.hidden = true;
        }
      };
    }

    dom.modal.classList.add('open');
    dom.modal.setAttribute('aria-hidden', 'false');
    dom.body.classList.add('modal-open');

    updateModalNav();

    window.setTimeout(() => {
      if (dom.modalClose) dom.modalClose.focus();
    }, 30);
  }

  function closeModal() {
    if (!dom.modal) return;

    dom.modal.classList.remove('open');
    dom.modal.setAttribute('aria-hidden', 'true');
    dom.body.classList.remove('modal-open');

    if (dom.modalIframe) {
      dom.modalIframe.src = '';
    }

    if (dom.modalLoading) {
      dom.modalLoading.hidden = false;
    }

    state.currentIdx = -1;

    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
      state.lastFocusedElement.focus();
    }
  }

  function updateModalNav() {
    if (dom.modalCounter) {
      dom.modalCounter.textContent = `${state.currentIdx + 1} / ${state.visibleLessons.length}`;
    }

    if (dom.modalPrev) {
      dom.modalPrev.disabled = state.currentIdx <= 0;
    }

    if (dom.modalNext) {
      dom.modalNext.disabled = state.currentIdx >= state.visibleLessons.length - 1;
    }
  }

  function goToPrevLesson() {
    if (state.currentIdx > 0) {
      openLesson(state.currentIdx - 1, state.lastFocusedElement);
    }
  }

  function goToNextLesson() {
    if (state.currentIdx < state.visibleLessons.length - 1) {
      openLesson(state.currentIdx + 1, state.lastFocusedElement);
    }
  }

  function handleGlobalKeys(event) {
    const modalOpen = dom.modal && dom.modal.classList.contains('open');

    if (modalOpen) {
      if (event.key === 'Escape') {
        closeModal();
      } else if (event.key === 'ArrowRight') {
        goToPrevLesson();
      } else if (event.key === 'ArrowLeft') {
        goToNextLesson();
      }
      return;
    }

    if (event.key === '/' && document.activeElement !== dom.search) {
      event.preventDefault();
      if (dom.search) dom.search.focus();
    }
  }

  function hideLoader() {
    if (!dom.loader) return;
    dom.loader.classList.add('fin-loader-hidden');
    window.setTimeout(() => {
      dom.loader.style.display = 'none';
    }, 450);
  }

  init();
})();
