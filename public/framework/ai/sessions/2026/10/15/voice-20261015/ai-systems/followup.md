# framework/ai follow-up: session data, token accounting, past-work, readmes, per-module log (2026-10-15)

Ask 0f679acf ([verbatim](../ask-0f679acf.md)). Facts only, apart from one readme fix (section 4). Counts come from node one-liners over this checkout; the earlier [report](report.md) has the abandoned-task census.

## On one screen

- **Session data is complete but stale; tagging is mostly missing.** Task logs reliably carry `model` (98%) and `session_id` (92%). `card` is on 44%, `group` on 10%, and `topics` and `module` on 0%. `session-index.json` (2,707 sessions) was last built 6 days ago, and nothing rebuilds it on a schedule.
- **Token accounting is built, but documented only in pieces.** Five scripts write the cost data. `ai/doc/tokens/tokens.md` explains what tokens cost but names none of those scripts or files. The two rollups (`spend-tree.json`, `week.json`) stopped updating on 2026-10-04, and almost no landing line carries `tokens` (1%) or `usage` (3%).
- **Past-work reads task logs, not the session system or audits.** `Server/PastWork.mjs` reads every `task.jsonl` (through `SessionIndex.reduce()`), `ai/asks.jsonl`, the `doc/*.md` and readme files, and `git log --grep`. It never opens `session-index.json`, `sessions.json`, transcripts or the audit files.
- **Readmes:** a fresh "you own framework/ai" agent can start from `ai/readme.md`. It is missing three things: the spawn tool's name, who owns the module and how to report, and the state scripts `SessionIndex` and `session-summary`. Three folders with readmes had no link; that is fixed (merged as `2242659c5`).
- **Per-module log: the proposal is sound, and about half of it exists.** `SessionIndex` already maps each task to its modules, and `LandingCheck` already checks a branch against `michael/dev`. Nothing joins them per path with dates and a grade. The shortest path is one script of about 100 lines that composes those two with `git log -- <path>` (section 5). The weak input is the per-folder `ai/log.jsonl`: 21 tracked files and 204 lines in the whole repo, so it can only be a bonus signal.

---

## 1. Session data and tagging, in numbers

| Measure | Number | How |
|---|---|---|
| task.jsonl files, 2026-10 (any depth) | 578 | walk `ai/sessions/2026/10` |
| … with `model` / `session_id` | 98% / 92% | any line, top level or inside `assign` |
| … with `brief` / `parent_task` | 67% / 31% | same |
| … with `card` | 44% | same |
| … with `group` | 10% | same |
| … with `topics` / `module` | 0% / 0% | same (1 file has topics) |
| … landed (`landed_at`) | 52% | same; see [report](report.md) for the grading |
| `session-index.json` | 2,707 sessions, 2,378 (88%) with cost and model; built 2026-10-09 | `Server/session-summary.mjs`; run only on demand (`Servex/agents/tools.js:195`, `Server/plugins/AILogs.js:111`) |
| transcripts on disk | about 9,950 files | system map, section 3 |
| refined asks (`ext/Refine/queue`) | 1,224 asks from 4 sessions | [past-work map](../past-work-map/map.md) |
| task → module | computed on the fly by `SessionIndex.module_of()` + `fence_modules()` (`Server/SessionIndex.mjs:35, 88`) from `action` file paths and the `Fence:` line | 1,601 rows in about 1.5 s |

What this means: who ran a task, on which model, in which session, is reliable. What it was about (topic, module) is never written down. It is only inferred from file paths, so a task that logged no `action` lines has no module.

## 2. Token accounting: files, scripts, docs

| File | Kind | What it does | Run by |
|---|---|---|---|
| `Server/task-cost.mjs` | script | writes `cost_usd` (an `assign` line) and `spend.json` beside each task.jsonl | Servex after every agent result (`Servex.js:1486`, `Budget.js:12`) |
| `Servex/Budget.js` | class | budget per task: 100% warn, 150% stop; defaults $15 / $5 | Heartbeat |
| `Servex/Usage.js` | class | refreshes `ai/usage.json` every 15 min (+ `usage.jsonl`) | Servex boot |
| `Server/usage-now.mjs` | script | prints pace (used % ÷ week gone %) | agents, before a spawn |
| `Server/spend-tree.mjs` → `sessions/spend-tree.json` | script + data | every agent's cost, nested by spawn tree | manual; **last run 2026-10-04** |
| `Server/week-cost.mjs` → `sessions/week.json` | script + data | this week's total | manual or `--watch`; **last run 2026-10-04** |
| `ai/doc/tokens/tokens.md`, `context-window.md` | docs | what a token costs, caching, context windows | — |
| `Servex/doc/budget.md` | doc | the budget gates (current, checked in [report](report.md)) | — |

Gaps:

- No one doc lists the accounting pipeline (these five scripts and their output files). Each script is described only in its own header, and `tokens.md` names none of them.
- `finish-task` asks for `tokens` and `usage` on the landing line and says "Token cost is written by Servex". No code writes them, so 3 of 578 tasks have `tokens` and 18 have `usage`. `cost_usd` is on 25%, written by `task-cost.mjs` in its own `assign` line.
- The two rollups are 11 days stale, but the Accounting link in the root readme points readers at them.

## 3. Does past-work query the session system or the audit files?

Neither. `Server/PastWork.mjs` (185 lines) has four sources:

