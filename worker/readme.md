# worker/: the one backend

One Cloudflare Worker serves the whole site: static files from `public/` (the only web root) and everything under `/api/*`. There is no second backend. The design is [/notes/auth/](../public/notes/auth/readme.md) and [identity.md](../public/notes/auth/identity.md); this page says what is built.

The demo you can use today is the auth app at **`/app/`** ([public/app/](../public/app/)): Google sign-in, a mock feed, profile, an admin users list, live documents with an editing lock, and a PWA (install button, iOS hint, notification bell).

## The three stages (one config: [wrangler.jsonc](wrangler.jsonc))

| Stage | Worker | Address | D1 database | Entry |
|---|---|---|---|---|
| local | `monorepo-dev` | `http://localhost:8787` | `monorepo-local` (a file under `worker/.wrangler/`) | [dev.js](dev.js) (adds the dev login) |
| staging | `monorepo-staging` | `https://staging.lew42.com` | `monorepo-staging`, seeded with fake people | [index.js](index.js) |
| production | `monorepo` | `https://lew42.com` | `monorepo-prod` (migrated, empty, unused until the cutover) | [index.js](index.js) |

Bindings are not inherited between wrangler environments, so each stage lists its own. The dev login exists only in `dev.js`, which only the local stage uses as `main`: the staging and production bundles do not contain the route.

## Files

| File | What it does |
|---|---|
| [index.js](index.js) | The router. One table, `"METHOD /path": [action, handler]`; the router resolves the user, checks the host and the origin, then runs `can(user, action)` **before** the handler. |
| [session.js](session.js) | The stateless cookie `s`: HMAC-SHA256 over `{uid, te, exp}`. Role is never in it; `index.js` reads the role from D1 each request. `token_epoch` (`POST /api/auth/logout-all`) revokes every cookie of a user. |
| [can.js](can.js) | `can(user, "read" \| "write" \| "admin")`, the six rows of identity ruling 4. |
| [google.js](google.js) | Verifies a Google ID token (RS256 against Google's keys, WebCrypto). |
| [room.js](room.js) | The `Room` Durable Object: one per url chat room, one per document (`doc:<id>`). A document has a single-editor lock ([lock.js](lock.js)), a JSONL history in its own SQLite and an R2 snapshot after 20 s of changes (only when an R2 bucket is bound). Wire protocol at the top of the file. |
| [settings.js](settings.js) | `UserDO`: one per user, their settings. |
| [likes.js](likes.js), [pages.js](pages.js) | The older likes and page-listing endpoints. |
| [dostorage.js](dostorage.js) | Lazy schema steps for a Durable Object's SQLite. |
| [dev.js](dev.js) | Local only: `POST /api/dev/login {handle}` and `GET /api/dev/login?as=alice`. |
| [migrations/](migrations/) | D1 schema (`wrangler d1 migrations apply`). Append a file; never edit one that shipped. |
| [seed/](seed/) | `dev.sql` (six people alice, bob, carol, dave, eve (banned), admin) and `staging.sql` (four fake people, never able to sign in). |
| [scripts/](scripts/) | `deploy.mjs`, `icons.mjs`, `live.test.mjs`, `ui.test.mjs`, `latency.mjs`. |

The user object is `{id, provider, handle, avatar_url, role, created_at, last_login}`. There is no email column ([identity ruling 7](../public/notes/auth/identity.md)): the Google name is the handle, and `ADMIN_EMAIL` is compared at sign-in only.

Docs: [public/framework/core/Item/DocStore.js](../public/framework/core/Item/DocStore.js) is the `Item.Store` adapter the document page uses.

## Run it locally

From the repo root: `node dev.mjs` (applies the migrations and `seed/dev.sql`, then runs `wrangler dev -c worker/wrangler.jsonc`). Open `http://localhost:8787/app/` and press a "dev: …" button. Tests, with the stage running:

```
node worker/google.test.mjs && node worker/session.test.mjs && node worker/can.test.mjs && node worker/lock.test.mjs   # pure, no server
node worker/api.test.mjs http://localhost:8787      # every route: who may call it, host guard, origin guard, revoke, the Room lock
node worker/scripts/ui.test.mjs http://localhost:8787     # headless browser, needs PLAYWRIGHT_DIR (a path to the playwright package)
node worker/scripts/live.test.mjs http://localhost:8787   # two browsers on one document
```

`api.test.mjs` reads the route table out of `index.js`, so a route added without an assertion fails it.

## Deploy

`node worker/scripts/deploy.mjs staging [--seed]` applies the D1 migrations to that stage's own database, deploys `worker/wrangler.jsonc` for that environment and creates `SESSION_SECRET` once. Staging first. `--secret KEY=VALUE` sets another secret (`ADMIN_EMAIL`). Staging's session secret is also written to `worker/.dev.vars` (gitignored) so `node worker/scripts/latency.mjs` can sign cookies for its fake users and measure the real edit-to-other-phone time.

### Why a git push cannot ship an untested API

The root [wrangler.jsonc](../wrangler.jsonc) is what Cloudflare's Git builds deploy (`npx wrangler deploy` on the production branch, `versions upload` previews on others). It is **assets only**: no `main`, no D1, no `/api` code. So a push serves static files and nothing else; it cannot put the API on lew42.com or point a preview at production data. The API Worker has its own deploy command and its own stage config. As a second guard the API answers only on the hostnames in `API_HOSTS` and returns 503 on any other (a preview url, a `workers.dev` name), so even a wrongly attached stage cannot touch the wrong database.

## Production cutover (not done: lew42.com still serves the assets-only Worker)

`monorepo-prod` exists and is migrated. To switch lew42.com to this Worker:

1. Open the Cloudflare dashboard → Workers → `monorepo` → Settings → Builds. Set the production branch to `production` (or disconnect Git builds for this Worker) and turn off builds for non-production branches. My API token cannot read or change Workers Builds, so this is a dashboard step.
2. Run `node worker/scripts/deploy.mjs production --secret ADMIN_EMAIL=<your google email>`. That replaces the live Worker `monorepo` with the full API Worker, which still serves all of `public/`.
3. Check lew42.com, then set the deploy command of the Git build to `npx wrangler deploy -c worker/wrangler.jsonc --env production` (so a push to `production` ships it) and make the root `wrangler.jsonc` the same file or delete it.

Before step 2, finish the owner's list below.

## What the owner must do

1. **Google OAuth client** (Google Cloud Console → APIs & Services → Credentials → Create credentials → OAuth client ID → Web application; first configure the consent screen: External, app name, your email, scopes `openid email profile`). Authorized JavaScript origins, no redirect URIs needed (Google Identity Services popup/button):
   - `http://localhost:8787`
   - `https://staging.lew42.com`
   - `https://lew42.com` (and `https://www.lew42.com` if it is used)
2. Put the client id in `GOOGLE_CLIENT_ID` for each stage in [wrangler.jsonc](wrangler.jsonc) (it is public, not a secret) and run the deploy script again.
3. Set `ADMIN_EMAIL` (secret) to your Google email; your first Google sign-in becomes admin: `node worker/scripts/deploy.mjs staging --secret ADMIN_EMAIL=you@example.com`.
4. Enable R2 in the Cloudflare dashboard (Storage → R2), create buckets `monorepo-staging-docs` and `monorepo-docs`, and add an `r2_buckets` binding named `SNAPSHOTS` to each environment. Until then document history lives only in the Durable Object (fully working, no off-site copy).
5. The Git-builds change at cutover (above).
