# Columns — nested pages laying out as peers

**The demo:** [/framework/core/Page/old/overview/columns/](/framework/core/Page/old/overview/columns/) — Miller columns (the
Finder arrangement). Every page in the tree is one column: its title, its prose, its children as a list. Click a
row and the next column opens to its right; click a row further left and everything right of it closes; below two
columns' width the row pages one at a time; six deep it scrolls sideways and the newest column scrolls itself into
view. Equal widths, capped, any depth. Two files: `overview/columns/page.js` (the tree and one walk that patches
every page) and `overview/columns/columns.css` (every rule).

## The question it answers

Can nested pages share space evenly? The intuition was no — a child mounted *inside* its parent's region can only
divide what the parent left it, so peers on screen would need a flat DOM, and a flat DOM breaks the arrangement
contract (an ancestor is visible only while it *contains* the active page — Page.css, and `demo.app`'s `mark()`).

**Yes, and the contract stays untouched.** Keep the DOM a tree — each page's `$pages` region sits inside its own
view — and flatten only the *layout*: `display: contents` on every non-root page and every region deletes those
boxes from layout, so the only flex items the root row ever sees are the column bodies. Peers on screen, a tree in
the DOM. A column closes because it lost its mark, not because anything moved it; nothing is written for closing.

The mechanism was proved once before and never shipped: `core/new/starter/` ("`display: contents` dissolves the
intermediate boxes so a nested DOM lays out as one flat CSS grid", measured 329 | 329 | 329 against nested's
494 | 246 | 245 — do-not-import), and `ai/2026-08-12/apps/columns/` was a fixed-width Miller prototype. This is the
first capped, responsive, live version.

## Measured 2026-08-18 (headless, the demo's 22em box)

| box | arrive (3 deep) | 4 deep | 6 deep | back up |
|---|---|---|---|---|
| 390 | 3 × 329 — one at a time, scrolled to Guide | 4 × 329 | 6 × 329 | 3 deeper `display: none`, scroll returns |
| 1280 | 3 × 195, no scroll | 4 × 180, row scrolls, newest flush right | 6 × 180 | 3 hidden, `scrollLeft: 0` |
| 3440 | 3 × 432 — the 24em cap | 4 × 424 | 6 × 282 | 3 hidden |

Every visible column the same width and height at every step; the outer region never scrolls in either axis; the
column *bodies* are what scroll vertically. Zero console errors or warnings here and on `/framework/core/Page/`.

## Four things the first sketch got wrong

- **`scroll-snap-type: x mandatory` undid the reveal.** A mandatory row re-snaps on every relayout, so the
  `scrollBy` `activated()` had just done was reversed and the deepest column arrived 46px clipped. `proximity`.
  And a container query never matches its own container, so the mobile block can only restyle the body's
  `min-width`, never the row's snap type.
- **`requestAnimationFrame` never fired the first reveal.** A demo page is built *detached* — at rAF the row is not
  connected and every rect is 0. A one-shot `ResizeObserver` on the row is the trigger that works, and it is also
  right when the stage is dragged. The rAF is still needed for later navigations: the box marks what it shows
  *after* `activate()`, so at `activated()` time the new column is still `display: none`.
- **`--page-pad` inherits** from the demo region — `padding: 0` on the row, or it sits 18px inside its own box.
- **`.page-title + *` (framework.css) reaches a hidden `h1`.** `render()` draws the heading; a `display: none`
  heading still counts as the `+` sibling, so every column but the first started 45px down the row and lost that
  much height. `margin: 0` on the body, at (0,3,0) — `.page > * { min-width: 0 }` ties at (0,1,0).

`--page-column-min` is 12em, not 14: at 14em three columns need 633px and the exhibit's 1280 render band is 586.

## Open — the owner decides

- **Graduate?** `.page.columns` / `.page.column` are shaped like `.page.solo`; they could live in `Page.css` as a
  real page shape with the walk as `Page.prototype.columns()`. Today only the demo loads the sheet.
- **The 24em cap** leaves ~460px empty right of three columns at 3440 — Finder does the same; raise
  `--page-column-max` if the columns should fill instead.
- **The `×`** on every non-root column closes it and everything right of it (href = the parent's url). Keep, or a
  plain head?
- **Columns and tabs.** Full-height columns under a `.block` tab bar would cut through the open tab's bottom edge and
  lose the flush tab-to-content effect (the owner's note). Columns are their own screen; do not put a folder-tab
  strip directly above them.

Related: [`layout.md`](/framework/core/Page/doc/layout/) — the open nested-vs-full question this is one data point
for; [`css.md`](/framework/core/Page/doc/css/) — the visibility contract the arrangement leaves alone.
