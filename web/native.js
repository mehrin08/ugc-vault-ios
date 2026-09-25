/*
 * UGC Vault native features for the iOS app.
 *
 * Add to the Netlify site's index.html, just before </body>:
 *   <script src="/native.js" defer></script>
 *
 * Inside the iOS app this adds reminder notifications, haptics and an
 * offline banner. In a normal browser it does nothing.
 *
 * Options on the script tag: data-bell="off" hides the floating reminders
 * button, data-first-run="off" skips the "turn on reminders" prompt.
 *
 * Task reminders: call these from the web app's own buttons (see
 * WEB-APP-NOTIFICATIONS.md). Every function is safe to call; outside the iOS
 * app window.UGCVault.isApp is false and they resolve to null.
 *
 *   UGCVault.remind({ task: 'Roblox' })                   // asks when
 *   UGCVault.remind({ task: 'Roblox', inMinutes: 30 })
 *   UGCVault.remind({ task: 'Roblox', at: new Date(...) })
 *   UGCVault.startTimer(25, 'Clipping skit')              // or startTimer(null, label) to pick
 *   UGCVault.cancelReminder('Roblox')
 *   UGCVault.listReminders()
 *   UGCVault.requestNotificationPermission()
 *   UGCVault.openReminderSettings()
 *   UGCVault.syncTaskReminders([{ key, title, body, at }])  // replaces the whole set
 *
 * No-code option: add data-ugc-remind="Task name" (and optionally
 * data-ugc-minutes="25") to any button, or data-ugc-reminder-settings to the
 * "phone notifications" button.
 */
