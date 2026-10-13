# Brief: Kit · Grids: basic grid usage in auto layout (owner, 2026-10-13)

The owner: "we probably need a whole page about basic grid usage… Figma has flex wrap (flow direction, wrapping on and off), similar to flex, but in terms of height and width equalisation, when they wrap, the min/max width thing… orphans: when a responsive grid reflows from 4-up to 3-up to 2-up, 8 items make two rows of 4, but at 3-up you get 3 + 3 + 2. Either the last row's items get bigger (big orphans) or they don't fill the row (small/lone orphans, a void, which isn't necessarily a problem: a quick grid without thinking too much). Six items is a nice spot: it goes from three to two to one easily. But you don't always want to restrict your content based on design."

Read: [design/layout/doc/space.md](/framework/design/layout/doc/space.md), [ext/Figma/doc/figma-layout.md](/framework/ext/Figma/doc/figma-layout.md), [page-layout.md](/framework/ext/Figma/doc/page-layout.md). Reuse the kit's cards and the `Icon` set (DS · 1.1, [icons.md](icons.md)). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. **Show, don't tell**: each idea is a specimen with a one-line caption. Notes box at the top.

## Page `Kit · Grids` (new; a 1920 `Page · Kit · Grids` component, masters top level)
1. **Wrap basics:** one card grid (FILL children, minWidth 360, maxWidth 520) shown in parents of 1920, 1440, 1000, 700 and 390 wide, so you can see 4/3/2/1-up. Caption: the min and max widths, and the count each parent gives.
2. **Equal heights:** the same row with ragged heights, then equalised (the tallest HUG and the rest FILL vertically), then with a fixed row height. Say what breaks when content changes.
3. **Orphans:** 8 items at 4-up, 3-up (small orphans), 3-up big orphans (the last row's items fill), and 2-up; 6 items at 3/2/1-up (no orphans); 5 and 7 items, each with its best treatment (for example the odd one becomes a wide feature card).
4. **Masonry:** variable-height cards in 3–4 columns balanced by real height (the shortest-column-first rule; see the Index page), next to the same cards in a plain wrap grid with holes.
5. **Fixed + fluid:** a pinned 280 column plus a FILL column, and a 2:1 split via grow ratios (two FILL children whose minWidths set the ratio), versus two fixed columns leaving a void.
6. **Verdict** in Notes: the default grid setup (min/max numbers) for cards, tiles and specimens at 1920.

Screenshot and fix. Link it from the Overview design-system card. Report `kit/grids.md`, committed by path.
