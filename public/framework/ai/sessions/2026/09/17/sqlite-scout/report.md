# SQLite half working: works locally, never deployed to production

**Cloudflare login and D1 create — 5 min.** That's the one thing needed to test this for real; everything else below is already built and already proven to work, just never turned on live.

## Is it working

Locally, yes — proven, not just configured. `npx wrangler dev --config wrangler.dev.jsonc --local` booted a real local Cloudflare Worker (Miniflare, on port 8145) in 3 seconds and answered two real routes from `worker/index.js`: `GET /api/me` and `GET /api/likes`. The local database is literally a `.sqlite` file on this machine (`.wrangler/state/v3/d1/`) — D1 *is* SQLite. `npx wrangler d1 list` fails with an auth error (no `CLOUDFLARE_API_TOKEN`, not logged in) — expected, and the only blocker to touching the real Cloudflare account.

In production, no. `wrangler.jsonc` (the file that actually deploys) has no `main` and no `d1_databases` binding — it only ships static files. Nothing with server code has ever been deployed to this site; confirmed by an earlier scout ([`/imagine/platform/prior/`](/imagine/platform/prior/)).

## Past work (why this already mostly exists)

Three tasks built and proved this, in order, none of it touched since:

1. [`/imagine/platform/decisions/data.md`](/imagine/platform/decisions/data.md) (2026-09-04) — ruled D1 for real rows, a Durable Object per live page.
2. `local-dev-harness` (2026-09-04, task log at `/framework/ai/2026-09-04/local-dev-harness/`) — built `worker/`, `wrangler.dev.jsonc`, `dev.mjs`; tested with real browser tabs that identity, D1, and a chat room all work locally.
3. `platform-slice` (2026-09-06, recipe at [`/framework/ai/2026-09-06/platform-slice/run/`](/framework/ai/2026-09-06/platform-slice/run/)) — proved the D1 *write* path: a "like" button writes a real row that survives a page reload and a full restart. Found and fixed a real bug on the way: D1 enforces foreign keys, so the seed script's old `DELETE FROM users` would have broken the second time anyone ran it.

Today the worker has three tables/routes: `users` and `likes` in D1 (`worker/schema.sql`), plus a `Room` Durable Object with its own private SQLite for chat. The site itself calls none of this yet outside the one demo page at [`/imagine/platform/topic/`](/imagine/platform/topic/).

## Can pages live in SQLite / D1 — what it takes

Yes, and half the plumbing already exists. As of today (2026-09-17), a page's `children` can be a function that fetches its own list — see [`/framework/core/Page/doc/data-children/`](/framework/core/Page/doc/data-children/) — so a page tree from D1 needs no new core work, just:

1. **A `pages` table** — `pages(path TEXT PRIMARY KEY, json TEXT, updated INTEGER)`, one line in `worker/schema.sql` next to the existing `likes` table. ~10 min.
2. **A worker route**, `GET/PUT /api/pages?under=<path>`, in `worker/index.js`, gated the same way `/api/likes` already is. ~30 min, copying the proven `likes.js` pattern.
3. **A page** using `children(){ return fetch("/api/pages?under=…").then(r => r.json()) }`. ~10 min — this part is free today.
4. **The D1 binding for local dev** — already done (`wrangler.dev.jsonc`).
5. **The owner's Cloudflare login + `wrangler d1 create`** — the 5-minute item above, needed once, for real.
6. **Production `wrangler.jsonc` gains a `main` and a `d1_databases` binding, then a deploy** — this is the actual gap. Nothing like it has ever shipped here.

**Does that break "no server at runtime"?** It lives beside the law, the way the worker is already built: `run_worker_first` is scoped to `/api/*` only, so every real page still ships as a plain static file with zero server involvement — the worker only answers the data fetch a page's `children()` makes, the same way `/api/likes` works today. But deploying *any* worker `main` to production would be the first time ever (item 6) — that's a real step outside today's static-only deploy, worth asking about before doing it, not a silent given.

Numbers, screenshots and the raw findings are in the task log: [`/framework/ai/2026-09-17/sqlite-scout/`](/framework/ai/2026-09-17/sqlite-scout/).
