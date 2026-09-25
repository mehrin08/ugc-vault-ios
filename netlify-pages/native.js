/*
 * UGC Vault native features for the iOS app.
 *
 * Add to the Netlify site's index.html, just before </body>:
 *   <script src="/native.js" defer></script>
 *
 * Inside the iOS app this adds reminder notifications, haptics, an offline
 * banner and offline caching. In a normal browser it only registers the
 * offline cache and does nothing else.
 */
(function () {
  'use strict';

  var cap = window.Capacitor;
  var isApp = !!(cap && cap.isNativePlatform && cap.isNativePlatform());

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  if (!isApp) return;

  function call(plugin, method, options) {
    return cap.nativePromise(plugin, method, options || {});
  }

  var store = {
    get: function (key, fallback) {
      try {
        var v = localStorage.getItem('ugcvault.native.' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem('ugcvault.native.' + key, JSON.stringify(value));
      } catch (e) {}
    }
  };

  /* ---------- Styles ---------- */

  var css = [
    '.uv-sheet-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s}',
    '.uv-sheet-backdrop.uv-open{opacity:1}',
    '.uv-sheet{width:100%;max-width:520px;background:#fff;color:#1d1d1f;border-radius:20px 20px 0 0;padding:22px 20px calc(20px + env(safe-area-inset-bottom));font:16px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;transform:translateY(100%);transition:transform .25s ease-out;box-sizing:border-box}',
    '.uv-open .uv-sheet{transform:none}',
    '.uv-sheet h2{font-size:20px;margin:0 0 6px;font-weight:700}',
    '.uv-sheet p{margin:0 0 16px;color:#6e6e73;font-size:15px}',
    '.uv-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-top:1px solid #e5e5ea;gap:12px}',
    '.uv-row label{flex:1}',
    '.uv-row small{display:block;color:#6e6e73;font-size:13px}',
    '.uv-row input[type=time]{font:inherit;border:0;background:#f2f2f7;border-radius:8px;padding:6px 8px;color:inherit}',
    '.uv-switch{appearance:none;-webkit-appearance:none;width:51px;height:31px;border-radius:16px;background:#e5e5ea;position:relative;flex:none;transition:background .2s;margin:0}',
    '.uv-switch:after{content:"";position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.2);transition:transform .2s}',
    '.uv-switch:checked{background:#34c759}',
    '.uv-switch:checked:after{transform:translateX(20px)}',
    '.uv-btn{display:block;width:100%;border:0;border-radius:14px;padding:15px;font:600 17px -apple-system,sans-serif;margin-top:10px;background:#ff5a5f;color:#fff}',
    '.uv-btn.uv-secondary{background:transparent;color:#ff5a5f}',
    '.uv-banner{position:fixed;left:12px;right:12px;top:calc(8px + env(safe-area-inset-top));z-index:2147483001;background:#1d1d1f;color:#fff;border-radius:12px;padding:10px 14px;font:14px/1.35 -apple-system,sans-serif;text-align:center;transform:translateY(-150%);transition:transform .25s}',
    '.uv-banner.uv-show{transform:none}',
    '.uv-bell{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:2147482999;width:48px;height:48px;border-radius:50%;border:0;background:#ff5a5f;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;padding:0}',
    '@media (prefers-color-scheme:dark){.uv-sheet{background:#1c1c1e;color:#f5f5f7}.uv-sheet p,.uv-row small{color:#98989d}.uv-row{border-color:#38383a}.uv-row input[type=time]{background:#2c2c2e}.uv-switch{background:#39393d}}'
  ].join('');

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------- Reminders (local notifications) ---------- */

  var DAILY_ID = 1001;
  var WEEKLY_ID = 1002;
  var PAYMENT_ID = 1003;

  var defaults = { daily: true, dailyTime: '09:00', weekly: true, payments: true };

  function settings() {
    var s = store.get('reminders', null);
    return s ? Object.assign({}, defaults, s) : null;
  }

  function parseTime(t) {
    var parts = (t || '09:00').split(':');
    return { hour: parseInt(parts[0], 10) || 0, minute: parseInt(parts[1], 10) || 0 };
  }

  function scheduleReminders(s) {
    return call('LocalNotifications', 'cancel', {
      notifications: [{ id: DAILY_ID }, { id: WEEKLY_ID }, { id: PAYMENT_ID }]
    }).catch(function () {}).then(function () {
      var list = [];
      if (s.daily) {
        var t = parseTime(s.dailyTime);
        list.push({
          id: DAILY_ID,
          title: "Today's UGC tasks",
          body: 'Check your batch list and knock out today\u2019s deliverables.',
          schedule: { on: { hour: t.hour, minute: t.minute }, allowWhileIdle: true }
        });
      }
      if (s.weekly) {
        list.push({
          id: WEEKLY_ID,
          title: 'Plan your content batch',
          body: 'Set up this week\u2019s batching checklist by brand.',
          schedule: { on: { weekday: 1, hour: 18, minute: 0 }, allowWhileIdle: true }
        });
      }
      if (s.payments) {
        list.push({
          id: PAYMENT_ID,
          title: 'Payment check-in',
          body: 'Any invoices still awaiting payment? Follow up with your brands.',
          schedule: { on: { weekday: 6, hour: 10, minute: 0 }, allowWhileIdle: true }
        });
      }
      if (!list.length) return;
      return call('LocalNotifications', 'schedule', { notifications: list });
    });
  }

  function enableReminders(s) {
    return call('LocalNotifications', 'requestPermissions').then(function (res) {
      if (res && res.display === 'granted') {
        store.set('reminders', s);
        return scheduleReminders(s).then(function () { return true; });
      }
      store.set('reminders', Object.assign({}, s, { daily: false, weekly: false, payments: false }));
      return false;
    });
  }

  function openSheet(buildContent) {
    var backdrop = document.createElement('div');
    backdrop.className = 'uv-sheet-backdrop';
    var sheet = document.createElement('div');
    sheet.className = 'uv-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    backdrop.appendChild(sheet);

    function close() {
      backdrop.classList.remove('uv-open');
      setTimeout(function () { backdrop.remove(); }, 250);
    }
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) close();
    });

    buildContent(sheet, close);
    document.body.appendChild(backdrop);
    requestAnimationFrame(function () { backdrop.classList.add('uv-open'); });
  }

  function el(tag, props, children) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'text') node.textContent = props[k];
      else if (k === 'className') node.className = props[k];
      else node.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  function switchRow(title, detail, checked, extra) {
    var input = el('input', { type: 'checkbox', className: 'uv-switch', 'aria-label': title });
    input.checked = checked;
    var label = el('label', {}, [document.createTextNode(title), el('small', { text: detail })]);
    var row = el('div', { className: 'uv-row' }, [label].concat(extra ? [extra] : []).concat([input]));
    return { row: row, input: input };
  }

  function openReminderSettings() {
    var current = settings() || defaults;
    openSheet(function (sheet, close) {
      var time = el('input', { type: 'time', 'aria-label': 'Daily reminder time' });
      time.value = current.dailyTime;
      var daily = switchRow('Daily tasks', 'Every day', current.daily, time);
      var weekly = switchRow('Weekly batch plan', 'Sundays at 6:00 PM', current.weekly);
      var payments = switchRow('Payment check-in', 'Fridays at 10:00 AM', current.payments);
      var save = el('button', { className: 'uv-btn', text: 'Save' });
      var cancel = el('button', { className: 'uv-btn uv-secondary', text: 'Cancel' });

      save.addEventListener('click', function () {
        var s = {
          daily: daily.input.checked,
          dailyTime: time.value || '09:00',
          weekly: weekly.input.checked,
          payments: payments.input.checked
        };
        enableReminders(s).then(function (ok) {
          close();
          if (!ok && (s.daily || s.weekly || s.payments)) {
            showBanner('Notifications are off. Turn them on in Settings \u2192 UGC Vault \u2192 Notifications.', 5000);
          } else {
            showBanner('Reminders saved', 2000);
          }
        });
      });
      cancel.addEventListener('click', close);

      [
        el('h2', { text: 'Reminders' }),
        el('p', { text: 'Gentle nudges to keep your batches and payments on track. Everything stays on your iPhone.' }),
        daily.row, weekly.row, payments.row, save, cancel
      ].forEach(function (n) { sheet.appendChild(n); });
    });
  }

  function firstRunPrompt() {
    if (settings() || store.get('promptShown', false)) return;
    setTimeout(function () {
      store.set('promptShown', true);
      openSheet(function (sheet, close) {
        var on = el('button', { className: 'uv-btn', text: 'Turn on reminders' });
        var later = el('button', { className: 'uv-btn uv-secondary', text: 'Not now' });
        on.addEventListener('click', function () {
          enableReminders(defaults).then(close);
        });
        later.addEventListener('click', function () {
          store.set('reminders', { daily: false, weekly: false, payments: false });
          close();
        });
        [
          el('h2', { text: 'Never miss a batch day' }),
          el('p', { text: 'Get a daily task reminder at 9:00 AM, a Sunday batch-planning nudge and a Friday payment check-in. You can change these anytime with the bell button.' }),
          on, later
        ].forEach(function (n) { sheet.appendChild(n); });
      });
    }, 2500);
  }

  function addBellButton() {
    var script = document.currentScript || document.querySelector('script[src*="native.js"]');
    if (script && script.getAttribute('data-bell') === 'off') return;
    var bell = el('button', { className: 'uv-bell', 'aria-label': 'Reminder settings' });
    bell.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
    bell.addEventListener('click', openReminderSettings);
    document.body.appendChild(bell);
  }

  /* ---------- Offline banner ---------- */

  var bannerEl;
  var bannerTimer;
  function showBanner(text, ms) {
    if (!bannerEl) {
      bannerEl = el('div', { className: 'uv-banner', role: 'status' });
      document.body.appendChild(bannerEl);
    }
    bannerEl.textContent = text;
    bannerEl.classList.add('uv-show');
    clearTimeout(bannerTimer);
    if (ms) bannerTimer = setTimeout(hideBanner, ms);
  }
  function hideBanner() {
    if (bannerEl) bannerEl.classList.remove('uv-show');
  }

  function watchNetwork() {
    cap.addListener('Network', 'networkStatusChange', function (status) {
      if (status && status.connected === false) {
        showBanner('You\u2019re offline. UGC Vault keeps working; changes stay on this iPhone.');
      } else {
        showBanner('Back online', 1500);
      }
    });
  }

  /* ---------- Haptics ---------- */

  function watchTaps() {
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('input[type=checkbox],[role=checkbox],button,[role=button]');
      if (!t || t.closest('.uv-sheet')) return;
      var isCheck = t.matches('input[type=checkbox],[role=checkbox]');
      var checked = t.checked === true || t.getAttribute('aria-checked') === 'true';
      if (isCheck && checked) {
        call('Haptics', 'notification', { type: 'SUCCESS' }).catch(function () {});
      } else {
        call('Haptics', 'impact', { style: 'LIGHT' }).catch(function () {});
      }
    }, true);
  }

  /* ---------- Start ---------- */

  function start() {
    injectStyles();
    addBellButton();
    watchNetwork();
    watchTaps();
    firstRunPrompt();
    var s = settings();
    if (s) scheduleReminders(s).catch(function () {});
    call('SplashScreen', 'hide').catch(function () {});
  }

  window.UGCVault = window.UGCVault || {};
  window.UGCVault.openReminderSettings = openReminderSettings;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
