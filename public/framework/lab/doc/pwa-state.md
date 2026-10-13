# PWA and notifications: state on 2026-10-13

**Verdict: partly.** Notifications and the worker are built and serve; installing to the Android home screen was missing a manifest and icons until today (fixed, below). The one thing never proven is a real push arriving on a phone.

## Proof (curl against `monorepo.localhost`, headless Chromium)

| Question | Answer | Proof |
|---|---|---|
| Web manifest served? | **was no, now yes** | `/manifest.webmanifest` 404 before; 200 `application/manifest+json` after merge `1b4bc1136` |
| Service worker served? | yes | `/sw.js` 200 `text/javascript` |
| `/push/key` answers? | yes | 200 JSON `{"key":"BDYj…"}` (VAPID public key) |
| Headless browser subscribes to push? | **no, a platform limit** | `AbortError: Registration failed - permission denied` (same as the lab's own [report](/framework/lab/notifications/report/); headless Chromium has no push service) |
| Installable on Android Chrome? | **now yes by Chrome's own check** | CDP `Page.getInstallabilityErrors` before: `no-manifest`; after: only `in-incognito`, an artifact of the test context |

## What the manifest declares
`/manifest.webmanifest`: `name`/`short_name` lew42, `start_url` `/`, `scope` `/`, `display` standalone, white `background_color` and `theme_color`, icons `/assets/img/icon-192.png` and `icon-512.png` (the site's mark on white, `purpose: any`). `index.html` links it and sets `theme-color`.

## What was asked vs what exists
Searches of `asks.jsonl`, `git log` and PastWork found one brief: [the Notifications Lab](/framework/ai/sessions/2026/10/09/notifications-lab/notifications-lab/) (the asks are in its `requirements.md`). Then the owner's 10-13 dictation: [ask 1](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-3.md).

- ✅ Notifications from a plain Android Chrome tab: [demo](/framework/lab/notifications/), [phone checklist](/framework/lab/notifications/phone/), [report](/framework/lab/notifications/report/). Desktop-tested; the Android column of the report is still empty.
- ✅ Service worker at the site root, with `WorkerHost` and `NotificationManager` classes ([lab readme](/framework/lab/readme.md)).
- ⚠️ Web Push: key, subscribe route and encryption tested; delivery to a real phone never seen. Subscriptions are in memory and the route exists only on the dev server (`Server/plugins/Push.js`), so production (static) has no push.
- ✅ Install to home screen: manifest and icons added today.
- ⬜ Offline: `sw.js` has no cache or fetch handler by design; the lab never asked for one.

Next steps and a ready brief: [next.md](next.md).
