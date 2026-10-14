# AI 2 vs AI: two card stores, the date layout, the merge proposal

<!-- merged from ai2-and-date-layout-2026-10-08.md (original kept in archive/) -->
## AI 2 vs AI, and the date directory layout — owner decisions, 2026-10-08

Recorded from dictation. **Facts found by looking:**
- `framework/ai2/` is a separate module (the "AI 2" dashboard: `card.js`, `rail.js`, chat, compose, agents…). **Correction (checked after writing the first version):** it has **no card data tree of its own**: `ai2/2026/10/08/` does not exist on disk; the card at `/framework/ai2/2026/10/08/task-audit-what-was-asked-and-never-fini/` lives in `ai/sessions/2026/10/08/cards/` and the `ai2` URL is another way to view it (find the route/alias that makes `/framework/ai2/<date-path>/` resolve). So the question is not two data stores but **two URL spaces and two UIs (AI 1 and AI 2) over the same data**, plus the unfinished merge.
- The plan itself is under `ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/` (hyphen layout); the card folder name was cut by the slug length (`…never-fini`).
- `ai/` has **46 hyphen-dated directories** (`2026-10-08/`) plus the year tree (`ai/sessions/2026/10/08/cards/`, 393 entries). Git has **141 `worktree/*` branches**, 11 of them `worktree/ai2-*` (zombie candidates).

**Owner's decisions / directives**
1. The intent was to **merge AI 2 into AI (AI 1)**. Find out how far that got, what is still only in `ai2/`, and what uses it. Do not duplicate data.
2. **Nothing destructive.** Port all tasks and raw data from `ai2/` to `ai/` by **moving** (git mv, no rewriting), keeping history; no deleting. Zombie branches: list them, check each is merged or archived, don't delete without proof it is safe (tag or keep).
3. **Date layout:** prefer the year tree `ai/YYYY/MM/DD/` (one `2026/` directory, tidy) over a growing pile of `ai/2026-10-08/` directories. Get the new system working with nested year/month/day. Moving the old hyphen directories breaks links site-wide, but the owner thinks it is worth it; a **hybrid** is fine: both layouts resolve, new work goes in the year tree, old ones stay in place (or move later, or fade as they age). Prefer the least breakage: a redirect/resolver rather than rewriting history.
4. Fix the **slug truncation** (a task-audit card became `…never-fini`); folder names should not cut a word.

Owner of the investigation: `2026-10-08/ai-system-docs` (AI system overview must cover AI 2). Output: an inventory (what lives where) and a migration proposal with the least breakage; do the safe, additive parts only.


### Update 2026-10-09: the merge happened

One script ([migrate.mjs](/framework/ai/sessions/2026/10/09/session-6784f3f5/ai2-merge/migrate.mjs)) moved the live AI 2 code to [ai/cards](/framework/ai/cards/) and [ai/rail](/framework/ai/rail/), the docs to [doc/ai2/](doc/ai2/history.md), and old page logs to [archive/ai2](archive/ai2/readme.md). The old `ai2/*.js` paths are one-line re-export shims, and `/framework/ai2/...` still routes through `ai2/page.js`. Every move is in [manifest.json](/framework/ai/sessions/2026/10/09/session-6784f3f5/ai2-merge/manifest.json) (`node migrate.mjs --revert` undoes it); the file-by-file facts are in [inventory.md](/framework/ai/sessions/2026/10/09/session-6784f3f5/ai2-merge/inventory.md). Not done: the date-layout and zombie-branch parts of the decisions above.


---

<!-- merged from ai2-merge-and-layout-proposal-2026-10-08.md (original kept in archive/) -->
## AI 2 into AI, the date layout, and the slug bug — inventory and proposal (2026-10-08)

Answers [ai2-vs-ai.md](ai2-vs-ai.md). Inventory is computed; the proposal moves nothing yet. Branch list: [branches.md](branches.md) (script: `branches.mjs`).

### 1. What is true now
- **One data store, two UIs.** `ai2/` has no date tree. `/framework/ai2/2026/10/08/<card>/` is `ai2/page.js` `route()` answering the card id through `AIRail.route()` / `card_page()`; the card's files live in `ai/sessions/2026/10/08/cards/<card>/` (written by `Servex/cards/Cards.js`, which also imports `ai2/fold.js` and `ai2/needs-rule.js`). So cards are not duplicated; the two URLs are two views of one folder.
- **How far the merge got:** the data merge is done (everything is in `ai/`). The UI merge is not: `ai2/` still owns the Inbox, Log, Needs-you, Overview, rail, card page, compose, chat and live card (about 35 files, readme 387 lines), and `ai/page.js` shares the rail through `AIRail.handles()`. `ai2.css` is retired down to v1-only screens ("until AI 2 is retired").
- **What uses `ai2/`:** `Servex/cards/Cards.js` (fold, needs-rule), `Servex/Servex.js` (the live card route, card storage), `Server/Ai2Overview.mjs`, the AI board links, and many dated task docs as links.

### 2. Proposal A: port ai2 into ai, no rewrites
`git mv` the shared pieces (`fold.js`, `needs-rule.js`, `card.js`, `rail.js`, `live.js`, `inbox.js`) from `ai2/` to `ai/cards/` as classes named after their files; leave a one-line re-export stub at every old path so the ~Servex imports and old links keep working. Remove a stub only after a grep shows no importer. Order: `fold.js` and `needs-rule.js` first (Servex imports them, so a Servex restart checks it), UI later. Not started: it touches Servex imports (ask first) and the files other agents are editing.

### 3. Proposal B: the date layout, hybrid
Today: `ai/` has 46 hyphen dirs (`2026-10-08/`, 8,398 tracked files; the year tree has 687) and a year tree (`ai/sessions/2026/10/08/cards/`, already used by every card). That already is the hybrid. The cheapest safe step is **declare the rule, move nothing**: new tasks and cards go in the year tree; hyphen dirs stay where they are and age out. Moving them would break at least the links in 3,089 files that mention `ai/20YY-MM-DD` (about 142k occurrences, counted by grep, mostly inside the dated dirs themselves). A static production site cannot redirect, so the only link-safe moves are copies or stubs; neither is worth it. Alternative if the owner insists: one script that `git mv`s a hyphen dir and rewrites those links in one commit, run on a branch with the four-width crawl as the check.

### 4. The slug bug
`Servex/cards/Cards.js` `slugify()` cuts at 40 characters, mid-word (`...never-fini`). Fix, a two-line change for the Servex owner: cut at the last `-` before 40 when one exists past character 20. It only changes names of new cards; existing folders and ids never change. Not applied here: `Servex/` needs a restart and is another agent's area.

### 5. Zombie branches
141 `worktree/*` branches, 11 are `ai2-*`. Half are merged, half carry commits `michael/dev` lacks; see [branches.md](branches.md). Nothing deleted. Next step if wanted: tag every merged one (`archive/<name>`), then delete the branch name only.
