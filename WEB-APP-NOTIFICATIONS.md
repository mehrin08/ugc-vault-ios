# Wiring the tasks-tab buttons to iPhone notifications

**Short answer: yes, part of this lives in your web app's code on Netlify.**
The alarm ⏰, "set a timer" and "phone notifications" buttons are part of your website, so the website decides what happens when you tap them.
The native side is already done in this repo: the plugin is installed, permissions are handled, and `native.js` does the scheduling.
All your web code has to do is tell `native.js` which task was tapped.

## Step 1: load native.js (once)

In your site's `index.html`, just before `</body>`:

```html
<script src="/native.js" defer></script>
```

Copy `netlify-pages/native.js` and `netlify-pages/sw.js` next to your `index.html` and deploy.

## Step 2: connect the buttons

Pick **one** of these two options.

### Option A: no JavaScript, just add attributes (easiest)

Add an attribute to each button in your tasks-tab HTML/JSX:

| Button | Add this | What happens in the app |
|---|---|---|
| ⏰ next to a task | `data-ugc-remind="Roblox"` (the task's name) | Opens a sheet: *In 15 min / 30 min / 1 hour / 3 hours / Tonight 8 PM / Tomorrow 9 AM / pick a date & time* |
| ⏰ with a fixed time | `data-ugc-remind="Roblox" data-ugc-minutes="30"` | Schedules straight away, 30 min from now |
| "set a timer" on a brand card | `data-ugc-timer="Higgsfield AI"` | Sheet with *5 / 15 / 25 / 45 min / 1 h / 2 h*, then a "⏰ Time's up" notification |
| "phone notifications" | `data-ugc-reminder-settings` | Opens the daily/weekly/payment reminder settings (and hides the floating bell) |

React/JSX example, where your task list loops over tasks:

```jsx
<button className="alarm-btn" data-ugc-remind={task.name}>⏰</button>
<button className="timer-btn" data-ugc-timer={brand.name}>set a timer</button>
<button className="notif-btn" data-ugc-reminder-settings>🔔 phone notifications</button>
```

Plain HTML:

```html
<button class="alarm-btn" data-ugc-remind="Roblox">⏰</button>
```

Your existing click handlers still run, so nothing else in your app breaks.

### Option B: call it from your existing click handlers

If a button already has an `onClick` (for example, your timer already lets someone pick minutes), call the API from it:

```js
// Ask when (shows the picker sheet)
window.UGCVault?.remind({ task: task.name });

// You already know when
window.UGCVault?.remind({ task: task.name, inMinutes: 30 });
window.UGCVault?.remind({ task: task.name, at: task.dueDate });   // Date or ISO string

// Timers
window.UGCVault?.startTimer(minutes, brand.name);   // minutes = null → picker

// Remove
window.UGCVault?.cancelReminder(task.name);

// Settings sheet / permission
window.UGCVault?.openReminderSettings();
window.UGCVault?.requestNotificationPermission();   // → Promise<true|false>
```

Every call returns a Promise. On a normal website (not the app) `window.UGCVault.isApp` is `false` and the calls do nothing, so your web version keeps working as it does now.

To light up the ⏰ icon when a reminder is set:

```js
document.addEventListener('ugcvault:reminder-set', (e) => {
  // e.detail = { key, task, at, id }
});
document.addEventListener('ugcvault:reminder-cleared', (e) => { /* e.detail.key */ });
document.addEventListener('ugcvault:notification-opened', (e) => {
  // User tapped a notification. e.detail = { key, task, kind: 'task' | 'timer' }
  // e.g. switch to the tasks tab and highlight that task
});

const reminders = await window.UGCVault?.listReminders();   // [{ task, at, kind }, ...]
```

## Permissions

The first time someone taps a reminder button, iOS shows its "Allow notifications?" prompt. This happens on first use, not at launch.
If they tap "Don't Allow", the app shows a banner explaining how to turn them on in Settings.

## If your code already uses the browser Notification API

The iPhone app has no `window.Notification`. `native.js` adds one that shows real iOS notifications, so calls like `Notification.requestPermission()` and `new Notification('Title', { body })` work in the app with no changes.
Note: a web `setTimeout` stops when the app is in the background. Use `UGCVault.remind({ ..., at })` for anything in the future.

## Want me to do it?

Send me your web app's source (a GitHub repo, or zip the project folder and upload it) and I'll add the attributes to the right buttons.
