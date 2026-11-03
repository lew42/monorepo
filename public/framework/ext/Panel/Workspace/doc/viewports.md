# viewports — the set (`viewports.js`)

`fill` (default) · `one` (a device width) · `all` (all four, tiled) · `twin` (390
beside 3440, one height). Every non-`fill` box is another VIEW of the SAME root
(`ws.mount()` — B's "N boxes, one tree"), framed in a 1em `panel-viewport` border,
labelled with its device px width.

## All seven boxes mount once

`Workspace.mount()` only ever GROWS `$roots[]` — there is no `unmount` (Workspace/doc/
decisions.md). Rebuilding boxes on every mode switch would leak one box per switch, so
`viewports(ws)` mounts everything up front — `fill` + four device frames (`one`/`all`
share them) + two `twin` panes, seven views total — and a mode switch only shows/hides
what already exists. `pane()`'s own `ResizeObserver` re-fits itself the instant a
hidden box becomes visible again (`ext/demo/twin.js`'s "hidden until the first fit"
trap, which is exactly this case) — nothing extra was needed to make that work.

## Fit vs 100%

`simulate($view, width, room)` and `watch(el, fn)`, imported straight from
`ext/demo/stage.js` — not `stage()` itself, which builds its own chrome. **Fit** zooms
each device frame down to its cell, capped at `Math.min(clientWidth, width)` so a
frame never zooms PAST its own device width — a 390px phone in a wide cell sits at its
real size with room beside it, it does not blow up to fill the cell. **100%** shows the
device at its literal pixel width (`flex: 0 0 auto; width: Npx`); the frame scrolls to
it (`overflow: auto`) rather than clipping — a scrollbar the reader asked for by
picking `100%` over `fit`.

`all` tiles one ROW of four, not a 2×2 grid — the owner's own words: "do all viewports
simultaneously... zoomed to fit" was about every device sharing the fit, mobile
included. A 2-column grid gave mobile a cell wide enough that it never needed to
shrink; one row of four does.

## twin — the aspect-ratio trick, and why it can't be nested

`pane()` (`ext/demo/twin.js`) is what lands both devices on one height with no second
measured pass: `flex: width/height 1 0` on the box, so two panes sharing a row get
widths proportional to their own aspect ratio, and `aspect-ratio` turns that width
straight into a matching height — the same fraction of the row's height for both,
algebraically, not by measuring twice.

⚠ That flex-basis only means WIDTH if the box is a DIRECT child of a ROW flex
container. The first version wrapped each pane in its own `flex: column` box (frame,
then a label below it) — `flex: width/height 1 0` then controlled HEIGHT distribution
instead, and the two panes landed at 783px and 378px, not matching. The fix: `pane()`'s
box stays a direct child of `.panel-viewport-twin` (`flex gap`, a row), and the label
is appended INSIDE it instead (`position: absolute`, `workspace.css`) rather than
stacked below.

## The dial and the readout

`magnifier()`/`ruler()`, lifted from `stage.js`'s private `tools()` (exported). The
dial writes `ws.zoom` and drags the ONE box a mode makes sense for — `fill`'s own, or
`one`'s single device; `all`/`twin` have no single box to drag, so it's a no-op there
(still drawn, for a steady bar). The readout is two spans, each bound to `ruler()`
once at construction — `fill`'s and `one`'s desktop frame — never rebuilt, only
re-parented into the bar on every `draw_bar()` (moving an already-observed element is
a plain `appendChild`, not a second `ResizeObserver`).

## Watch out

- `$readout_one` must exist BEFORE the device frames are built — `cell()` hands the
  desktop frame's box straight to `ruler()`. The two readout spans are built first,
  ahead of `$stage`, for exactly this reason.
- `one` always shows `desktop` — there is no device picker yet; a future one would
  read `frames.find(f => f.name === chosen)` instead of the hardcoded `ONE_DEFAULT`.
