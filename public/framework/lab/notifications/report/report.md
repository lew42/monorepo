# Notifications Lab: report

**Short version:** a plain Chrome tab (no PWA) can show notifications through a service worker, and the demo is built and tested in a desktop browser. What a real Android phone does is **yours to test**: open the [phone checklist](../phone/), then the [demo](../). Fill the "Android result" column from what you see.

## What was built
- `sw.js` at the site root (thin: tells the page about clicks and closes, focuses or opens a tab, shows pushes).
- Three classes in `framework/lab/`: [`WorkerHost`](/framework/lab/WorkerHost/WorkerHost.js), [`NotificationManager`](/framework/lab/NotificationManager/NotificationManager.js), [`NotificationHandle`](/framework/lab/NotificationManager/NotificationHandle.js), plus a shared [`EventLog`](/framework/lab/EventLog/EventLog.js). Each has a static `View` that redraws whenever the object changes.
- Push: a small dev-server route (`Server/plugins/Push.js`, node crypto only, no new dependency).

## Results

| Demo | Checked on desktop Chromium (headless) | Android result |
|---|---|---|
| Register worker, `type: 'module'`, scope `/` | works, state `active` | ? |
| Permission | granted by the test; the real prompt is yours | ? |
| `new Notification()` | **did not throw** on desktop. The Android claim (it throws) is untested: press "Probe" on the phone | ? |
| All options at once | accepted, shows | ? (icon, badge, image, vibrate, buttons) |
| `maxActions` | reports **2** on desktop. Sent 6 buttons: no error, the notification simply kept **2** (its `actions` list is cut at show time) | ? |
| Long body | accepted | ? (where it is cut, expanded view) |
| Different tags vs same tag | 2 different tags gave 2 notifications; the same tag twice gave 1 (replaced) | ? |
| Progress bar (`▓▓▓░░ 3/5`) via repeated `set()` | works; each step is a new show under the same tag | ? (flicker? sound each step? `silent: true` is used) |
| Question chain | code path tested; the answer arrives from the worker as an `action` event | ? |
| Tap with tab focused / background / closed | worker code written; not testable headless | ? |
| Sound and vibration | cannot be observed headless | ? |
| Push end to end | key, subscribe route and encryption are tested; headless Chromium cannot subscribe ("permission denied" from its push service), so the full path needs your phone | ? |

## Setup steps that worked
Written in the [phone checklist](../phone/). Short: LAN IP and port, then `chrome://flags/#unsafely-treat-insecure-origin-as-secure` with that exact `http://IP:port`, relaunch, open `/framework/lab/notifications/`, check `isSecureContext` says true.

If it does not: the fallback is `mkcert` (a trusted `https://` address for the PC), described in the [mobile page](/framework/dev/mobile/).

## Limits (from the platform, not tested here)
- Notification **buttons only**: no checkboxes, text inputs or sliders in Chrome on Android. Actions can carry a `title` and an `icon`, nothing else.
- A notification cannot be edited, so "update" means showing again under the same tag. With `renotify: false` it is silent; with `renotify: true` it alerts again.
- Only so many buttons show (`maxActions`), and the rest are dropped without an error.
- Whether the page's sound/vibrate choice wins is decided by Android's per-site and per-channel settings.

## Things that were surprising
- Extra buttons are dropped silently, and `getNotifications()` shows only the kept ones: a cheap way to see the limit.
- The click of a notification with **no tab open** cannot be passed to the new tab by message (the tab does not exist yet), so the worker puts it in the URL (`?clicked=tag&action=x`) and the page logs it.
- `skipWaiting()` plus `clients.claim()` means the worker controls the page the first time, with no reload.

## Next step (not built): page lifecycle
Notes from the specs, **not tested yet**. Plan a small lab that logs each in the shared event log while you switch apps and close the tab:
- `visibilitychange` (hidden) is the one reliable "leaving" signal on phones; save work there.
- `pagehide` fires when the page is navigated away or put in the back-forward cache; `unload` is unreliable on mobile and blocks that cache, so avoid it.
- `freeze` and `resume` (the Page Lifecycle API) say Chrome has paused or woken a background tab.
- `navigator.sendBeacon()` is the way to send a last message while hiding; it survives the page closing.
- Timers (like the "show in 10 s" button) can be paused by Android once the tab is in the background, so the closed-tab tests use a notification that waits for your tap instead.
