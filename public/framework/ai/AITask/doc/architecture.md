# AITask architecture — render the working log, from session up to the board

AITask extends [`Page`](/framework/core/Page/Page.class.js) and serves as the master template for a task's detail view, a day's dashboard, and the board over every task. Entry point: [`AITask.js`](../AITask.js); core rendering components: [`card.js`](../card.js), [`dashboard.js`](../dashboard.js), [`conversation.js`](../conversation.js), [`asks.js`](../asks.js).

## The manifest drives everything — task.jsonl

**Decided:** a task is its `task.jsonl` record (an append-only JSONL file), rendered through a template that reads its fields (`session_id`, `outcome`, `steps`, `asks`, `decisions`, etc.) and draws accordingly.
**Why:** JSONL is stream-friendly (each append updates subscribers without a reload), minimal (fields are optional; missing ones just don't render), and self-contained — no separate `session.json` legacy support breaks new tasks.
**Instead:** a directory crawler (fetches file listings for the index), or a schema-enforced database (requires a server), or every field as a separate file.
**Detail:** [./manifest.md](./manifest.md).

## Three tiers, named: session–task–day–board

**Decided:** a `session` (one Claude transcript, a UUID) works a `task` (`ai/<date>/<slug>/`, one `task.jsonl`); a `day` (`ai/<date>/`) is the dashboard; `/framework/ai/` is the board over every task ever.
**Why:** the user scans *when* a task ran (the time spine beats effort grouping); a day groups related work; a session is what a minion writes to while working.
**Instead:** flat tasks with no day grouping, or sessions as the primary tier (loses day context).
**Detail:** [./decisions.md](./decisions.md#the-board-is-a-time-spine).

## Template override — a task's own page.js extends AITask

**Decided:** the `report()` method builds the default tabs (Asks, Report, Session); a task's own `page.js` can override methods like `extra()` or `shots()` to add custom content without rebuilding the whole page.
**Why:** most tasks use the template as-is; custom ones extend it, not copy it.
**Instead:** a configuration file (loses type safety), or no override pattern (forces copies).
**Detail:** [./template.md](./template.md).

## Live streaming, not polling — ext/JSONL drives updates

**Decided:** on localhost, `AITask.session()` and `dashboard()` subscribe to `task.jsonl` via [`ext/JSONL.live()`](/framework/ext/JSONL/) and redraw on append; off localhost (static hosting), a fetch populates once.
**Why:** a reader can watch tasks land while they run; streaming keeps the data current without polling.
**Instead:** a timed refresh (stale data), or server-sent events (requires a server at runtime).
**Detail:** [./decisions.md](./decisions.md#the-board-streams).

## Card layout is a container query

**Decided:** the card's layout responds to its own width (inside the rail, narrow even on desktop), not the viewport.
**Why:** the same card renders in the index rail and full-width on task detail; one rule fits both.
**Instead:** two breakpoint-based layouts, or a prop passed to the component.
**Detail:** [./decisions.md](./decisions.md#card-layout-is-a-container-query).

## Mobile card fix — minmax(0, 1fr) on grid columns

**Decided:** the card's title/tag row uses `grid-template-columns: minmax(0, 1fr)` so text can shrink below its content minimum and wrap, not overflow.
**Why:** without the floor, `1fr` carries an automatic minimum width, so narrow cards (390px) spilled text instead of reflowing.
**Instead:** a new breakpoint (adds complexity), or letting the card overflow (fails accessibility).
**Detail:** [./decisions.md](./decisions.md#-ai-cards-mobile-single-column-rule).
