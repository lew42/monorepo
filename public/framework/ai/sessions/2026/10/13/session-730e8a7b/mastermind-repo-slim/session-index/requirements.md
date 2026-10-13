# Session index: one in-memory query

Budget: $15. Load the `sub-mastermind` skill first. The owner's raw words: `../requirements-3.md`, ask 6 ("with our 4,000 or 8,000 sessions… a server-side process that has them all loaded in memory and does JavaScript-based filtering… the dynamic index and the querying is the same thing… keeps it simple instead of a new database or having to install anything… JSONL is git friendly, I don't mind leaning into that"). Your log is this dir's `task.jsonl`. CLAUDE.md: one of everything; compute don't recall; stream don't poll; classes not function bags.

## What exists (extend it; never a second system)

- **Query path:** `ext/Query` + the dev socket. Sessions asks node for its rows; node holds the data (30–40 ms per query; `ai/sessions/2026/10/12/session-87bec773/server-query/`).
- **Roll-ups:** `Server/AISessionIndex.mjs` (month/year totals, `--check`), per-day `index.json`, gitignored `sessions.json`.
- **Readers (each reads the store its own way: the duplication to end):** `ext/DataGrid`, `Server/FollowUp.mjs`, `Server/PastWork.mjs`, `code/performance` session buckets.
- Run `node Server/PastWork.mjs "indexing system sessions"` and read the design the owner says was asked for earlier; link it.

## Deliverable

1. **One class, `Server/SessionIndex.mjs` (`class SessionIndex`)**, or `ext/Query`'s node side grown into it if that is the same thing: loads every session and task record from the store once into memory (sessions, tasks, landing lines, owner chat lines, costs), watches the store for appends (`fs.watch`/the existing stream, incremental, never a full reload on every write), and answers queries as plain JavaScript filters: `index.query({kind, since, text, agent, module, landed, limit})` returning rows plus a count. Startup time and heap at today's volume are measured and logged (two numbers: rows loaded vs files on disk).
2. **The same query from the browser**: through the socket route `ext/Query` already has; the Sessions grid, `FollowUp.mjs` and `PastWork.mjs` are pointed at it (a flag or a shim each, no behaviour change, proven by their existing checks); the per-day `index.json` becomes a product of the index (`--write`) rather than a hand-maintained input, or stays as-is with a one-line reason.
3. **Tags by module and class**: each task row carries the modules its files touched (from its `action` lines' `files` and the brief's fence) so "every task that touched ux/Dictate" is one query; prove it with that query and the count.
4. **Doc**: `Server/doc/session-index.md` (one screen: what it holds, the query shape, the numbers, how it streams), linked from `Servex/readme.md` or `Server/readme.md` and `public/framework/ai/sessions/readme.md`.
5. Report on your card: rows, load time, heap, one example query and its count, the link.

Fence: `Server/SessionIndex.mjs`, `ext/Query/**`, `Server/AISessionIndex.mjs`, `Server/FollowUp.mjs` and `Server/PastWork.mjs` (the shim only), the two readme lines, `Server/doc/session-index.md`, this task dir. Worktree; the dev server changes are tested on a private port (`worktree-up.mjs`), never by restarting the live server. Sonnet; a Haiku minion for the census of record shapes.
