# Lab — small browser-feature experiments, each a live demo page

## Index
- [notifications](notifications/) — web notifications from a plain Android Chrome tab: demo cards, a [phone checklist](notifications/phone/), a [report](notifications/report/)
- [WorkerHost](WorkerHost/WorkerHost.js) — registers `/sw.js`, shows its state, relays its messages
- [NotificationManager](NotificationManager/NotificationManager.js) — permission, `maxActions`, `showNotification`, `getNotifications`; [NotificationHandle](NotificationManager/NotificationHandle.js) is one tag's slot
- [EventLog](EventLog/EventLog.js) — the shared log every object writes to; [LiveView](LiveView/LiveView.js) — the base `Lab` class and View that redraw on `change`

## Use
Each lab class extends `Lab` and has a `static View extends LiveView`. `host.view`, `manager.view`, `log.view` render live state.

## Watch out
- Names avoid native ones (`Notification`, `ServiceWorker`). `new Notification()` is never used, only `registration.showNotification()`.
- `public/sw.js` is the worker (it must sit at the site root to control `/`). No caching, no fetch handler.
- Push needs `Server/plugins/Push.js` running (dev server only); subscriptions are kept in memory.
- Decision: lab lives in `public/framework/lab/`; the alternative was `public/lab/`.
