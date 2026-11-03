# Sessions grid at 3440: two bugs (measured 2026-10-12)

The owner, on [/framework/ai/sessions/](/framework/ai/sessions/) at 3440×1440: "the gray items go up behind the header items… the scrollable area is like a third of my page height. These are the items that I want to see."

Screenshots: [at rest](sessions-0.png) · [grid scrolled 20 px](sessions-20.png).

1. **Two scroll boxes, one inside the other.** `.page-column-body.page-column-fill` scrolls (1184 tall, content 1943), and inside it `.datagrid.datagrid-paged` scrolls too (1120 tall, content 4689) but starts 825 px down the column. Only about 360 px of the grid is on screen until you scroll the outer column first. Fix: one scroller. Either the grid fills the space left under the header (`flex: 1; min-height: 0`, and the column body stops scrolling), or the grid stops scrolling and the column scrolls with a sticky header.
2. **The sticky header has holes.** Each `.datagrid-head-cell` is `position: sticky; top: 0; background: #fff; z-index: 1`, but the gaps between the cells are transparent, so grey group rows show through between the headings when the grid scrolls (see the small grey ticks under the header in the 20 px shot). Fix: make the header ROW the sticky, opaque element (or give the grid's gap/background to the header row), not each cell.

Also seen: the header block above the grid (three meters, a one-line stats sentence 1,400 px long, filters) takes 825 px before the first row. A compact version (meters in one row beside the title, the stats as a muted subtitle, filters as one toolbar row) is drawn in Figma: Sept-2026 file, page "Claude prototype", screen "Sessions · data grid".
