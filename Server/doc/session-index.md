# SessionIndex — every task in memory, queried with plain JavaScript

[`Server/SessionIndex.mjs`](../SessionIndex.mjs) (`class SessionIndex`) holds one record per `task.jsonl` under `public/framework/ai/`, loaded once and kept current. It is the node side of [ext/Query](/framework/ext/Query/) grown by one source, `tasks`: no database, nothing to install, the JSONL files stay the truth. The owner's ask (ask 6, `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-3.md`): a process that holds the thousands of records and filters them in JavaScript; the index and the query are the same thing.

## A row
`{ id, kind:"task", dir, slug, url, day, title, request, outcome, group, agent, session, model, branch, started, last, step, steps, landed, landed_at, usd, links, topics, modules[], files, chats, reviews }`. `modules` comes from each `action` line's `files` plus the `Fence:` line of the task's `requirements.md`: `core/Page`, `ux/Dictate`, `Server`, `ai`.

## Ask it
- **Node:** `index.query({ kind, since, text, agent, module, landed, group, sort, limit, offset })` returns `{ rows, count }`. `module: "ux"` finds `ux/Dictate` too; `text` is every word; `since` is a day.
- **Browser:** `new QueryClient("tasks").ask({ where: [{ field: "modules", op: "contains", value: "ux/Dictate" }] })`, the same socket route Sessions uses. The first query loads the index; later ones take about 3 ms.
- **Shell:** `node Server/SessionIndex.mjs --check ux/Dictate` prints the numbers below and the example.

## Numbers (2026-10-13, this repo)
- 1,489 rows from 1,489 `task.jsonl` files (16 MB on disk): **load 1.1–1.6 s, +21 MB heap**.
- Example: `module: "ux/Dictate"` gives **33 tasks**; 1,164 are landed.

## How it streams
`fs.watch` on `ai/` marks a changed `task.jsonl`; only the bytes appended since the last read are parsed (a shorter file is re-read whole), 50 ms debounced. Each change is pushed to subscribed pages as a `query_row` (Query's own push). Never a full reload.

## One reader
`Server/PastWork.mjs` and `Server/FollowUp.mjs` read `task.jsonl` through `SessionIndex.reduce`, not their own loops: their output is unchanged (`node Server/PastWork.mjs "indexing system sessions"` diffed identical before and after).

## Sessions and the per-day `index.json`
Live session snapshots stay in [`ai/AISession/AISessionIndex.mjs`](/framework/ai/AISession/AISessionIndex.mjs) (the `sessions` source): they come from transcripts outside the repo and that class is their one writer. `new SessionIndex({ sessions: () => iterable })` joins them as `kind: "session"` rows when a caller supplies them. The per-day `index.json` stays as it is: it is the static site's read path, which cannot ask node.

## Watch out
- A worktree dev server loads its own copy of `ai/`, so counts differ from the main tree.
- A task with no `Fence:` line and no `action` files has no modules.
