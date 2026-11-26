# worker/: the one backend

One Cloudflare Worker serves the whole site: static files from `public/` (the only web root) and everything under `/api/*`. There is no second backend. The design is [/notes/auth/](../public/notes/auth/readme.md) and [identity.md](../public/notes/auth/identity.md); this page says what is built.

The demo you can use today is the auth app at **`/app/`** ([public/app/](../public/app/)): Google sign-in, a mock feed, profile, an admin users list, live documents with an editing lock, and a PWA (install button, iOS hint, notification bell).

## The three stages (one config: [wrangler.jsonc](wrangler.jsonc))

| Stage | Worker | Address | D1 database | Entry |
|---|---|---|---|---|
| local | `monorepo-dev` | `http://monorepo.localhost/api/*` through Servex, or `http://localhost:8787` direct | `monorepo-local` (a file under `worker/.wrangler/`) | [dev.js](dev.js) (adds the dev login) |
| staging | `monorepo-staging` | `https://staging.lew42.com` | `monorepo-staging`, seeded with fake people | [index.js](index.js) |
| production | `monorepo` | `https://lew42.com` | `monorepo-prod` (migrated, empty, unused until the cutover) | [index.js](index.js) |

Bindings are not inherited between wrangler environments, so each stage lists its own. The dev login exists only in `dev.js`, which only the local stage uses as `main`: the staging and production bundles do not contain the route.

## Files

