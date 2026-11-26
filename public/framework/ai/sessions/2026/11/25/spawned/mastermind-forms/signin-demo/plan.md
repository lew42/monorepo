# Sign-in demo: plan (mastermind-forms, 2026-11-25)

**The ask:** [brief.md](brief.md), relayed by the cloud chat from the owner's words. It describes a video landing page for ads with ONE button that changes: Continue with Google, then Allow one notification a week, then done (plus a test push). It also asks for a settings sheet (Sign out, Turn off notifications, Delete account), an in-app browser card, a `?debug=1` strip, and real web push with a weekly cron, deployed to staging.

## What exists (reuse, don't rebuild)

- **The Worker** [worker/](../../../../../../../../../worker/readme.md):
  - Google ID-token check (`google.js`), a signed 30-day cookie (`session.js`), D1 `users` and one `UserDO` per user.
  - Routes are a table in `worker/index.js` (`ROUTES`, each guarded by `can.js`).
  - Staging is `staging.lew42.com`: one Worker serves both `public/` and `/api/*`, so the page and the API are on the same origin.
  - `node worker/scripts/deploy.mjs staging` deploys it.
- **The Google client id, found** in `Server/plugins/Auth.js:9` (the old dev-server login, July 2026): `722949407087-g0kagkteln7gifhndpifetv5j2prn5a9.apps.googleusercontent.com`.
  - It goes in `GOOGLE_CLIENT_ID` for the local and staging stages. Not production yet.
  - The owner must still add `https://staging.lew42.com` to its Authorized JavaScript origins.
- **`ux/Auth`** ([readme](../../../../../../../ux/Auth/readme.md)): `GoogleButton.js` (GIS, with a mock when there is no id), `VideoSignIn.js` (one button over a talking-head video) and the page `/framework/ux/Auth/google/`.
- **The in-app detector** is in [inapp/proposal.md](../inapp/proposal.md), the snippet under "Detection". The Figma mock is section 15, node `154:2261`.
- **`/app/`** has a manifest and a service worker (`public/app/sw.js`, scope `/app/`). It shows only local notifications, with no web push, so there is no push code to reuse.

## Decisions

1. **URL `/join/`** (`public/join/`), a framework page built from `ux/Auth` pieces.
   - It has its own manifest and its own service worker, scope `/join/`.
   - Mobile first. On desktop it shows the same 9:16 video centred at full height on a dark backdrop.
   - *Alternative:* a standalone HTML page with no framework, for a faster first paint. Switch to it if the ad's load time is the problem.
2. **Sessions:** a D1 `sessions` table in a new migration.
   - The cookie carries the session id, and each Google sign-in makes one row.
   - Sign out ends that row; Delete account removes every row the user has.
   - *Alternative:* keep the signed cookie alone. It is simpler, but you can't list or end a session.
3. **Push subscriptions live in D1** (`push_subs`), not in `UserDO`, because the weekly cron must walk every subscriber in one query.
4. **Web push** is hand-written in `worker/push.js`, with Web Crypto only (VAPID JWT ES256 plus RFC 8291 aes128gcm). There is no new npm dependency.
   - Keys come from `worker/scripts/vapid.mjs`, which runs on the PC. The private key is a Worker secret; the public key is served by `GET /api/push/key`.
5. **The cron:** Mondays at 16:00 UTC (`0 16 * * 1`).
   - The text and link come from the vars `PUSH_WEEKLY_TEXT` (default "New this week: watch part 2") and `PUSH_WEEKLY_URL` (default `/join/`).
   - Dead subscriptions (404/410) are deleted.
6. **Copy** is in one file, `public/join/copy.js`.
7. **The video:** the poster is the V01 still, `https://v3b.fal.media/files/b/0ab3d0d3/dIs8KZNuIpEOApqDLn3oz_QWSUU3Vg.png`, until the cloud chat sends a clip.
   - The URL is set in `copy.js` (`video`, `poster`).
   - With no video yet, the page shows the still with a slow zoom.

## The API contract (both builders code to this)

| Route | Who | Does |
|---|---|---|
| `GET /api/config` | anyone | exists: `{client_id, env, dev_login}`; add `vapid_public` |
| `POST /api/auth/google` `{credential}` | anyone | exists; now also inserts a `sessions` row and puts its id in the cookie |
| `POST /api/auth/logout` | signed in | ends the current session row and clears the cookie (add it, or reuse the existing logout) |
| `GET /api/me` | anyone | exists; add `push: true/false` (has a subscription) and `session_id` |
| `DELETE /api/me` | signed in | wipes the user's D1 row, sessions, push_subs and UserDO storage; clears the cookie; returns `{deleted:true, email}` |
| `POST /api/push/subscribe` | signed in | body = `PushSubscription.toJSON()`; upserts by endpoint |
| `DELETE /api/push/subscribe` | signed in | body `{endpoint}`, or no body to remove all of the caller's |
| `POST /api/push/test` | signed in | sends one push to the caller's subscriptions now; returns per-endpoint status codes |

Push payload, JSON: `{title, body, url}`. The `/join/` service worker shows it, and a tap opens `url`.

## Who builds what (one worktree `qf-1`, branch `worktree/qf-1`, two builders, no shared files)

- **api** (`worker/**` only): [api/requirements.md](api/requirements.md). It owns the deploys to staging.
- **join** (`public/join/**`, `public/framework/ux/Auth/**`): [join/requirements.md](join/requirements.md).
- **mastermind-forms**: reviews, merges to `compliance/dev`, does the final staging deploy and reports to the cloud chat.
