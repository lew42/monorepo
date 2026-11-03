# Sessions data: facts for ask 8c18b60c, item B

Counts come from a node census over `public/framework/ai/**` (script in the scratchpad, not the repo) plus the file reads named below. Nothing here is a recommendation.

## 1. One tree on disk?

Yes, mostly. `public/framework/ai/sessions/` holds 40,293 files: 19,785 `.jsonl`, 11,989 `.json`, 4,700 `.png`, 2,823 `.md`.

- Top level: year dirs `2026/` (months `08`, `09`, `10`, plus `cards/` and `index.json`), 5 UUID-named session dirs, and the computed files (`session-index.json`, `sessions.json`, `session-tree.json`, `spend-tree.json`, `week.json`, `settings.jsonl`, `page.jsonl`, `doc/`, `screenshots/`).
- `2026/10/` has 582 session-folder entries across its day folders (depth-3 dirs).
- Outside the sessions tree: `TaskDirs.mjs` says old-shape `ai/YYYY-MM-DD/<slug>/` folders were moved into the store with a `task-moves.jsonl` line or the `task-manifest.json`. I did not count what is still on disk outside the store. Run `node Server/TaskDirs.mjs --census` to get that.
- Claude's own SDK transcripts live under the user profile, not in the repo. `ai/sessions/doc/data-sources.md` describes them. I did not verify them.

## 2. Append logs and their fields

There is **no `session.jsonl` anywhere in the repo** (count 0). The append logs that exist (census over `public/framework/ai`, 109,285 lines parsed, 0 bad):

| file | files | lines | top-level keys seen |
|---|---|---|---|
| `task.jsonl` | 1,599 | 20,233 `log`, 8,177 `assign`, 5,560 `action`, 2,124 `review`, 1,809 `agent`, 1,265 `decision` | one verb key per line, e.g. `{"log":{"at","task","msg"}}` |
| `day.jsonl` | 46 | 1,824 | `{"log":{"at","task","msg"}}` |
| `cache.jsonl` | 11,379 | 16,125 | `{"summary":{…}}` (`id`, `provider`, `cursor`, `first_at`, `last_at`, …) |
| `files.jsonl` | 1,318 | 33,382 `{file}`, 17,430 `{file,gone}` | `file`, `gone` |
| `page.jsonl` | 5,137 | not counted | page items |

Script: `/tmp/sd/census.mjs` (scratch only).

## 3. How SDK (Servex-spawned) sessions log and create tasks

- `Servex/agents/tools.js` exposes `spawn_agent` with a `task` option. I did not confirm the exact schema line.
- `Servex/agents/Agents.js:176`: `session_id = spec.session_id ?? randomUUID()`.
- `Servex/agents/Agents.js:~775` `open_task(task, …)`: `TaskDirs.normalize(task.dir)` (rewrites old-shape dirs), `mkdirSync`, then appends one `assign` line `{session_id, agent, card, brief, …}`. It never rewrites earlier lines. `parent_task` and `after` build the tree.
- Recent volume: of 1,585 `task.jsonl` files whose first line is dated 2026-10-01 or later, **1,487 have `assign.session_id` (spawned)** and 98 do not (manual). Task-folder counts by day, from `task.jsonl` files on disk: 10/01 133, 10/02 34, 10/03 66, 10/04 16, 10/05 14, 10/06 1, 10/07 2, 10/08 20, 10/09 37, 10/10 3, 10/11 0, 10/12 142, 10/13 97, 10/14 0, 10/15 11.

## 4. Is the node-driven task system real and used?

- `Server/TaskDirs.mjs` is real. CLI: `--new <slug>`, `--day`, `--find`, `--list [days]`, `--follow`, `--census`. Its header says a task lives at `ai/sessions/YYYY/MM/DD/<session>/<slug>/`.
- Callers that reference it (grep): `Servex/agents/Agents.js`, `Servex/asks/tasks.js`, `Servex/TaskLoop.js`, `Servex/Dispatcher.js` (its prompt tells agents to run `--new`), `Server/merge.mjs`, `Server/on-landing.mjs`, `Server/Server.js`, `Server/Council.mjs`, `Server/FollowUp.mjs`, `Server/Crawl.mjs`, `.claude/hooks/append.mjs`, `.claude/hooks/prompt-relay.mjs`, `.claude/skills/every-prompt/say.mjs`, and others (about 22 files).
- `.claude/hooks/append.mjs` is real. It validates each new line against `jsonl-schema.mjs` by basename and refuses unknown verbs with exit 3.
- `finish-task`: the skill exists (`.claude/skills/finish-task/`). Git: 129 of 2,669 commit subjects in the last 14 days say `finish-task` or `landed`. **No invocation counter exists**, so the CLI call count is unmeasured.

## 5. Is there a sessions index?

Yes.

- `public/framework/ai/sessions/session-index.json`: 286 KB, `count` 2,707 sessions, `scanned` 7,765, generated `2026-10-09T03:02Z`. Written by `Server/session-summary.mjs:140`. Read by `AISession/AISessionIndex.mjs:128` and `AISessionsPage.js`.
- `sessions.json` (331 KB): the VS Code/CLI snapshot. `AISessionsPage.js:456` fetches it with `get_json(url + "sessions.json")`.
- `session-tree.json` (176 KB) and `2026/index.json` (178 B: Oct 6,942 sessions, $5,879.94; Sep 2,286, $10,068.94).
- `sessions/page.js` is one line: `new AISessionsPage({ meta: import.meta })`.
- Remote mode (default on the dev socket): `AISessionsPage.js:518` uses `QueryClient("sessions")`. The node side is `QueryServer.source("sessions")` in `AISession/AISessionTailer.mjs:15`, so the browser asks only for visible rows. `?source=files` forces the file path.
- `Server/SessionIndex.mjs` registers the `tasks` query source over the same index.
- Polling: `AISessionsPage.js:449` runs a 30 s `setInterval`, and flags reload every 2 minutes. This conflicts with the owner's stream-not-poll rule. It is a fact, not a fix.
- `Directory.js:10` skips `ai/sessions/<year>/` paths (the 2026-10-09 note says 32,650 files).
