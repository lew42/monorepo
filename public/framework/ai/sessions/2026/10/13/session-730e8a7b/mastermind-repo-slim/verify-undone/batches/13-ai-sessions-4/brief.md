# Check 23 asks against the repo: ai/sessions

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/13-ai-sessions-4/results.json` and stop.

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

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/13-ai-sessions-4/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 23 asks

1. `332726707f` (4 days old): Find every field that is written but rendered from a stale source, and render from the proper field so model updates appear.
2. `c0e403144f` (4 days old): Do not add a database for this problem.
3. `3f8af51fdf` (4 days old): Add a current model field to sessions that points to the model the session is using now.
4. `0b00b3e06e` (4 days old): Work out the accounting for switching models on a session, including cache-write costs and whether each message records its model.
5. `1b724b1096` (4 days old): Show logged costs newest first.
6. `4ad57644db` (4 days old): Condense the very granular logged costs into a more compact representation with a total.
7. `11ab7def8e` (4 days old): Widen the right sidebar, which is about 300px, and redistribute space so the input, cache read and output table is readable.
8. `3157c2e51c` (4 days old): Confirm whether the chat area uses the same chat widget as the rest of the app.
9. `2d5b17e8ad` (4 days old): Give the chat area its own padding and background, and put the scrollbar outside that padded area.
10. `eabccbc61e` (4 days old): Reduce the excess padding above the chat area header.
11. `96e89916c4` (4 days old): Keep the split bar defaulting to 50% with double-click reset to 50%.
12. `d212d78dc1` (4 days old): Fix the usage item sidebar so it shows its full content, not just the heading.
13. `dc439fbc2a` (4 days old): Give the footer its own background colour, remove excess padding, and cut the space it takes up.
14. `2002d0e09b` (4 days old): Question whether the footer is needed at all, and explain what 'one below' means.
15. `f34fd2237d` (4 days old): Check whether the footer refreshes live and why tasks show as stalled when some are no longer stalled.
16. `48a22399cb` (4 days old): Fix the page load error that appears after refresh.
17. `774c92af75` (4 days old): Fix the ai/sessions tab clutter: add visual hierarchy and stop randomly positioned text.
18. `d57aa2bc51` (4 days old): Take a screenshot of monorepo.localhost/framework/ai/sessions at 3440 px.
19. `b64380dd1e` (4 days old): Fix the sessions data grid so headers lay out properly and gray rows no longer scroll behind the sticky header.
20. `89fb1f3d97` (4 days old): Use headless Playwright to scroll the sessions data grid and verify the fix.
21. `e6911b3957` (4 days old): Consider making the sessions header more solid.
22. `fd27ce604a` (4 days old): Fix the sessions scrollable area, which is only about a third of page height.
23. `309613f33c` (4 days old): Make all sessions items visible and clickable.
