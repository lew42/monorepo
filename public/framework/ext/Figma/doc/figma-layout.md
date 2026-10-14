# Auto layout in practice: the Figma side of "using the space"

The general rules (fluid first, no voids, no clipping, repetition, masonry) live in the design system: [design/layout/doc/space.md](/framework/design/layout/doc/space.md). This page covers only how to do them in Figma.

- **Fill, not fixed.** Children default to `layoutSizingHorizontal = "FILL"` in a row or column that has a width, and to `HUG` vertically. Use `FIXED` only for icons, avatars, controls and a deliberately pinned column, and name it in the layer (`Sidebar (fixed 280)`), as the fixed-size register in [use-figma.md](use-figma.md) says.
- **Text has a measure.** Body text frames get `maxWidth` about 760 (or sit in a column that narrow). A wide card splits into columns instead (the `Claude · Overview` For you card is two 760 columns).
- **Wrappers are transparent.** A frame that only groups or lays out (Tiles, Specimens, a row) has no fill; `createFrame()` defaults to white, so clear it. Grounds belong to cards, sections and pages.
- **No clipping by default.** `clipsContent = false` on cards and specimens unless the clip is the point (an image crop, a phone screen). A specimen that clips its own content means its size is wrong, not its content.
- **A HUG parent with only FILL children collapses.** At least one child must give the size.
- **Equal heights in a row: two ways, and both have a cost.**
  - (a) *Tallest hugs*: the tallest child is HUG and the rest are `layoutSizingVertical = "FILL"`. It adapts, but it breaks as soon as a different child becomes the tallest, so it is poor for reusable templates.
  - (b) *Fixed row*: the row has a fixed height bigger than any card (named in the layer, `Row (fixed 320: equal cards)`), and every card FILLs it. It is robust when content is swapped, but it doesn't grow, so check that nothing clips.
  - Either way, align card content to the TOP (`primaryAxisAlignItems = "MIN"`), never centre it (see space.md).
  - When heights can't be tamed, use the masonry script instead of a grid.
- **Wrapping grids:** a horizontal auto layout with `layoutWrap = "WRAP"` works like flex-wrap. Children set to FILL with `minWidth` / `maxWidth` decide how many fit per row; `counterAxisSpacing` is the row gap. Check how it reflows by resizing the parent. Earlier trap: wrap rows left children at their minWidth when they weren't set to FILL (see use-figma.md Traps).
- **Orphans in a wrap (measured 2026-10-13, Kit · Grids):** FILL children stretch the last row, up to their `maxWidth` (big orphans, so set a max); FIXED children keep the column width (small orphans). `layoutGrow` is flex-like (content width counts first), so grow 2 : 1 measures about 1.9 : 1.
- **Masonry is manual in Figma, so let a script do it.** Make N vertical column frames (FILL width, HUG height) and put each item into the column that is currently shortest, by real height, in reading order. Re-run the script after the content changes. The Index page is built this way.
- **Pages:** one 1920 auto-layout wrapper per page, made a component. See [page-layout.md](page-layout.md).
