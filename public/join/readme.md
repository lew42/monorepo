# /join/ — a video asks you to sign in and allow one notification a week

A standalone page (not a framework `page.js`, so no sidebar): a full-height 9:16 video that never stops, her words as a caption, and ONE button at the bottom that changes. On a desktop the same column sits centred on a dark backdrop. Open it at [/join/](/join/); `?debug=1` adds a state strip with a "Reset everything" button.

## The button's states (derived on every load, so a reload lands on the right one)

| State | Shown when | Button |
|---|---|---|
| `google` | no user | Continue with Google (`ux/Auth/GoogleButton`), plus "Not working?" |
| `inapp` | no user, inside Instagram/Facebook/… | the "open in your browser" card (Android `intent://`, iOS steps, Copy link, Share) instead of Google |
| `allow` | user, no push subscription or permission | Allow one notification a week; on iPhone not added to the Home Screen it opens the add-to-home-screen sheet |
| `done` | user, subscribed, permission granted | "You're in. See you next week." + Send me a test notification now |

The gear is the avatar (top right, once signed in): Sign out, Turn off notifications, Delete account (confirm first).

## Modes (`?debug=1` shows which)

- **google**: the Worker's `/api` answers `/api/config`; Google's own button signs in.
- **test**: `?test=<key>` adds a "Test sign-in" button that calls `POST /api/auth/test {key}` (staging only); everything after it is the real path. The key is never stored in a file.
- **mock**: no `/api` (the dev server), or `?mock`. Fake sign-in, fake subscribe, a local `showNotification`, and a yellow MOCK badge. State lives in `localStorage["join-mock"]`.

## Files

`index.html`, `main.js` (boots it), `Join.js` (the page class), `join.css`, `copy.js` (**all** words and the video, poster and captions paths: edit text here), `Backend.js` (the Worker's `/api` calls; `Backend.detect()` picks real or mock), `MockBackend.js` (+ `MockBackend.test.mjs`), `sw.js` (service worker, scope `/join/`, shows the push payload, caches nothing), `manifest.webmanifest`, `media/` (the video, poster and `captions.vtt`), `shoot.mjs` (the check below). Built on `ux/Auth`: [GoogleButton](/framework/ux/Auth/readme.md) and `InAppBrowser`. The API: [worker/readme.md](/worker/readme.md), "Sign-in, sessions and push".

## Re-run the flow

`node public/join/shoot.mjs [base-url] [out-dir]` walks the whole first-visit path (sign in, allow, reload, test push, notifications off, sign out, delete), prints each check and any console error, and shoots every state at 400 and 1920 wide. Needs Playwright installed globally and Chromium (`channel: "chromium"`; the headless shell denies notifications). Shots from the first run: `public/framework/ai/sessions/2026/11/25/spawned/mastermind-forms/signin-demo/join/shots/`.

## Not proven here

Real Google sign-in needs the page's origin in the Google client's Authorized JavaScript origins. Real push on iOS needs a physical iPhone with the page on the Home Screen. Headless Chromium has no H.264, so the shots show the poster, not the playing video.
