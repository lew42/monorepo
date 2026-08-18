# Floors and ceilings

Almost every layout that breaks at a width nobody checked is a box with **one
bound instead of two**. A track with a floor and no ceiling runs away; a track
with a ceiling and no floor collapses. The measured cases, from the library:

| written | missing | what it did |
|---|---|---|
| `minmax(min(40em, 100%), 1fr)` | a ceiling | 128 characters a line at 1280, clean at 400 and 1920 |
| `minmax(0, 18em) minmax(0, 1fr)` | a floor | first track collapsed to **62px** at 400; prose laddered at 9.6 chars |
| `flex: 1` on an article | a ceiling | 160 chars at 1920, **261** at 3440 |
| `flex: 1` on a pane | a floor of 0 | one unbreakable token pushed its sibling 83% out of the box |
| `repeat(3, 320px)` | both | 296px outside the page at 400, 72% of the screen empty at 3440 |

## The four spellings

```css
minmax(min(14em, 100%), 1fr)      /* tiles — floor, and a ceiling that stretches */
minmax(min(34em, 100%), 38em)     /* prose — bounded at BOTH ends */
minmax(0, 1fr)                    /* a track that may be narrower than its content */
flex: 1 1 24em;  min-width: 0     /* the same pair, spelled for flex */
```

- **`min(x, 100%)` is the floor that cannot overflow.** A bare `14em` floor is
  wider than a 320px phone and takes the document sideways with it.
- **`1fr` is a *maximum*, and an unbounded one.** Correct for tiles, where a card
  stretching to fill is fine. Wrong for prose, which needs a number.
- **`minmax(0, …)` and `min-width: 0` are the same declaration** in two syntaxes:
  *this item may be narrower than what is inside it*. Without them a grid or flex
  item's automatic minimum is its content, and one long token sets the floor.
- **A rail is the fixed half of a row** — `flex: 0 0 15em`, never `flex: 1`. As
  `flex-1` it splits the slack with the article and renders wider than the
  reading.

## Where the ceiling goes

On the **container**, never on the leaf. `max-width` on every `p` has to be
unset for tables, code blocks, figures and card grids, and the sixth `unset`
gets written by someone who never saw the other five. The container owns a
track; a child opts out by asking for a wider one.

⚠ **A bound is not a breakpoint.** None of the declarations above name a
viewport width. The width at which a layout changes should be a *consequence* of
its bounds — which is why `sweep()` reports edges, and why an edge nobody chose
is the finding (`responsive.md`).

Live: [Reading grid](/framework/ext/DesignTool/library/reading-grid/) ·
[Tile wall](/framework/ext/DesignTool/library/tile-wall/) ·
[Unbreakable child](/framework/ext/DesignTool/library/bad/unbreakable-child/).
