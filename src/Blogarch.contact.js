(function () {
  'use strict';

  if (window.BlogArchContact) return;
  window.BlogArchContact = true;

  var TG_TOKEN   = '8584957677:AAEjIrDm--lITFerx3h_4TiludFDt85UEUY';
  var TG_CHAT_ID = '1719616821';

  var COOLDOWN_MINUTES  = 2;
  var COOLDOWN_KEY      = 'bal_contact_lastSent';
  var MIN_MSG_LENGTH    = 10;
  var MAX_MSG_LENGTH    = 4000;
  var MAX_SUBMIT_TRIES  = 5;
  var TRIES_KEY         = 'bal_contact_tries';
  var TRIES_RESET_KEY   = 'bal_contact_tries_ts';
  var TRIES_WINDOW_MS   = 30 * 60 * 1000;

  function sanitize(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  function tgEscape(s) {
    return String(s || '')
      .replace(/[*_`\[\]]/g, function (m) { return '\\' + m; })
      .slice(0, MAX_MSG_LENGTH);
  }

  function isValidName(name) {
    var trimmed = name.trim();
    if (trimmed.length < 2) return false;
    return /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z\s.\-']{2,60}$/.test(trimmed);
  }

  function isValidEmail(email) {
    var trimmed = email.trim();
    if (trimmed.length > 254) return false;
    var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,10}$/;
    if (!emailRegex.test(trimmed)) return false;
    var parts = trimmed.split('@');
    if (parts.length !== 2) return false;
    var domain = parts[1];
    if (domain.indexOf('.') === -1) return false;
    var blockedDomains = ['test.com', 'test.test', 'example.com', 'fake.com', 'noreply.com'];
    for (var i = 0; i < blockedDomains.length; i++) {
      if (domain.toLowerCase() === blockedDomains[i]) return false;
    }
    return true;
  }

  function isValidMessage(msg) {
    var trimmed = msg.trim();
    if (trimmed.length < MIN_MSG_LENGTH) return false;
    if (trimmed.length > MAX_MSG_LENGTH) return false;
    if (/^(.)\1{9,}$/.test(trimmed)) return false;
    if (/^https?:\/\/\S+$/.test(trimmed)) return false;
    return true;
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
    } catch (e) {}
    return null;
  }

  function setCooldown() {
    try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch (e) {}
  }

  function checkRateLimit() {
    try {
      var now         = Date.now();
      var windowStart = parseInt(localStorage.getItem(TRIES_RESET_KEY) || '0', 10);
      var tries       = parseInt(localStorage.getItem(TRIES_KEY)       || '0', 10);
      if (now - windowStart > TRIES_WINDOW_MS) {
        localStorage.setItem(TRIES_RESET_KEY, String(now));
        localStorage.setItem(TRIES_KEY, '0');
        tries = 0;
      }
      if (tries >= MAX_SUBMIT_TRIES) {
        return 'لقد تجاوزت الحد المسموح به من المحاولات. حاول مجدداً بعد 30 دقيقة.';
      }
    } catch (e) {}
    return null;
  }

  function incrementTries() {
    try {
      var tries = parseInt(localStorage.getItem(TRIES_KEY) || '0', 10);
      localStorage.setItem(TRIES_KEY, String(tries + 1));
    } catch (e) {}
  }

  function injectHoneypot(form) {
    if (form.querySelector('[name="_hp"]')) return;
    var hp = document.createElement('input');
    hp.type         = 'text';
    hp.name         = '_hp';
    hp.tabIndex     = -1;
    hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
    form.appendChild(hp);
  }

  function getFormattedDateTime() {
    var now = new Date();
    var localDateTime = now.toLocaleString('ar-EG', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
      hour:    '2-digit',
      minute:  '2-digit',
      second:  '2-digit',
      hour12:  true
    });
    var timezone = (Intl && Intl.DateTimeFormat)
      ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'غير محددة')
      : 'غير متاحة';
    var offsetMin   = -now.getTimezoneOffset();
    var offsetSign  = offsetMin >= 0 ? '+' : '-';
    var offsetHours = Math.floor(Math.abs(offsetMin) / 60);
    var offsetMins  = Math.abs(offsetMin) % 60;
    var offsetStr   = 'UTC' + offsetSign + offsetHours + (offsetMins ? ':' + String(offsetMins).padStart(2, '0') : '');
    return {
      local:    localDateTime,
      timezone: timezone,
      offset:   offsetStr,
      iso:      now.toISOString()
    };
  }

  function buildMessage(data, source) {
    var dt = getFormattedDateTime();
    var lines = [
      '📨 *رسالة جديدة من المدونة*',
      '━━━━━━━━━━━━━━━━━━━━━━',
      '',
      '🏷️ المصدر: _' + tgEscape(source)   + '_',
      '👤 الاسم: *'  + tgEscape(data.name) + '*',
      '📧 البريد: '  + tgEscape(data.email),
    ];
    if (data.subject) lines.push('📌 الموضوع: ' + tgEscape(data.subject));
    lines.push('');
    lines.push('💬 *الرسالة:*');
    lines.push(tgEscape(data.message));
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('🕐 *معلومات الوقت والتاريخ*');
    lines.push('');
    lines.push('📅 التاريخ والوقت: ' + dt.local);
    lines.push('🌍 المنطقة الزمنية: ' + tgEscape(dt.timezone));
    lines.push('⏰ الفارق عن UTC: '   + dt.offset);
    lines.push('🔧 ISO 8601: `'        + dt.iso + '`');
    lines.push('');
    if (document.referrer) lines.push('🔗 مصدر الزيارة: ' + tgEscape(document.referrer));
    var userAgent = navigator.userAgent || '';
    if (userAgent) {
      var browser = 'غير محدد';
      if      (/Edg\//i.test(userAgent))     browser = 'Microsoft Edge';
      else if (/Chrome\//i.test(userAgent))  browser = 'Google Chrome';
      else if (/Firefox\//i.test(userAgent)) browser = 'Mozilla Firefox';
      else if (/Safari\//i.test(userAgent))  browser = 'Apple Safari';
      else if (/OPR\//i.test(userAgent))     browser = 'Opera';
      var device = /Mobi|Android|iPhone|iPad/i.test(userAgent) ? '📱 جوال' : '🖥️ حاسوب';
      lines.push('🌐 المتصفح: ' + browser);
      lines.push('💻 الجهاز: '  + device);
    }
    lines.push('');
    lines.push('🌐 الصفحة الحالية: ' + tgEscape(window.location.href));
    return lines.join('\n');
  }

  function setStatus(stEl, text, kind) {
    if (!stEl) return;
    stEl.textContent = text;
    stEl.className   = 'contact-note contact-status-' + (kind || 'info');
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

  function bindForm(form, opts) {
    if (!form || form.dataset.balBound === '1') return;
    form.dataset.balBound = '1';

    injectHoneypot(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn      = opts.btn    ? document.getElementById(opts.btn)    : form.querySelector('button[type="submit"]');
      var stEl     = opts.status ? document.getElementById(opts.status) : null;
      var idleHTML = btn ? btn.innerHTML : '';
      var busyHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

      var hp = form.querySelector('[name="_hp"]');
      if (hp && hp.value.trim() !== '') {
        setStatus(stEl, '✓ تم الإرسال بنجاح، شكراً لك!', 'success');
        form.reset();
        return;
      }

      var rl = checkRateLimit();
      if (rl) { setStatus(stEl, rl, 'error'); return; }

      var cd = checkCooldown();
      if (cd) { setStatus(stEl, cd, 'error'); return; }

      var rawData = {
        name:    (form.elements['name']    || {}).value || '',
        email:   (form.elements['email']   || {}).value || '',
        subject: (form.elements['subject'] || {}).value || '',
        message: (form.elements['message'] || {}).value || ''
      };

      var data = {
        name:    sanitize(rawData.name),
        email:   rawData.email.trim().toLowerCase(),
        subject: sanitize(rawData.subject),
        message: sanitize(rawData.message)
      };

      if (!data.name.trim()) {
        setStatus(stEl, 'الاسم مطلوب.', 'error'); return;
      }
      if (!isValidName(rawData.name)) {
        setStatus(stEl, 'الاسم يجب أن يحتوي على حروف فقط، بدون أرقام أو رموز.', 'error'); return;
      }

      if (!data.email) {
        setStatus(stEl, 'البريد الإلكتروني مطلوب.', 'error'); return;
      }
      if (!isValidEmail(rawData.email)) {
        setStatus(stEl, 'البريد الإلكتروني غير صالح أو غير مكتمل. مثال: name@domain.com', 'error'); return;
      }

      if (!isValidMessage(rawData.message)) {
        if (rawData.message.trim().length < MIN_MSG_LENGTH) {
          setStatus(stEl, 'الرسالة قصيرة جداً (الحد الأدنى ' + MIN_MSG_LENGTH + ' أحرف).', 'error');
        } else if (rawData.message.trim().length > MAX_MSG_LENGTH) {
          setStatus(stEl, 'الرسالة طويلة جداً (الحد الأقصى ' + MAX_MSG_LENGTH + ' حرف).', 'error');
        } else {
          setStatus(stEl, 'محتوى الرسالة غير مقبول، يرجى كتابة رسالة حقيقية.', 'error');
        }
        return;
      }

      incrementTries();
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

  function init() {
    bindForm(document.getElementById('contact-form'), {
      btn:    'contact-btn',
      status: 'contact-status',
      source: 'نموذج التواصل'
    });
    bindForm(document.getElementById('fin-mc-form'), {
      source: 'نشرة بريدية'
    });
    if (!TG_CHAT_ID) {
      console.warn('[BlogArchContact] TG_CHAT_ID is not defined.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BlogArch             = window.BlogArch || {};
  window.BlogArch.sendContact = sendToTelegram;

})();
