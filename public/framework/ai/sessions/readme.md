# Sessions — a data grid of every Claude session, newest activity first

The owner's own words: "the start time, the source tag, the agent or tab name, the model, the
state and the cost." This tab is that grid, covering all three kinds of session on this machine:
a **VS Code** tab (you, typing), a **Servex** agent (a mastermind or minion, spawned), or a
standalone **CLI** run. Click a row to see that session's own prompts, in order, at its own url —
prompts live inside their session, never a separate log page, and on a wide screen the detail
opens as a side peek beside the grid instead of replacing it.

## Use

Visit [`/framework/ai/sessions/`](/framework/ai/sessions/). Ten columns, newest activity first:
Start, Stop, Duration, Source (a coloured tag), Role, Name, Model, State, RAM, Cost. Drag a column
header's own right edge to resize just that column — each one is a single `--col-<name>` CSS
custom property, with its own minimum width so a column never collapses to nothing. It's a CSS
grid, not a `<table>`: `doc/decisions.md` says why, and what that bought (one token per column)
that a table couldn't.

**Start / Stop / Duration (2026-10-03):** Start and Stop are both real timestamps where known;
Stop reads "ongoing" while a session is still active rather than guessing when it ended — a plain
transcript file has no formal "stopped" event. Duration is Stop minus Start (or "now" minus Start
while ongoing).

**What's new (session-costs minion-build, 2026-10-02) — real per-session dollars, not just the one
older `cost` figure:**
- **Click the Cost header to sort** by it (missing/null always sorts last); click again to reverse,
  a third click returns to the default (newest activity first).
- **The State column is an icon now**, not a word: a blinking green ▶ for a working/active row, a
  quiet dot for everything else. A ✓ for "done" only ever shows on a session's own detail page.
- **A Role column** — real for a Servex row (straight from the agent registry), a best-effort guess
  for a VS Code/CLI row (`doc/decisions.md` says exactly how, and why it's a guess there).
- **A RAM column** — blank until Servex's own agent feed carries a real-time sample; never a stale
  number.
- **Claude $ next to OpenRouter $** when a row carries the split (an "OR" tag marks the real-money
  one) — falls back to the one older `cost` figure for a row that doesn't carry it yet.
- **A role filter and a 30-day date filter** above the grid, with a summary line (sessions shown,
  Claude $ logged in range) and a "Claude $ logged by role" list, largest first — all computed from
  the rows already on screen, no new fetch. Both are honestly partial, not a full range total — see
  "Where the real dollars come from" below.
- **Five stat cards across the top** (sessions-tab-polish, 2026-10-03): Claude $ this week,
  OpenRouter $ this week, plan used % this week, the plan's own $-per-1% (spelled out as a label,
  not crammed into the number), and the current filtered session count — the real `week.json`
  figures, big bold dollars with smaller cents, not a line of plain text. `doc/decisions.md` has the
  full reasoning for why these cards are the trustworthy number and the range summary below the
  grid is not.
- **A session's own detail page** shows a compact row per logged cost line (time, tokens, $) above
  its prompts, when `public/framework/ai/AISession/AISessionAudit.mjs` has logged one.
- **Below that (session-trace, 2026-10-03): a cost-over-time chart and a "what was it doing"
  table**, when a `trace.json` exists for that session (a manual, run-by-hand file today — see
  below). The chart is cumulative $ over elapsed time, with a tick per tool call; the table groups
  every tool call by tool (Read/Edit/Bash/spawn…) with its count, $ and share, and flags waste it
  can actually compute — the same file read 3+ times, chunked reads, polling, and long runs of
  reads with no write. `doc/decisions.md` has the full case, the real test, and the thresholds
  used.
- **The spend tree (2026-10-03):** every row's Cost cell gets a second, quieter line —
  "$X w/ N" — when that agent ever spawned anything, showing the whole subtree's $ (own +
  every descendant) alongside its own $ above it. A **trigger filter** (why it was spawned:
  task, owner prompt, review gate, clarity, heartbeat/revive, assistant, echo) sits next to
  the role filter, and a session's own detail page shows who spawned IT and what it spawned
  in turn, each a link one level down. All from `Server/spend-tree.mjs` →
  `spend-tree.json` — [`doc/spend-tree.md`](doc/spend-tree.md) says exactly how a parent and
  a trigger get worked out, and where that guessing is honestly weakest. The one-screen
  reading of what it's for — does a review pay for itself, where the dollars go — is
  [`ai/2026-10-03/spend-tree/study.md`](/framework/ai/2026-10-03/spend-tree/).

- **Cache $ breakdown, per agent and by role/trigger (token-accounting, 2026-10-04):** a
  session's own detail page now shows input/cache-write/cache-read/output $ under "Logged
  cost". The `cost by role`/`cost by trigger` lists have a sibling, all-time "Cache $
  breakdown" list, same split, grouped.
- **Two real accounting bugs**, found while building that breakdown: a wrong cache-write
  price, and a task's own `cost_usd` undercounting a revived agent by up to 59%.
  `doc/decisions.md`'s 2026-10-04 entry has the full story.