- `tasks()` (`:38`): walks every `task.jsonl` under `framework/ai/` at any depth. It reduces each one with `SessionIndex.reduce()`, which is the shared task.jsonl reader, but not the `SessionIndex` query server or `session-index.json`.
- `asks()` (`:54`): `ai/asks.jsonl`.
- `docs()` (`:62`): `doc/*.md` and `readme.md` under `framework/` (skips dated folders, `sessions/` and `archive/`).
- `git()` (`:93`): `git log --grep` on up to three keywords. It matches commit subjects only, never the paths a commit touched.

It also counts the importers of each matching module. `ai/past-work-index.md` is its own output (`--index`), not an input. Because it walks the folders itself, it does see nested child tasks, unlike `TaskDirs.list()` (see [report](report.md)). Its landing test is `assign_landed`, so the 17 tasks that put `landed_at` at the top level read as not landed here too.

## 4. Readme setup for a standing "you own framework/ai" agent

✅ Fixed in a worktree and merged (`2242659c5`): `ai/readme.md` now links [dashboard](/framework/ai/dashboard/), [local](/framework/ai/local/) and [talk](/framework/ai/talk/). All three had a readme and no link. (`merge.mjs` refused its smoke test because a plain `git worktree add` worktree has no `.worktrees.json` entry. I used `--skip-smoke` for this markdown-only change and checked that the readme serves (200). Next time, make the worktree with `Server/worktree-up.mjs`.)

⬜ Not one-line fixes; for the module owner:

- **Who owns it, and how to report.** The readme has no "owner agent + report path" line (card, `owner_note`, module inbox). A standing agent needs this first.
- **How to spawn.** `spawn_agent` (by brief path) and the Haiku-for-reads rule are not named. They live in `doc/agents/mcp.md` and CLAUDE.md.
- **State scripts.** `TaskDirs` and `PastWork` are named; `SessionIndex.mjs` (task rows, module filter), `session-summary.mjs`, `task-cost.mjs` and `abandoned.mjs`-style census scripts are not.
- **Known issues.** `handover.md` is 368 lines, and its newest section is 2026-10-14. The open issues from [report](report.md) (`TaskDirs.list` depth, two landing rules) are not in any `framework/ai` doc yet.
- Seven folders have no readme: `audits` (linked), `classes` (linked), `collab`, `errors`, `process`, `tests` (linked), `v`. `recordings`, `systems` and `whisper` have no tracked page either.

## 5. The per-module day/week/month log: check of the proposal

The proposal: one node script per module path that joins task.jsonl landing lines, git commits touching the path, and `ai/` folder touches, and grades each task as landed+committed, committed-unclosed, or never-started.

What already exists:

| Piece | Does which part | Call |
|---|---|---|
| `Server/SessionIndex.mjs` | every task → `{landed, landed_at, …}` plus its **modules** (from `action` paths and `Fence:`); query source `tasks` with `where: module contains X` | `SessionIndex.reduce(dir, text)`; `node Server/SessionIndex.mjs --check <module>` |
| `Server/LandingCheck.mjs` | is a branch's (or a task's) work on `michael/dev`, by file content | `node Server/LandingCheck.mjs <branch\|taskDir>` |
| `Server/landing-audit.mjs` | branch → task → landed?, as a markdown table | `node Server/landing-audit.mjs <out.md>`; uses `TaskDirs.list` (2 levels) |
| `Server/FollowUp.mjs` | daily "fell through" list: unlanded tasks, unmerged branches | TaskLoop, daily; also `TaskDirs.list` |
| `dir_log` tool / `Sessions.js check_dir_line()` | appends `session`/`task`/`decision` lines to `<module>/ai/log.jsonl` | MCP `dir_log`; 21 tracked files, 204 lines repo-wide |
| `ai/asks.jsonl` | owner asks, status | no module or path field |
| `Server/page-ai-cost.mjs` | task → pages it touched → cost | `--dry` |

Nothing yet does the join or the dates, and nothing ties a commit back to its task. Commit subjects rarely name the task: for `core/Page`, 296 commits since 2026-09-15, and in a sample of 10 subjects only 1 named an existing task folder.

Shortest path: one class, `Server/ModuleLog.mjs`, about 100 lines, built from what exists.

1. Tasks for the path: walk every task.jsonl, then `SessionIndex.reduce()` and keep the tasks whose modules include the path (the same walk as `PastWork.tasks()`, so nested tasks are included).
2. Commits for the path: `git log --since … --name-only -- <path>`. Tie a commit to a task by its branch (`worktree/<slug>`, via merge commits) or by an `action` file plus a time window. `LandingCheck` settles the grade for a task with a branch.
3. Grade: **landed+committed** (landing line and a matching commit), **committed-unclosed** (a commit, no landing; 7 of 14 in the earlier sample), **never-started** (no `action`, no commit), and **orphan commits** (a commit on the path with no task; probably most of the 296).
4. Output: day/week/month buckets as JSONL beside the module (`<module>/ai/work.jsonl` or the module's `page.jsonl`), so the module page renders it live.

The `ai/log.jsonl` touches are too sparse to grade on; use them only as a "who looked here" column. The alternatives the voice mastermind named still stand: re-tagging transcripts first is costly, and a landing-time folder line only helps from now on. Both can come later, because the script works from data that is already on disk.
