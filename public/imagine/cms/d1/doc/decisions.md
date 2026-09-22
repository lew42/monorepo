# D1 pages — the record

Task: [`ai/2026-09-17/pages-in-d1/`](/framework/ai/2026-09-17/pages-in-d1/). The owner asked
whether pages can live in SQLite / Cloudflare D1; the scout's report
([`ai/2026-09-17/sqlite-scout/report.md`](/framework/ai/2026-09-17/sqlite-scout/report.md))
found most of the plumbing already built and working locally. This task built the last piece
— a table, a route, a page — and proved the whole chain end to end on this machine.

## The table

`pages(path TEXT PRIMARY KEY, json TEXT NOT NULL, updated INTEGER NOT NULL)` in
`worker/schema.sql`, right beside `likes`. Three rows are seeded under `/imagine/cms/d1/` in
`worker/seed.sql`, upserted so a second `npm run dev` does not duplicate them.

**Why this does not touch the `likes` decision.** `schema.sql` already carries a real rule:
a like keys on the page's `url`, not on a page id, because a rename must never orphan a like.
That rule is about what a *like* points at — it says nothing about where a page's own content
lives. This `pages` table is that content, keyed on its own `path`. Nothing in `worker/pages.js`
reads or writes the `likes` table, and nothing in `worker/likes.js` changed.

## The route

`GET /api/pages?under=<path>` in `worker/pages.js`, wired into `worker/index.js` right after
`/api/likes`. It returns every row whose `path` starts with `under`, as `[{path, ...json}]` —
no auth check, because pages are public the same as any static file under `public/`.

**The write path came free, so it is built too.** `PUT /api/pages` upserts one row. It reuses
the exact five lines `/api/likes`'s `POST` branch already proved: `can(user, "write")`, then the
`Sec-Fetch-Site` same-origin check. Verified by hand: anonymous gets `403`; signed in as
`alice`, a `PUT` lands the row and a following `GET` shows it; the test row was deleted again
afterward so the seed stays at exactly three.

## The page

`public/imagine/cms/d1/page.js` copies `/imagine/cms/json/page.js`'s seam exactly — `children`
is a function that fetches its list (core's `doc/data-children.md`) — except the fetch goes to
`worker/pages.js` instead of a `page.json` file. One thing had to be undone from the first
draft: `index: true` was set by mistake, which tells core *"my own `content()` already draws my
children"* and suppresses core's default child-link list — since this page draws no such list
itself, that flag hid all three links. Removing it lets core draw its own list, the same one
`/imagine/cms/json/` already relies on.

**The offline line.** Every fetch ends in `.catch(() => null)`, matching
[`/imagine/platform/like.js`](/imagine/platform/like.js)'s rule: a missing API is not a bug, so
it never throws. Loaded with no worker at this origin, the page says **"Database unreachable —
the page renders anyway, which is the point."** instead of a blank page or a console error —
verified headless on `:8110` (the static-only server), zero console errors.

## The proof (2026-09-17, local harness on :8110 / :8202)

```
$ curl http://localhost:8202/api/pages?under=/imagine/cms/d1/
[{"path":"/imagine/cms/d1/one/",...},{"path":"/imagine/cms/d1/three/",...},{"path":"/imagine/cms/d1/two/",...}]
```

- **Rows from the route: 3.** **Links drawn on the page: 3.** The two agree — verified headless
  with Playwright, `waitUntil: "networkidle"` plus a settle pause for the async `children()`.
- **Console errors on `/imagine/cms/d1/` (worker origin, `:8202`): 0**, beyond the framework's
  own known, pre-existing `WebSocket` dev-socket noise (`run.md`'s own troubleshooting section
  names this exact message as *"expected, and harmless"* on any page loaded from the wrangler
  origin — reproduced identically on the unrelated `/imagine/platform/topic/` page, so it is not
  this task's bug).
- **Console errors on `/imagine/cms/d1/` (static-only origin, `:8110`, worker unreachable): 0**,
  including the WebSocket noise — this origin's dev socket connects fine, since it IS
  `node server.js`.
- Clicking into a child (`/imagine/cms/d1/two/`) renders its own one-line content with no error.

## Left open, and why

**The CMS parent wall (`/imagine/cms/page.js`) draws a broken image for the new `d1` card.**
Its `previews()` wall looks up a screenshot per child in a `SHOTS` map; `d1` has none, so the
card's `<img>` gets `src=".../shots/undefined"` (confirmed: `naturalWidth: 0`, no console error
— a failed image load is a network event, not a thrown error). The real fix is either a
screenshot for a `SHOTS.d1` entry, or extending the wall's existing `if (name === "guide")
return;` guard to also skip `d1`. Both are more than the one `children:` word plus one line this
task's fence allows in `public/imagine/cms/page.js` — named here rather than fixed, for whoever
takes the CMS wall next.

**The deploy itself — outside every fence on this task, and the owner's own next step.** Verbatim
from the scout's report, the three items still standing between this local proof and the real
Cloudflare account:

4. **The D1 binding for local dev** — already done (`wrangler.dev.jsonc`).
5. **The owner's Cloudflare login + `wrangler d1 create`** — the 5-minute item, needed once, for real.
6. **Production `wrangler.jsonc` gains a `main` and a `d1_databases` binding, then a deploy** — this is the actual gap. Nothing like it has ever shipped here.
