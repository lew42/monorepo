# The Processes graph on the Live card — report

Built in `C:/Code/lew42/worktrees/process-graph`, branch `worktree/process-graph`. What it
looks like: [`/framework/ai2/live/`](/framework/ai2/live/) → scroll down past "Working on".

## What you see

![Processes at 1920, dark](shots/dark-1920.png)

A stacked RAM area (ours on the bottom, everything else above it) with a thin CPU line under
it, one glance answering "ours is X GB of Y" — here, **9.5 GB ours of 31.7 GB total**. Hover
shows the exact numbers at any point in the last hour:

![hover](shots/hover.png)

Below the graph: the biggest 5 task/system groups open, each with its own RAM sparkline and a
tap to see its processes; everything else behind one "N more" row.

Then orphans ("0 orphaned, 0 reaped" today) and the worktree count ("45 worktrees: 3 pool, 6 in
use, 9 open, 5 uncommitted"). "Running now" agent rows also gained their real process — pid and
MB, or "no process" if one is working with none behind it.

![at 400](shots/light-400.png) · [at 1200](shots/light-1200.png)

## A bug the proof caught, not the eye

The first screenshots all looked fine — that was the trap. Headless measurement (not a
screenshot) showed the Live card was actually **14,067px tall**, not the ~250px a closed list of
groups should be.

The page's own fixed-height shell silently cut everything past the fold, so a glance at a
screenshot never showed anything wrong. Two bugs, both in my own `ai2.css`, both fixed:

1. A closed `<details>` only stays closed because the *browser's own* style hides its body, and
   my `.ai2-proc-pids{display:flex}` — an *author* rule — beat that regardless of layer, so
   every group row rendered its full process list all the time.
2. Reusing `.ai2-live-item` for the row's look also reused its 4-column grid, uninvited —
   `<summary>` landed in an 88px-wide column with no placement of its own, and its text wrapped
   one letter per line.

Fixed with an explicit collapse rule and `grid-column: 1 / -1` on every row's children. After:
**1,913px**, each closed row **53px**. Scrolled to the bottom:

![scrolled to the bottom](shots/scrolled-bottom.png)

Detail, for the next agent who touches this file: [`ai2/doc/processes.md`](/framework/ai2/doc/processes.md).

## A second round — three fixes from the fresh-eyes review

The reviewer found three more things at 1920, all fixed in my own `ai2.css`/`live.js`:

1. **A ~650px gap above Processes.** It was a row of its own after both grid columns,
   waiting on the taller one. Now it sits in Running now's own column — no wait.
2. **Worktrees sat ~110px in from the left** — a reused 4-column grid, wrong shape for
   two lines of text. Plain box now, flush left like Orphans.
3. **Every "By task" row a different width.** `framework.css` dresses a bare `<summary>`
   as a button (`width: fit-content`); this one now opts out, so rows line up in a column.

![after, at 1920 dark](shots/dark-1920.png)

## What was left

- `group_detail()`'s agent-list branch is coded but unseen — the sample had no task/desk groups.
- Orphan/reaped fields are read defensively (`?? "?"`) — the sample's own arrays were empty.
- No build step, no new dependency: inline SVG, the pattern `styles/elements/media/page.js` already uses.

Proof: headless Playwright, the sample snapshot, 400/1200/1920 light and dark, zero console
or page errors on the pages this task touched.
