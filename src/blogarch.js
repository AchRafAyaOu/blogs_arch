/* BlogArch — CDN JS  ( · 2026)
   القالب الشخصي — المكوّن الرئيسي
  
   ─────────────────────────────────────────────────────────
   ملاحظات التكامل مع XML:
   - XML يضبط window._blogarchFeedSearchEnabled = true → §12 لا يعمل
   - XML يضبط window._quotesLoaded = true عند نجاح inline rotator → §14 يستبدله
   - #scroll-top-btn و #reading-progress بالـ ID مُعالَجان في XML
   - .back-to-top و .reading-progress بالـ class → هذا الملف
*/
(function () {
  'use strict';

  var CDN_BASE = 'https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main';
  var VERSION  = (window.BlogArch && window.BlogArch.VERSION) || '20260601';

  /* ══════════════════════════════════════════════════
     §01 — Init guard
     يمنع التشغيل المزدوج إذا حُمِّل الملف مرتين
     ══════════════════════════════════════════════════ */
  if (window._blogarchJsLoaded) return;
  window._blogarchJsLoaded = true;


  /* ══════════════════════════════════════════════════
     §02 — Back-to-top  (.back-to-top)
     يعمل مع أزرار الكلاس .back-to-top (CDN CSS)
     أما #scroll-top-btn بالـ ID فمُعالَج داخل XML
     ══════════════════════════════════════════════════ */
  (function () {
    var btns = document.querySelectorAll('.back-to-top');
    if (!btns.length) return;

    function onScroll() {
      var visible = window.scrollY > 300;
      btns.forEach(function (btn) {
        btn.classList.toggle('visible', visible);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* تطبيق الحالة الأولية فوراً */

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  })();


  /* ══════════════════════════════════════════════════
     §03 — Reading progress  (.reading-progress / .fin-scroll-progress)
     يعمل مع عناصر الكلاس (CDN CSS)
     أما #reading-progress بالـ ID فمُعالَج داخل XML
     ══════════════════════════════════════════════════ */
  (function () {
    var bars = document.querySelectorAll('.reading-progress, .fin-scroll-progress');
    /* تجاهل العناصر التي لها ID — مُعالَجة بالفعل في XML */
    bars = Array.prototype.filter.call(bars, function (el) {
      return !el.id;
    });
    if (!bars.length) return;

    function onScroll() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct  = docH > 0 ? (window.scrollY / docH * 100) : 0;
      bars.forEach(function (bar) {
        bar.style.width = pct + '%';
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  })();


  /* ══════════════════════════════════════════════════
     §12 — DOM search fallback
     يعمل فقط إذا لم يكن Blogger Feed search مفعَّلاً
     XML يضبط: window._blogarchFeedSearchEnabled = true
     ══════════════════════════════════════════════════ */
  (function () {
    /* إذا كان Feed search مفعَّلاً (XML) → لا حاجة لهذا القسم */
    if (window._blogarchFeedSearchEnabled) return;

    var inp = document.getElementById('search-input');
    var res = document.getElementById('search-results');
    if (!inp || !res) return;

    /* بحث بسيط في عناوين المقالات المعروضة في DOM */
    function buildIndex() {
      var items = [];
      document.querySelectorAll('.post-card, .entry').forEach(function (card) {
        var titleEl = card.querySelector('h2, h3, .card-title');
        var linkEl  = card.querySelector('a[href]');
        if (!titleEl || !linkEl) return;
        items.push({
          title : titleEl.textContent.trim(),
          url   : linkEl.getAttribute('href') || '#'
        });
      });
      return items;
    }

    var index = null;
    var timer = null;

    inp.addEventListener('input', function () {
      clearTimeout(timer);
      var q = inp.value.trim();
      if (q.length < 2) { res.innerHTML = ''; return; }
      timer = setTimeout(function () {
        if (!index) index = buildIndex();
        var matches = index.filter(function (item) {
          return item.title.indexOf(q) !== -1;
        });
        if (!matches.length) {
          res.innerHTML = '<p style="color:var(--muted);font-size:.85rem">لا توجد نتائج</p>';
          return;
        }
        var frag = document.createDocumentFragment();
        matches.slice(0, 8).forEach(function (item) {
          var a   = document.createElement('a');
          a.href  = item.url;
          a.className = 'search-item';
          a.style.cssText = 'display:flex;align-items:center;gap:.5rem;padding:.55rem .4rem;border-bottom:1px solid var(--border);color:var(--text);text-decoration:none;border-radius:6px;transition:background .15s';
          a.addEventListener('mouseover', function () { this.style.background = 'var(--muted-bg)'; });
          a.addEventListener('mouseout',  function () { this.style.background = ''; });
          var ico = document.createElement('i');
          ico.className = 'fas fa-file-alt';
          ico.setAttribute('aria-hidden', 'true');
          ico.style.cssText = 'color:var(--primary-color);font-size:.7rem;flex-shrink:0';
          var txt = document.createElement('span');
          txt.style.cssText = 'font-size:.9rem;line-height:1.5';
          txt.textContent = item.title;
          a.appendChild(ico);
          a.appendChild(txt);
          frag.appendChild(a);
        });
        res.textContent = '';
        res.appendChild(frag);
      }, 280);
    });

    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var q = inp.value.trim();
        if (q) window.location.href = '/search?q=' + encodeURIComponent(q);
      }
    });
  })();


  /* ══════════════════════════════════════════════════
     §14 — Quote rotator  (_initQuotes)
     يستبدل الـ inline fallback في XML إذا حُمِّل CDN
     XML inline fallback يضبط: window._quotesLoaded = true
     ══════════════════════════════════════════════════ */
  (function () {
    var quotesEl = document.getElementById('fin-quote-text');
    var sourceEl = document.getElementById('fin-quote-source');
    var dotsEl   = document.getElementById('fin-quote-dots');
    var prevBtn  = document.getElementById('fin-quote-prev');
    var nextBtn  = document.getElementById('fin-quote-next');
    if (!quotesEl || !sourceEl) return;

    /* إذا كان الـ inline fallback لم يُحمِّل بعد → CDN يتولّى */
    /* إذا كان محمَّلاً بالفعل (window._quotesLoaded) → CDN يستبدل بنسخة أقوى */

    var quotes    = [];
    var idx       = 0;
    var autoTimer = null;
    var INTERVAL  = 5500;

    /* ── بناء النقاط ── */
    function renderDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      quotes.forEach(function (_, i) {
        var d = document.createElement('button');
        d.className = 'fin-quote-dot' + (i === idx ? ' active' : '');
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'مقولة ' + (i + 1));
        d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        d.addEventListener('click', function () { goTo(i); });
        dotsEl.appendChild(d);
      });
    }

    /* ── عرض مقولة ── */
    function show(i, animate) {
      if (!quotes.length) return;
      idx = ((i % quotes.length) + quotes.length) % quotes.length;
      var q = quotes[idx];
      var text   = q.text   || q.quote  || '';
      var author = q.author || q.source || '';

      if (animate !== false && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        quotesEl.style.opacity = '0';
        sourceEl.style.opacity = '0';
        setTimeout(function () {
          quotesEl.textContent = text;
          sourceEl.textContent = '— ' + author;
          quotesEl.style.opacity = '1';
          sourceEl.style.opacity = '1';
        }, 300);
      } else {
        quotesEl.textContent = text;
        sourceEl.textContent = '— ' + author;
      }
      renderDots();
    }

    /* ── تشغيل تلقائي ── */
    function startAuto() {
      clearTimeout(autoTimer);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      autoTimer = setTimeout(function () { show(idx + 1, true); startAuto(); }, INTERVAL);
    }

    function goTo(i) {
      clearTimeout(autoTimer);
      show(i, true);
      startAuto();
    }

    /* ── أزرار التنقل ── */
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(idx + 1); });

    /* ── السحب (swipe) ── */
    var box = document.querySelector('.fin-quote-box');
    if (box) {
      var swipeX = 0;
      box.addEventListener('touchstart', function (e) {
        swipeX = e.touches[0].clientX;
      }, { passive: true });
      box.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - swipeX;
        if (Math.abs(dx) > 45) goTo(idx + (dx > 0 ? 1 : -1));
      }, { passive: true });
    }

    /* ── لوحة المفاتيح ── */
    var qSection = document.getElementById('fin-quotes');
    if (qSection) {
      qSection.setAttribute('tabindex', '0');
      qSection.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   { e.preventDefault(); goTo(idx - 1); }
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') { e.preventDefault(); goTo(idx + 1); }
      });
    }

    /* ── مقولات احتياطية ── */
    var FALLBACK = [
      { text: 'العلم في الصغر كالنقش على الحجر.',       author: 'الحكمة العربية' },
      { text: 'من لا يقرأ لا يحكم على ما يجهل.',        author: 'مجهول' },
      { text: 'الكلمة الطيبة صدقة.',                      author: 'الحديث النبوي' },
      { text: 'لا تيأس فإن اليأس بداية الهزيمة.',        author: 'ابن تيمية' },
      { text: 'اقرأ باسم ربك الذي خلق.',                 author: 'القرآن الكريم' }
    ];

    /* ── تحميل quotes.json ── */
    function shuffle(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr;
    }

    function loadQuotes() {
      fetch(CDN_BASE + '/data/quotes.json?v=' + VERSION)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data || !data.length) throw new Error('empty');
          quotes = shuffle(data.slice());
          show(0, false);
          startAuto();
          window._quotesLoaded = true;
        })
        .catch(function () {
          quotes = shuffle(FALLBACK.slice());
          show(0, false);
          startAuto();
        });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadQuotes);
    } else {
      loadQuotes();
    }

    /* تصدير للاستخدام الخارجي */
    window._initQuotes = loadQuotes;
  })();

})();
