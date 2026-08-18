# AITask — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

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
| `shots.js` | the screenshot wall — `shot_wall()`, lazy thumbnails of a task's logged `shot` lines |
| `chat()` (in `AITask.js`) | ext/Ask's panel — talk to this task's session, from the page |
| `stats.js` | pure derivations — `progress`, `spend`, `usage_of`, `tail_activity`, `timeline_of` |
| `prompt.js` / `message.js` | parsing one transcript line into something readable |
| `effort.js` | tasks regrouped by `group` — derivation only; the board filters by it |
| `compose.js` | the board's "start work" box — `rpc:start`, dev server only |

## The manifest

`task.jsonl` (`ext/JSONL`) is the current format; `session.json` still renders
read-only. Every field is optional except **`session_id`**, whose absence costs
the whole session log. Full schema, field-by-field: [doc/manifest.md](manifest.md).

## The board is a time spine — one card per row

`/framework/ai/` lists every task by date, newest first, and heads a run of
cards with a **label that only prints when it changes**: today reads as a
sequence of times (`12:34 PM`), and each past day collapses into one
`SATURDAY`. That one rule is the whole of `board.js`; there is no grouping
pass. (the owner, 2026-08-16 — the previous board was a wall of effort groups, and
what a working log is scanned for is *when*.)

## Active comes first — and appears exactly once

`active_strip()` pins every task that is **running right now**, newest first,
across every day, and `rail()` subtracts those rows from the spine below. The
strip used to sit over effort groups that also held them, so a live task
rendered twice; a dated list has no group counts to skew by removing it, so
the duplication went with the groups. (the owner, 2026-08-15: grouping by topic
buried what was running.)

## The effort is the category tag — `group`

A day is the filing system; an **effort** is the thread of work that outlives
any one day, named by the `group` slug a task assigns itself. No registry, no
second file. Each card wears its effort as a tag, and the tag is a link:
`/framework/ai/effort/<slug>/` is the same board with everything else filtered
out. [doc/effort.md](effort.md).

## Starting work from the board

`compose.js` posts `rpc:start`; the dev server scaffolds the task dir and
spawns `claude -p`, returning as soon as the process is away — the task's own
log is the progress channel. [doc/starting-work.md](starting-work.md) —
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
[doc/pace.md](pace.md).

## The template, and its override

