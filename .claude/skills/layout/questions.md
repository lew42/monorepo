# Layout — review questions

The layout skill's rules, worded as questions a reviewer answers yes, no or n/a from the screenshots, `layout.json` or the page's source; the `review` skill asks them.

## Layout

1. At 3440, does the page fill the width with several columns, or a navigation column beside a centred main one, rather than one narrow column on an empty screen? [layout: defaults, work at 3440 as well as 1280]
2. Does the page use one of the approved layouts (Standard, Split, Columns, Tile wall, Rail + content, Docs three-region), or say it is a new proposal? [layout: C5]
3. For every region and box: is its width right for its content at 400, 1200, 1920 and 3440? [page: step 4, how wide is it; layout: question 2]
4. For every region and box: does it take padding only because it needs it (a region `.pad`, a framed box `.card`, a deliberate no `.bleed`)? [page: step 4, does it need padding]
5. For every region and box: does text keep room from every neighbour's edge and ground? [page: step 4, how does it meet its neighbours]
6. Do two or more columns of content sit in `wide` or `bleed`, never squeezed into the reading column? [layout: question 2]
7. Does each band of the screen take a share that matches its importance — no band both big and nearly empty? [owner 2026-09-30] [measured: layout.json bands[].share, bands[].ink, bands[].big_empty]
8. Do columns side by side have roughly equal content, or is a short column's hole turned into weight (centred) or spent on more content? [layout: C4]
9. Is dead space answered by a new region or accepted as a gutter, never by widening a reading column past its measure? [layout: the two bounds rules]
10. Is content scaled to its box: nothing large in a small column, nothing tiny alone in a huge band? [layout: content scale follows the box]
11. Does a wall of cards end on a full or balanced last row at every width, with no lone card and no reserved blank tracks? [layout: auto-fill vs auto-fit]
12. Do flush-stacked rows share one rounded outline, and do rounded cards stand apart with a gap? [layout: rounded corners and gaps go together]

## Sizing

13. Is every box auto height, with a fixed height only where content cannot grow (an icon, media of known size, a full-viewport shell, a deliberate scroll area)? [layout: leave the defaults alone, height]
14. Are previews auto height, as tall as their content, never cropped or padded out to a fixed height? [layout: previews are auto height]
15. Does every bounded box (a hero, a viewport band, an equal-height row, a scrolling rail) say what happens to longer content: scroll, clip or truncate? [layout: some boxes grow, some cannot]
16. Is every scrollbar on the page one that was meant (a log, a code block, a rail), with no surprise scrolling box? [layout: scrollbars are a decision]
17. Is a band above the first navigation budgeted in height (`vh`), so it never pushes the navigation below the fold? [layout: question 2, height above the first nav]
18. Does every track have a floor and a ceiling, so nothing overflows at 400 or collapses? [layout: the two bounds rules] [measured: layout.json overflow_x]
19. Do sizes meant to follow the text use `em`, and floors use `rem`? [layout: leave the defaults alone; question 3, floors in rem]

## Wrapping

20. Does every tab bar, title, button row and nav row sit on one line where it was meant to? [owner 2026-09-30] [measured: layout.json wraps]
21. Is there no wrap that appears only under 1920 — a row that is one line at 1920 and two at 1200? [owner 2026-09-30] [measured: layout.json wraps, compared across widths]
22. Where a row does wrap (a control row, a chip row), is it `flex wrap` by design and does it wrap cleanly? [layout: only a control row takes flex wrap]
23. At 400, does every full-row item stack into one column rather than crushing a track to a sliver? [layout caveats: a full-row item's inside must be able to stack]
24. Is no preview description clipped where the same child shows at two widths (a wall card and a rail item)? [layout: question 5, 45 characters]

## Flow

25. Does the order top to bottom match priority: the most important thing is what the eye lands on first? [layout: before the first factory call, focus and visual hierarchy]
26. Is nothing hidden off-screen: no content past the right edge, under a fixed overlay, or below an inner scroller nobody will find? [layout: look at it, then cycle] [measured: layout.json overflow_x]
27. Does each box keep one rhythm (`.flow` for prose, `flex v gap` for UI), and does a wall in prose keep the prose's rhythm? [layout: rhythm, one system per box]
28. Does each label sit clearly closer to its own card than to the next one? [layout: association by proximity]
29. Does a live page stay still as items arrive, with new items waiting behind an "N new" pill? [layout: the layout never jumps]
30. Does no prose line run past the measure at any width? [layout: look at it, then cycle] [measured: layout.json widest_text]
31. Does fixed chrome around the site (a frame, a dev shell, a rail) push `.app` by tokens rather than re-parent it, so turning it off gives exactly the page as before? [dev-shell, 2026-09-30]
