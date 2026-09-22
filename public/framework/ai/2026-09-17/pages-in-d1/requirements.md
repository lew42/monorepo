# pages-in-d1 — the local proof: a page whose children live in D1, end to end, before the owner's five minutes

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one table, one route, one page; copy the proven pattern). Clear beats brief by far. Prioritize (the read path first; a write path only if the auth pattern comes free).
**Length budget:** the demo page is one screen: the children drawn from the database and one line saying where they came from. Your landing report is one screen with the two counts.

## The owner's words (2026-09-17, 22:40)

> Can we store pages in SQLite? On cloudflares D1? What is required to get that working? Look for past work.

The scout's answer (`ai/2026-09-17/sqlite-scout/report.md` — read it first): SQLite half working — works locally (Miniflare, the local D1 is a `.sqlite` file), never deployed; the deploy needs the owner's Cloudflare login (their 5-minute item). The mastermind's decision: build and prove the local slice now; the deploy waits for the owner.

## What exists — copy it, do not reinvent

- `worker/index.js` (routes and who may call them), `worker/likes.js` (the proven D1 read/write pattern: prepared statements, `env.DB`), `worker/schema.sql` + `worker/seed.sql` (idempotent), `wrangler.dev.jsonc` (the D1 binding, local), `dev.mjs` (`PORT=<site> API_PORT=<api> npm run dev` runs both servers and applies schema + seed; read its header and `ai/2026-09-06/platform-slice/run.md` for how the browser reaches `/api/*` locally).
- Core: `children` may be a function returning a promise (`/framework/core/Page/doc/data-children/`), applied today. `/imagine/cms/` already has JSON pages built on data children (`/imagine/cms/json/`) — read its `page.js` for the shape a fetched child list takes.
- ⚠ `schema.sql` records a prior decision: likes key on `url`, "there is no page table and there should not be one" — that was about likes never referencing a page id. A `pages` table that STORES pages is a different thing; say so in one comment beside the table and do not touch `likes`.

## Deliverables

1. **The table**: `pages(path TEXT PRIMARY KEY, json TEXT NOT NULL, updated INTEGER NOT NULL)` in `worker/schema.sql`; three seeded rows in `worker/seed.sql` under `/imagine/cms/d1/` (a title, a description, an icon each, as the JSON pages use), idempotent like the rest.
2. **The route**: `GET /api/pages?under=<path>` in a new `worker/pages.js`, wired in `worker/index.js` beside likes: returns the rows whose `path` starts with `under`, as `[{path, ...json}]`, no auth for reads (pages are public), same shape as likes' handler. A `PUT /api/pages` that upserts one row ONLY if the existing user check in `index.js` makes it a five-line addition; otherwise leave it and say so.
3. **The page**: `public/imagine/cms/d1/page.js` — `children(){ return fetch("/api/pages?under=/imagine/cms/d1/").then(r => r.json()).then(rows => rows.map(…)) }`, one visible line ("these three children are rows in the local D1"), added to `/imagine/cms/page.js` `children:` (and one visible line there — count the anchor). If the site's dev server cannot reach the worker's origin, the page says "database unreachable" in one line instead of breaking — `available()`-style, never a console error.
4. **The proof**: run the harness on private ports (`PORT=8110 API_PORT=8202 node dev.mjs` from the repo root, in the background; both processes killed by their REAL Windows PIDs at landing — `$!` is not one; read `netstat -ano` for both ports); `curl` the route (3 rows); load the page headless — three child links drawn, zero console errors; two numbers that must agree: rows from the route and links on the page. Then the deploy checklist for the owner, verbatim from the scout, as the last three lines of the page's `decisions.md`.
5. **Docs**: `public/imagine/cms/readme.md` gets one Use line; the page's `decisions.md` (the record: the table, the route, why no page id for likes, the deploy checklist with minutes).

## Rules

- Load `code`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/pages-in-d1/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `worker/schema.sql`, `worker/seed.sql`, `worker/index.js`, `worker/pages.js` (new), `public/imagine/cms/d1/**` (new), one `children:` word + one line in `public/imagine/cms/page.js`, one line in `public/imagine/cms/readme.md`, your task dir. Nothing else — never `wrangler.jsonc` (production), never `worker/likes.js`, never a deploy, never `wrangler login`.
- Never kill or restart the dev server on port 80, never drive the owner's tabs, never `git stash`, never `find /`. Timestamps from the clock; never Out-File for jsonl.
- Landing: `outcome` = the headline ("three pages read from D1, locally"), the link, the route's response as a short code block, the two counts, the owner's checklist with minutes, what was left and why. One screen.
