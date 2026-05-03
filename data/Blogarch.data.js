/* ═══════════════════════════════════════════════════════════════
   BlogArch — Data Module  v1.0  (Blogarch.data.js)
   المستودع: https://github.com/AchRafAyaOu/blogs_arch

  

 ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (window.BlogArchDataLoaded) return;
  window.BlogArchDataLoaded = true;

  /* ─────────────────────────────────────────────────────────────
     الثوابت
  ───────────────────────────────────────────────────────────── */
  const CDN_BASE    = window.BlogArch?.CDN_BASE
    || 'https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main';
  const DATA_URL    = `${CDN_BASE}/data/site.data.json`;
  const CACHE_KEY   = 'ba_site_data';
  const CACHE_TS    = 'ba_site_data_ts';
  const TTL_MS      = 24 * 60 * 60 * 1000; /* 24 ساعة */


  /* ═══════════════════════════════════════════════════════════
     localStorage Cache — قراءة / كتابة مع TTL
  ═══════════════════════════════════════════════════════════ */
  function _readCache() {
    try {
      const ts   = parseInt(localStorage.getItem(CACHE_TS) || '0', 10);
      const raw  = localStorage.getItem(CACHE_KEY);
      if (raw && Date.now() - ts < TTL_MS) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  function _writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TS,  String(Date.now()));
    } catch (_) {}
  }


  /* ═══════════════════════════════════════════════════════════
     التطبيق — site.data.json → DOM
  ═══════════════════════════════════════════════════════════ */
  function _apply(data) {
    if (!data) return;
    window.BlogArchData = data;

    _applySocial(data.social);
    _applyMetaCounts(data.meta);
    _applyDefaultTheme(data.theme);
    _applyNavBadges(data.meta);
    _applyFooterYear();

    /* إخطار الوحدات الأخرى */
    document.dispatchEvent(new CustomEvent('blogarch:data', { detail: data }));
  }


  /* ── روابط التواصل الاجتماعي ── */
  function _applySocial(social) {
    if (!social) return;
    const map = {
      'fin-social-telegram': social.telegram,
      'fin-social-github':   social.github,
      'fin-social-twitter':  social.twitter,
      'fin-social-youtube':  social.youtube,
      'fin-social-linkedin': social.linkedin,
      'fin-social-email':    social.email ? `mailto:${social.email}` : null,
    };
    Object.entries(map).forEach(([id, url]) => {
      if (!url) return;
      const el = document.getElementById(id);
      if (el) {
        el.href = url;
        el.removeAttribute('hidden');
        el.style.display = '';
      }
      /* أيضاً: بحث بـ data-social attribute */
      document.querySelectorAll(`[data-social="${id.replace('fin-social-', '')}"]`).forEach(a => {
        a.href = url;
      });
    });
  }


  /* ── شارات العدد (الدروس، الاقتباسات، البودكاست...) ── */
  function _applyMetaCounts(meta) {
    if (!meta) return;
    Object.entries(meta).forEach(([key, val]) => {
      const count = val?.count;
      if (typeof count !== 'number') return;

      /* [data-count="learn"] أو [data-count="quotes"] */
      document.querySelectorAll(`[data-count="${key}"]`).forEach(el => {
        el.textContent = count;
        el.removeAttribute('hidden');
      });

      /* شارة في nav: id="nav-badge-learn" */
      const badge = document.getElementById(`nav-badge-${key}`);
      if (badge) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
      }
    });
  }


  /* ── الثيم الافتراضي (فقط عند أول زيارة) ── */
  function _applyDefaultTheme(theme) {
    if (!theme?.default) return;
    const isFirstVisit = !localStorage.getItem('ba-theme');
    if (!isFirstVisit) return;

    const themeName = theme.default; /* 'default' | 'ocean' | 'sunset' | 'forest' | 'midnight' */
    const darkMode  = theme.dark === true;

    /* استخدام API من blogarch.js إذا كان محمَّلاً */
    if (typeof window.BlogArch?.setTheme === 'function') {
      window.BlogArch.setTheme(themeName, darkMode);
    } else {
      /* تطبيق مباشر إذا تأخّر تحميل blogarch.js */
      document.addEventListener('blogarch:ready', () => {
        window.BlogArch?.setTheme?.(themeName, darkMode);
      });
    }
  }


  /* ── شارات nav (title + aria-label) ── */
  function _applyNavBadges(meta) {
    if (!meta) return;
    Object.entries(meta).forEach(([key, val]) => {
      const title = val?.title;
      if (!title) return;
      document.querySelectorAll(`[data-nav-section="${key}"]`).forEach(el => {
        if (el.tagName === 'A' || el.tagName === 'BUTTON') {
          el.setAttribute('aria-label', title);
        }
      });
    });
  }


  /* ── تحديث سنة حقوق النشر (fallback لو blogarch.js لم يُحمَّل بعد) ── */
  function _applyFooterYear() {
    const el = document.getElementById('fin-year');
    if (el && !el.textContent.trim()) el.textContent = new Date().getFullYear();
  }


  /* ═══════════════════════════════════════════════════════════
     التحميل الرئيسي — Cache أولاً ثم Fetch
  ═══════════════════════════════════════════════════════════ */
  function _load() {
    const cached = _readCache();
    if (cached) {
      _apply(cached);
      /* تحديث صامت في الخلفية */
      _fetchAndApply(true);
      return;
    }
    _fetchAndApply(false);
  }

  function _fetchAndApply(silent) {
    fetch(DATA_URL)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        _writeCache(data);
        if (!silent) _apply(data);
        else {
          /* تحديث صامت: نُحدِّث window.BlogArchData فقط دون إعادة رسم */
          window.BlogArchData = data;
          document.dispatchEvent(new CustomEvent('blogarch:data:refresh', { detail: data }));
        }
      })
      .catch(err => {
        if (!silent) console.warn('[BlogArch Data] تعذّر تحميل site.data.json:', err.message);
      });
  }


  /* ═══════════════════════════════════════════════════════════
     التهيئة
  ═══════════════════════════════════════════════════════════ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _load);
  } else {
    _load();
  }


  /* ═══════════════════════════════════════════════════════════
     PUBLIC API
  ═══════════════════════════════════════════════════════════ */
  window.BlogArch = Object.assign(window.BlogArch || {}, {
    reloadData:   _load,
    clearData:    function () {
      try {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TS);
      } catch (_) {}
    },
    DATA_VERSION: '1.0.0',
  });

})();