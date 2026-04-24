
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (window.BlogArchContact) return;
  window.BlogArchContact = true;

  /* ══════════════════════════════════════════════════════
     ⚙️ إعدادات البوت — حدّث هنا فقط
  ══════════════════════════════════════════════════════ */
  var TG_TOKEN   = '8584957677:AAEjIrDm--lITFerx3h_4TiludFDt85UEUY';
  var TG_CHAT_ID = '';   /* ← ضع رقم محادثتك هنا (انظر التعليمات أعلاه) */

  /* ══════════════════════════════════════════════════════
     ⏱️ حماية ضد السبام
  ══════════════════════════════════════════════════════ */
  var COOLDOWN_MINUTES = 2;
  var COOLDOWN_KEY     = 'bal_contact_lastSent';
  var MIN_MSG_LENGTH   = 10;
  var MAX_MSG_LENGTH   = 4000;

  /* ══════════════════════════════════════════════════════
     🛠️ Helpers
  ══════════════════════════════════════════════════════ */
  function tgEscape(s) {
    /* Telegram MarkdownV1: escape only structural chars */
    return String(s || '')
      .replace(/[*_`\[\]]/g, function (m) { return '\\' + m; })
      .slice(0, MAX_MSG_LENGTH);
  }

  function checkCooldown() {
    try {
      var last = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
      var diff = Date.now() - last;
      var wait = (COOLDOWN_MINUTES * 60 * 1000) - diff;
      if (wait > 0) {
        var sec = Math.ceil(wait / 1000);
        return 'يرجى الانتظار ' + sec + ' ثانية قبل إرسال رسالة أخرى.';
      }
    } catch (e) { /* localStorage مغلق */ }
    return null;
  }

  function setCooldown() {
    try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch (e) {}
  }

  function injectHoneypot(form) {
    if (form.querySelector('[name="_hp"]')) return;
    var hp = document.createElement('input');
    hp.type = 'text';
    hp.name = '_hp';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
    form.appendChild(hp);
  }

  function buildMessage(data, source) {
    var lines = [
      '📨 *رسالة جديدة من المدونة*',
      '',
      '🏷️ المصدر: _' + source + '_',
      '👤 الاسم: *' + tgEscape(data.name)  + '*',
      '📧 البريد: ' + tgEscape(data.email),
    ];
    if (data.subject) lines.push('📌 الموضوع: ' + tgEscape(data.subject));
    lines.push('');
    lines.push('💬 *الرسالة:*');
    lines.push(tgEscape(data.message));
    lines.push('');
    lines.push('🕒 ' + new Date().toLocaleString('ar-EG'));
    if (document.referrer) lines.push('🔗 ' + tgEscape(document.referrer));
    return lines.join('\n');
  }

  function setStatus(stEl, text, kind) {
    if (!stEl) return;
    stEl.textContent  = text;
    stEl.className    = 'contact-note contact-status-' + (kind || 'info');
    if (kind === 'success' || kind === 'error') {
      setTimeout(function () {
        if (stEl.textContent === text) {
          stEl.textContent = '';
          stEl.className   = 'contact-note';
        }
      }, 6000);
    }
  }

  function setBtnState(btn, busy, busyHTML, idleHTML) {
    if (!btn) return;
    btn.disabled  = busy;
    btn.innerHTML = busy ? busyHTML : idleHTML;
  }

  /* ══════════════════════════════════════════════════════
     📡 إرسال الرسالة لـ Telegram
  ══════════════════════════════════════════════════════ */
  function sendToTelegram(text) {
    if (!TG_CHAT_ID) {
      return Promise.reject(new Error('chat_id غير معرّف في blogarch.contact.js'));
    }
    var url = 'https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage';
    return fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        chat_id:                  TG_CHAT_ID,
        text:                     text,
        parse_mode:               'Markdown',
        disable_web_page_preview: true
      })
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!j.ok) throw new Error(j.description || 'Telegram error');
        return j;
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     📝 ربط نموذج عام (يُعاد استخدامه)
  ══════════════════════════════════════════════════════ */
  function bindForm(form, opts) {
    if (!form || form.dataset.balBound === '1') return;
    form.dataset.balBound = '1';

    injectHoneypot(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn       = opts.btn   ? document.getElementById(opts.btn)   : form.querySelector('button[type="submit"]');
      var stEl      = opts.status? document.getElementById(opts.status): null;
      var idleHTML  = btn ? btn.innerHTML : '';
      var busyHTML  = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

      /* 1) honeypot */
      var hp = form.querySelector('[name="_hp"]');
      if (hp && hp.value) {
        setStatus(stEl, 'تم رفض الإرسال.', 'error');
        return;
      }

      /* 2) cooldown */
      var cd = checkCooldown();
      if (cd) { setStatus(stEl, cd, 'error'); return; }

      /* 3) جمع البيانات */
      var data = {
        name:    (form.elements['name']    || {}).value || '',
        email:   (form.elements['email']   || {}).value || '',
        subject: (form.elements['subject'] || {}).value || '',
        message: (form.elements['message'] || {}).value || ''
      };

      /* 4) validation */
      if (!data.name.trim() || !data.email.trim()) {
        setStatus(stEl, 'الاسم والبريد مطلوبان.', 'error'); return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        setStatus(stEl, 'البريد الإلكتروني غير صالح.', 'error'); return;
      }
      if (data.message.trim().length < MIN_MSG_LENGTH) {
        setStatus(stEl, 'الرسالة قصيرة جداً (الحد الأدنى ' + MIN_MSG_LENGTH + ' أحرف).', 'error'); return;
      }

      /* 5) إرسال */
      setBtnState(btn, true, busyHTML, idleHTML);
      setStatus(stEl, 'جاري الإرسال...', 'info');

      var msg = buildMessage(data, opts.source || form.id);

      sendToTelegram(msg)
        .then(function () {
          setStatus(stEl, '✓ تم الإرسال بنجاح، شكراً لك!', 'success');
          form.reset();
          setCooldown();
        })
        .catch(function (err) {
          console.error('[BlogArchContact]', err);
          setStatus(stEl, '✗ تعذّر الإرسال — حاول لاحقاً.', 'error');
        })
        .then(function () {
          setBtnState(btn, false, busyHTML, idleHTML);
        });
    });
  }

  /* ══════════════════════════════════════════════════════
     🚀 INIT — يربط جميع النماذج المعروفة
  ══════════════════════════════════════════════════════ */
  function init() {
    /* نموذج التواصل الرئيسي */
    bindForm(document.getElementById('contact-form'), {
      btn:    'contact-btn',
      status: 'contact-status',
      source: 'نموذج التواصل'
    });

    /* نموذج النشرة البريدية / الـ FAB */
    bindForm(document.getElementById('fin-mc-form'), {
      source: 'نشرة بريدية'
    });

    if (!TG_CHAT_ID) {
      console.warn('[BlogArchContact] ⚠️ TG_CHAT_ID فارغ — لن يتم الإرسال. حدّث الملف.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* تصدير API للاستخدام الخارجي */
  window.BlogArch = window.BlogArch || {};
  window.BlogArch.sendContact = sendToTelegram;

})();