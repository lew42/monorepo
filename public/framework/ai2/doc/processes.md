# The Processes section (process-monitor, 2026-09-30)

The Live card's own "Processes" block: RAM/CPU over the last hour, one row per
task with a sparkline, orphans, and the worktree pool count. `processes.js`
owns it end to end — `live.js` only wires its poller in and calls
`processes_section(it.processes)` where the block sits on the card.

**Where the data comes from:** `GET <servex_base()>/api/processes`, the exact
shape documented at [`Servex/doc/processes.md`](/Servex/doc/processes.md)
(ours/other RAM and CPU, one row per task or system group, orphans, reaped,
`running[]` — the real process behind every agent — and up to an hour of
10-second history points). A Servex that hasn't restarted onto the route yet
answers 404, and the whole section draws nothing — same as `poll_pool` does
for `/api/worktrees`.

**Ask 2** ("Running now" shows the real process) lives in `live.js`, not here:
`running_index()` and `process_badge()` (both exported from `processes.js`)
are the one shared rule for "pid 47356 · 248 MB" / "no process" / "dormant,
no process", so the Running-now list and this section's own agent rows can
never disagree about what a badge says.

**Short by default.** A machine easily has two dozen "Claude Code session"
groups; only the biggest 5 draw open, the rest fold behind one "N more" row
(`task_rows()`'s `TOP_GROUPS`) — most of that list is noise on a day nothing
is wrong, and detail nests one click down.

## Four CSS traps this section found, worth knowing before touching `.ai2-proc-*` again

- **A `display` declaration on a direct child of a closed `<details>` defeats
  the browser's own collapse**, no matter how low its layer — a closed
  `<details>` hides its body via a *user-agent* rule, and any *author* rule
  (even `@layer base`) outranks a user-agent rule regardless of specificity.
  `.ai2-proc-pids` used to set `display: flex` on exactly that body, so every
  group row rendered its full pid list all the time — the Live card measured
  14,000px tall instead of ~250. The fix is `.ai2-proc-row:not([open]) >
  :not(summary) { display: none; }`, an explicit author rule of its own.
- **`.ai2-live-item` is not just a look — it is a 4-column grid**
  (`5.5em / max-content / 1fr / auto`, one column per part of a plain row:
  state badge, name, line, ✕). Wearing it on a `<details>` for its border and
  padding also makes `<summary>` a grid ITEM with no placement of its own, so
  it auto-placed into column one — 5.5em wide — and its own flex children
  word-wrapped one letter per line inside that sliver. `.ai2-proc-row > * {
  grid-column: 1 / -1; }` is what makes every child (the summary, and
  whatever the details opens to) span the whole row instead.

- **A grid area belongs to the box that OWNS the column, not any one list
  inside it.** Processes used to be its own item in the card's grid, placed
  after both columns — so it waited for whichever column (tasks + chat) was
  taller to finish, leaving a ~650px gap above it at 1920 even though Running
  now itself was short. The fix is `.ai2-live-run-col` (`live.js`): Running
  now and Processes share one box, and that box — not the list — carries
  `grid-area: run`. Processes then starts the moment Running now's own
  content ends, not after some other column.
- **`framework.css` dresses every bare `<summary>` as a button**, including
  `width: fit-content` — each "By task"/"Orphans" row sized itself to its own
  text instead of the list ("Dev servers" ~290px, "Claude Code session (pid
  …)" ~450px). `.ai2-proc-row > summary` now resets `width`, `background`,
  `border`, `border-radius`, `min-height` and `box-shadow` back to plain —
  the same opt-out `.ai2-ov-done > summary` and `.research-node > summary`
  already use elsewhere on the site. (And a plain `.ai2-live-item` row, like
  Worktrees used to be, hits the *other* trap above it in this list — its
  4-column grid has no column for two lines of running text, which is why
  Worktrees is its own `.ai2-proc-worktrees` box now, not `.ai2-live-item`.)

All four were caught by the headless proof's own screenshots and measurements
before landing, not by eye. Full account, before/after shots for the second
round too: [`ai/2026-09-30/process-monitor/graph/graph-report.md`](/framework/ai/2026-09-30/process-monitor/graph/graph-report.md).
