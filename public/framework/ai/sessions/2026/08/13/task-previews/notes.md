# Notes — task-previews

## The tiers

- **ai index** (`framework/ai/page.js`) → declares each date as a child, calls
  `this.previews()`, which calls `page.preview(nav)` per child.
- **day** (`framework/ai/<date>/page.js`) → renders `dashboard(this)` (the
  full-row list) AND, additively, now overrides its own `preview(nav)` — the
  tile the ai index shows for it — to `preview_card(nav, () => glance(this))`.
- **task** (`framework/ai/<date>/<task>/page.js`) → optional. If it overrides
  `preview(nav)`, `dashboard.js`'s `card(t)` calls that instead of the
  manifest-driven row. If not, the manifest card renders (unchanged).
- **sub** (`framework/ai/<date>/<task>/<sub>/page.js`) → not exercised by any
  task today. Same mechanism would apply one level down: a task with sub-dirs
  worth summarizing would call `dashboard(this)`/reuse `card()` on itself,
  exactly as a day does — no new code, once `tasks()` generalizes past exactly
  two levels below `ai/` (see Open questions).

One check does all four tiers: `child.preview !== Page.prototype.preview`. A
page that hasn't opted in is invisible to the bridge and gets the default.

## Q3 — which session.json fields does the CARD need?

The row card (`manifest_card` in `dashboard.js`) reads exactly:

- `landed_at`, `requested_at` — status + the time range
- `now`, or `agents[].task` / `agents[].outcome` (presence only) — the current
  line while running
- `agents.length` and `agents[].outcome` (presence, for done/total) — the
  progress hint
- `tokens` (or a sum over `agents[].tokens`) — spend
- `window.after` — one number, the budget pressure
- `model`, `tab` — chips
- **first line only** of `outcome` or `request` — the caption

Everything else in the schema is page-owned:

- **Full `outcome` markdown**, the **full `request`**, `requirements.md`
  in full — `AISession.report()` (or a task's own `content()`) renders these,
  not the card.
- **Per-agent detail** — `model`, `duration_ms`, `cost_usd`, `session_id`,
  `kind`, the individual `outcome` text — the agent table, not the row.
- **`window.before` / `window.note`** — a caveat for the reader who opens the
  page, not a glance decision.
- **The transcript replay** — `AISession` only, needs the session id and the
  dev-only `/ai-logs/` route; a card must never depend on it (static hosting
  has no replay).
- **Anything with no session.json field at all** — this task's own checklist
  card needs nothing from the manifest; it's purely page-owned content. That's
  the point of the bridge: a task can answer "where's it at" with something
  the schema was never going to have a field for.

## A `preview()` override is global, not audience-specific

The day page's own `content()` already called `this.previews()` (the standard
topic wall of its declared children) before this task touched anything.
Overriding `preview()` on a task page reaches BOTH callers — `dashboard.js`'s
`card()` bridge and that pre-existing wall — because it's one method on the
Page, not two. First cut of this demo used a bespoke `.ai-card`-styled row,
which looked right in the dashboard's linear list and wrong squeezed into the
wall's card grid. Fix: build the override on `preview_card()` + a `thumb`
function (same primitive the day-level `glance()` bridge already uses)
instead of hand-rolled markup — one shape that reads in a list or a grid,
because that's what `preview_card()` is already for.

## Open questions

- **A date with no `page.js` gets no glance on the ai index.** `previews()`
  calls `page.preview(nav)` only when `this.children.get(name)` resolved to a
  real Page; an undeclared/unwritten day stays `null` in the map (declared,
  never resolved — `route()`'s "dashboard stub" is built only when someone
  *navigates* to that url, `child()` never calls `route()` for a name that's
  already declared). Fixing this cleanly wants a change to how `previews()` or
  `child()` treats a declared-but-unresolved name, which is `core/Page` — out
  of this task's ownership. Left as a known gap; today (2026-08-13, the only
  day with edits in flight) is unaffected.
- **`tasks()`/`dashboard()` hardcode `ai/<date>/<task>/`.** `tasks(page)`
  derives `date` from `page.url`'s last segment and looks it up under
  `directory.json`'s `ai` node — exactly two levels deep. A task page that
  wants its own sub-dashboard can still call `dashboard(this)`, but `tasks()`
  would need a generalized walk (segments from `this.url` onward) to actually
  enumerate real sub-dirs rather than misreading `date`. Nobody needs it yet.
- **The override check is reference equality**
  (`child.preview !== Page.prototype.preview`) against the exact `Page` class
  imported in `dashboard.js` (`core/Page/Page.class.js`) — correct as long as
  there's one copy of the class, which a no-bundler site guarantees.
