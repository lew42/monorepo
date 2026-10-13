# Kit · Grids report (2026-10-13)

Built in the Figma file `QYN0G2URSBHYH5I06MOjxU`: page `Kit · Grids` (`250:105043`), its 1920 component `Page · Kit · Grids` (`250:105044`), and the master `Grid card` (`250:105054`, top level, right of the page). Linked from the Overview design-system card. Brief: [brief-grids.md](brief-grids.md).

- ✅ **1 Wrap basics** (`250:105057`): six cards, FILL, min 360 / max 520, in parents of 1680, 1440, 1000, 700 and 390 wide → 4, 3, 2, 1 and 1-up (cards 402, 464, 488, 520, 390). The captions are computed from the layout, not typed. A 1920 parent cannot sit inside the page's 1680 of content, so 1680 stands for it.
- ✅ **2 Equal heights** (`250:105171`): ragged, (a) tallest hugs, (b) fixed row 240 with FILL cards, each before and after swapping card 2 for longer text; plus centred vs top-aligned paragraphs of 3, 2 and 4 lines. Result: (a) breaks (the hugging card stays short), (b) cuts the text off, ragged stays ragged; centred tops wave, top-aligned looks normal. Verdict in Notes.
- ✅ **3 Orphans** (`250:106298`): 8 items at 4-up, 3-up small (FIXED cards), 3-up big (FILL cards), 2-up; 6 items at 3, 2, 1-up; 5 with a wide feature card; 7 with a full-width last card.
- ✅ **4 Masonry** (`250:106525`): the same 12 cards in a plain wrap (holes, 1484 tall) and in three columns by the shortest-column rule (1078, 991, 1252 tall).
- ✅ **5 Fixed + fluid** (`250:106611`): pinned 280 + FILL (280 : 1376), grow 2 : 1 (measured 1087 : 569), two fixed 520 columns (void).
- ✅ **6 Verdict** in the page's Notes box: cards 360/520, tiles 200/280, specimens 480/760; equal heights; orphans.

## Found while building
- In a Figma wrap, FILL children stretch the last row, stopping at their max width (big orphans, capped). FIXED children keep the column width (small orphans).
- `layoutGrow` is flex-like: content width counts first, so 2 : 1 comes out about 1.9 : 1.
- A masonry by the shortest-column rule ends within one tall card of level.

Checked at 1680 wide in screenshots of each section; the page is a Figma file, so the four web widths do not apply. Not done: the `Grid card` master has no variants, since the specimens only needed a title and a body.

## Addendum: 6 Responsive dynamics (`254:32591`)
- ✅ **Count-driven:** 3 FILL cards at 164 wide; a 4th makes all four 117; with a min width of 150 on a wrap row the 4th wraps (164, 164, 164, then 540 as a big orphan).
- ✅ **Icon + title** at 480 / 360 / 280 / 220: with a HUG title the long one drops under the icon from 360 and overflows at 280 and 220; fix 1 (icon FIXED, title FILL) wraps beside the icon (it breaks mid-word at 220); fix 2 truncates to one line, so the height never moves.
- ✅ **Margins:** noted in the Notes box (a grid spans margin to margin; the narrow specimens are narrow on purpose).