| File | What it does |
|---|---|
| [index.js](index.js) | The router. One table, `"METHOD /path": [action, handler]`; the router resolves the user, checks the host and the origin, then runs `can(user, action)` **before** the handler. `GET /api/` prints that table (method, path, action, who may call it), generated from it. |
| [session.js](session.js) | The signed cookie `s`: HMAC-SHA256 over `{uid, te, exp, sid}`. Role is never in it; `index.js` reads the role from D1 each request. `sid` names a row of the `sessions` table: when that row is ended (or gone) the cookie reads as signed out. A cookie with no `sid` (made before migration 0002) is still honoured until it expires. `token_epoch` (`POST /api/auth/logout-all`) revokes every cookie of a user. |
| [push.js](push.js) | Web push with WebCrypto only: the VAPID JWT (RFC 8292, ES256, `aud` = the push service's origin), payload encryption (RFC 8291 aes128gcm), `send_push`/`send_all` (a 404 or 410 deletes the subscription row) and `weekly()`, the cron's body. [push.test.mjs](push.test.mjs) encrypts, decrypts with the RFC's steps, verifies the JWT and runs the cron against fakes (under 1 s, no network). |
| [can.js](can.js) | `can(user, "read" \| "write" \| "admin")`, the six rows of identity ruling 4. |
| [google.js](google.js) | Verifies a Google ID token (RS256 against Google's keys, WebCrypto). |
| [room.js](room.js) | The `Room` Durable Object: one per url chat room, one per document (`doc:<id>`). A document has a single-editor lock ([lock.js](lock.js)), a JSONL history in its own SQLite and an R2 snapshot after 20 s of changes (only when an R2 bucket is bound). Wire protocol at the top of the file. |
| [settings.js](settings.js) | `UserDO`: one per user, their settings. A `DELETE` wipes its storage (account deletion). |
| [likes.js](likes.js), [pages.js](pages.js) | The older likes and page-listing endpoints. |
| [dostorage.js](dostorage.js) | Lazy schema steps for a Durable Object's SQLite. |
| [dev.js](dev.js) | Local only: `POST /api/dev/login {handle}` and `GET /api/dev/login?as=alice`. |
| [migrations/](migrations/) | D1 schema (`wrangler d1 migrations apply`). Append a file; never edit one that shipped. `0001` users, likes, docs, pages; `0002` `sessions(id, user_id, created_at, ended_at, user_agent)` and `push_subs(endpoint PK, user_id, p256dh, auth, created_at)`; `0003` `join_events` (the ad funnel, no personal data: [join.js](join.js)). |
| [seed/](seed/) | `dev.sql` (seven people alice, bob, carol, dave, eve (banned), admin, zed (the one `api.test.mjs` deletes)) and `staging.sql` (four fake people, never able to sign in). |
| [scripts/](scripts/) | `deploy.mjs`, `vapid.mjs` (makes the push keys once), `serve.mjs` (the local API as one process, started by Servex), `icons.mjs`, `live.test.mjs`, `ui.test.mjs`, `latency.mjs`. |

## Sign-in, sessions and push (the API the join page codes against)

| Route | Who | What |
|---|---|---|
| `GET /api/config` | anyone | `{client_id, env, dev_login, vapid_public}` |
| `GET /api/me` | anyone | signed out: `{anonymous:true, user:null, push:false, session_id:null}`; signed in: `{handle, roles, user, push, session_id}` (`push` = this user has a subscription) |
| `POST /api/auth/google {credential}` | anyone | verifies the Google token, makes a `sessions` row, sets the cookie |
| `POST /api/auth/test {key, name?}` | anyone, **staging only** | signs in a fake user `test-<name>` (provider `test`) with a real session. Answers 404 unless the secret `TEST_LOGIN_KEY` is set on that stage and `key` matches (constant-time compare). Production never gets the secret, so there it does not exist; this is the secret-gated stand-in for the dev login, which staging's bundle does not contain. |
| `POST /api/auth/logout` | anyone | ends this cookie's `sessions` row, clears the cookie |
| `POST /api/auth/logout-all` | member | ends every session of the user |
| `DELETE /api/me` | member | wipes the account: sessions, push subscriptions, likes, documents, the user row and the `UserDO`; clears the cookie; answers `{deleted:true, handle}` (there is no email) |
| `POST /api/push/subscribe {endpoint, keys:{p256dh, auth}}` | member | the browser's `PushSubscription.toJSON()`; the endpoint must be https on a known push service (Google: googleapis.com or google.com, Mozilla, Apple, Windows), the keys 65 and 16 bytes; one row per endpoint |
| `DELETE /api/push/subscribe {endpoint?}` | member | removes that endpoint, or all of the caller's; answers `{ok, removed, push}` |
| `POST /api/push/test` | member | sends "Test notification" to the caller's subscriptions: `{sent, failed, removed, results:[{host, status}]}`; 503 where VAPID is not configured |
| `POST /api/join/event {v, e, inapp, os, src, camp, content}` | anyone | the ad funnel (`worker/join.js`): one `join_events` row per step of `/join/` (migration `0003`), no personal data — only a visitor id the page keeps in `localStorage`. `v` must be 16 hex chars, `e` one of Funnel.js's own list, or 400. Rate-limited by `cf-connecting-ip` (the `JOIN_RL` binding, ~60/min, skipped where the binding is absent) plus a 300-rows-per-visitor-per-day cap; either gives 429. Answers `204` |
| `GET /api/join/stats` | admin | distinct-visitor counts per funnel step, today (UTC) / 7 days / all time, split by `utm_source` and by in-app vs not, plus `signed_up_users` and `active_push_subs`. Shown at [public/join/stats/](../public/join/readme.md) |

**Push keys and the weekly push.** `node worker/scripts/vapid.mjs` makes the P-256 pair once and writes `VAPID_PRIVATE_JWK`, `VAPID_PUBLIC` (and `STAGING_TEST_LOGIN_KEY`) to `worker/.dev.vars` (gitignored; `wrangler dev` reads it, so local push works too). `deploy.mjs staging` puts them on staging as secrets `VAPID_PRIVATE_JWK`, `VAPID_PUBLIC`, `TEST_LOGIN_KEY`. Never regenerate the pair after people subscribe: every subscription is tied to the public key. Staging has a cron (`0 16 * * 1`, Monday 16:00 UTC) whose `scheduled()` sends `{title:"lew42", body: PUSH_WEEKLY_TEXT, url: PUSH_WEEKLY_URL}` to every `push_subs` row and logs `push weekly: sent X, failed Y, removed Z` (vars in [wrangler.jsonc](wrangler.jsonc): "New this week: watch part 2" and `/join/`; `wrangler tail` shows the line).

The user object is `{id, provider, handle, avatar_url, role, created_at, last_login}`. There is no email column ([identity ruling 7](../public/notes/auth/identity.md)): the Google name is the handle, and `ADMIN_EMAIL` is compared at sign-in only.

Docs: [public/framework/core/Item/DocStore.js](../public/framework/core/Item/DocStore.js) is the `Item.Store` adapter the document page uses.

## Run it locally

**Under Servex (the normal way).** Open `http://monorepo.localhost/app/`. Servex's proxy sends `/api/*` (HTTP and WebSocket) to this Worker and every other path to the dev server, and starts the Worker on the first request ([Servex/doc/prefix-routes.md](../Servex/doc/prefix-routes.md)). The Worker runs as the Servex project `monorepo-api` ([serve.mjs](scripts/serve.mjs): applies the migrations and `seed/dev.sql`, then `wrangler dev` on the port Servex assigned, loopback only), so `stop_server`, `restart_server` and `server_logs` work on it. The first request waits for wrangler to boot (about 15 s); a page shows "Starting monorepo-api…" and reloads itself, and a `POST` or a `fetch` before then gets a 503 with `Retry-After`. Inside the Worker the hostname is `monorepo.localhost`, which is in the local `API_HOSTS`, and the dev login accepts any `*.localhost` name. Press a "dev: …" button on `/app/`.

**Without Servex.** `node dev.mjs` (the dev server on :80 and the Worker on :8787), then open `http://localhost:8787/app/`: the Worker serves the whole site on that one origin.

Tests, with the stage running (pass `http://monorepo.localhost` to go through the proxy, or the :8787 url):

```
node worker/google.test.mjs && node worker/session.test.mjs && node worker/can.test.mjs && node worker/lock.test.mjs   # pure, no server
node worker/push.test.mjs                               # pure: push encryption round trip, VAPID, weekly cron
node worker/api.test.mjs http://monorepo.localhost      # every route: who may call it, host guard, origin guard, sessions, push, account deletion, revoke, the Room lock (re-run after restarting the dev script: it deletes zed)
node worker/scripts/ui.test.mjs http://monorepo.localhost     # headless browser, needs PLAYWRIGHT_DIR (a path to the playwright package)
node worker/scripts/live.test.mjs http://monorepo.localhost   # two browsers on one document
```

⚠ On Windows Node cannot resolve `*.localhost` (curl and browsers can), so `api.test.mjs` against `http://monorepo.localhost` needs a preload that maps `*.localhost` to 127.0.0.1 (`node --import ./that.mjs`); the two browser tests need nothing. Behind the proxy a forged `Host` is turned away by the proxy itself (404), so that one assertion only checks it is not served.

`api.test.mjs` reads the route table out of `index.js`, so a route added without an assertion fails it, and it checks `GET /api/` lists every row.

Wrangler checks every file under `public/` before it starts: 25 MiB per file at most, and a file count limit. Files that must never be an asset (private downloads, caches, the big task-state logs) are listed in [public/.assetsignore](../public/.assetsignore); a new big file under `public/` that is not in git has to be added there or `wrangler dev` stops with "Ensure all assets in your assets directory conform with the Workers maximum size requirement".

## Deploy

`node worker/scripts/deploy.mjs staging [--seed]` applies the D1 migrations to that stage's own database, deploys `worker/wrangler.jsonc` for that environment and creates `SESSION_SECRET` once. Staging first. `--secret KEY=VALUE` sets another secret (`ADMIN_EMAIL`). On staging it also sets the push keys and `TEST_LOGIN_KEY` if missing. Staging's session secret is also written to `worker/.dev.vars` (gitignored) so `node worker/scripts/latency.mjs` can sign cookies for its fake users and measure the real edit-to-other-phone time.

### Why a git push cannot ship an untested API

The root [wrangler.jsonc](../wrangler.jsonc) is what Cloudflare's Git builds deploy (`npx wrangler deploy` on the production branch, `versions upload` previews on others). It is **assets only**: no `main`, no D1, no `/api` code. So a push serves static files and nothing else; it cannot put the API on lew42.com or point a preview at production data. The API Worker has its own deploy command and its own stage config. As a second guard the API answers only on the hostnames in `API_HOSTS` and returns 503 on any other (a preview url, a `workers.dev` name), so even a wrongly attached stage cannot touch the wrong database.

## Production cutover (not done: lew42.com still serves the assets-only Worker)

`monorepo-prod` exists and is migrated. To switch lew42.com to this Worker:

1. Open the Cloudflare dashboard → Workers → `monorepo` → Settings → Builds. Set the production branch to `production` (or disconnect Git builds for this Worker) and turn off builds for non-production branches. The agents' Cloudflare token cannot read or change Workers Builds, so this is a dashboard step.
2. Run `node worker/scripts/deploy.mjs production --secret ADMIN_EMAIL=<your google email>`. That replaces the live Worker `monorepo` with the full API Worker, which still serves all of `public/`.
3. Check lew42.com, then set the deploy command of the Git build to `npx wrangler deploy -c worker/wrangler.jsonc --env production` (so a push to `production` ships it) and make the root `wrangler.jsonc` the same file or delete it.

Before step 2, finish the owner's list below.

## Not built yet

- **Real Google sign-in has not yet been tried end to end.** `GOOGLE_CLIENT_ID` is set on local and staging (production stays empty until the cutover), and `google.js` is tested, but Google only accepts a sign-in from an origin the owner has listed in the OAuth client: `https://staging.lew42.com` is step 1 below. Until then staging is tested with `POST /api/auth/test`.
- **Real push delivery to a phone has not been seen.** The encryption is proven against the RFC in `push.test.mjs`, and the live push service answered the staging test (Google's push service returned 410 for a made-up subscription, which the Worker removed as designed), but nobody has subscribed a real browser yet.
- **Banning a real user.** A ban is a flag in the dev login's cookie only (`dev.js`); no column or admin route sets it on staging or production, and `can.js` does not check it.
- **A page that lists live documents and their lock holders.**
- **Per-user form answers.** Proposed (2026-11-25, not built): an `answers` table in `UserDO` plus `GET`/`PUT /api/answers`, read by `ux/Form`'s `form.bind(user)`: [proposal.md](../public/framework/ai/sessions/2026/11/25/spawned/mastermind-forms/auth/proposal.md) · [what exists](../public/framework/ai/sessions/2026/11/25/spawned/mastermind-forms/auth/findings.md).
- **People arriving in in-app browsers** (YouTube, Instagram, TikTok): Google sign-in is blocked there. Proposed (2026-11-25, not built): detect it, show an "open in your browser" card, and a one-use handoff link by email or text: [proposal.md](../public/framework/ai/sessions/2026/11/25/spawned/mastermind-forms/inapp/proposal.md).
- The old app's `ADMIN_GOOGLE_SUB` option (admin by Google subject id) was dropped: the admin is `ADMIN_EMAIL`, compared at sign-in.

## What the owner must do

1. **Google OAuth client** (Google Cloud Console → APIs & Services → Credentials → Create credentials → OAuth client ID → Web application; first configure the consent screen: External, app name, your email, scopes `openid email profile`). Authorized JavaScript origins, no redirect URIs needed (Google Identity Services popup/button):
   - `https://staging.lew42.com`
   - `https://lew42.com` (and `https://www.lew42.com` if it is used)
   - optionally `http://localhost:<port>` for the :8787 direct run. Google rejects `*.localhost` origins, so `monorepo.localhost` cannot be listed: local sign-in uses the dev login, and real Google sign-in is tested on staging.
2. The client id is already in `GOOGLE_CLIENT_ID` for local and staging in [wrangler.jsonc](wrangler.jsonc) (it is public, not a secret); at the production cutover put it there too and run the deploy script again.
3. Set `ADMIN_EMAIL` (secret) to your Google email; your first Google sign-in becomes admin: `node worker/scripts/deploy.mjs staging --secret ADMIN_EMAIL=you@example.com`.
4. Enable R2 in the Cloudflare dashboard (Storage → R2), create buckets `monorepo-staging-docs` and `monorepo-production-docs`, and add an `r2_buckets` binding named `SNAPSHOTS` to each environment. Until then document history lives only in the Durable Object (fully working, no off-site copy).
5. The Git-builds change at cutover (above).
