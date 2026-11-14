# app: sign-in, a PWA and live documents on Cloudflare

A small Cloudflare Worker app, separate from the lew42.com site (the git-built "monorepo" Worker, which this folder never touches and must never be deployed under that name). It signs people in with Google, shows a home feed, a profile page, an admin users page, installs as a phone app, and has live-edited documents.

| Stage | Worker | URL | Database |
|---|---|---|---|
| local | `lew42-app-local` (`wrangler dev`) | http://localhost:8787 (dev sign-in on) | local D1 |
| staging | `lew42-app-staging` | https://staging.lew42.com (seeded with fake people) | `DB` of env.staging |
| production | `lew42-app` | https://lew42-app.lew42.workers.dev | `DB` of env.production |

Each stage has its own D1, its own `SESSION_SECRET`, and its own Durable Object storage. Bindings do not inherit between `wrangler.jsonc` envs, so each env lists its own.

## What is in the folder

- `wrangler.jsonc`: the three stages (top level is local), D1, `ASSETS` (`run_worker_first: ["/api/*"]`, SPA fallback), Durable Objects `DOC_DO` (`DocDO`) and `USER_DO` (`UserDO`), migration tag `v1`.
- `src/index.js`: the Worker. `/api/*` routes: config, me, auth/google, auth/logout, dev/login (local only), feed, settings, docs, admin/users, and the WebSocket `/api/doc/<id>/ws`.
- `src/google.js`: verifies a Google ID token (RS256 against Google's JWKS, with Web Crypto). `src/google.test.mjs` tests it.
- `src/session.js`: the `sid=<token>.<hmac>` cookie; D1 keeps only `sha256(token)`.
- `src/doc.js`: `DocDO`, one Durable Object per document (below). `src/lock.js`: the single-editor lock (TTL 12 s, heartbeat 4 s), `src/lock.test.mjs`. `src/dostorage.js`: lazy schema migration for Durable Object SQLite (`meta.schema_version`).
- `src/user.js`: `UserDO`, one per user, holds settings (theme, compact).
- `migrations/`: numbered D1 SQL (`0001_users`, `0002_docs`), applied by `wrangler d1 migrations` through `scripts/deploy.mjs`.
- `seed/staging.sql`, `seed/production.sql`: fake people for staging; production seed is minimal.
- `web/`: the front end, plain ES modules with the framework's `View` (no bundler). `app.js` (shell and routes), `docs.js` (documents pages), `DocStore.js` (the store adapter, below), `sw.js` (service worker), `manifest.webmanifest`, `icons/`.
- `scripts/`: `deploy.mjs <staging|production>` (stage assets, apply D1 migrations, deploy, make sure `SESSION_SECRET`; `--seed`, `--secret KEY=VALUE`), `stage.mjs` (copies `web/` to the gitignored `.stage/` and follows imports to copy the needed framework files from `public/`), `icons.mjs`, `ui.test.mjs` (Playwright UI test), `live.test.mjs` (two-user live edit test with latency, needs `wrangler dev`), `latency.mjs` (the same measurement against staging).
- `.dev.vars` (gitignored): local secrets; `.dev.vars.example` is the template.

## Secrets and settings

Secrets (`wrangler secret put`, or `deploy.mjs --secret`): `SESSION_SECRET` (made automatically), `ADMIN_EMAIL` or `ADMIN_GOOGLE_SUB` (the first admin). `GOOGLE_CLIENT_ID` is a plain var in `wrangler.jsonc`, empty until the Google OAuth client exists. `DEV_LOGIN=1` is local only.

## Live documents

`DocItem.open("doc:<id>")` (`web/DocStore.js`, a subclass of the `Item.Store` in `core/Item/Store.js`) opens one WebSocket to the document's `DocDO`. History arrives as JSONL lines and replays onto the item; every `item.set(...)` afterwards is one line sent over the socket (typing is folded for 60 ms); lines from the editor arrive as live reads on every other client.

Wire (JSON text frames), also in the header of `src/doc.js`: `hello`/`lines`/`ack`/`lock`/`beat`/`unlock`/`refused`/`ping`/`pong`. Only the lock holder may write; the lock frees on Done, on lock expiry (alarm), or when the editor's last socket closes. The history is the `lines(seq, line, at, author)` table in the Durable Object's SQLite. About 20 s after the first unsaved change an alarm writes `docs/<id>.jsonl` to R2 (`SNAPSHOTS`, bound locally only until R2 is enabled on the account; without it the snapshot step is skipped).

Measured on staging (30 edits, two browsers, one machine): ping round trip median 28 ms; edit reaches the other client median 46 ms (p95 55); keystroke to visible median 115 ms (p95 129).

## Known limits (demo)

- The editing lock belongs to a person, not a tab: one person with two tabs can write from both.
- Any signed-in user can open and edit any document (the list is not filtered by owner).
- Leaving a document page closes its socket and gives up the lock (`DocStore.close()`, called through `app.on_leave`); `scripts/live.test.mjs` covers it.

## Still open

- Real Google sign-in is untested until a Google OAuth Client ID is set in `wrangler.jsonc` vars.
- R2 is not enabled on the account (error 10042), so staging/production have no snapshots yet.
- Web Push (VAPID) is not built; the bell asks for permission and shows a local test notification.