`report()` is `AITask`'s outline: a local Requirements · Report · Session tab
bar over named methods a task's own `page.js` can override — `outcome`,
`links`, `status`, `checklist`, `extra`, `shots`, `figures` build the Report
tab (the answer leads); `chat` + `log` build Session; `head` builds
Requirements. [doc/template.md](template.md).

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
- **⚠ `.ai-index-rail`'s mobile rule (`ai.css`, `<64em`) needed the same routed/
  unrouted split its desktop rule already has** (2026-08-17, `ai-rail-mobile`
  — a third consequence of `ext/catalog`'s scroll-ceiling work, out of that
  module's fence, recorded in its `doc/decisions.md`). It used to fire
  unconditionally: `max-height: none` on the `shrink: 0` rail let it claim its
  full natural height (tens of thousands of px — `catalog.css` turns
  `.page-catalog` into a column below 64em) and squeezed `.page-catalog-pages`
  to `clientHeight: 0`, confirmed against a `scrollHeight` of 8725 on a real
  day page — no scrollbar, no wheel, no keyboard, `/framework/ai/<day>/`
  entirely unreachable on a phone. Fixed by scoping the mobile rule to
  `:has(> .page-catalog-pages > .page:is(.active-page, .active-ancestor))` —
  the identical test `ai.css`'s own board-mode rule already keys off — and
  reusing the desktop default's own bound verbatim (`flex: 0 0 min(34em,
  45%); max-height: 100dvh`) rather than inventing a new number: `flex-basis`
  and `max-height` both resolve against whichever axis is currently main, so
  the same declaration that caps the rail's WIDTH in the row layout caps its
  HEIGHT once the column takes over. Verified with `analyze()` at 390/720/
  1280/3440 × routed/unrouted × every `catalog()` caller: `unreachable`,
  `zero-size` and `gutter` all absent. Two unrelated pre-existing findings
  surfaced by the same sweep, confirmed via `git stash` to predate this fix and
  left alone (out of fence): a low `gutter` on `/framework/core/Page/`'s table
  at 720/3440 (matches the "73–85px rail overshoot" already on record in
  `ext/catalog/readme.md`), and a high `gutter` on `/framework/ext/catalog/`'s
  own `.demo-app-pages` at 390/720 — new to this sweep, not yet recorded
  anywhere, belongs to `ext/catalog` or its demo, not here.
- **⚠ The "reuse the desktop bound verbatim" call above was itself the next bug**
  (2026-08-17, `ai-rail`). `flex: 0 0 min(34em, 45%)` sizes whichever axis is
  main — the row's WIDTH, but the column's HEIGHT — and `45%` was chosen to be
  a good WIDTH share; nothing picked it as a good height share, it just carried
  over. Result, live at 999px: the rail sticking 731px wide and 45% of a 725px
  stack (326px) above the content — the owner's own "50/50, full width, on top."
  Fixed with a height-native unit instead of a second guess at the same
  percentage: `flex: 0 0 min(22em, 34dvh)` in the routed column case. Also
  tightened the row rule's own `45%` to `41%` — at 1280 it was putting 474px of
  a 1051px catalog box into nav, a near-50/50 split even in row mode (content:
  506px). Wanted lower still (30% tested), but a generated task-detail page's
  `code`/`td` spans use `framework.css`'s fixed px padding (`code{padding:.15em
  .4em}`, line 247), not scaled to box width — widening the content column past
  ~550px trips DesignTool's `pad-share` band from full credit to a letter-grade
  drop (40%→80/B, 38%→78/C, swept in 2% steps). `41%` clears that floor with a
  1-point margin (81/B) and is otherwise the site's own `code`/`td` padding to
  fix, out of this file's fence. `ai/2026-08-17/ai-rail/` has the full sweep.
- **⚠ `.ai-card`'s mobile single-column rule (`ai.css`, `@container (width < 44em)`) needed a floor, not just a collapse** (2026-08-17, `ai-card-mobile` — the mobile sweep's worst finding site-wide: `/framework/ai/` 82/B at 1280 → 58/F at 390, `.ai-who` spilling up to 119px/36% past 15 of ~105 cards). `grid-template-columns: 1fr` still carries `1fr`'s content-based automatic minimum, so the title+tag row (`.ai-who`) refused to shrink below its own min-content and spilled past the card instead of wrapping. Fixed with `minmax(0, 1fr)` — the same "track needs a floor" fix as `bounds.md`, one declaration, no new breakpoint. Verified with `analyze()` at 390/720/1280/3440: all three high-severity findings (`escape`, `doc-overflow`, `cramped`) gone at 390 (48/F → 84/B), 720/1280/3440 byte-for-byte unchanged from baseline (the rule only fires under 44em), and the single worst-overflowing card (`element-pages`, 118px) confirmed fixed by name.
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
- Prose renders through **`md()`** — the owner's call (2026-08-13): browsability
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
- **The screenshot wall never requests an image off localhost.** `shots.js`'s
  `LOCAL` check gates whether an `<img>` element is *created* at all, not just
  whether it's shown — `/screenshot` (`Server/plugins/Screenshots.js`) is
  dev-only, so on static hosting there is nothing to fetch and no broken-image
  flash to hide. On localhost a `.missing` class (set by the `<img>`'s own
  `error` event) swaps in a plain swatch instead — covers a shot logged before
  the dev server that serves it was restarted, too.
- **A running card marks itself quiet after 30 minutes of silence.** `quiet()` in
  `stats.js`, computed at render time from the log the card already holds — no
  server involvement, and deliberately worded as a silence ("2h 0m quiet"), not a
  diagnosis: nothing here can tell a crash from a long, honest think.
- **The task page rendered twice on one screen, and the answer sat 5% down
  249,000px of it** (2026-08-17, `ai-board-fix` — diagnosed with file:line
  causes in `ai-board-review/proposal.md`). `report()` ran three tables before
  `md(m.outcome)`; `feed.js` expanded every tool-call turn in full (235,034px
  on one 47-turn session); the rail's `34dvh` mobile rule (two entries up) was
  still the wrong fix — a routed day or task doesn't want the archive at any
  size, so `.ai-index-rail` is `display: none` now, at every width, superseding
  that whole mechanism; `card.js`'s `.ai-links` pills never rendered on the
  task page itself; `day.jsonl` was written by every task and read by nothing;
  and a task dir with its own `page.js` had to be hand-declared in `children:`
  or `route()`'s unconditional `AITask` claim beat `Page.load()`'s real
  filesystem probe to it. Fixed together: `report()` now builds a hand-rolled
  `.tabs`/`.tab-bar`/`.tab-panel` toggle (Requirements · Report · Session —
  not `Page.prototype.tabs`, since these are sections of one page, not routed
  children) with `outcome()` and the reused `links_row()` leading the Report
  tab; `feed.js` folds a turn's tool flow behind a click (`message.js`'s
  `fold()`), showing the prompt only; the agents table's outcome column is
  first-sentence-plus-click for the same reason; `dashboard.js` exports
  `day_strip()` (day.jsonl, newest first, capped at 12) and `has_page_js()` (a
  `directory.json`-backed cache, warmed by `dashboard()` itself) that both
  day `route()`s now consult before falling back to `AITask`. `has_page_js`
  reads `undefined` (cache still warming, e.g. a cold deep link) the same as
  "no page.js" — safe, not wrong, just not yet the fix; a click from the day
  page itself (the normal path) always has a warm cache. Measured:
  `mastermind-run` @1440 went from 249,069px (answer at y≈12,900) to 5,091px
  (answer at y≈150). `ai/2026-08-17/ai-board-fix/` has the before/after shots.
- **A day page had two scrollbars, and the first screen held no cards**
  (2026-08-17, `day-page-ux` — the owner: *"that first page has 2 scrollbars. the
  long list of non-clickable things is rather useless"*). Both halves, measured:

  **The scrollbars.** Every ordinary page scrolls in `.pages` (`Page.css`
  reserves that gutter unconditionally, so navigating never shifts content
  sideways). A *routed catalog* page does not: `catalog.css` caps it at the
  region height and hands the scroll to `.page-catalog-pages` instead — right
  for a **split**, where a rail and a region each cap their own height. But
  `ai.css` had already hidden this rail the moment a day or task was routed, so
  what was left was a wrapper around one region still paying for a split it no
  longer was: `.pages` 900/900 with a dead reserved bar, `.page-catalog-pages`
  900/9,640 with a live inset one. `ai.css` releases the ceiling in that state
  now — the same verdict its board mode already reached: *a board is not a
  scrollport, the page scrolls*. Two things the release needs, both non-obvious:
  the region's `overflow-y: visible` must be **nested** inside the parent rule
  or it loses the specificity race with `catalog.css` and silently does nothing;
  and it needs `flex: 1 1 auto`, because below 64em `catalog.css` turns the row
  into a **column**, where `flex: 1 1 0` is a *height* basis of zero — the page
  rendered 622×0 and blank at 900 while looking perfect at 1440.

  **The first screen.** It was the date, three lines of intro prose, and twelve
  grey `day.jsonl` lines. No cards. `ux-v1` (a vision prompt written for this,
  run at 900/1440/3440) read those twelve lines *as* the task list at every
  width and called the missing link affordance its top `broken` finding. So:
  the strip is a fold at the foot, on `wide`, and every line is its task's link;
  Landed is a compact group (one line of outcome, not two); Proposed is a fold;
  a **running** card no longer prints the dispatch `request` it was launched
  with, because the step bar and the `now` line beside it already say what is
  happening; `t.m.tab` (the VS Code window title, on every card) is gone; and
  `.ai-card` drops the theme's 1.8 prose leading for 1.4, which a row of facts
  is entitled to. At 1440 the first screen is now four running cards with their
  step bars and two landed rows; at 3440, twelve landed rows.

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
How the module got here, wave by wave: [`doc/waves.md`](waves.md).
