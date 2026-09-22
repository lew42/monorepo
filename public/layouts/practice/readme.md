# Practice — three big layouts, built to be judged: a workbench, a reader and a catalog

Three whole pages. Each one spans a 3440 screen and still works at 400, each is filled with
this site's own content so the judgement is honest, and each carries a fold at the bottom
holding the nine design answers, the four widths and the polish line.

**They are practice, not a new standard.** Every one is an instance of a layout the
[encyclopedia](/layouts/) already names and a shape [the approved five](/layouts/doc/studies/approved/)
already closed. Nothing here proposes a sixth.

| page | its id | approved shape | what it is for |
|---|---|---|---|
| [Workbench](/layouts/practice/workbench/) | [`3-holy-grail`](/layouts/3-holy-grail/) | 2 + 4 inside | pick a thing from a wall, read about it in a panel |
| [Reader](/layouts/practice/reader/) | [`3-holy-grail`](/layouts/3-holy-grail/) | 2 | one article at the measure, the leftover put to work |
| [Catalog](/layouts/practice/catalog/) | [`1-bands`](/layouts/1-bands/) | 1 + 4 inside | a hero, a wall of cards, a footer |

Two of the three share an id, and that is the point: an id names **how the room is divided**
and nothing else, so a workbench and an article page really are one layout wearing different
content. [`doc/naming.md`](/layouts/doc/naming/) is why.

## Use

- [/layouts/practice/](/layouts/practice/) — the three, shown at 1920, one line each
- Open any one and press the fold at the bottom: **why it is the way it is** — layout,
  navigation, structure, visual hierarchy, iceberg, colour with the ratios, focus,
  interaction, purpose and outcome
- Copying one? Start from its `page.js` header comment, which answers the layout skill's five
  questions before the first factory call, and from the three rules at the top of `practice.css`

## The three rules this module is built on

1. **A box with a background gets padding; a box without one gets none.** Padding with no
   background change floats a thing in midair, off the margins its siblings line up on. Every
   surface is listed below with which of the two it is.
2. **Spacing is the tokens** — `--pad`, `--gap`, `--flow`. The one exception the size standard
   itself names: a *control's* own padding, its height and the gap between its own icon and its
   own label stay in the control's `em`. A nav item's height here is a `min-height`, not
   padding, which is how it gets a comfortable hit target without inventing a box.
3. **Responsive is a container query, never a viewport one.** A viewport query lies the moment
   the page is put inside a column, a panel or a frame.

## Every surface, and which it is

| surface | paints? | padding? |
|---|---|---|
| the page's own floor | `--surface` (the app's `--wash` behind it) | none — the page grid's gutters are the page's |
| the rail, the wall, the article, the margin | no | **none** |
| a nav link, a footer link | no | **none** — its height is a `min-height` |
| a tile, a card, a note, the panel | `--fill-a04` | yes, `--gap` × a fraction, or `--pad` |
| the Catalog's bar and footer | `--fill-a08` | yes, on the band itself |
| the Catalog's hero | `--fill-a04` | yes, on the band itself |
| the Catalog's content band | no | **inline only** — it restores the page's gutter, which is alignment, not decoration; its air above the footer is a `margin`, which is not padding |
| a crumb, a chip, a button, the fold's `summary` | yes | its own control `em` |

## Watch out

- **`--gutter-x` is a clamp in `em`, so it re-resolves against the element's own font-size.**
  The Catalog's footer carried `font-size: 0.9em` and its gutter came out 81px against every
  other band's 90px at 3440 — a 9px misalignment, invisible one band at a time and obvious down
  the left edge of the page. A band keeps the page's font size; its *contents* shrink.
- **`--subtle` is not contrasty enough on this module's painted boxes.** The lew42 skin's
  `#6a6a6a` is 4.83:1 on the page floor but only 4.0:1 on `--fill-a04` — under AA for body text.
  This module declares `--std-practice-quiet` instead, one step darker, measured at 5.97 / 5.46 /
  4.97:1 on the three grounds it paints.
- **A wall's column COUNT is written out, never derived from a column width.** `auto-fill` with
  a `--column` is one line and it cannot be told which counts are allowed: swept every 80px, the
  24 tiles landed on 5 columns from 2240 to 2480 and on 7 from 2880 to 3120, and the 12 cards on
  5 from 2800 to 3360 — each a short last row, and none of it visible at the four widths it was
  proved at. Both walls now name their counts, and every one is a divisor.
  [`doc/critique.md`](/layouts/practice/doc/critique/) has the sweep.
- **When the count is fixed and small, write the count.** The nine answers in the fold went to
  2 columns at 1280 and 4 at 1920 under `auto-fill`, each leaving a short last row for nothing;
  they are `repeat(3, …)` or one column now. The same rule reached the two walls one pass later.
- **A region that takes the leftover has to be able to SPEND it.** The Reader's margin used to go
  four columns wide on a big screen; a margin has no more content when it is wider, so it grew
  905px and 1,483px of dead tail instead. One column, and the whole layout centres above its
  ceiling — which is why the Reader does not fill 3440 and the other two do.
- **`position: sticky` on a grid item under `align-items: start` can never fire.** The item is
  exactly as tall as its content, so there is nowhere to travel and nothing throws. The box that
  stretches and the box that sticks have to be two boxes.
- **`ext/toc` is `display: none` until a rule turns it on** — its own rule only fires for a toc
  that is a direct child of the page, inside an 82em viewport media query. One line in
  `practice.css` is the whole cost of reusing the site's component and its scroll spy.
- **The fold carries `toc-skip`.** `toc()` scans every `h2`/`h3` in the page, so without it the
  nine answers appear in the article's table of contents as though they were sections of it.
- **A tile is a `<button>`, so it arrives wearing framework.css's control grammar** — a fill, a
  hairline, a 2.4em min-height, centred content. Six declarations put that back. The rule is
  `(0, 2, 0)` so it cannot lose to a skin's own `:is(button, .btn)` on load order.
- **A selected state must not be a box that only exists when it is on.** Every tile carries a
  transparent 1px border at rest; lighting one up moves nothing.

## More

- Files: `page.js` (the index) · `Practice.js` (the rail, the head, the fold, and the data the
  three pages share) · `practice.css` · `workbench/` `reader/` `catalog/` · `shots/`
- [`doc/decisions.md`](/layouts/practice/doc/decisions/) — what was settled, what was measured,
  what was deliberately left
- [`doc/critique.md`](/layouts/practice/doc/critique/) — the critic's pass: eleven things a
  four-width sweep could not see, at six widths and an 80px wall sweep
- The measurements: the eight checks × four widths × three layouts are in
  [the build log](/framework/ai/2026-09-17/practice-layouts/); the six-width re-measure and the
  80px wall sweep are in [the critic's log](/framework/ai/2026-09-17/practice-critic/)
- All three are on the layout wall: [`/layouts/browse/`](/layouts/browse/), Global tier
- Beside it: [`/layouts/`](/layouts/) the encyclopedia these three cite ·
  [`/layouts/browse/`](/layouts/browse/) every layout on the site, with a verdict button ·
  [the approved five](/layouts/doc/studies/approved/) the closed set they are instances of
