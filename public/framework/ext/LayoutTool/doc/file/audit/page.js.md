The whole site, ranked. Loads a committed baseline (`findings.json`) instantly,
then offers a live re-measure at any of four widths — 116 pages × up to four
widths is roughly two minutes, so the saved run is what makes the page useful
the moment it opens.

## Findings are grouped by problem, not by page

`problems()` inverts the ranked-pages table into "N kinds of problem across N
pages" — "95 pages run prose past 95 characters" is one fix to one stylesheet
rule, and a ranked list of 95 individual page rows would make it read as 95
separate problems instead of one.

## `classes: "lt-page"`, never `"full"`

Full-bleed with a working gutter is two explicit tokens (`--measure: none`,
`--page-pad: …`) declared in `LayoutTool.css`, not `.page.full`'s zeroed
padding patched back by hand — because `Page` renders the `<h1>` outside
anything this file builds, and `full` would stand it flush in the corner.

## `open()` only re-measures when the saved baseline has no issues to show

The baseline intentionally omits `issues` for any row that scored ≥ 80 (see
`findings.json`'s own doc) — `open()` re-runs `frame()` live for exactly those
rows, and reuses the saved issue list for everything else.

## Improvements

1. **`PAGES` (imported from `pages.js`) currently contains two stale
   `/framework/ext/classdoc/` urls** that 404 since `ext/doc`'s rename — a live
   run against the current `PAGES` list will now error on both rows instead.
   `pages.js` is not a `page.js`, so this file can't fix the list itself; see
   the audit report's top recommendation. *(simple, important — not applied,
   fenced.)*
2. **`run()` awaits each page's `frame()` one at a time, in series** — honest
   about the true 116-load cost, but means a full re-measure blocks the whole
   two minutes with no way to parallelize. `frame()`'s iframes are already
   isolated per-load; a small concurrency limit (4–6 at once) would likely cut
   wall time substantially without changing what gets measured. *(medium,
   useful — real engineering effort, and worth confirming iframe-flooding
   doesn't itself skew measurements before committing to it.)*
