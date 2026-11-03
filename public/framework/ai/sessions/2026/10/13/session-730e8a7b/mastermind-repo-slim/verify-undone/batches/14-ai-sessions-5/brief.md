# Check 23 asks against the repo: ai/sessions

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/14-ai-sessions-5/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `ai/sessions`, folder `public/framework/ai/sessions` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/ai/readme.md`, `public/framework/ai/sessions/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/ai/sessions/readme.md`)

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

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/14-ai-sessions-5/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 23 asks

1. `929dca1fc8` (4 days old): Fix the sessions page data grid: add padding where backgrounds differ, and remove the broken behaviour and wasted space.
2. `95b02c7b13` (4 days old): Fix the layout problems: areas with coloured backgrounds and no padding, wasted space, and broken elements such as the sessions page data grid.
3. `490dcdffcb` (4 days old): Find and talk to the other Opus mastermind session
4. `36de0de1d6` (4 days old): Fix the cluttered sessions tab so it has visual hierarchy and text is positioned properly
5. `235bbde924` (4 days old): Take a screenshot of monorepo.localhost/framework/ai/sessions at 3440 pixels
6. `7d70ca6363` (4 days old): Use Playwright to scroll the sessions data grid and check the gray rows
7. `5e08404a8e` (4 days old): Fix the sticky header so rows no longer scroll behind it and headers are laid out properly
8. `9c48ceb07d` (4 days old): Make the header more solid
9. `9ca9283728` (4 days old): Reduce the scrollable area, which is about a third of the page height
10. `4e1b8d8f84` (4 days old): Make every item visible and clickable in the sessions list
11. `fae3c38562` (3 days old): Have agents log their work to JSONL as they go, so state survives without a handoff file.
12. `a253d9f118` (3 days old): Make the AI session system browsable, showing what was requested and when, with clickable raw logs.
13. `51a34fe1bf` (3 days old): Have masterminds study what exists, starting fresh sessions and reusing one only when its cache is fresh.
14. `e0ec4e076e` (3 days old): Record efficiency rules, such as move or copy a file instead of reading and writing it.
15. `d3e9f489a1` (3 days old): Answer where things stand on minion count, model, effort, and output.
16. `1ad88949c1` (3 days old): Get the AI session system working so the owner can browse what was requested and when.
17. `62c0ba2512` (3 days old): Add a raw log the owner can click through and read.
18. `518bfc6786` (3 days old): Start with fresh sessions by default, reusing only when the cache is fresh.
19. `932e33890b` (3 days old): A fresh session reads READMEs and code, not the old session's context.
20. `330ed1413e` (3 days old): Decide whether the date-based view belongs in the sessions directory
21. `bb0f62d1d9` (3 days old): Add year, month and day breadcrumb filters that scope sessions strictly
22. `0fcd96c20f` (3 days old): Sort the month view by most recent first
23. `6c71e15ada` (3 days old): Consider making the month view the default sessions view
