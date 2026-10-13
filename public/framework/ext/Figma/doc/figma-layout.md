# Auto layout in practice: the Figma side of "using the space"

The general rules (fluid first, no voids, no clipping, repetition, masonry) live in the design system: [design/layout/doc/space.md](/framework/design/layout/doc/space.md). This page covers only how to do them in Figma.

- **Fill, not fixed.** Children default to `layoutSizingHorizontal = "FILL"` in a row or column that has a width, and to `HUG` vertically. Use `FIXED` only for icons, avatars, controls and a deliberately pinned column, and name it in the layer (`Sidebar (fixed 280)`), as the fixed-size register in [use-figma.md](use-figma.md) says.
- **No clipping by default.** `clipsContent = false` on cards and specimens unless the clip is the point (an image crop, a phone screen). A specimen that clips its own content means its size is wrong, not its content.
- **A HUG parent with only FILL children collapses.** At least one child must give the size.
- **Equal heights in a row.** Figma has no "equalise" switch. Give the row a height from its tallest child: set that child to HUG and the rest to `layoutSizingVertical = "FILL"`. If the tallest one changes, switch which child hugs. For a fixed set (a pricing row, say), a fixed row height named in the layer is fine.
- **Masonry is manual in Figma, so let a script do it.** Make N vertical column frames (FILL width, HUG height) and put each item into the column that is currently shortest, by real height, in reading order. Re-run the script after the content changes. The Index page is built this way.
- **Pages:** one 1920 auto-layout wrapper per page, made a component. See [page-layout.md](page-layout.md).
