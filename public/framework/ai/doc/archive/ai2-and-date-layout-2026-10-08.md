# AI 2 vs AI, and the date directory layout — owner decisions, 2026-10-08

Recorded from dictation. **Facts found by looking:**
- `framework/ai2/` is a separate module (the "AI 2" dashboard: `card.js`, `rail.js`, chat, compose, agents…). **Correction (checked after writing the first version):** it has **no card data tree of its own**: `ai2/2026/10/08/` does not exist on disk; the card at `/framework/ai2/2026/10/08/task-audit-what-was-asked-and-never-fini/` lives in `ai/2026/10/08/` and the `ai2` URL is another way to view it (find the route/alias that makes `/framework/ai2/<date-path>/` resolve). So the question is not two data stores but **two URL spaces and two UIs (AI 1 and AI 2) over the same data**, plus the unfinished merge.
- The plan itself is under `ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/` (hyphen layout); the card folder name was cut by the slug length (`…never-fini`).
- `ai/` has **46 hyphen-dated directories** (`2026-10-08/`) plus the year tree (`ai/2026/10/08/`, 393 entries). Git has **141 `worktree/*` branches**, 11 of them `worktree/ai2-*` (zombie candidates).

**Owner's decisions / directives**
1. The intent was to **merge AI 2 into AI (AI 1)**. Find out how far that got, what is still only in `ai2/`, and what uses it. Do not duplicate data.
2. **Nothing destructive.** Port all tasks and raw data from `ai2/` to `ai/` by **moving** (git mv, no rewriting), keeping history; no deleting. Zombie branches: list them, check each is merged or archived, don't delete without proof it is safe (tag or keep).
3. **Date layout:** prefer the year tree `ai/YYYY/MM/DD/` (one `2026/` directory, tidy) over a growing pile of `ai/2026-10-08/` directories. Get the new system working with nested year/month/day. Moving the old hyphen directories breaks links site-wide, but the owner thinks it is worth it; a **hybrid** is fine: both layouts resolve, new work goes in the year tree, old ones stay in place (or move later, or fade as they age). Prefer the least breakage: a redirect/resolver rather than rewriting history.
4. Fix the **slug truncation** (a task-audit card became `…never-fini`); folder names should not cut a word.

Owner of the investigation: `2026-10-08/ai-system-docs` (AI system overview must cover AI 2). Output: an inventory (what lives where) and a migration proposal with the least breakage; do the safe, additive parts only.


## Update 2026-10-09: the merge happened

One script ([migrate.mjs](/framework/ai/sessions/2026/10/09/session-6784f3f5/ai2-merge/migrate.mjs)) moved the live AI 2 code to [ai/cards](/framework/ai/cards/) and [ai/rail](/framework/ai/rail/), the docs to [doc/ai2/](doc/ai2/history.md), and old page logs to [archive/ai2](archive/ai2/readme.md). The old `ai2/*.js` paths are one-line re-export shims, and `/framework/ai2/...` still routes through `ai2/page.js`. Every move is in [manifest.json](/framework/ai/sessions/2026/10/09/session-6784f3f5/ai2-merge/manifest.json) (`node migrate.mjs --revert` undoes it); the file-by-file facts are in [inventory.md](/framework/ai/sessions/2026/10/09/session-6784f3f5/ai2-merge/inventory.md). Not done: the date-layout and zombie-branch parts of the decisions above.
