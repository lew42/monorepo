# Minion: show the worktree pool on the Live card

Load the `minion` skill, then `page` and `content`. Card with the owner's raw words: `public/framework/ai/2026/09/25/quick-fix-worktrees-smoke-test-then-merg/`. Parent brief: `public/framework/ai/2026-09-25/quickfix-worktrees/requirements.md` (deliverable 5, second half).

**Work only in the worktree** `C:/Code/lew42/worktrees/quickfix-worktrees` (its site: http://127.0.0.1:65447). Commit there. Do not merge.

## Deliverable

The Live card (`public/framework/ai2/live.js`, reached at `/framework/ai2/` from the rail; find how it is placed) shows the worktree pool: each slot as ready, preparing, or taken by whom, and how long it has been idle or taken. Keep it small: a compact row or chip list, not a new page.

- Data: `GET <servex_base()>/api/worktrees` (use the `servex_fetch`/`servex_base` helpers live.js already uses). The shape is `{ K, N_hours, slots: [{id, state, url, path, branch, taken_by, taken_at, idle_since}] }`.
- Another minion is building that route in parallel. Until the live Servex has it the fetch 404s, so render nothing then, with no console error (check `res.ok` before `.json()`).
- To prove it, stub the route in Playwright with `page.route("**/api/worktrees", …)`, answering three slots: one ready, one taken by `task-foo`, one preparing. Screenshot `/framework/ai2/` at 1920 with the pool visible, save it as `live/pool-1920.png`, and judge it yourself: can you tell at a glance what is free?
- New CSS class names go through the `new-css-class` skill. CSS goes inside a layer.
- Run `node Server/layout-check.mjs http://127.0.0.1:65447/framework/ai2/ --widths 1920` and confirm zero errors.
- Commit (the message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`), log to `live/task.jsonl`, and write `live/report.md` (one screen, with the screenshot).

Fence: `public/framework/ai2/live.js` and `ai2.css` (only if needed), and `live/` in the task dir. Nothing in Servex/.
