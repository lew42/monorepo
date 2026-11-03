# Two small card follow-ups: the plan page reads each merge's done field, and the health check drops the retired fold class

Budget: $3. Sonnet. Load the `minion` and `code` skills. Your log is this dir's `task.jsonl`.

**Why (`public/framework/ai/todo.md`, the 2026-10-19 11:45 line; the card-merges task log `../card-merges/task.jsonl`):** after merges 4 popovers and 5 folds landed (42f94a4be, 7cbbb67f8), two loose ends: (1) `public/framework/ux/Content/plan/page.js` does not read the `done` field of `plan.json`, so the plan page's two big numbers (kinds 36, padding rules 5) never move as merges land, and a done merge is not marked on the page; (2) `Server/health.mjs` still names `.ai-fold-bar`, a class the fold merge retired for `details.ui-accordion-item`, so the health check looks for something that no longer exists. Read `ux/Content/plan/readme.md` (`count.mjs` is the one counter; the page only reads), `plan.json` (the `done` field the merges set), `plan/page.js`, and `grep -n "ai-fold-bar" Server/health.mjs public/framework -r`.

## Deliverable

1. **The plan page:** a merge with `done` set renders as done (a ✅ and the landing commit beside its name, its pairs folded), and the two big numbers are computed from `plan.json` the same way `count.mjs` computes them (import the same function, never a second formula): print the numbers `count.mjs` gives and what the page shows, they must agree. `check_page` on `/framework/ux/Content/plan/` at 400 and 1200, zero errors; `node Server/padding-check.mjs` on it clean.
2. **health.mjs:** the `.ai-fold-bar` check becomes the `details.ui-accordion-item` check (or is removed if the fold merge made it moot: say which in a `decision` line); `node Server/health.mjs` (or however it runs: its header says) passes on the AI tasks page.
3. Worktree, `node --check`, `Server/smoke.mjs` clean, `merge.mjs` (`--no-review` naming your review if the gate cannot see this 2026-10-13 task dir), a `finish` line with the agreeing numbers checked with `tail -1`, `git status` clean for your paths; strike the two follow-ups inside the todo line (`~~` around those words, the landing commit named). Never restart servers; never drive the owner's tabs.

Fence: `ux/Content/plan/page.js` (and its CSS), `Server/health.mjs`, the todo words, this task dir. Not `count.mjs`, not `plan.json`.