(function () {
  'use strict';

  var cap = window.Capacitor;
  var isApp = !!(cap && cap.isNativePlatform && cap.isNativePlatform());

  if (!isApp) {
    var none = function () { return Promise.resolve(null); };
    window.UGCVault = {
      isApp: false, remind: none, startTimer: none, cancelReminder: none,
      listReminders: function () { return Promise.resolve([]); },
      requestNotificationPermission: function () { return Promise.resolve(false); },
      syncTaskReminders: none,
      openReminderSettings: function () {}
    };
    return;
  }

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
    '.uv-sheet-backdrop{position:fixed;inset:0;background:rgba(60,30,30,.35);z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s}',
    '.uv-sheet-backdrop.uv-open{opacity:1}',
    '.uv-sheet{width:100%;max-width:520px;background:#fffaf6;color:#1c1a19;border-radius:20px 20px 0 0;padding:22px 20px calc(20px + env(safe-area-inset-bottom));font:16px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;transform:translateY(100%);transition:transform .25s ease-out;box-sizing:border-box}',
    '.uv-open .uv-sheet{transform:none}',
    '.uv-sheet h2{font-size:21px;margin:0 0 6px;font-weight:700}',
    '.uv-sheet h2 em{font-family:Georgia,serif;color:#8c3a4a}',
    '.uv-sheet p{margin:0 0 16px;color:#7a6660;font-size:15px}',
    '.uv-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-top:1px solid #eedcd3;gap:12px}',
    '.uv-row label{flex:1}',
    '.uv-row small{display:block;color:#7a6660;font-size:13px}',
    '.uv-row input[type=time]{font:inherit;border:0;background:#f6e0d8;border-radius:8px;padding:6px 8px;color:inherit}',
    '.uv-switch{appearance:none;-webkit-appearance:none;width:51px;height:31px;border-radius:16px;background:#eedcd3;position:relative;flex:none;transition:background .2s;margin:0}',
    '.uv-switch:after{content:"";position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.2);transition:transform .2s}',
    '.uv-switch:checked{background:#8c3a4a}',
    '.uv-switch:checked:after{transform:translateX(20px)}',
    '.uv-btn{display:block;width:100%;border:0;border-radius:14px;padding:15px;font:600 17px -apple-system,sans-serif;margin-top:10px;background:#8c3a4a;color:#fff}',
    '.uv-btn.uv-secondary{background:transparent;color:#8c3a4a}',
    '.uv-banner{position:fixed;left:12px;right:12px;top:calc(8px + env(safe-area-inset-top));z-index:2147483001;background:#3a2226;color:#fff;border-radius:12px;padding:10px 14px;font:14px/1.35 -apple-system,sans-serif;text-align:center;transform:translateY(-150%);transition:transform .25s}',
    '.uv-banner.uv-show{transform:none}',
    '.uv-bell{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:2147482999;width:48px;height:48px;border-radius:50%;border:0;background:#8c3a4a;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;padding:0}',
    '.uv-chips{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0 14px}',
    '.uv-chip{border:0;border-radius:12px;padding:13px 8px;font:500 15px -apple-system,sans-serif;background:#f6e0d8;color:#5a2a33}',
    '.uv-custom{display:flex;gap:8px;align-items:center;padding-top:12px;border-top:1px solid #eedcd3}',
    '.uv-custom input{flex:1;min-width:0;font:16px -apple-system,sans-serif;border:0;background:#f6e0d8;border-radius:10px;padding:10px;color:#1c1a19}',
    '.uv-custom .uv-btn{width:auto;margin:0;padding:11px 16px;font-size:15px}',
    '.uv-current{background:#f6e0d8;border-radius:12px;padding:10px 12px;margin:0 0 12px;font-size:14px;color:#5a2a33;display:flex;justify-content:space-between;align-items:center;gap:8px}',
    '.uv-current button{border:0;background:none;color:#8c3a4a;font:600 14px -apple-system,sans-serif;padding:4px}'
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

  // Asks iOS for notification permission the first time; afterwards returns
  // the saved answer without showing the system prompt again.
  function ensurePermission() {
    return call('LocalNotifications', 'checkPermissions').then(function (res) {
      if (res && res.display === 'granted') return true;
      if (res && res.display === 'denied') return false;
      return call('LocalNotifications', 'requestPermissions').then(function (r) {
        return !!(r && r.display === 'granted');
      });
    }).catch(function () { return false; });
  }

  function permissionDeniedBanner() {
    showBanner('Notifications are off. Turn them on in Settings \u2192 UGC Vault \u2192 Notifications.', 5000);
  }

  function enableReminders(s) {
    return ensurePermission().then(function (granted) {
      if (granted) {
        store.set('reminders', s);
        return scheduleReminders(s).then(function () { return true; });
      }
      store.set('reminders', Object.assign({}, s, { daily: false, weekly: false, payments: false }));
      return false;
    });
  }

  function openSheet(buildContent, onDismiss) {
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
      if (e.target === backdrop) {
        close();
        if (onDismiss) onDismiss();
      }
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
            permissionDeniedBanner();
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

  function scriptOption(name) {
    var script = document.querySelector('script[src*="native.js"]');
    return script ? script.getAttribute('data-' + name) : null;
  }

  function firstRunPrompt() {
    if (scriptOption('first-run') === 'off') return;
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
          el('p', { text: 'Get a daily task reminder at 9:00 AM, a Sunday batch-planning nudge and a Friday payment check-in. You can change these anytime from phone notifications.' }),
          on, later
        ].forEach(function (n) { sheet.appendChild(n); });
      });
    }, 2500);
  }

  function addBellButton() {
    if (scriptOption('bell') === 'off') return;
    // The web app has its own reminders button, so no floating bell needed.
    if (document.querySelector('[data-ugc-reminder-settings]')) return;
    var bell = el('button', { className: 'uv-bell', 'aria-label': 'Reminder settings' });
    bell.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
    bell.addEventListener('click', openReminderSettings);
    document.body.appendChild(bell);
  }

  /* ---------- Task reminders and timers ---------- */

  var FIRST_TASK_ID = 100000;

  function taskKey(key) {
    return String(key || '').trim().toLowerCase();
  }

  // iOS notification ids are 32-bit integers, so hash the task key into one.
  function idFor(key) {
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
    return FIRST_TASK_ID + (Math.abs(h) % 2000000000);
  }

  function savedReminders() {
    var all = store.get('tasks', {});
    var now = Date.now();
    Object.keys(all).forEach(function (k) {
      if (new Date(all[k].at).getTime() < now) delete all[k];
    });
    store.set('tasks', all);
    return all;
  }

  function formatWhen(date) {
    var d = new Date(date);
    var time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    var today = new Date();
    var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return time;
    if (d.toDateString() === tomorrow.toDateString()) return 'tomorrow ' + time;
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ' ' + time;
  }

  function toDate(opts) {
    if (opts.inMinutes != null && !isNaN(opts.inMinutes)) {
      return new Date(Date.now() + Number(opts.inMinutes) * 60000);
    }
    if (opts.at != null) {
      var d = opts.at instanceof Date ? opts.at : new Date(opts.at);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  function scheduleAt(opts, when) {
    var key = taskKey(opts.key || opts.task);
    var id = idFor(key);
    if (when.getTime() < Date.now() + 5000) when = new Date(Date.now() + 5000);
    return ensurePermission().then(function (granted) {
      if (!granted) {
        permissionDeniedBanner();
        return null;
      }
      return call('LocalNotifications', 'cancel', { notifications: [{ id: id }] }).catch(function () {}).then(function () {
        return call('LocalNotifications', 'schedule', {
          notifications: [{
            id: id,
            title: opts.title || (opts.timer ? '\u23F0 Time\u2019s up' : '\u2661 ' + opts.task),
            body: opts.body || (opts.timer ? opts.task : 'Time to work on \u201C' + opts.task + '\u201D'),
            schedule: { at: when.toISOString(), allowWhileIdle: true },
            extra: { key: key, task: opts.task, kind: opts.timer ? 'timer' : 'task' }
          }]
        });
      }).then(function () {
        var all = savedReminders();
        all[key] = { id: id, task: opts.task, at: when.toISOString(), kind: opts.timer ? 'timer' : 'task' };
        store.set('tasks', all);
        showBanner((opts.timer ? 'Timer set \u00B7 ends ' : 'Reminder set for ') + formatWhen(when), 2500);
        call('Haptics', 'notification', { type: 'SUCCESS' }).catch(function () {});
        var result = { id: id, key: key, task: opts.task, at: when };
        document.dispatchEvent(new CustomEvent('ugcvault:reminder-set', { detail: result }));
        return result;
      });
    });
  }

  function cancelReminder(keyOrTask) {
    var key = taskKey(keyOrTask);
    var id = idFor(key);
    return call('LocalNotifications', 'cancel', { notifications: [{ id: id }] }).catch(function () {}).then(function () {
      var all = savedReminders();
      delete all[key];
      store.set('tasks', all);
      document.dispatchEvent(new CustomEvent('ugcvault:reminder-cleared', { detail: { key: key } }));
      return true;
    });
  }

  function nextAt(hour) {
    var d = new Date();
    d.setHours(hour, 0, 0, 0);
    if (d.getTime() <= Date.now() + 60000) d.setDate(d.getDate() + 1);
    return d;
  }

  function localInputValue(d) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  // Bottom sheet asking when to remind. Resolves with the scheduled reminder, or null.
  function pickTime(opts) {
    return new Promise(function (resolve) {
      var done = false;
      function finish(v) { if (!done) { done = true; resolve(v); } }
      openSheet(function (sheet, close) {
        var closeAnd = function (v) { close(); finish(v); };
        var existing = savedReminders()[taskKey(opts.key || opts.task)];

        var title = el('h2', {});
        title.appendChild(document.createTextNode(opts.timer ? 'Timer for ' : 'Remind me about '));
        title.appendChild(el('em', { text: opts.task }));
        sheet.appendChild(title);

        if (existing) {
          var remove = el('button', { text: 'Remove' });
          remove.addEventListener('click', function () {
            cancelReminder(opts.key || opts.task).then(function () {
              showBanner('Reminder removed', 1500);
              closeAnd(null);
            });
          });
          sheet.appendChild(el('div', { className: 'uv-current' }, [
            el('span', { text: (existing.kind === 'timer' ? 'Timer ends ' : 'Reminder set for ') + formatWhen(existing.at) }),
            remove
          ]));
        }

        var choices = opts.timer
          ? [['5 min', 5], ['15 min', 15], ['25 min', 25], ['45 min', 45], ['1 hour', 60], ['2 hours', 120]]
          : [['In 15 min', 15], ['In 30 min', 30], ['In 1 hour', 60], ['In 3 hours', 180],
             [nextAt(20).getDate() === new Date().getDate() ? 'Tonight 8 PM' : 'Tomorrow 8 PM', nextAt(20)],
             ['Tomorrow 9 AM', (function () { var d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; })()]];
        var chips = el('div', { className: 'uv-chips' });
        choices.forEach(function (c) {
          var b = el('button', { className: 'uv-chip', text: c[0] });
          b.addEventListener('click', function () {
            var when = typeof c[1] === 'number' ? new Date(Date.now() + c[1] * 60000) : c[1];
            scheduleAt(opts, when).then(closeAnd);
          });
          chips.appendChild(b);
        });
        sheet.appendChild(chips);

        if (!opts.timer) {
          var input = el('input', { type: 'datetime-local', 'aria-label': 'Custom reminder time' });
          input.value = localInputValue(new Date(Date.now() + 60 * 60000));
          input.min = localInputValue(new Date());
          var set = el('button', { className: 'uv-btn', text: 'Set' });
          set.addEventListener('click', function () {
            var when = new Date(input.value);
            if (isNaN(when.getTime())) return;
            scheduleAt(opts, when).then(closeAnd);
          });
          sheet.appendChild(el('div', { className: 'uv-custom' }, [input, set]));
        }

        var cancel = el('button', { className: 'uv-btn uv-secondary', text: 'Cancel' });
        cancel.addEventListener('click', function () { closeAnd(null); });
        sheet.appendChild(cancel);
      }, function () { finish(null); });
    });
  }

  function remind(opts) {
    if (typeof opts === 'string') opts = { task: opts };
    opts = Object.assign({}, opts || {});
    opts.task = String(opts.task || opts.title || 'Task').trim();
    var when = toDate(opts);
    return when ? scheduleAt(opts, when) : pickTime(opts);
  }

  function startTimer(minutes, label) {
    var opts = { task: String(label || 'Focus session').trim(), timer: true, key: 'timer:' + taskKey(label || 'focus') };
    if (minutes != null && !isNaN(minutes)) opts.inMinutes = Number(minutes);
    return remind(opts);
  }

  function listReminders() {
    var all = savedReminders();
    return Promise.resolve(Object.keys(all).map(function (k) {
      return { key: k, id: all[k].id, task: all[k].task, kind: all[k].kind, at: new Date(all[k].at) };
    }));
  }

  // Buttons marked up in the web app: data-ugc-remind / data-ugc-timer / data-ugc-reminder-settings.
  function watchMarkedButtons() {
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('[data-ugc-remind],[data-ugc-timer],[data-ugc-reminder-settings]');
      if (!t) return;
      if (t.hasAttribute('data-ugc-reminder-settings')) {
        openReminderSettings();
        return;
      }
      var minutes = t.getAttribute('data-ugc-minutes');
      var mins = minutes === null || minutes === '' ? null : Number(minutes);
      if (t.hasAttribute('data-ugc-timer')) {
        startTimer(mins, t.getAttribute('data-ugc-timer'));
      } else {
        remind({ task: t.getAttribute('data-ugc-remind'), inMinutes: mins });
      }
    });
  }

  // Tapping a notification opens the app; tell the web app which task it was for.
  function watchNotificationTaps() {
    cap.addListener('LocalNotifications', 'localNotificationActionPerformed', function (action) {
      var extra = (action && action.notification && action.notification.extra) || {};
      if (extra.key) {
        var all = savedReminders();
        delete all[extra.key];
        store.set('tasks', all);
      }
      document.dispatchEvent(new CustomEvent('ugcvault:notification-opened', { detail: extra }));
    });
  }

  /* ---------- Web Notification API inside the app ---------- */

  // iOS web views have no window.Notification, so code written for browsers
  // (Notification.requestPermission(), new Notification(...)) would fail.
  // This makes that code show real iOS notifications instead.
  function polyfillWebNotifications() {
    if ('Notification' in window) return;
    var nextId = 900000;
    function AppNotification(title, options) {
      options = options || {};
      this.title = title;
      this.body = options.body || '';
      this.onclick = null;
      ensurePermission().then(function (granted) {
        if (!granted) return;
        call('LocalNotifications', 'schedule', {
          notifications: [{ id: nextId++, title: String(title), body: String(options.body || ''), extra: { kind: 'web' } }]
        }).catch(function () {});
      });
    }
    AppNotification.permission = 'default';
    AppNotification.requestPermission = function (cb) {
      return ensurePermission().then(function (granted) {
        AppNotification.permission = granted ? 'granted' : 'denied';
        if (typeof cb === 'function') cb(AppNotification.permission);
        return AppNotification.permission;
      });
    };
    AppNotification.prototype.close = function () {};
    AppNotification.prototype.addEventListener = function () {};
    window.Notification = AppNotification;
    call('LocalNotifications', 'checkPermissions').then(function (res) {
      if (res && res.display === 'granted') AppNotification.permission = 'granted';
      else if (res && res.display === 'denied') AppNotification.permission = 'denied';
    }).catch(function () {});
  }

  // The web app hands over every upcoming reminder; this makes the phone's
  // schedule match it exactly. iOS keeps at most 64 pending notifications.
  var MAX_SYNCED = 58;
  function syncTaskReminders(list) {
    list = (list || []).slice(0, MAX_SYNCED);
    return call('LocalNotifications', 'checkPermissions').then(function (res) {
      var granted = res && res.display === 'granted';
      var prev = store.get('synced', []);
      var notifications = [];
      if (granted) {
        list.forEach(function (r) {
          var at = r.at instanceof Date ? r.at : new Date(r.at);
          if (isNaN(at.getTime()) || at.getTime() < Date.now()) return;
          notifications.push({
            id: idFor('sync:' + r.key),
            title: String(r.title || 'Reminder'),
            body: String(r.body || ''),
            schedule: { at: at.toISOString(), allowWhileIdle: true },
            extra: { kind: 'task', key: String(r.key) }
          });
        });
      }
      var next = notifications.map(function (n) { return n.id; });
      var stale = prev.filter(function (id) { return next.indexOf(id) < 0; });
      var cancel = stale.length
        ? call('LocalNotifications', 'cancel', { notifications: stale.map(function (id) { return { id: id }; }) }).catch(function () {})
        : Promise.resolve();
      return cancel.then(function () {
        store.set('synced', next);
        if (!notifications.length) return;
        return call('LocalNotifications', 'schedule', { notifications: notifications });
      });
    }).catch(function () {});
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
    watchMarkedButtons();
    watchNotificationTaps();
    addBellButton();
    watchNetwork();
    watchTaps();
    firstRunPrompt();
    var s = settings();
    if (s) scheduleReminders(s).catch(function () {});
    call('SplashScreen', 'hide').catch(function () {});
    document.dispatchEvent(new CustomEvent('ugcvault:ready'));
  }

  polyfillWebNotifications();

  window.UGCVault = {
    isApp: true,
    remind: remind,
    startTimer: startTimer,
    cancelReminder: cancelReminder,
    listReminders: listReminders,
    requestNotificationPermission: ensurePermission,
    syncTaskReminders: syncTaskReminders,
    openReminderSettings: openReminderSettings
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