**A VS Code tab's own $ stopped updating after midnight (vscode-session-cost, 2026-10-04) — fixed.**
A session's cost is found by its own page folder, wherever it lives (not just today's), so a tab
left open overnight keeps pricing correctly instead of silently stalling. The "Per 1% of your
weekly plan" stat tile now also shows the two numbers it divides underneath the figure, not just
in a hover title. `doc/decisions.md`'s own 2026-10-04 entry (above the token-accounting one) has
the full story.

## Where the real dollars come from

Two SEPARATE scripts, neither live — both are run by hand and read by the page, same shape as
`sessions.mjs` above:
- [`public/framework/ai/AISession/AISessionAudit.mjs`](/code/) reads one Claude Code session's own transcript (the only
  place per-prompt token counts exist) and sums it into a total + a per-prompt breakdown, priced
  by model. A Stop hook (`.claude/settings.json`) runs it after every turn, appending one
  `{"cost":{...}}` line to that session's own `page.jsonl` — the file
  [`task-mastermind-prompt-refine`](/framework/ai/) owns creating, this task only ever appends to.
  `node public/framework/ai/AISession/AISessionAudit.mjs <session-id>` prints the JSON on its own, for testing.
  The same script's `trace_of_transcript()` answers a DIFFERENT question — not the $ total, but
  every individual tool call and its own timestamp, behind the chart + table above: `node
  public/framework/ai/AISession/AISessionAudit.mjs --trace-file <session-id> <out-path>` writes it as `<out-path>`, read by
  the detail page as `<session-dir>/trace.json`. Manual/on-demand only (doc/decisions.md).
- [`Server/week-cost.mjs`](/code/) writes this week's Claude $ and OpenRouter $ against the $200
  Max plan to `week.json` beside this readme — the stat cards' own source. Two ways to run it:
  a plain `node Server/week-cost.mjs` writes a one-time snapshot (re-run it by hand to refresh);
  `node Server/week-cost.mjs --watch [minutes]` keeps running and rewrites `week.json` on that
  interval (default 10) until stopped — no HTTP route or dev-server watcher needed (both are
  outside this fence, `doc/decisions.md`), just a plain process somebody starts. `week.json`'s own
  `note` field always says which mode actually wrote it. Its windowed computation
  (`compute_window(from, to)`) is reusable for ANY date range, not just "this week" — `node
  Server/week-cost.mjs --from <iso> --to <iso>` prints one straight to the terminal, no file
  written — so a future live range feature has one real function to call instead of a second,
  possibly-disagreeing one (`doc/decisions.md`, "Why OpenRouter read $0.00 in range").

This is a DIFFERENT system from `Server/task-cost.mjs` (a Servex agent's own running total, no
per-prompt detail) — see that script's own doc, `Server/doc/task-cost.md`, for why the two don't
merge.

## Where the data comes from

- **Servex rows are live.** The page polls Servex's own `GET /api/agents` every 20 seconds
  (paused while the tab is hidden — the same shape [`ai2/needs.js`](/framework/ai2/)'s
  `watch_needs()` already uses), so a card and a mastermind's state here is always current.
- **VS Code and CLI rows come from a snapshot**, `sessions.json`, written by
  [`sessions.mjs`](/framework/ai/2026-10-02/panel2-sessions/sessions.mjs) — a plain node script,
  not a live route. Re-run it to refresh those rows:
  ```
  node public/framework/ai/2026-10-02/panel2-sessions/sessions.mjs
  ```
  Why a script instead of Servex answering live: this task asked `mastermind-servex-9` for a real
  `GET /api/sessions` route (Servex/agents inbox, 2026-10-02) and none had landed when this was
  built; this task's own fence is `public/framework/ai/` only, so it cannot add a route under
  `Server/` itself. The full reasoning, and what a real route would fix, is in
  [`doc/decisions.md`](./doc/decisions.md).
- **`sessions.json` is gitignored**, the same way `ai/usage.json` already is — machine state
  written by a script, a COMPUTED CACHE never the record itself (the owner's own words). Running
  `sessions.mjs` regenerates it locally; it is never committed.
- **No duplicate data (2026-10-03):** a session's own prompts are never copied anywhere — the old
  `transcripts/<id>.json` snapshot (110 files, 2.5 MB) is gone. The detail page reads a session's
  real prompts LIVE, through `/ai-logs/<id>` (`Server/plugins/AILogs.js`, dev-server only, the same
  route [`ext/AITask/replay.js`](/framework/ext/AITask/) already used) — the owner's own dictated
  text never sits in `public/`, the folder this site deploys statically, even transiently.

## Watch out

- **"Session" means two different things on this site.** This tab is a *Claude Code* session
  (a VS Code tab, a Servex agent, a CLI run). [`ext/Session`](/framework/ext/Session/) is a
  *voice* session (one ✦ press, a dictated conversation) — unrelated, already named first. Don't
  confuse the two; this tab never touches `ext/Session`'s own `GET /api/sessions` route.
- A VS Code tab writes no title of its own into its transcript file, so this tab shows the
  session's working folder name instead (`tab_title`) — the real tab title isn't available from
  the data this reads.
- A Servex-sourced session's own page has no transcript yet (`GET /api/agents` carries no prompt
  text) — its detail page says so, with a link to why.
