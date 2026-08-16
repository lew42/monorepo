# Spending a widescreen

`dead-space` is the only rule that reports a layout for being *correct but
small*. It measures **content span ÷ viewport** above 1500px, and the library
puts a number on each shape:

| shape | used at 3440 | verdict |
|---|---|---|
| [Tile wall](/framework/ext/LayoutTool/library/tile-wall/) | **88%** | clean — the track count is a consequence of the width |
| [Dashboard row](/framework/ext/LayoutTool/library/dashboard-row/) | **75%** | clean — the row stays a row, its inside has places |
| [Reading grid](/framework/ext/LayoutTool/library/reading-grid/) | **83%** | clean — three bounded reading columns |
| [Rail and content](/framework/ext/LayoutTool/library/rail-and-content/) | 18% | `med` — two regions cannot fill a mega monitor |
| [Reading column](/framework/ext/LayoutTool/library/reading-column/) | 27% | `med` — one column, and it is the house default |
| [Fixed-track wall](/framework/ext/LayoutTool/library/bad/fixed-track-wall/) | 28% | `med` — a pixel track decided the viewport |

## The three shapes that spend width, and how

1. **More tracks.** `repeat(auto-fill, minmax(min(x, 100%), …))` — the only
   declaration in this file that has no width in it at all. Tiles take `1fr` as
   the maximum, prose takes an em ceiling.
2. **More regions.** A rail beside an article uses a laptop and wastes a mega
   monitor; a rail, an article and a table of contents uses both. This is the
   whole difference between the site's Document and Docs layouts, and it is a
   checkbox, not a rewrite.
3. **Places inside a row.** A full-row item — a feed entry, a dashboard line —
   should stay a row and grid its **inside**: identity | detail | figures. Extra
   width then becomes legibility instead of a 3000px line of text.

## The two that cannot, and what to do about it

A **reading column** and a **two-region rail** are not broken. They are bounded
on purpose, and the bound is the point. `dead-space` caps at medium for exactly
this reason — a widescreen miss costs a grade step, never a pass.

So the question a `dead-space` finding asks is not *"is this wrong"* but
**"is there a second thing the reader wants beside it?"** If yes, the fix is
another column or another region. If no — a login form, a single article, a
settings pane — the finding is a note, and `defer.js` is where it goes.

⚠ **Widening the column is never the fix.** It trades a `dead-space` medium for
a `measure` high, and one of those is content nobody can read.

⚠ **The rule needs four paragraphs to see anything** (`blind-spots.md`). A
table, a hero or a toolbar can waste any amount of width for free, and
`width_used` on such a page means *where the prose is*, not *where the layout
is*.
