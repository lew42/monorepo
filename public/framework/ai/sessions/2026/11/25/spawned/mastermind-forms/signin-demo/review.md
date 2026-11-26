verdict: fix
1. [fix] The iPhone add-to-Home-Screen steps end with "Tap Allow one notification a week, then Allow" (public/join/copy.js:63), but an iOS Home Screen app has its own cookie jar, separate from Safari. A person who opens it from the Home Screen is signed out and sees Continue with Google first. Say "sign in again, then tap Allow" (and check that GIS/FedCM signs in inside the standalone app). Otherwise the iOS half of the owner's "sign in, then turn on notifications" ask breaks at its last step.
2. [fix] Brief decision 11 (find the past Durable Object + WebSocket work for documents and note in the auth proposal how a per-user live connection would attach) is not done: `mastermind-forms/auth/proposal.md` has no socket or live-connection note, and the diff touches nothing for it.
3. [fix] Real push to a real browser was never achieved on staging. `join/shots/staging-p-3-after-allow-400.png` shows permission granted, but subscription (browser) false and subscription (server) false, with the state stuck on allow. The later commit 3bd0f7fcc0 ("time limit on the push subscribe") is on worktree/qf-1 but not in this diff.patch, so it was not reviewed. Brief 8 asks to "test with a real Chrome subscription on the PC": that is still open, and task.jsonl should say so plainly rather than "/api/auth/test 200".
4. [fix] A stale comment at worker/index.js:92 (the `logout-all` route): it still says "one counter, no sessions table", but the route now also ends every `sessions` row (diff line 1235).
5. [fix] A fresh agent can't continue from the task folder alone. There is no `requirements.md` at its top (the brief is `brief.md`). plan.md decision 1 still says "a framework page built from ux/Auth", although task.jsonl records the switch to a standalone index.html. task.jsonl has no closing outcome. The shots (`join/shots/`) exist only on worktree/qf-1. Update plan.md decision 1, close the task with an outcome, and merge or link the shots.
6. [note] A Copy link or Share in the in-app card copies `location.href` (public/join/Join.js:471). In test mode that URL carries `?test=<TEST_LOGIN_KEY>`, so sharing the page from a test session publishes the staging test key. Strip the `test` param from the shared URL.
7. [note] `Backend` has no `login()`: public/join/Join.js:377 calls `this.backend.login(user)` whenever GoogleButton fires a mock sign-in. That happens on any stage where `/api` answers but `GOOGLE_CLIENT_ID` is empty (production today). The result is a TypeError, not a sign-in. `Backend.detect()` could fall back to the mock when `client_id` is empty.
8. [note] `Reset everything` runs `localStorage.clear()` (Join.js:550), which wipes every app's local state on staging.lew42.com, not only /join/'s keys (`join-mock`, `join-google-email`). Debug only, but worth narrowing.
9. [note] Small dead code in Join.js: `this.$sound_slot` (line 333) is never read; render() destructures an unused `copy` (line 360); `copy_err` (line 555) just returns `err.message`. The "Not working?" sheet renders an empty `<h2>` (`this.sheet("", …)`, line 484).
10. [note] `Join` is a new class with no `Join.test.mjs` (agents.md law 12). `shoot.mjs` walks the flow headless, so this may be acceptable, but say so in public/join/readme.md.
11. [note] public/join/readme.md:3 calls the host "her" (true of the placeholder clip). The owner will record his own video, so "the host's words" stays true after the swap.

## Requirements
Widths given: none by review.mjs. I read the builder's own shots in worktree/qf-1 `signin-demo/join/shots/` (400 and 1920, plus staging at 400).
- 1 One auth system, the existing Worker, plus a sessions table — yes — worker/index.js start_session, migrations/0002, api.test.mjs sessions block
- 2 Find and wire the Google client id; name the Console step — yes — wrangler.jsonc local and staging; worker/readme.md "Not built yet" step 1 names https://staging.lew42.com
- 3 Staging only, no secret in the repo — yes — secrets go to worker/.dev.vars (gitignored) and wrangler secret put; production vars untouched
- 4 Full-height 9:16 video, caption, one button at the bottom, desktop centred on dark — yes — 1-google-400.png, 1-google-1920.png
- 5 One button that changes: Google, then Allow, then iOS sheet, then done + test push; in-app card — partly — the states exist (2-allow, 3-ios-sheet, 4-done, 6-inapp); the iOS last step is wrong (finding 1); real push is unproven (finding 3)
- 6 Settings sheet: Sign out, Turn off notifications, Delete account with revoke — yes — 5-settings-400.png; DELETE /api/me wipes D1 and UserDO; Join.js delete_account calls revoke
- 7 `?debug=1` strip with Reset everything — yes — 7-debug, staging-p-3-after-allow-400.png
- 8 Push: manifest, sw, VAPID, routes, weekly cron, real Chrome test — partly — everything is built and push.test.mjs passes the RFC round trip; no real subscription yet (finding 3)
- 9 Copy in one place, help-me-test framing — yes — public/join/copy.js
- 10 Placeholder video — yes — media/join-talk-540.mp4 with captions.vtt
- 11 Real-time note in the auth proposal — no — finding 2
- Class with live instances to watch — n/a (Join and InAppBrowser hold no state the owner watches)
## Page structure
- page 1 — yes — 1-google-400.png: one video, one action, one caption
## Navigation
- techniques — a bottom sheet (settings, iOS steps, "Not working?")
- sheet closes by its backdrop and a Close link — yes — Join.js sheet()
## Layout
- yes — 1-google-1920.png: the 9:16 column is centred at full height on #0b0b0d, as the brief asks
## Sizing
- yes — the button is 52px high and full column width; the avatar is 40px (join.css)
## Wrapping
- yes — no wraps in any 400 shot
## Spacing and padding
- yes — 20px side padding and the safe-area bottom inset (join.css .over); the caption's 4.2em min-height leaves about two empty lines under a one-line cue (1-google-400.png, bottom band): minor
## Colour and contrast
- yes — white text on an 85% black scrim; the MOCK badge is dark on amber
## Flow
- partly — 2 taps for a first visitor on Android/desktop (shoot.mjs); iOS breaks at the last step (finding 1)
## Words
- yes — short, plain lines in copy.js; finding 1 is the one wrong instruction
