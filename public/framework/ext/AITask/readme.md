# ext/AITask

The AI working log, rendered. Three tiers, named: a **session** (one Claude
transcript, a uuid) works a **task** (`ai/<date>/<slug>/`); a **day**
(`ai/<date>/`) is the dashboard over its tasks; `/framework/ai/` is the rail
over every task there has ever been. `AITask` **is** the master template for a
task's page — a manifest rendered, a checklist, a spend table, a session log —
and a task dir with no `page.js` of its own still gets one, through its day's
`route()` fallback.

| file | what it renders |
|---|---|
| `usage.js` | the usage windows as **pace** — the bar is spend, the ▼ is the clock |
| `card.js` | one task as a row: state, category tag, step segments, `now`, links, cost |
| `board.js` | the listing's shape — `dated()` (the time spine), `list()`, `group()` |
| `dashboard.js` | enumeration + loading — `rail()` (index), `active_strip()`, `dashboard()` (a day), `effort_board()` (one tag), `glance()` (a thumb) |
| `AITask.js` | one task's detail page, and the template a task's own `page.js` extends |
| `feed.js` / `replay.js` | the transcript, as a live feed and as browsable threads |
| `chat()` (in `AITask.js`) | ext/Ask's panel — talk to this task's session, from the page |
| `stats.js` | pure derivations — `progress`, `spend`, `usage_of`, `tail_activity`, `timeline_of` |
| `prompt.js` / `message.js` | parsing one transcript line into something readable |
| `effort.js` | tasks regrouped by `group` — derivation only; the board filters by it |
| `compose.js` | the board's "start work" box — `rpc:start`, dev server only |

## The manifest

`task.jsonl` (`ext/JSONL`) is the current format; `session.json` still renders
read-only. Every field is optional except **`session_id`**, whose absence costs
the whole session log. Full schema, field-by-field: [doc/manifest.md](doc/manifest.md).

## The board is a time spine — one card per row

`/framework/ai/` lists every task by date, newest first, and heads a run of
cards with a **label that only prints when it changes**: today reads as a
sequence of times (`12:34 PM`), and each past day collapses into one
`SATURDAY`. That one rule is the whole of `board.js`; there is no grouping
pass. (Mike, 2026-08-16 — the previous board was a wall of effort groups, and
what a working log is scanned for is *when*.)

## Active comes first — and appears exactly once

`active_strip()` pins every task that is **running right now**, newest first,
across every day, and `rail()` subtracts those rows from the spine below. The
strip used to sit over effort groups that also held them, so a live task
rendered twice; a dated list has no group counts to skew by removing it, so
the duplication went with the groups. (Mike, 2026-08-15: grouping by topic
buried what was running.)

## The effort is the category tag — `group`

A day is the filing system; an **effort** is the thread of work that outlives
any one day, named by the `group` slug a task assigns itself. No registry, no
second file. Each card wears its effort as a tag, and the tag is a link:
`/framework/ai/effort/<slug>/` is the same board with everything else filtered
out. [doc/effort.md](doc/effort.md).

## Starting work from the board

`compose.js` posts `rpc:start`; the dev server scaffolds the task dir and
spawns `claude -p`, returning as soon as the process is away — the task's own
log is the progress channel. [doc/starting-work.md](doc/starting-work.md) —
including where this is still `framework/ai/`-only (see Open, below).

## The board streams on the dev server

