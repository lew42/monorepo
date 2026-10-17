# Sessions — a data grid of every Claude session, newest activity first

The owner's own words: "the start time, the source tag, the agent or tab name, the model, the
state and the cost." This tab is that grid, covering all three kinds of session on this machine:
a **VS Code** tab (you, typing), a **Servex** agent (a mastermind or minion, spawned), or a
standalone **CLI** run. Click a row to see that session's own prompts, in order, at its own url —
prompts live inside their session, never a separate log page, and on a wide screen the detail
opens as a side peek beside the grid instead of replacing it.

- **The session folder shape (decided 2026-10-16):** not built as its own project; the task system (`Task extends Item`) carries it and `Session` piggybacks. What shipped (the exact cost counter) and what moves to the task-system plan, ask by ask: [AISession/doc/accounting-decision.md](/framework/ai/AISession/doc/accounting-decision.md). Source proposal: [shape.md](2026/10/16/voice-20261016/accounting/shape.md). The session folder's one record is `session.jsonl` (the rule, the move script, its undo and the counts: [doc/session-record.md](doc/session-record.md)).
- **The grid is [ext/DataGrid](/framework/ext/DataGrid/)**: a table or a rail of cards (the Table / Rail toggle, `?view=rail`, default in `settings.jsonl`); rows are `AISessionView`, order and nesting are `AISessionsPage.arrange()`.
- **Detail classes** live in [ai/AISession](/framework/ai/AISession/); the old `ai/sessions/Session*.js` shims are retired to `ai/archive/retired/2026-10-13/sessions/` (manifest + `ai/archive/retire-shims.mjs --undo`).
- **Routine sessions are hidden** (prompt cleaning, short headless runs, clarity, reviews, helpers): one chip per kind with its count, click to show them; the search finds every session, and matches a session's tags too (`page/live-cards`, `task/…`, `topic/…`; the tagged digests are `session.jsonl` lines, [round 4](2026/10/16/voice-20261016/past-work/round4-result.md)); [doc/buckets.md](doc/buckets.md).
- **Use** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#use), verbatim.
- **Where the real dollars come from** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#where-the-real-dollars-come-from), verbatim.
- **Where the data comes from** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#where-the-data-comes-from), verbatim.
- **Tasks in memory** — every `task.jsonl` as a queryable row (`module`, `landed`, `text`): [Server/doc/session-index.md](/Server/doc/session-index.md).
- **Coverage tab** on a session's own page: every ask in the owner's prompts (refined one prompt per Haiku call by `Server/RefineQueue.mjs`), its status, the cited raw sentences one click down, and the session's coverage score: [ext/Refine/doc/refine-queue.md](/framework/ext/Refine/doc/refine-queue.md).
- **Layout** — the compact grid, scope trail, left rail, status line: [doc/ui/compact-layout.md](doc/ui/compact-layout.md).
- **Buckets** — thousands of routine sessions fold into a few chips with their own totals: [doc/buckets.md](doc/buckets.md).
- **Data sources** — the SDK session file is the one copy of what was said; where the repo still duplicates it, and the deep link: [doc/data-sources.md](doc/data-sources.md).
- **Next** — what the 2026-10-13 review left open (Coverage's nested cards, the late title): [doc/next.md](doc/next.md).
- **Picture archive** — old months' screenshots live on the E: drive, records stay here; how to read or restore one: [doc/picture-archive.md](doc/picture-archive.md).
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
- Detail, latency numbers and the scripts: [`doc/live/realtime.md`](doc/live/realtime.md).

## More

- Resume warm, cold or fresh, computed from the session's idle time and context: [doc/data/resumption.md](doc/data/resumption.md) (`Server/SessionResume.mjs`)
- **Every task lives in this store** (2026-10-12): `YYYY/MM/DD/<session>/<task>/`, made by `node Server/TaskDirs.mjs --new <slug>`; the flat `ai/YYYY-MM-DD/` day folders are retired and their old addresses redirect. Why and how: [../doc/task-folders.md](../doc/task-folders.md) · the 2026-10-10 first pass: [doc/data/tasks-in-sessions.md](doc/data/tasks-in-sessions.md)

Every Sessions doc, by subsystem: [`doc/readme.md`](doc/readme.md).

- [`doc/data/layout.md`](doc/data/layout.md) — folder migration counts on the main data: 7,784 sessions (7,783 move), 4,555 cards = 4,089 joined + 466 other, 1,066 tasks = 271 joined + 795 orphans, 6,582 name collisions all resolved by an id suffix; tasks stay put for now
- [`doc/live/realtime.md`](doc/live/realtime.md) — snapshots, day files and the socket: the path, what is live, measured latency
- [`../doc/tasks/tasks.md`](../doc/tasks/tasks.md) — proposal: tasks as `core/Task` with `origin` = the creating session; session cost rolls up into its tasks
- [`doc/data/data-architecture.md`](doc/data/data-architecture.md) — the owner's open design: index files, several files per session, what session.jsonl keeps, routes, what the task audit leaves behind
- [`doc/asks/asks.md`](doc/asks/asks.md) — idea: a session as a container for a whole AI setup (roles, models, tools); open
- [`doc/live/realtime.md`](doc/live/realtime.md) — the owner's ask (2026-10-07): this page
  must go realtime using the site's EXISTING jsonl stream, never a second one. What that stream
  already is, why this tab has never actually used it, and the staged plan to get a session's own
  `session.jsonl` streaming live instead of the current stale snapshots.
- [`doc/cost/context-cost.md`](doc/cost/context-cost.md) — the owner's ask (2026-10-07): is a long
  session quietly expensive? Measured: 79-93% of a long session's $ is repeated context, and an
  idle gap past the cache TTL prices the next turn 15-50x higher. Servex already has the right
  "fresh, not compacted" pattern (`Layers.js`) for assistants/managers; masterminds don't have it
  yet — the recommendation and plan to extend it.
- [`doc/asks/asks.md`](doc/asks/asks.md) — the owner's asks for this page, most important first: follow this list
- [`doc/data/patterns.md`](doc/data/patterns.md) — every place session data lives today, counted by a script; each count opens the grid filtered
- [`doc/data/findings.md`](doc/data/findings.md) — what the detail view loads for a row, and where each number comes from
- [`doc/ui/views.md`](doc/ui/views.md) — which class draws which page; [`doc/ui/classes.md`](doc/ui/classes.md) — the classes, one per file
- [`doc/data/layout.md`](doc/data/layout.md) — where a session's folder lives (`ai/sessions/YYYY/MM/DD/<id>/`), how old paths still load, the scripted conversion, why ids and not task names
- [`doc/data/record-spec.md`](doc/data/record-spec.md) — the line types a session record accepts (tag, note, alert, weight, closed, question, links) and how to write them
- [`doc/ui/session-class.md`](doc/ui/session-class.md) — `AISession.js` (cost, model + effort, tokens by purpose, audit), the `session.jsonl` cache, `session-index.json`; the Cost cell and the detail's Audit button come from it (`AISessionView.js`)
- [`doc/asks/decisions.md`](doc/asks/decisions.md) — the full data-source decision, the `css-scopes.txt`
  reservation note, and the VS-Code-vs-CLI heuristic, checked against a real session
- [`ext/panel2`](/framework/ext/panel2/) — the header/main chrome this tab is built from
- Files: the classes live in [`../AISession/`](../AISession/) (see [`doc/ui/classes.md`](doc/ui/classes.md), which also lists the names rejected); here: `page.js` (creates `AISessionsPage`), `AISessionsPage.js`, `AISessionDetail.js`, `AISessionView.js`, `AISessionRows.js`, `AISessionTrace.js`, `sessions.css` (the row), `settings.jsonl`
  (`{"tab":true}`, how this folder joined the strip)
- OpenRouter dollars are real, Claude dollars are an equivalent, and the gap to the account is stated: [`doc/cost/openrouter-dollars.md`](doc/cost/openrouter-dollars.md).
- The grid switches to compact cards below 88em of panel, checked at four widths: [`doc/ui/views.md`](doc/ui/views.md).
- Tasks migration dry run (2026-10-09): 64 tasks join a session, 1003 orphans, 651 slug collisions resolved by id8; not applied until moved tasks have a route.
- A session page shows the live conversation (both sides, tool calls folded) and cards the AI posts: [`doc/ui/views.md`](doc/ui/views.md).
- Red flags (`$$$`, stalled, context, Opus minion) and the mastermind tag are computed by `node Server/session-flags.mjs --watch` into `session-flags.json` (gitignored; keep the watcher running) and drawn by `AISessionFlags.js`; thresholds sit in its `LIMITS`.
- The owner wants a later redesign (less text, clear hierarchy, the home of everything real-time): [`doc/asks/asks.md`](doc/asks/asks.md).
- Why some tabs read as running when they are not, and which launcher made them: [`doc/asks/stuck-sessions.md`](doc/asks/stuck-sessions.md).
- Models and cost per turn: [`doc/cost/models-and-cost.md`](doc/cost/models-and-cost.md); detail tabs and chat-bubble storage: [`doc/ui/detail-layout.md`](doc/ui/detail-layout.md).
- Compaction dry run (what a compacted task log would keep and lose, 4.5 MB saved, not applied): [`doc/compaction.md`](doc/compaction.md).
- **Cards (one tree)** — task cards live under `ai/sessions/YYYY/MM/DD/cards/`, one folder per card; [today](/framework/ai/sessions/2026/10/13/cards/).