- **A session's home is its date path, once one exists — and none do yet.**
  `task-mastermind-prompt-refine`'s hooks are meant to write a real
  `ai/<Y>/<M>/<D>/<slug>-<uuid8>/page.jsonl` per session (page-item-design.md); checked live,
  2026-10-03, and no such folder exists on this machine yet. `session_page_dir_index()` (`page.js`)
  walks for one on every grid load regardless — the moment a session has one, its row's own link
  points there instead of this tab's `/sessions/<id>/` view, with no further code change.
  `with_date_path_rows()` goes one step further: a session whose ONLY record is a date-path folder
  (no `sessions.json`/Servex entry at all) still appears as a row, tagged "Page" — the grid lists
  from those pages, not only links to them, the moment any exist. Its own plan has changed three
  times already while this task was being built, so don't trust any more specifics than that here —
  check `task-mastermind-prompt-refine`'s current state instead. `load_transcript()` (`page.js`) is
  still the one function whose body changes once a real prompt source lands; today it reads a
  session's transcript live (see above), not a copy.

## Real time: true now versus planned

- **True now:** a session's cost, state and last activity reach the grid in well under a second, and a new session appears the same way. A server-side `AISessionIndex` keeps one small snapshot per session, writes it to the session's `index.json` and the day's `YYYY/MM/DD/index.json` (real files a static host serves), and pushes each changed snapshot over the dev socket. An open session page tails its own log and corrects the grid row. It runs on the main dev server only, after a restart.
- **Not yet:** a parent's tree total when a child changes, and the tree, closed list and traces (still the `session-index.json` snapshot).
- Detail, latency numbers and the scripts: [`doc/realtime.md`](./doc/realtime.md).

## More

- [`doc/realtime.md`](./doc/realtime.md) — snapshots, day files and the socket: the path, what is live, measured latency
- [`../doc/tasks.md`](../doc/tasks.md) — proposal: tasks as `core/Task` with `origin` = the creating session; session cost rolls up into its tasks
- [`doc/data-architecture-2026-10-08.md`](./doc/data-architecture-2026-10-08.md) — the owner's open design: index files, several files per session, what session.jsonl keeps, routes, what the task audit leaves behind
- [`doc/session-as-container-2026-10-08.md`](./doc/session-as-container-2026-10-08.md) — idea: a session as a container for a whole AI setup (roles, models, tools); open
- [`doc/realtime-plan.md`](./doc/realtime-plan.md) — the owner's ask (2026-10-07): this page
  must go realtime using the site's EXISTING jsonl stream, never a second one. What that stream
  already is, why this tab has never actually used it, and the staged plan to get a session's own
  `session.jsonl` streaming live instead of the current stale snapshots.
- [`doc/context-cost.md`](./doc/context-cost.md) — the owner's ask (2026-10-07): is a long
  session quietly expensive? Measured: 79-93% of a long session's $ is repeated context, and an
  idle gap past the cache TTL prices the next turn 15-50x higher. Servex already has the right
  "fresh, not compacted" pattern (`Layers.js`) for assistants/managers; masterminds don't have it
  yet — the recommendation and plan to extend it.
- [`doc/priorities.md`](./doc/priorities.md) — the owner's asks for this page, most important first: follow this list
- [`doc/patterns.md`](./doc/patterns.md) — every place session data lives today, counted by a script; each count opens the grid filtered
- [`doc/findings.md`](./doc/findings.md) — what the detail view loads for a row, and where each number comes from
- [`doc/templates.md`](./doc/templates.md) — which class draws which page; [`doc/classes.md`](./doc/classes.md) — the classes, one per file
- [`doc/layout.md`](./doc/layout.md) — where a session's folder lives (`ai/sessions/YYYY/MM/DD/<id>/`), how old paths still load, the scripted conversion, why ids and not task names
- [`doc/record-spec.md`](./doc/record-spec.md) — the line types a session record accepts (tag, note, alert, weight, closed, question, links) and how to write them
- [`doc/session-class.md`](./doc/session-class.md) — `AISession.js` (cost, model + effort, tokens by purpose, audit), the `session.jsonl` cache, `session-index.json`; the Cost cell and the detail's Audit button come from it (`AISessionView.js`)
- [`doc/decisions.md`](./doc/decisions.md) — the full data-source decision, the `css-scopes.txt`
  reservation note, and the VS-Code-vs-CLI heuristic, checked against a real session
- [`ext/panel2`](/framework/ext/panel2/) — the header/main chrome this tab is built from
- Files: the classes live in [`../AISession/`](../AISession/) (see [`doc/classes.md`](./doc/classes.md), which also lists the names rejected); here: `page.js` (creates `AISessionsPage`), `AISessionsPage.js`, `AISessionDetail.js`, `AISessionView.js`, `AISessionRows.js`, `AISessionTrace.js`, `sessions.css` (the row), `settings.jsonl`
  (`{"tab":true}`, how this folder joined the strip)
