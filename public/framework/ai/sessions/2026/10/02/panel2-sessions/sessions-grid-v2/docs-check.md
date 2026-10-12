# Docs check — sessions, dashboard, panel2 (2026-10-02)

A read-only pass: readme.md checked against page.js and doc/*.md for each of the three touched
modules. No edits made.

## public/framework/ai/sessions

Reads clean. Every specific claim in the readme matches `page.js`:

- Six columns (Start/Source/Name/Model/State/Cost), each its own `--col-<name>` token with a
  minimum width — matches `COLUMNS` and `header_row()`'s `grip({ write(px){ … $grid.style("--col-"
  + col.key, …) } })`.
- "Newest activity first" — matches `merge()`'s sort by `last_activity` descending.
- Click a row → its own url, side peek on a wide screen via `core/Page`'s `columns()` — matches
  `width: "fill"` + `this.columns()` in `initialize()`, and the `route(id)` handler that returns a
  real `Page` per session.
- Data sources (Servex `GET /api/agents` polled live every 20s; VS Code/CLI rows from
  `sessions.json`/`sessions.mjs`) — matches `POLL_MS`, `get_json("/api/agents")`, and the
  `load_transcript()` seam comment.

One thing not verifiable from inside this module alone: the readme says "drag a column header's
own right edge" to resize, while `doc/decisions.md` describes the grip's `from: "start"` as
measuring "the cell's own left edge." These aren't necessarily contradictory (one is the visible
handle position, the other is the drag-math anchor inside `ext/grip`), but confirming they agree
means reading `ext/grip` and `sessions.css`, both outside this check's scope. Worth a second look
if anyone reports the drag feeling backwards.

## public/framework/ext/panel2

Reads clean. The new "three preview levels" section's pointer sentence ("The full rule, the two
watch-outs on `card`, and where it's used today: `doc/preview-levels.md`") is accurate —
`preview-levels.md` contains exactly those three things, in that order: the inline/card/detail
table, card's two watch-outs (the ⋯ menu vs. the rest of the card being a link, and the touch-only
corner arrow), and a "where this is used today" section naming the Sessions grid.

`preview-levels.md` itself reads clearly on its own: it states the rule in the owner's own words
first, explains why exactly three levels, then the two watch-outs, then where it's applied, then
what it explicitly is not (no new CSS class or JS part). No stale references — it correctly
describes `/framework/ai/sessions/` as a data grid whose row is the inline level and whose own url
is the detail level via `columns()`, which matches what `sessions/page.js` actually does.

## public/framework/ai/dashboard

The Sessions tile description is accurate. The readme says the tile is "the top 5 rows from the
Sessions tab" and that no tile is a second copy of its data; `page.js` confirms: `sessions_tile()`
imports `row_view as session_row, merge as merge_sessions` directly from `../sessions/page.js`,
reuses the identical `sessions-grid` CSS class the Sessions tab itself uses (the readme doesn't
mention this detail, but it's a correctness requirement called out in `doc/decisions.md` — the
cells are `display: contents` grid items and need the same grid container shape, or they render
with no column tracks), slices to 5 rows, and links "See all" to the real Sessions tab url.

Nothing else in the readme's tile descriptions (Stalled, In flight + queued, Inbox, Log) was in
scope for this check, but a glance at `page.js` shows all four match their stated sources
(`tasks.json`, `watch_needs()`, `CardList`) the same way Sessions does.
