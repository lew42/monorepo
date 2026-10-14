# Perf — the brief's own proof: drag a column 300px across 2,000 rows

`perf.mjs`, beside this file, drags the first column's resize handle 300px across the demo page's
2,000-row grid (`/framework/ext/DataGrid/`) and prints one line: the average frame time during the
drag, and the CPU this process used over that same span — the same two numbers the owner's own bug
report measured on the old grid ("108% CPU").

## What it measures, and how

- **Frame time** — a plain `requestAnimationFrame` counter running inside the page for the whole
  drag; the average gap between frames is the number. 60fps is 16.6ms/frame; this module's target.
- **CPU** — Chrome DevTools Protocol's own `Performance.getMetrics` `TaskDuration` (the cumulative
  time the page's main thread spent working, in seconds), read before and after the drag and
  divided by the drag's real wall-clock time — the same "% of one core" shape Chrome's own task
  manager reports, which is what the owner's "108% CPU" came from.
- **The drag itself** — `page.mouse.move/down/move×30/up` across the handle, 8ms between steps (a
  human-speed drag, not a teleport), via headless Chromium (`Server/Browser.mjs` — the one way any
  script in this repo opens a browser; never a visible window, never `mcp__playwright`, per this
  task's own fence).

Run it yourself: `node public/framework/ext/DataGrid/perf.mjs` (from the repo root), once the
worktree's own page is reachable — see the open item below.

## The measured numbers (2026-10-03, headless Chromium, `Server/Browser.mjs`)

```
DataGrid perf: drag 300px across a 2,000-row grid — 6.95ms/frame avg (93 frames over 640ms), CPU 10.0% (target: 60fps / 16.6ms/frame)
```

Run twice to check it wasn't a fluke: 6.95ms and 6.94ms/frame, 10.0% CPU both times — comfortably
inside the 16.6ms/frame (60fps) target, actually closer to 140fps, and nowhere near the owner's
measured "108% CPU" on the old grid. Reproduce it yourself: `node
public/framework/ext/DataGrid/perf.mjs` from the repo root, against a running worktree (the proxy
auto-starts a registered one on first request).

Re-run after the review's layout fixes below (the `.wide` page-width fix, the filter-row wrap, the
wider Note column) to confirm none of them cost anything: 6.94ms and 6.95ms/frame again, CPU actually
a little lower this time (6.8–7.1%) — a CSS-only layout change, as expected, moves nothing on the
drag's own hot path.

**The listener count behind the number** — this class mounts 6 event listeners, ever: `pointerdown`,
`pointermove`, `pointerup`, `pointercancel` on the header row for resize (`wire_resize()`), one
`click` on the header row for sort (`wire_sort()`), and one `scroll` on the grid for windowing
(`wire_scroll()`) — 0 on `document`. (A filter also adds one plain `change` listener per filter
input, same as any ordinary form control — not counted above since it's not part of the resize/sort/
windowing loop the perf test measures.) The grid it replaces (`ext/grip`, one instance per column)
mounts a `pointerdown`, `pointermove`, `pointerup`, `pointercancel` and `dblclick` listener **per
column** (9 columns × 5 = 45) plus one `document`-wide `pointermove` listener **per column** (9
more) for its "is the pointer near this edge" glow — the exact loop the owner's "108% CPU, moving
the mouse anywhere on the page" report came from.

## Two bugs this measurement caught that reading the code alone did not

Getting a live page to actually test against (see `task.jsonl` for the Servex worktree-registration
delay this ran into first) surfaced two real mistakes before they shipped:

1. **An unescaped backtick inside `css(\`...\`)`** in `ui/datagrid/datagrid.js` — a code-styled
   `` `.datagrid` `` in a plain comment, exactly the trap CLAUDE.md names ("one backtick inside
   `css(...)` kills every page"). It closed the template literal early and turned the rest of the
   stylesheet into a syntax the engine tried to run as code, throwing a page-wide `pageerror` the
   moment the module loaded — the whole page rendered blank. Caught by loading the page headless
   and reading `console`/`pageerror` events, not by re-reading the source.
2. **`perf.mjs`'s own frame counter started with `undefined`** — the first `requestAnimationFrame`
   tick was invoked directly instead of scheduled, so it ran with no timestamp argument, and
   `number - undefined` is `NaN`, which poisoned the whole average (the first real run printed
   "NaNms/frame"). Fixed by scheduling every tick, including the first, through
   `requestAnimationFrame`.
