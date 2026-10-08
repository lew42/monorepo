# AI 2 vs AI, and the date directory layout — owner decisions, 2026-10-08

Recorded from dictation. **Facts found by looking:**
- `framework/ai2/` is a separate module (the "AI 2" dashboard: `card.js`, `rail.js`, chat, compose, agents…). It also holds **card data** in its own date tree (`ai2/2026/10/08/<card>/`), while the `create_card` tool wrote another card to `ai/2026/10/08/<card>/`. So cards are split over two stores. The card at `/framework/ai2/2026/10/08/task-audit-what-was-asked-and-never-fini/` is the task-audit Inbox card (its folder name was cut off by the slug length); the plan itself is under `ai/2026-10-08/task-audit/`.
- `ai/` has **46 hyphen-dated directories** (`2026-10-08/`) and also a year tree (`ai/2026/10/08/`). About 40 `worktree/ai2-*` branches linger in git (zombie branches).

**Owner's decisions / directives**
1. The intent was to **merge AI 2 into AI (AI 1)**. Find out how far that got, what is still only in `ai2/`, and what uses it. Do not duplicate data.
2. **Nothing destructive.** Port all tasks and raw data from `ai2/` to `ai/` by **moving** (git mv, no rewriting), keeping history; no deleting. Zombie branches: list them, check each is merged or archived, don't delete without proof it is safe (tag or keep).
3. **Date layout:** prefer the year tree `ai/YYYY/MM/DD/` (one `2026/` directory, tidy) over a growing pile of `ai/2026-10-08/` directories. Get the new system working with nested year/month/day. Moving the old hyphen directories breaks links site-wide, but the owner thinks it is worth it; a **hybrid** is fine: both layouts resolve, new work goes in the year tree, old ones stay in place (or move later, or fade as they age). Prefer the least breakage: a redirect/resolver rather than rewriting history.
4. Fix the **slug truncation** (a task-audit card became `…never-fini`); folder names should not cut a word.

Owner of the investigation: `2026-10-08/ai-system-docs` (AI system overview must cover AI 2). Output: an inventory (what lives where) and a migration proposal with the least breakage; do the safe, additive parts only.
