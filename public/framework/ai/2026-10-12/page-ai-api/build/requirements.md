Budget: $12

# Build: make the page tools match `ai-api.md` (minion brief)

You are a minion of @mastermind-page-ai-api. Work ONLY in the worktree `C:/Code/lew42/worktrees/page-ai-api` (branch `worktree/page-ai-api`). Commit each working step there with a clear message. Do not merge; report back when done.

**The spec is `public/framework/core/Page/doc/ai-api.md` in that worktree. Read it first.** Build what it says; where reality forces a difference, change the doc in the same commit and say why.

## Read first (do not rebuild)
- `Servex/agents/page_tools.js` (page_set, page_add, page_call, page_log, page_read) and its test `Servex/agents/page_tools.test.mjs`.
- `Servex/pages.js` (`create_page`: folder + page.jsonl line 1 + readme stub + link in parent).
- `public/framework/ai/AISession/AISessionDetail.js` (a session page: `/framework/ai/sessions/<id>/`, whose `page.jsonl` lives in a dated folder; `log_urls()`, `child()`, `SessionPageLog`).
- `public/framework/core/Page/parts/` (part-heading, part-text, part-card).

## Deliverables (tick each with proof in your report)
1. **`Servex/agents/Subpages.js`, `class Subpages`**: `add({name,title,icon,description})`, `rename({name,to})`, `remove(name)` on one parent folder (a `page.jsonl` parent gets `{"file":"<name>/page.jsonl"}` / `{"file":"<name>/page.jsonl","gone":true}` lines; a `page.js` parent gets its `children:` string edited). Remove = move the folder to `<parent>/_removed/<name>-<YYYYMMDD-HHMMSS>/`, never delete. A `dry` option returns the plan (old → new paths) without touching disk. A tiny CLI at the bottom (`node Servex/agents/Subpages.js rename <parent-url> <name> <to> [--dry]`) so a move is scriptable. `create_page` in `Servex/pages.js` calls `Subpages.add` for the folder and link (keep its readme stub and its parent-context answer), so there is one implementation.
2. **`page_set` handles a top-level `pages` key** through `Subpages` (add / rename / remove), writes the rest of the delta as today, and answers `{ok, ids, line, size}` where `ids` lists every id it stamped (so the model can target them next). A subpage made on a session page goes in the session's own folder.
3. **`resolve()`**: a session route deeper than the page (`/framework/ai/sessions/<id>/notes/`) resolves to `<session folder>/notes/page.jsonl` when that folder exists; otherwise it keeps today's behaviour (the segment is a tab target). Same for a plain page: `/x/notes/` is already its own folder.
4. **Descriptions**: `page_set`'s description carries the model in a few lines (the three key rules, the card types, `pages.add`, ids returned) and points to `/framework/core/Page/doc/ai-api.md`. `page_add`, `page_call`, `page_log` and `create_page` each get a one-line description: "alias of page_set …". An agent that reads only the descriptions must be able to build a heading, three cards and a subpage without a wrong first try.
5. **`page_read`** lists each card's `type` and id, and the subpages (from `file` lines, minus `gone`), with their urls.
6. **The session page draws it, live, in a browser**: on `/framework/ai/sessions/<id>/` a `part-heading`, `part-text` and `part-card` appended by the tool appear within about a second with no reload, and a subpage made by `pages.add` opens at `/framework/ai/sessions/<id>/<name>/` and survives a reload. Fix with small additive changes in `AISessionDetail.js` (and the parts kinds' registration if they are not imported there). **Do not edit `core/Page/Page.class.js`** (frozen while its split plan runs). Prove it headless (`mcp__site__shot` or a Playwright probe in your scratchpad, never the owner's tabs) against the worktree's own server (see `Server/readme.md` / `start_server` for how a worktree is served; a private port).
7. **Tests**: extend `page_tools.test.mjs` for pages add/rename/remove (in a temp folder), `ids`, and the subpage resolve; run it, plus `node Server/smoke.mjs C:/Code/lew42/worktrees/page-ai-api`.

## Never
- Never rewrite a whole `page.jsonl`; append lines only. Never delete a folder.
- Do not restart the main Servex; the mastermind batches one restart after merge.
- Do not touch files outside: `Servex/agents/page_tools.js`, `Servex/agents/page_tools.test.mjs`, `Servex/agents/Subpages.js`, `Servex/pages.js`, `public/framework/ai/AISession/AISessionDetail.js`, `public/framework/core/Page/parts/*`, `public/framework/core/Page/doc/ai-api.md`, and your own scratchpad. Need another file? Say so in your report.

## Report
Append to `public/framework/ai/2026-10-12/page-ai-api/build/task.jsonl` as you go (a line at least every ~5 minutes). End with `report.md` beside this brief: one screen, each deliverable ✅/⬜ with its proof (commit hash, test output line, screenshot path), and anything you changed in `ai-api.md`.
