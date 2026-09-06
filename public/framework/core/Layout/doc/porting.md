# The port — where the thirty came from

**Nothing here was invented.** The site already held three catalogues of the same shapes,
written out again each time; this is the one they became, and every entry keeps the prose its
source wrote for it.

| n | source | what the port was |
|---|---|---|
| **18** | [`/imagine/layouts/system.js`](/imagine/layouts/) `ENTRIES` | already data. `n` → `columns`, `rules` → `decl`, `word` kept, `boxes` gained a `kind`. Added `widths`, `fallback`, `grows`, `tags`. |
| **11** | [`ext/DesignTool/library/patterns.js`](/framework/ext/DesignTool/library/) | `build()`'s container style became `decl` and its children became `boxes`; `short` became `intro`, `caption` became `note`, `see` kept. These eleven arrive with measurements at four widths already taken. |
| **1** | [`styles/layouts/masonry`](/framework/styles/layouts/masonry/) | the one shape neither of the other two says: CSS columns, three words, no JavaScript. |

**18 + 11 + 1 = 30.** The remaining `styles/layouts/` dirs stay exactly where they are and keep
their urls; folding them in is slice C's job, not this one's.

## The five things that changed on the way

A port that changes nothing is a copy. These five are what changed, and why.

1. **`rules` became `decl`.** `rules` means LayoutRules in this module, and two meanings for one
   word in one directory is how a checker ends up applied as CSS.

2. **Every prose slot gained a measure cap.** `.page.standard` bounds prose for every layout on
   the live site; lifted out of a page, a layout has to say it itself or it is judged without the
   thing that was holding it. The cap lives in the fixture, not in the thirty entries, so it is
   one line rather than twenty.

3. **Three bounded layouts learned to bound.** `rows`, `shell` and `rows-in-columns` declared a
   fixed height and then let content spill out of it. Their bars now cap themselves at `3.5em`
   and each root clips. A box that says it is bounded and is not is the exact defect
   `grows: false` exists to name.

4. **`dashboard-row`'s figures slot can shrink.** `flex: 0 0 auto` with no `min-width: 0` runs a
   long value off the right edge — 30,287px of it, measured. Now `0 1 auto` with `min-width: 0`,
   which keeps "sized to its content, sitting at the end" and survives content that is not a
   figure.

5. **Every entry gained the four props the sources never had**: `widths`, `fallback`, `grows` /
   `overflow`, and `wraps`. Those four are what the tree filters on and what the fixtures prove;
   without them a catalogue is a picture book.

## The near-twins, kept on purpose

`measure` and `reading-column` are the same shape at two ceilings; `wall`, `tile-wall` and
`media-gallery` are one `auto-fill` grid at three column widths; `fixed-fluid` and
`rail-and-content` are a rail beside a body in grid and in flex. **They are not deduplicated,**
because each carries a different argument its source made — a distribution, a measured case, a
wrapping story — and each cross-links the others through `variations` and `alternatives`. The
duplication the census complained about was three *catalogues*, not three entries.

## What this module is NOT

**`ext/layout` is not its rival and is not dead.** Twelve files import it, `ext/demo/shell.js`
among them, which is why every demo on the site can wear a control bar. It steers a live box's
words; `core/Layout` catalogues arrangements. Two different jobs that share four letters — which
is also why every class here is `page-layout-` and never `layout-`.

## The one thing that could not be done inside the fence — and was, an hour later

The tree's wall was `tree.js`, a near-copy of `ext/catalog/browse.js` with three facet rows and a
sixty-card cap added, because `ext/` was outside slice A's write fence. **It is gone.** Those
twenty-five lines are options on `browse()` itself now — `cap`, `facets` and `search` — and
`page.js` calls `this.browse(BANDS, tokens, { cap: 60, facets: FACETS })` like every other wall on
the site. A facet reads a page prop straight, so the three filters here are still `columns`, `tags`
and `approved` and nothing registers anything. (2026-09-06, slice 3 of the graduation.)
