# Sessions in real time: the index, the tailer, the plan

<!-- merged from realtime.md (original kept in archive/) -->
## Real time: a snapshot per session, a file per day, a socket on top

When a session's transcript grows, its row on the Sessions grid changes in well under a second. This page says how, and what is built.

### The path, one line at a time

1. Claude appends a line to a transcript (`~/.claude/projects/c--code-lew42-*/<id>.jsonl`).
2. `ai/AISession/AISessionIndex.mjs` is told by `fs.watch`. It reads only the new bytes through `Session.update`, which runs `Session.apply_line` per line, and rebuilds that session's **snapshot**.
3. If a field changed, the snapshot is stored in memory and two things happen: the page is **pushed** the one changed snapshot over the dev socket (`session_index`), and the files are queued for a rewrite.
4. `AISessionLive.js` folds the snapshot into a light `Session` (`Session.apply_delta`). The Session tells its subscribers, and the `AISessionView` row for it redraws. One update, one row.

### The files: real, static, and small

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

### Day close, and what git keeps

Month and year totals are rewritten about once a minute, and only when a total changed. Once a day is over and none of its sessions is active, `AISessionIndex.freeze()` writes its composite one last time with `"closed": true`, then rebuilds the month and year totals from the closed days. A closed day is never rewritten.

Git ignores the live files (every session's `index.json`, and day composites). **Commit a closed day once** with `git add -f public/framework/ai/sessions/YYYY/MM/DD/index.json`. The month and year totals are not ignored: commit them as they change.

### The grid and the detail view

- The grid reads the year and month totals to find the closed days its date filter needs, fetches those day files plus today's, and folds them oldest first. It then sends `session_sub` for today: the server answers with every snapshot of today once, then only each snapshot that changes. There is no subscription for an old day. With no dev socket (production) the 30-second tick re-reads today's file.
- The grid has the filters **in flight**, **tag**, **category** and **core** (the module a session edited).
- The **detail view** (`AISessionFollow.js`) loads the session's own log from `/ai-logs/<id>`, folds each line through `Session.apply_line`, and keeps reading only new bytes (a Range request). After each batch it corrects the grid row for the same id. It corrects only a session the log itself prices (`provider` claude); an OpenRouter session's price comes from Servex configuration the browser cannot see, so the server's number stays.

### What is real time now, and what is not

| | True now |
|---|---|
| A session's own cost, model, flags, active or idle, last activity | Real time, once the dev server's index runs. |
| A new session appearing on the grid | Real time. |
| A parent's `tree_usd` when a **child** changes | Not live. It keeps the descendants total from the last `--index` rebuild. |
| Tree, closed list and traces | Still read from the `session-index.json` snapshot. |

The index runs only on the **main checkout's** dev server (a worktree's `.git` is a file) and starts when that server restarts. `SESSION_TAIL=1` forces it on, `0` off; `SESSION_TAIL_DIR` points it at another transcript folder.

### Commands

- `node ai/AISession/AISessionIndex.mjs --build` writes every missing session `index.json`, the day composites, closes finished days and rebuilds the totals. Run it on the main tree.
- `node ai/AISession/AISessionIndex.mjs --check` is the audit: the totals match the closed day files, and every cached session has an `index.json`.
- `node Server/session-latency.mjs` measures the path (below).
- `node Server/session-gap.mjs` counts transcripts with no cache; `--fix` builds each missing one. Run it on the main tree.

### Measured latency

`node Server/session-latency.mjs` starts a private dev server, writes fake transcript lines and times a headless page. Run on 2026-10-08 and again on 2026-10-09, after the AISession rename (wire 49 to 62 ms, page 49 to 202 ms, no page errors; the 5 s file write was not observed in the 2026-10-09 run, its figure is from the first run):

| Step | Result |
|---|---|
| Transcript append to the snapshot reaching the page | about 50 to 70 ms |
| Append to the row redrawn (cost update) | about 50 ms |
| A new session appearing | about 200 ms (includes a 100 ms redraw debounce) |
| Append to the session's `index.json` holding it | about 5 s (the write waits for 5 s of quiet, by design) |


---

<!-- merged from realtime-plan.md (original kept in archive/) -->
## Going realtime — using the stream the rest of the site already has

The owner's ask (2026-10-07): this page and its cost data must update live, low latency,
using **core/Page's existing jsonl stream** — never a second streaming system. Full
investigation: [`/framework/ai/2026-10-07/token-accounting/findings.md`](/framework/ai/2026-10-07/token-accounting/findings.md).

### What the stream already is (checked, not assumed)

One mechanism, already used by every live `page.jsonl` on the site: a WebSocket
(`dev/Socket/Socket.js`), with a tiny wire protocol — `subscribe(path, offset)` from the
browser, `jsonl(path, lines, offset)` back from the dev server the moment new bytes land
(`Server/plugins/SocketServer/Tail.js` on the write side, `ext/JSONL/live.js` on the read
side). It tails ANY `.jsonl` file under `public/`, byte-offset only, never a replay of
old lines. **Localhost only** — off the dev server (the real deployed site) a page just
fetches once; that's fine here, since this tab is only ever opened on localhost.

### What this tab does TODAY — not this stream at all

