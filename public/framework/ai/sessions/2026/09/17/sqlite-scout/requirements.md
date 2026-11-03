# sqlite-scout — one line: is SQLite working; can pages live in SQLite or D1; what it takes; the past work

Load the `minion` skill first. Then this brief. Read-only over the repo; you write only your task dir (`new-task` first, `finish-task` at the end).

**Three laws.** Less is more. Clear beats brief by far. Prioritize.
**Length budget:** your report is ONE item the owner clicks if interested: the first line reads exactly `SQLite working`, `SQLite not working`, or `SQLite half working: <six words>`; then one owner item with minutes if one exists (`Cloudflare login and D1 create — 5 min`); then one screen of plain sentences with links.

## The owner's words (2026-09-17, 22:40)

> Look into whether we got SQL working. For this task, your message should read: "SQLite (not?) working". One item, I click on it if I'm interested. Can we store pages in SQLite? On cloudflares D1? What is required to get that working? Look for past work.

## What to do

1. **Past work.** `worker/` at the repo root (`index.js`, `room.js`, `session.js`, `likes.js`, `schema.sql`, `seed.sql`, `wrangler.jsonc`, `wrangler.dev.jsonc` with a `d1_databases` binding and `new_sqlite_classes: ["Room"]`). Read them. Then `rg -il "d1|sqlite|wrangler|durable" public/framework/ai --glob "*.md" --glob "*.jsonl"` for the task logs and briefs that built it — link the two or three that matter (`/framework/ai/<date>/<slug>/`). Say in one line each what the worker does today (tables, routes, what the site calls) and whether production (`wrangler.jsonc`) binds a D1 at all.
2. **Is it working.** Without credentials you cannot deploy; you can: `npx wrangler --version`; `npx wrangler d1 list` (expect an auth error — that error IS the owner item); `npx wrangler dev --config wrangler.dev.jsonc --local` for at most 60 seconds on a port ≥ 8110 to see whether the local D1 (Miniflare) boots and answers one route from `index.js` — kill it by PID. Never touch the dev server on 80, never deploy, never `wrangler login`. The verdict line follows from what answers.
3. **Pages in SQLite / D1.** Core's `children` may now be a function returning a promise (`/framework/core/Page/doc/data-children/`, applied today) — so a page can declare `children(){ return fetch("/api/pages?under=…").then(r => r.json()) }` and the rows can live anywhere. Say what it takes, as a numbered list with minutes: the table (`pages(path, json, updated)`), a worker route, the binding, the owner's login + `wrangler d1 create`, a deploy; and what the STATIC production site can and cannot do (no server at runtime: D1 only reaches the site through the worker, so a D1-backed page tree is a worker route, never a static file — say whether that breaks the "no server at runtime" law or lives beside it as the worker already does).
4. Report as `report.md` in your task dir (one screen) and as your final message — the same text.

## Rules

- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`; search with rg scoped to the repo. No repo file outside your task dir changes. Timestamps from the clock; never Out-File for jsonl.
