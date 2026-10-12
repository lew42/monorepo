# Notifications Lab — mastermind brief

Owner (2026-10-08). You are a **Sonnet 5.5 mastermind** who owns this project end to end. It may be large and multi-step. You can build it yourself (most likely) and spawn Haiku 5.5 minions via `spawn_agent` (parent = you) only for cheap research; make executive decisions when a minion falls short. **Work in a worktree** so you do not crash the main site; read the diff, run the smoke/`check_page`, then merge. Run `node Server/usage-now.mjs` before spawns. Budgets are advisory; post an update at least every ~5 minutes. Non-destructive; commit often.

## Don't lose anything in context (owner's standing instruction for this task)
After every prompt/step, **document and keep the state current** in `STATE.md` in this task dir (one screen): what is done, what is in flight, what is next, decisions made (with the alternative), open questions, where the code is (worktree, branch, files), and how to resume. If you are handed off or restarted, a fresh session reading `STATE.md` plus this brief must be able to continue immediately. Everything you create must be linked from the site (CLAUDE.md "Everything is linked"). Chat replies: one sentence.

Context already in the repo: `public/framework/dev/mobile/` documents phone access (LAN IP + port) and the microphone/HTTPS gap; browsers also require a **secure context** for service workers and notifications, which is why the Android flag below matters. Read that page first, plus the readme chain to where you build.

## The task, verbatim from the owner

# Notifications Lab

## Goal
Get web notifications working on my Android phone against the local dev
server, from a normal browser tab (no PWA install), and build a demo page
to explore what notifications can do. Write a short report of findings
when done.

## Constraints
- Vanilla JS, native ESM, no TypeScript, no build step.
- Use our existing View class and page system; read existing code first
  and follow its patterns.
- Each class has a static View, rendered via `this.constructor.View`.
  Parents render children through the children's views. Views should
  show internal state live (permission, worker state, visible
  notifications, event log).
- New classes go in lab/ClassName/ClassName.js (capitalized, file name
  matches class name). Helper classes that only serve a parent are nested
  in the parent's folder.
- Don't reuse native API names (Notification, ServiceWorker, etc.).
- Keep wrappers thin and close to the native API shape.
- No offline caching / fetch interception.

## Local testing
I test on my phone via the desktop's LAN IP. Setup: Android Chrome →
chrome://flags → "Insecure origins treated as secure" → add
http://<LAN-IP>:<port> → relaunch. Show window.isSecureContext on the
page. If the flag doesn't make service workers + notifications work,
tell me and propose the simplest fallback (e.g. mkcert).

## Classes
lab/WorkerHost/WorkerHost.js
  Registers the service worker (sw.js at site root, type: 'module'),
  exposes registration + state, relays messages from the worker.
  Keep sw.js thin.

lab/NotificationManager/NotificationManager.js
  One instance at the app level. Wraps permission, maxActions,
  registration.showNotification and getNotifications.
  NOTE: `new Notification()` throws on Android Chrome, so everything goes
  through showNotification(). Verify this.
  show(opts) → NotificationHandle
  Relays click / action / close events from sw.js to the page.

lab/NotificationManager/NotificationHandle.js
  One notification slot keyed by tag. Native notifications are immutable,
  so set(props) re-shows under the same tag to act like an update.
  close(), and click / action / close events.

## Demo page
Stacked demo cards, each with buttons plus a live view, and a shared
event log. Cover:
- All showNotification options: body, icon, badge, image, tag, renotify,
  silent, vibrate patterns, requireInteraction, actions, data
- maxActions, and what happens with more actions than allowed
- Long multi-paragraph body: truncation and expanded view
- Multiple notifications at once vs same-tag replacement
- Progress bar via repeated set() (text bar like ▓▓▓░░ 3/5)
- Question chain: 2-button choices, answer → next question on same tag
- Click behavior with the tab focused, backgrounded and closed (focus
  the existing tab vs open a new one)
- What sound/vibrate/silent the page controls vs Android's per-site
  settings

Stretch, only once the above works: push notifications (subscription +
a dev-server route that sends a test push after a delay, so I can switch
apps or close the tab first).

## Report
Short markdown: what works without installing a PWA, setup steps that
worked, results of each demo, limits found (e.g. buttons only, no
checkboxes or inputs), and anything that surprised you.

## Next step (don't build yet)
Page lifecycle testing: visibilitychange, pagehide, freeze, unload,
sendBeacon. Note anything you learn about it in the report.

## Notes from the dispatcher
- "lab/" means a lab directory under the public tree; choose the right location by the readme chain (is there an existing lab area? if not, pick `public/framework/lab/` or similar and record the alternative), and make sure the lab and its demo are linked from the site.
- You can test notification logic headless where possible; the real Android test is the owner's, so give them a **one-screen phone checklist page** (the URL to open, the flag steps, the buttons to press) and put the same steps in the report.
- No new npm dependency. The push stretch needs a dev-server route (`Server/`); that is the one place to be careful: small, loopback-safe, reviewed.
