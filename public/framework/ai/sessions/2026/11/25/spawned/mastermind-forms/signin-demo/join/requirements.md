# Sign-in demo, part 2: the /join/ landing page

Budget: $14. Load the `minion` skill first, then `page`, `code` and `ui`. You work alone; spawn no one.

Card: /framework/ai/2026/11/25/sign-in-demo-video-landing-google-weekly/

## Read first

- **The ask:** [../brief.md](../brief.md) (decisions 4, 5, 6, 7, 9 and 10 are yours; the owner's words are at its top).
- **The plan:** [../plan.md](../plan.md). Code to its API contract; the other builder is making those routes now.
- **What to reuse:**
  - `public/framework/ux/Auth/readme.md` and its files: `GoogleButton.js`, `VideoSignIn.js`, `google/page.js`;
  - the detector snippet in [../../inapp/proposal.md](../../inapp/proposal.md);
  - the look in Figma file `woCZQDoXKJW3GcJPZukW7f`, sections 14 and 15 (node `154:2261`). Read them with `get_screenshot` only; don't edit Figma.
  - `public/app/sw.js` and `manifest.webmanifest` show the service worker and manifest shape already in use.

## Where

- **The worktree:** `C:/Code/lew42/worktrees/qf-1` (branch `worktree/qf-1`); its site is at `http://127.0.0.1:57506/`.
- **Your fence:** `public/join/**`, `public/framework/ux/Auth/**` and this folder.
- **The other builder** edits `worker/**`. Don't touch it.
- Commit by exact path after each working step.

## Build

1. **`/join/`**, mobile first:
   - a full-height 9:16 video (`autoplay muted playsinline loop`, a poster, tap for sound);
   - the host's line as a caption;
   - ONE action button at the bottom, above the caption, as in Figma 14-A.
   - On desktop the same 9:16 column sits centred at full height on a dark backdrop.
   - The video never stops or reloads between steps.
   - Until a clip exists, the poster is the V01 still (URL in plan.md, decision 7), with a slow zoom.
2. **The one button changes state:**
   - **Continue with Google:** GIS with FedCM on, through `GoogleButton`, and a small "Not working?" link under it.
   - **Allow one notification a week:** with the line "One notification, every week. Nothing else."
   - The tap: iOS Safari and not standalone opens a sheet with the add-to-home-screen steps (Share, Add to Home Screen, open it from there, tap Allow). Anywhere else it runs `Notification.requestPermission()`, then `PushManager.subscribe` with the VAPID key from `/api/config`, then `POST /api/push/subscribe`.
   - **Done:** "You're in. See you next week.", plus **Send me a test notification now** (`POST /api/push/test`).
   - A reload lands on the right state, read from `/api/me` and the permission.
3. **"Not working?" and the in-app browser:**
   - When an in-app browser is detected, the Google button is replaced by the "open in your browser" card: an Android `intent://` button, the iOS menu steps, **Copy link** and **Share** (`navigator.share`).
   - "Not working?" opens the same card. There is no email or SMS yet.
   - Put the detector in `ux/Auth` as a class (`InAppBrowser.js` is the suggested name) with a lean `InAppBrowser.test.mjs` over real user-agent strings.
4. **The settings sheet** (a gear or the avatar, top right):
   - "Signed in as X";
   - **Sign out:** `POST /api/auth/logout`, then `google.accounts.id.disableAutoSelect()`;
   - **Turn off notifications:** unsubscribe, then `DELETE /api/push/subscribe`;
   - **Delete account:** confirm, `DELETE /api/me`, then `google.accounts.id.revoke(email)`.
   - Each one returns the button to the right state.
5. **`?debug=1` strip:**
   - in-app yes/no and which app; iOS or Android; standalone; `Notification.permission`; push supported; signed in and the user id; subscription present;
   - a **Reset everything** button: sign out, unsubscribe, unregister the service worker and clear local state.
6. **Push plumbing:**
   - `public/join/manifest.webmanifest`, with `start_url` and `scope` `/join/` and icons (reuse `/app/icons/` if they fit);
   - `public/join/sw.js`, scope `/join/`, which shows the push payload `{title, body, url}` and opens `url` on tap.
   - Never cache `/api/`.
7. **Copy and media in ONE file**, `public/join/copy.js`: every line of text, the video URL and the poster.
   - The opening line uses help-me-test framing with a hint of value, as in brief decision 9.
8. **The mock path must work end to end** where there is no Worker (the dev server at the worktree URL has no `/api`):
   - a fake sign-in, a fake subscribe and a local `showNotification` for the test;
   - one clear "mock" badge on screen.
   - On staging (same-origin `/api`), the real path runs.

## Check

- **Headless screenshots** at 400 and 1920 of each state: the Google button, allow, the iOS sheet, done, settings, the in-app card and debug.
  - Read them yourself; save them in this folder (`shots/`).
  - Force states the way the `ui-test` skill says.
- **The console** has no errors on the mock path.
- **When the API builder says staging is up** (mastermind-forms tells you), ask mastermind-forms to redeploy with your page, then shoot `https://staging.lew42.com/join/` at 400.
- **Docs:** update `ux/Auth/readme.md` for the new class. Give `public/join/` a short readme: what it is, its states, where the copy lives and how to re-run the flow.

## Done when

- Your commits are on `worktree/qf-1`.
- Each step's result is a `log` line in this folder's task log.
- You send mastermind-forms 5 lines: what works, the shots folder, the tap count for a first-time visitor and what is unproven.

## Never

- Kill or restart the dev server or Servex, or drive the owner's browser tabs.
- Use git's stash, push, or put a secret in a file.
