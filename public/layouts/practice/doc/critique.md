# The critic's pass — eleven things a four-width sweep could not see

The three layouts landed on 2026-09-17 with eight polish checks passing at 400, 1280, 1920 and
3440 — **32 of 32 on every page.** A second pass then measured them at **six** widths (1000 and
1440 added, because those are where a 400 / 1280 / 1920 / 3440 sweep has missed things before),
swept the walls **every 80px from 400 to 3440**, and looked at every screenshot.

It found eleven things. Ten are fixed; one was judged and kept. Every number below was read
back off the live pages by headless Chromium, and the full log is
[`ai/2026-09-17/practice-critic/`](/framework/ai/2026-09-17/practice-critic/).

**The eight checks were not wrong.** They still pass, before and after — re-derived
independently on the Workbench at 1280, the two numbers agree. They are simply eight checks a
page can pass while still looking unfinished, which is what the rest of this page is about.

## The one that mattered most: a wall's column COUNT is not a column WIDTH

Both walls were written as `repeat(auto-fill, minmax(min(var(--column), 100%), 1fr))` — one
line, and it cannot be told which counts are allowed. Swept every 80px, they landed on counts
that do not divide their item count, which shows as a short last row:

| wall | items | landed on | over these widths | last row |
|---|---|---|---|---|
| tiles | 24 | 5 columns | 2240 – 2480 | 4 of 5 |
| tiles | 24 | 7 columns | 2880 – 3120 | 3 of 7 |
| cards | 12 | 5 columns | 2800 – 3360 | 2 of 5 |

None of that is visible at the four widths it was proved at. The card wall's band includes a
2880 laptop and any un-maximised window on a 3440 monitor.

The tile wall also stepped **backwards** twice as the screen got wider: 2 columns at 720 became
1 at 800 (the rail turned into a 240px column and took more than the wall could spare), and 3
at 1360 became 2 at 1440 (the panel column arrived and took 320 more).

**Both walls now write their counts out**, one `@container` query each — 2, 3, 4, 6, 8 for the
24 tiles and 1, 2, 3, 4, 6 for the 12 cards, every one a divisor. Two thresholds moved with
them so the count never drops when a region appears: the rail becomes a column at **48rem**
rather than 44rem, and the panel's floor is **17rem** rather than 20rem. Swept again at 39
widths: **no hole anywhere, and the count never decreases.**

The module's readme already said the rule — *when the count is fixed and small, write the
count* — and it had been applied to the nine answers in the fold and not to the two walls.

## The rest, one line each

1. **The card wall was one column from 400 to 1040.** At 1000 a card was 920px of paint holding
   a 584px sentence: 336px of empty fill, twelve times down the page. Now two columns from
   57rem of band.
2. **The Catalog's nav bar was two thirds empty** — 2,176px of a 3,260px painted bar at 3440.
   `justify-content: space-between` puts the brand on the page's left axis and the last link on
   the right one, the same axis the hero's button and the wall's last card end on.
3. **The Workbench's panel left a column of nothing up to 1,940px tall.** It declared
   `position: sticky`, but the grid declares `align-items: start`, so the panel's grid item was
   exactly as tall as its content and sticky had zero travel — it could never fire. The panel
   now sits inside a stretched, unpainted side track and sticks inside that.
4. **The panel under the wall was a painted box wider than its own words** — 919px at 1280
   against 600px of text. Capped at the measure.
5. **The fold did not line up with the page it is about.** Outside the grid, its left edge was
   the page gutter (x=90 at 3440) while the layout's h1 and wall stood on x=385. It is a row of
   the layout's own grid now (`grid-area: why`).
6. **The Reader's four-column margin was three tall grey rectangles** — see below.
7. **The Catalog's content band butted the footer**, 12px between the fold's box and the
   footer's painted edge. An unpainted band takes its air from the bands either side, but the
   footer's air is inside the footer's paint. One `margin-block-end` — a margin is air between
   two boxes, not padding inside one, so the box rule is untouched.
8. **The Workbench at 400 was a 3,754px stack** with the panel 3,400px down it. Below 34rem a
   tile is now its icon and its name in a row, two columns: **1,405px**, and the panel sits at
   y=990. The sentence a tile drops is the first line of the panel you get by tapping it.
   ⚠ That fix had a bug of its own worth keeping: written ABOVE the tile's base rule, the
   compact block lost, because a container query adds **no specificity** and both selectors were
   (0,2,0). Equal weight, later wins — query or no query.
9. **The practice index at 1000 showed one card and no sign of the other two** — a 920x575 jpeg
   whose bottom edge was at y=920 against an 800px fold. The picture is capped at 20rem while
   the wall is one column, so the first card ends at y=677 and the second begins at y=692; at
   three columns the picture is the whole point and is left alone.

## Why the Reader centres and the other two span

The Reader's margin used to take the whole leftover on a wide screen and lay its four blocks
across it. Measured at 3440, that spent the leftover on **width**, and a margin has no more
content when it is wider — it just has more empty. The four blocks sat in one grid row, so the
row was as tall as the tallest: **905px and 1,483px of dead tail** under two of them, and the
region as a whole still ended **726px above the article's bottom**. "On this page" was five
links in a 520px column with a thousand pixels of nothing under it.

One column at 38rem instead, and the arithmetic comes out: the same four blocks stacked are
about as tall as the article beside them. The room that is left goes to the page's two gutters
— the grid `justify-content: center`s — **792px on each side at 3440**, which a reader reads as
a page margin rather than as a hole.

**That is the difference between these three layouts, and it is worth saying out loud.** A wall
spends a wide screen honestly, because it has more items to show: the Workbench goes to 8
columns and the Catalog to 6, and both fill 3440. An article cannot — past about 40em a line is
tiring to read — so above its ceiling it holds its measure and **centres**. Asking a reading
page to fill 3440 anyway is what produced the grey in the first place.

## The one that was judged and kept

**The Catalog hero has 283px between its words and its buttons at 3440** (it was 2,007px until
the hero's content was capped at 96rem). The remaining span is painted band, not bare page, and
the buttons end on 96rem — the same axis the fold below them ends on. A hero band's middle is
paint; that one is wanted.

## What the pass did not touch

The eight checks, the colour ratios, the content, the nine answers, and the two ids. Nothing
here proposes a sixth approved layout, and nothing was deleted — the tile sentence a phone
drops and the picture a one-column card crops are both one tap down.