`dashboard()`, `active_strip()` and `AITask.session()` read their `task.jsonl`
through [`ext/JSONL`'s `live()`](/framework/ext/JSONL/), so an append redraws in
place: the day's groups (a task that lands moves out of Active), the index's
Active strip (same move, one tier up), and the task page's `$live` block
(checklist, `extra()`, figures — chat and feed hold state and are left alone).
Off localhost it is a plain fetch. The rail's dormant spine below stays on
`load()` deliberately — it holds every task of every day, and only the running
few are worth a subscription.

## `state()` and progress

A task is **running** only once it carries `requested_at` — a manifest with
just a `group` is metadata, not a launch. `landed_at` wins over both. Progress
is two fields: `steps` (the outline, declared once) and `step` (the 1-based
index underway), so `1..step-1` are done and the card's bar, its `3/8`, and
the detail page's checklist all derive from the same pair.

## Pace, not percentage

Each usage window is fixed-length, so `resets_at` gives how far in we are — a
▼ over a track whose fill is spend. Bar behind marker = under pace.
[doc/pace.md](doc/pace.md).

## The template, and its override

`report()` is `AITask`'s outline — `head`, `checklist`, `extra`, `figures`,
`chat`, `log`, each a named method a task's own `page.js` can override.
[doc/template.md](doc/template.md).

## Who uses this

- **`/app.js`** re-exports `AITask` — every task `page.js` that wants the
  template does `import { AITask } from "/app.js"`.
- **[`/framework/ai/`](/framework/ai/)** (`ai/page.js`) — the board: `rail()`
  for its catalog region, `AITask` as the fallback for an undeclared task dir,
  and an `effort/<slug>` route onto `effort_board()` — the other half of the
  card's category tag.
- **[`/framework/ai/2026-08-13/`](/framework/ai/2026-08-13/)**,
  **[`2026-08-14/`](/framework/ai/2026-08-14/)** — day pages: `dashboard()` +
  `glance()` (the `/framework/ai/` tile), `AITask` as the same fallback. Every
  other day (`2026-08-08`…`2026-08-12`, `2026-08-15`) has no `page.js` of its
  own and is served entirely through these two mechanisms one tier up.
- **[`manifest-vs-log`](/framework/ai/2026-08-13/manifest-vs-log/)** — a live
  demo/verification page for `stats.js`'s `usage_of`/`tail_activity`/`timeline_of`.
- **[`panel`](/framework/ai/2026-08-13/panel/)**,
  **[`sessions`](/framework/ai/2026-08-13/sessions/)**,
  **[`editor-panel-review`](/framework/ai/2026-08-14/editor-panel-review/)** —
  task pages, each `new AITask({ …, extra(){ … } })`.
- **[`task-previews`](/framework/ai/2026-08-13/task-previews/)** — a design
  note that cites `dashboard.js`'s `card()` bridge; not an importer.
- **`/framework/ext/page.js`** declares `AITask` in `children:`, which is what
  makes this page routable at all.
- **`core/Page/readme.md`**, **`core/Router/doc/method/mark_links.md`** — doc
  pages that cite this module as a worked example (`class … extends Page`,
  `mark_links()`'s rail-refresh caller).

No file in this module goes uncalled.

## Traps

- **A routed task mounts beside its day, not inside it.** A plain `Page` sets
  no `$pages`, so `container()` walks past the day to the ai index's catalog
  region and both land there as siblings. `ai.css` stands the day aside while
  one of its tasks is showing — the `.tab-panel` contract, one tier down.
- **`previews()` is doing two jobs.** It is both "my children, on someone
  else's index" (`walls()`) and "my catalog rail". Overriding it for the rail
  therefore rendered the whole dashboard on `/framework/`; `leaf: true` on the
  ai page opts it out of both the wall and the nav tree.
- **Card layout is a container query, not a viewport one** — in the rail the
  card is narrow while the screen is wide.
- **A log's timestamps are not all in one format.** Sessions write both
  `…T17:22:30.464Z` and `…T12:22:30-05:00` for the same instant, so any
  ordering must `Date.parse` — compared as text the UTC one sorts five hours
  late. Three files did it as text until the dated board made the order legible.
- **`new Date("2026-08-15")` is UTC midnight**, which west of Greenwich is the
  day before. Every weekday heading on the board would have been wrong by one,
  plausibly. Build a day from its parts (`board.js`'s `local()`).
- **A fork's transcript contains the full copied parent history**, with
  `sessionId` rewritten to the fork's own. No surviving marker distinguishes
  copied lines; timestamps jump backward at the boundary. Open.
- **The log is threads, not messages.** Tool results arrive typed `"user"`,
  sidechain lines belong to a subagent, and a Skill's injected body arrives as
  a `"user"` text block with `isMeta: true` — none of them start a thread.
- Prose renders through **`md()`** — Mike's call (2026-08-13): browsability
  beats the raw-html risk. If a message renders strangely, suspect its
  embedded HTML before the viewer.
- **An append no longer reloads the tab — it redraws.** A `.jsonl` write streams
  to its subscribers instead (`ext/JSONL`'s `live()`), so the old rule "log
  milestones, not keystrokes" is now about the log's readability, not the
  browser's. Anything else in a task dir (`requirements.md`, a new file) still
  goes through the reload path.
- **The chat FORKS on its first message.** A headless turn must never share a
  transcript a human still has open, so `chat_session_id` is a sibling of
  `session_id`, not the same session. See [`ext/Ask`](/framework/ext/Ask/).
- **`AITask.session()` probes `task.jsonl` blind** — `dashboard.js` avoids it by
  reading the directory listing first; the detail page has no listing to read.
  On the dev server the probe is a socket subscribe, answered with an empty
  batch (`.loaded` stays unset) and no console noise; on static hosting it is
  still one 404 per legacy `session.json` task. The empty answer leaves the
  subscription **standing**, which is right for a just-scaffolded task and wrong
  for a legacy one — so the legacy branch, and only that branch, calls
  [`unsubscribe()`](/framework/ext/JSONL/api/unsubscribe/).
- **A dropped log line is stated, not swallowed.** `ext/JSONL` counts what fails
  `JSON.parse` and the detail page prints "N unparsed lines" under the checklist.
  It is the only visible symptom: a landing line lost to an illegal escape leaves
  a finished task rendering as running, with everything else looking correct.
- **A running card marks itself quiet after 30 minutes of silence.** `quiet()` in
  `stats.js`, computed at render time from the log the card already holds — no
  server involvement, and deliberately worded as a silence ("2h 0m quiet"), not a
  diagnosis: nothing here can tell a crash from a long, honest think.

## Open

- **The `<page>/ai/<slug>/` move is half-landed** — see CLAUDE.md. Reading
  already works anywhere: `AITask.chat()`'s `task` path and `Server/plugins/Ask.js`'s
  `thread_dir()` fence accept any `public/**/ai/<slug>` (widened 2026-08-15,
  `devbar-ai`). **Writing a new task is still `framework/ai/`-only** —
  `Server/plugins/Start.js`'s `scaffold()` hardcodes `public/framework/ai` as
  its root, so the compose box on `/framework/ai/` cannot open a task beside
  an arbitrary page yet, and `tasks()`/`dashboard()`/`all_tasks()` here all
  assume the two-level `ai/<date>/<slug>/` shape — a browsable `<page>/ai/`
  would need a generalized walk, not a hardcoded depth.
- Subagent transcripts (`<session>/subagents/agent-*.jsonl`) aren't served.
- `replay.js`'s `load()`/`turns()`/`is_prompt()` are not exported, so
  `feed.js` carries ~15 lines of the same shape. Hoist when a third caller
  wants it.

## Where replays come from

`Server/plugins/AILogs.js` maps `/ai-logs/<uuid>` onto
`~/.claude/projects/<cwd-slug>/<uuid>.jsonl`, read-only and UUID-validated —
transcripts are 130KB–2.4MB each and are scratch by CLAUDE.md's own rule, so
they are served from the real path and never enter the repo. On static
hosting the route falls to `index.html`; the viewer sniffs the content-type
and says "unavailable." Production never depends on it.

Field-by-field authoritative-vs-derivable verdicts and the schema-v2 proposal:
[`manifest-vs-log/analysis.md`](/framework/ai/2026-08-13/manifest-vs-log/).
How the module got here, wave by wave: [`doc/waves.md`](doc/waves.md).