Checked directly in `page.js`: every cost number on this page comes from a plain
one-shot `fetch()` of a **snapshot file** someone has to re-run a script to refresh —
`sessions.json` (from `sessions.mjs`), `week.json` (from `week-cost.mjs`), `spend-
tree.json` (from `spend-tree.mjs`). The one place that DOES already use the live jsonl
stream on this site, `page.jsonl` itself (a session's own cost lines, appended by the
Stop hook), is still only read here with a one-shot `get_jsonl()` — never `JSONL.live()`.
So this page has never used the fast path at all; it isn't a second stream to replace,
it's the FIRST real use of the one that already exists.

### Who writes a cost line, and how fast it could really be

- **A VS Code tab / plain CLI run:** only the `.claude/settings.json` Stop hook
  (`session-cost.mjs --append-stdin`) ever writes a cost line, and only once per WHOLE
  TURN (it re-reads the entire transcript after the turn ends). Fastest this can ever be:
  "the moment the turn finishes" — there is no sub-turn signal available outside the
  running CLI process.
- **A Servex-spawned agent:** `Agents.js` already SEES every SDK message the instant it
  arrives, live, in-process (`assistant(message)`, `result(message)` — it's already
  reading `message.usage` per message to drive the OpenRouter per-call pricing). Nothing
  stops it from appending a cost line **per message**, not per turn — genuinely
  real-time, sub-turn granularity, for every Servex row. This is the one real asymmetry:
  Servex rows CAN be truly live; VS Code/CLI rows can only ever be "live per turn."

### The shape: `session.jsonl` beside `page.jsonl`, not instead of it

The owner's instinct is right and matches how every other module here already splits
data: `page.jsonl` is the PAGE's own log (what a reader of the tab sees written there —
chat, nav, cost summaries already shown); a new `<session-dir>/session.jsonl` would hold
the SESSION's own raw facts (per-message usage, per-tool cost, which sub-agents it
spawned) — the detail a cost dashboard needs but a page's own narrative doesn't. Same
split `ai/sessions/doc/asks/decisions.md` already describes for `task.jsonl` vs a task's
`page.jsonl`. **A session probably HAS a page** (`session.page` / `page.session`), the
same relationship a task already has to its own page — not a new concept, an existing one
applied here.

### The open question: how the two display — recommendation + tradeoff + alternative

**Recommendation:** keep them as two files, two `JSONL` subclasses
(`SessionJSONL extends JSONL`, same pattern `TaskJSONL` already is), and let the Sessions
grid/detail page subscribe to BOTH live, merging them client-side the same way `page.js`
already merges Servex rows + snapshot rows today — `session.jsonl`'s lines feed the cost
numbers and the per-message trace; `page.jsonl`'s lines feed anything narrative (a chat
line, a note). Nothing new to invent: `JSONL.live()` already supports two instances on
one page.

- **Tradeoff:** two files per session instead of one means two subscriptions, two small
  files to keep straight — slightly more plumbing than a single merged file, but it keeps
  "data lives with its page" (CLAUDE.md law, `page.jsonl` stays the page's own narrative)
  separate from "raw session facts" (which a cost dashboard, not a human, mostly reads) —
  the same separation of concerns `task.jsonl` vs `page.jsonl` already proved out.
- **Alternative considered:** one file, `page.jsonl`, with cost/usage lines mixed in the
  same stream (what the Stop hook already does today, in miniature — it appends `{"cost":
  {...}}` onto `page.jsonl` directly). Simpler — one file, one subscription — but it's
  already showing the cost: a session with thousands of tool calls (the real
  `session-trace` test case had 4,225) would flood the page's own narrative log with
  machine-only facts no human reading that file wants mixed into their chat history. Not
  recommended for that reason, though it is the smaller change.

### Migration from `sessions.json` to a streamed `session.jsonl` — staged, not a rewrite

1. **Servex writes `session.jsonl` live, for its own rows first** (the easy half — no
   polling script to retire yet). `Agents.js`'s `result()`/`assistant()` already see
   every message; add one `append_log`-style write per message/turn to
   `<session's page dir>/session.jsonl`. Needs a session → page-dir mapping that already
   mostly exists (`find_page_jsonl`-style lookup).
2. **The Stop hook writes the SAME shape for VS Code/CLI rows**, once per turn (its real
   ceiling) — `session-cost.mjs --append-stdin` already computes everything needed; it
   just appends to `session.jsonl` instead of (or alongside) `page.jsonl`.
3. **The grid subscribes live** (`JSONL.live()`) to every open session's `session.jsonl`
   instead of polling `sessions.json`/`spend-tree.json`. The two existing stale-snapshot
   scripts (`sessions.mjs`, `spend-tree.mjs`) stay as the ALL-SESSIONS-AT-ONCE rollup (one
   request, one history) — streaming only makes sense for sessions the reader has open
   RIGHT NOW, not a scan of years of history on every load.
4. **Retire the polling** once (3) is proven on a few real sessions — not a flag day;
   both can run side by side until the live numbers are trusted.

Not started — this is the plan, not the build. First real step is (1), scoped small:
one write call added to `Agents.js`, proven against one live agent before touching the
browser side at all.
