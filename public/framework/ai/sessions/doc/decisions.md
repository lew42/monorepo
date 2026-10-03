# Sessions — decisions

## 2026-10-02 (sessions-grid-v2) — a CSS grid, `columns()`, and `ext/grip`, not three new things

The owner's follow-up ask added three requirements on top of the shipped preview-card list:
a data grid with Start/Source/Name/Model/State/Cost, no HTML `<table>`, one `--col-<name>` token
per column with a resize that touches only that token, and a Notion-style side peek on a wide
screen. Full brief: [`/framework/ai/2026-10-02/sessions-grid-v2/requirements.md`](/framework/ai/2026-10-02/sessions-grid-v2/requirements.md).

**The grid, without a `<table>`.** `.sessions-grid` is one real CSS grid; the header and every
data row are `display: contents`, so their cells become the grid's own flat items and line up in
its `grid-template-columns` tracks — the exact nested-`display:contents` idiom `core/Page`'s own
`columns()` already uses to let a tree of pages read as a row (`doc/columns.md`, "Peers on screen,
a tree in the DOM"). Each track is `minmax(<floor>, var(--col-<name>))`, so the grid itself refuses
to go under the floor even if JS never clamped it.

**The resize, reusing `ext/grip`.** Not a new drag handler: `grip({ from: "start", write(px){…} })`
on each header cell, the same factory `ext/files`, `Panel2.split`, `core/Sidebar` and `core/Page`'s
own column system already call. `from: "start"` measures the cell's own left edge — which IS the
column's start — so the pointer position it hands `write()` is already the column's width, no
extra arithmetic. `write()` touches exactly one token (`$grid.style("--col-" + key, …)`), satisfying
"resizing a column changes the one token" with no bespoke code. The handle you actually see and
drag sits on the cell's **right** edge, not its left: `grip`'s own `mirror` option defaults to
`from === "start"`, which draws the strip at the opposite edge from the one it measures — so
"measured from the left" and "dragged on the right" are the same grip, not a contradiction (the
readme's "drag a column header's own right edge" and this doc's "measures the cell's own left
edge" are both true, of two different things: where you grab it, and what it computes).

**The side peek, reusing `columns()`.** The alternative considered was a bespoke `:has()` master-
detail layout (the shape `core/new/1/site/compound/master-detail/page.js` hand-rolls) or putting
the detail on `Panel2.Side`. Rejected: `Panel2.Side` is navigation chrome that slides OVER the
page (a drawer), not a second reading pane beside it, and a hand-rolled `:has()` layout would be a
second master-detail mechanism next to the one `core/Page` already ships and three other pages
already use this exact way (`core/Page/overview/columns/uses/inbox/`). Sessions calls
`this.columns()` and sets `width: "fill"`; the grid claims the whole row alone, and the existing
"`fill` yields to an open child" rule (`doc/columns.md`) drops it to the default reading width the
moment a row's detail opens, leaving the rest of the row to the detail page — the whole peek, for
free, from a rule already shipped for other pages. The `< 32em` phone regime `core` already has
folds it to one screen at a time; nothing extra was written for narrow screens either.

**Found live, fixed same day:** a cell callback written as `cond && small.c(…)` rendered the
literal text "false" in the Cost column, because a live agent's `cost` field really was the
boolean `false` (not a number, not null) — the arrow function's own return value (`false`) was
the thing that ended up as a stray text node. Rewritten as plain `if` statements. The Dashboard
tab's own Sessions tile (`ai/dashboard/page.js`) reuses `row_view()`/`merge()` (law 6, one row
renderer) and needed the same `sessions-grid` class added to its own container, since a cell's
grid position depends on the parent actually being that grid.

## Why a script, not a live route

The owner wants a live sessions list, and the obvious way to build one is a real Servex route,
`GET /api/sessions`, answering one row per session straight from the agent registry and the
machine's own Claude session files. This task asked for exactly that
(`Servex/agents` inbox note, 2026-10-02, from `task-mastermind-panel2-sessions`), with the full
row shape it would need. No reply had landed by the time this tab had to ship, and this task's
own write fence is `public/framework/ai/` plus two named files — it cannot add anything under
`Server/` itself to build the route another way.

A browser page also cannot read a local `.jsonl` file by itself (no filesystem access), so for
the VS Code/CLI half of the list, SOME node process has to do that scan. The smallest thing that
works today: a plain script, `sessions.mjs`, run by hand, writing one JSON snapshot this tab
fetches. Servex's own agents are different — `GET /api/agents` already exists and answers live —
so the page polls that directly instead of waiting on the snapshot for those rows, and only the
VS Code/CLI half goes stale between script runs.

**What a real route would still add, that this cannot:** a Servex-sourced row's `last_prompt_first_
line` (`GET /api/agents` carries no transcript at all), and sessions outside this one machine's
`c--Code-lew42-monorepo` project folder (a worktree runs its own session files under a differently
-named folder, keyed by its own path — e.g. this very task's own session lives under
`C--Code-lew42-worktrees-panel2-sessions`, not the folder `sessions.mjs` scans). Both are
one-line additions once the route exists; neither is worth hand-rolling twice.

## The VS-Code-vs-CLI heuristic, checked against real data

Every session's own `type: "user"` lines carry a `turnOrigin` field: `"human"` when a person
typed it, `"sdk"` when a program sent it, and — found only by reading a real file —
`"task_notification"` for the harness telling itself a background task finished. The rule:
look at the LAST real (non-sidechain, non-task-notification) user line in the session; `"human"`
tags it `vscode`, anything else tags it `cli` (a Servex-spawned agent's own session never reaches
this scan at all — its `session_id` is already in Servex's own agent list, excluded before the
file scan runs).

Checked against two real sessions before shipping: the task's own named test case,
`361c4d18-e878-4c04-9537-444e847e13d5` (a real, interactive VS Code mastermind tab), and a
Servex-spawned `task-mastermind-framework-home` session. The FIRST version of this script used
whichever user line was simply last in the file, which for `361c4d18` was a `task_notification`
line (the harness noting a background sub-task finished) — tagging a genuinely interactive
session `cli`. Excluding `task_notification` lines from the scan fixed it; re-verified after the
fix that `361c4d18` tags `vscode` with a real, human-written last prompt.

## Open: a Servex row's time is when it started, not its newest activity

`merge()` reads `a.started_at` for a Servex row because `GET /api/agents` carries no
last-activity field — only `started_at`, `turns` and `cost`. "Newest activity first" is exactly
right for VS Code/CLI rows (their own transcript's real last timestamp) and only approximately
right for Servex rows, which sort by when the agent began, not its latest turn. A long-running
agent that started early but just replied would sort behind one that started later and has gone
idle. Noted, not fixed: the same real route this task already asked for (`doc/decisions.md`
above) would carry a true last-activity field; patching around its absence here would be the
same kind of guess this task avoided for the Inbox tab's own data source.

## Open: `css-scopes.txt` reservation

`sessions-` is free (grep across `public` found only JS property accesses like `proc.sessions`,
never a CSS class) but this task's fence doesn't include
`public/framework/styles/css-scopes.txt`. Whoever next can write that file should add:

```
sessions-    ai/sessions
```

## 2026-10-02 (session-costs minion-build) — real per-prompt $, sort, filters, RAM, role

Full brief: [`/framework/ai/2026-10-02/session-costs/minion-build/requirements.md`](/framework/ai/2026-10-02/session-costs/minion-build/requirements.md).

**Why two more scripts, not one bigger one.** `Server/session-cost.mjs` (per-session, per-prompt,
from a raw transcript) and `Server/week-cost.mjs` (the week's totals, from every session's own
logged cost) are kept separate from `Server/task-cost.mjs` (a Servex agent's own running total,
from its agent log) on purpose — they answer different questions from different sources, and
`task-cost.mjs` already works; merging them would make one script read two unrelated kinds of log
for no benefit. `Server/doc/task-cost.md` has the full one-is-not-the-other case.

**The Cost header sorts; missing data sorts last, never first.** A session nobody has priced yet
(no transcript scanned, no cost line logged) would look like the cheapest session in the list if
`null` sorted as 0 — `sort_by_cost()` (page.js) always puts every row with a known cost first, in
the chosen direction, and every row with none after them, untouched.

**The state icon reuses one rule for "in flight."** `WORKING_STATES = {"working","active"}` is the
one place that decides blink-vs-dot; `Server/task-cost.mjs`'s own `closed()` check uses a similar
but not identical set (`/^(stopped|gone)$/`) for a different purpose (can this agent's cost still
grow) — the two aren't merged because a "stopped" agent and an "idle" one are different facts for
a reader of this grid (one is over, one might start again), even though neither is "working".

**The role heuristic is a real, named gap, not a guess dressed up as data.** A Servex row's role
is always real (`a.role`, straight from the agent registry — the exact field
`Server/task-cost.mjs` already reads as `row(id).role`, never computed). A VS Code/CLI row has NO
role field anywhere in the data this page reads (`sessions.json`, `GET /api/agents`) — the brief's
own fuller heuristic ("a task's own line-1 `group` naming 'every-prompt'" → "fast assistant") needs
the task's own `task.jsonl`, which this page never fetches (it would mean one more request per row,
every poll, for a guess). What `role_of()` (page.js) actually does: an id starting `echo-` →
"echo/refiner" (the one naming convention visible from the id alone); otherwise the row's own
source tag, spelled out ("vscode mastermind" / "cli") — never a stronger guess. **Fixing this for
real needs the session's own line 1 to record its role going forward** — outside this task's fence,
same as the RAM gap below.

**RAM stays blank — `GET /api/agents` doesn't carry it yet.** The column, the `ram_mb` /
`ram_sample_age_ms` fields and the "under 10 seconds old" check are all in `merge()` and `row_view()`
now, so the moment Servex's own agent card adds real-time RAM, the column lights up with no further
change here. Until then it is correctly, permanently blank — never a fabricated or stale number.

**The OpenRouter tag's colour: `--subtle`, not a new one.** The brief asked for a colour
"different from Claude $'s muted text" that "passes contrast against both themes" and comes from
the existing token set, not an invented one. `lew42.css` (the live theme) has exactly two
`light-dark()`-aware TEXT tokens besides `--ink` itself: `--prim-ink` (already the Servex tag's
colour — reusing it here would make Claude $ and OpenRouter $ look like the same category) and
`--subtle` (checked: >4.5:1 against both `--surface` and `--wash` in both themes, and visually a
plain grey — distinct from the orange `--prim-ink`). No `--warn-ink`/`--ok-ink`/accent-ink token
exists in this theme yet; `--subtle` was the only real choice, not an invented one.

**`page.jsonl`'s `cost` line carries two fields beyond the brief's own minimum shape:**
`last_prompt_input`/`last_prompt_output`, alongside the specified `total_usd`/`last_prompt_usd`/
`by_model`/`source`/`at`. The detail page's own per-prompt row (brief item 5: "time, input/output
tokens, $") needs token counts that the brief's literal append shape didn't carry — adding them is
additive (a reader that only looks at the documented fields is unaffected) and avoids inventing a
second log line just to carry two numbers.

**Filters are a plain `<label><input type=checkbox>` row, not a new component.** A quick look for
a reusable multi-select turned up `ux/Filter/FilterChips.js` (dismissable chip pills over a
`Filter` base) — a different shape (it shows the ACTIVE filters as chips you remove; this needed a
persistent toggle row you check/uncheck in place) and pulling it in would have meant learning and
wiring a second system for a yes/no list of under a dozen roles. The brief's own fallback ("a plain
`<label><input type=checkbox>` row is fine if nothing reusable turns up quickly") applied.

**Role/date filters, the summary line and "cost by role" are all computed client-side, from rows
already on screen** (CLAUDE.md law 7) — no new fetch, no new endpoint; `render_rows()` (page.js) is
the one function that redraws all three together whenever a filter, the sort, or the next poll
changes the row set.

## Open: only one project's session files are scanned (partly fixed, 2026-10-02)

`sessions.mjs` only reads `%USERPROFILE%\.claude\projects\c--Code-lew42-monorepo\*.jsonl` — the
main checkout's own sessions. A session run from a worktree (including this very task's own)
writes to a differently-named project folder and never shows up here. Scanning every
`c--Code-lew42-*` folder would catch them, at the cost of reading many more files on every run;
**`Server/session-cost.mjs`'s own `find_transcript()` already does scan every `c--Code-lew42-*`
folder** (it has to, to find ONE session by id, cheaply — unlike `sessions.mjs`, it never reads
every file in every folder, just checks whether `<folder>/<session-id>.jsonl` exists) — so a
worktree session's own cost IS found and logged correctly today, even though it still never shows
as a ROW in this grid until `sessions.mjs` gets the same fix.
left as a known gap rather than guessed at, since nobody has asked for worktree sessions to show
here yet.
