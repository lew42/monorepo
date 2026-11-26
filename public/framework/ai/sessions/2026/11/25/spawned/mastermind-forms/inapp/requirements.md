# Auth: get people out of in-app browsers (research + proposal, nothing built)

Budget: $4. Load the `minion` skill first, then the `research` skill.

Card: /framework/ai/2026/11/25/auth-get-people-out-of-in-app-browsers/ (the ask as relayed by voice-app, 2026-11-25).

## The owner's ask (relayed by voice-app, 2026-11-25)
**Problem:** people arrive from ads inside in-app browsers (YouTube Shorts, Instagram, TikTok).
- Google sign-in may fail there, or they are not signed in.
- PWA install and web push don't work there.
- On iPhone, push needs Add to Home Screen in Safari, and notifications then belong to that home-screen app.

**Goal:** get them into their DEFAULT browser, where they are signed in to Google, can add to home screen and allow notifications.

**Design to evaluate:**
- Detect in-app browsers.
- Android: an "Open in Chrome" button via an `intent://` URL.
- iPhone: no official escape. The `shortcuts://` x-error trick is hacky: try it, don't rely on it.
- iPhone instead: beside "Continue with Google", a small "Not working?" link opens "Send me a link" by text or email. Short note: "in the app's browser you're probably not signed in; the link opens your own browser where you are".
- The link carries a session id so they pick up where they left off.
- The in-app page can be just a landing page: short video + "Continue".
- SMS: e.g. Twilio Verify (about 5 cents each).

**PROPOSE ONLY:** create no accounts, keys or deploys.

## Do
1. Web search pass, dated sources, 2026 behaviour where findable: YouTube's in-app browser on iOS and Android (WebView, SFSafariViewController or Custom Tab? does it open links externally?), Instagram and TikTok the same; Google's block on sign-in in embedded webviews (`disallowed_useragent`) and whether the Google Identity Services button / One Tap works there; iOS web push rules (home-screen web app only, iOS version, permission on a user gesture); PWA install from in-app browsers; whether `intent://` to Chrome works from each Android in-app browser; the `shortcuts://` / x-safari tricks on current iOS; user-agent detection strings (FBAN/FBAV, Instagram, TikTok/musical_ly/BytedanceWebview, YouTube's iOS app).
2. Read what exists: `../auth/proposal.md` and `../auth/findings.md` (this session folder), `worker/readme.md`, `public/framework/ux/Auth/GoogleButton.js`. The magic link must fit the existing Worker sign-in (D1 users, cookie `s`): say how.
3. Write `proposal.md` in this folder, one screen at the top, detail below: a table per app × platform (sign-in works? push? install? escape method), with a credence and a source link per row; the recommended flow; the magic-link design (token, expiry, one use, carries the session id; email vs SMS; cost per send; what the owner must sign up for); the detection snippet as JavaScript; what to build first (MVP) and what to try but not rely on.
4. Add one line linking it under "Not built yet" in `worker/readme.md`, next to the per-user answers line. Commit both by exact path on compliance/dev (doc only, no page loads them).
5. Log findings as `log` lines in this folder's task log, then send mastermind-forms a 5-line summary.

Never: create accounts or keys, deploy, kill or restart servers, drive the owner's tabs, use git's stash, push.
