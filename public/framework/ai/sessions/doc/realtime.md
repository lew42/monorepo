# Real time: a snapshot per session, a file per day, a socket on top

When a session's transcript grows, its row on the Sessions grid changes in well under a second. This page says how, and what is built.

## The path, one line at a time

1. Claude appends a line to a transcript (`~/.claude/projects/c--code-lew42-*/<id>.jsonl`).
2. `ai/AISession/AISessionIndex.mjs` is told by `fs.watch`. It reads only the new bytes through `Session.update`, which runs `Session.apply_line` per line, and rebuilds that session's **snapshot**.
3. If a field changed, the snapshot is stored in memory and two things happen: the page is **pushed** the one changed snapshot over the dev socket (`session_index`), and the files are queued for a rewrite.
4. `AISessionLive.js` folds the snapshot into a light `Session` (`Session.apply_delta`). The Session tells its subscribers, and the `AISessionView` row for it redraws. One update, one row.

## The files: real, static, and small

```
sessions/2026/index.json              months that exist + totals each            (closed days only)
sessions/2026/10/index.json           days that exist + { count, usd, flagged }  (closed days only)
sessions/2026/10/08/index.json        the DAY composite: { day, closed, snapshots: [...] }
sessions/2026/10/08/<id>/index.json   ONE session's snapshot
```

- A **snapshot** is the session's state now, never a history: `id, state, model, effort, provider, usd, tree_usd, children, wall_ms, flags, tokens, first_at, last_activity, day, tags, alerts, core, category, parent, agent, closed`. The filterable fields are `state, model, provider, tags, usd, last_activity`, plus `category` and `core` from the [task audit](../../2026-10-08/task-audit/).
- `AISessionIndex` is the **only writer** (one instance, in memory). Disk writes are a trailing debounce: a session's `index.json` and the day composite are written after 5 seconds with no further change, and at least every 60 seconds while they keep changing, both by writing `index.tmp.json` then renaming, so a reader never sees half a file.
- The composite is a **real file at a stable URL**, so a static host serves it unchanged: production needs no server and no build. The socket is only an accelerator between file writes (it sends changes straight from memory; no delta is ever written to disk). After a restart, memory is rebuilt from the per-session snapshots, then the recent transcripts.
- A session belongs to one day: the UTC day of its last activity. A session revived after its day closed moves into the newer day; a reader folds by id and the later `last_activity` wins.
- Per-day `usd` in the month and year totals is the lifetime cost of the sessions last active that day, not what was spent that day.

## Day close, and what git keeps

Month and year totals are rewritten about once a minute, and only when a total changed. Once a day is over and none of its sessions is active, `AISessionIndex.freeze()` writes its composite one last time with `"closed": true`, then rebuilds the month and year totals from the closed days. A closed day is never rewritten.

Git ignores the live files (every session's `index.json`, and day composites). **Commit a closed day once** with `git add -f public/framework/ai/sessions/YYYY/MM/DD/index.json`. The month and year totals are not ignored: commit them as they change.

## The grid and the detail view

- The grid reads the year and month totals to find the closed days its date filter needs, fetches those day files plus today's, and folds them oldest first. It then sends `session_sub` for today: the server answers with every snapshot of today once, then only each snapshot that changes. There is no subscription for an old day. With no dev socket (production) the 30-second tick re-reads today's file.
- The grid has the filters **in flight**, **tag**, **category** and **core** (the module a session edited).
- The **detail view** (`AISessionFollow.js`) loads the session's own log from `/ai-logs/<id>`, folds each line through `Session.apply_line`, and keeps reading only new bytes (a Range request). After each batch it corrects the grid row for the same id. It corrects only a session the log itself prices (`provider` claude); an OpenRouter session's price comes from Servex configuration the browser cannot see, so the server's number stays.

## What is real time now, and what is not

| | True now |
|---|---|
| A session's own cost, model, flags, active or idle, last activity | Real time, once the dev server's index runs. |
| A new session appearing on the grid | Real time. |
| A parent's `tree_usd` when a **child** changes | Not live. It keeps the descendants total from the last `--index` rebuild. |
| Tree, closed list and traces | Still read from the `session-index.json` snapshot. |

The index runs only on the **main checkout's** dev server (a worktree's `.git` is a file) and starts when that server restarts. `SESSION_TAIL=1` forces it on, `0` off; `SESSION_TAIL_DIR` points it at another transcript folder.

## Commands

- `node ai/AISession/AISessionIndex.mjs --build` writes every missing session `index.json`, the day composites, closes finished days and rebuilds the totals. Run it on the main tree.
- `node ai/AISession/AISessionIndex.mjs --check` is the audit: the totals match the closed day files, and every cached session has an `index.json`.
- `node Server/session-latency.mjs` measures the path (below).
- `node Server/session-gap.mjs` counts transcripts with no cache; `--fix` builds each missing one. Run it on the main tree.

## Measured latency

`node Server/session-latency.mjs` starts a private dev server, writes fake transcript lines and times a headless page. Run on 2026-10-08:

| Step | Result |
|---|---|
| Transcript append to the snapshot reaching the page | about 50 to 70 ms |
| Append to the row redrawn (cost update) | about 50 ms |
| A new session appearing | about 200 ms (includes a 100 ms redraw debounce) |
| Append to the session's `index.json` holding it | about 5 s (the write waits for 5 s of quiet, by design) |
