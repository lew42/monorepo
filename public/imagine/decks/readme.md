# Decks — cutting a screen, and what belongs in each piece

Nine presentational layouts at [`/imagine/decks/`](/imagine/decks/), each a real url you can
open cold. [`/imagine/screens/`](/imagine/screens/) found the two words a whole screen is made
of — `full` replaces, `fill` joins. This lab is one rung in: **once you have the screen, how do
you cut it, and what kind of content survives the piece it lands in.**

## Use

```js /imagine/decks/<name>/page.js
import { Deck, region, quiet, statement, notes, slices } from "../deck.js";

export default new Deck({
    meta: import.meta,
    title: "Golden",
    shapes: ["1.618:s 1:n"],          // the card's picture, toned by content kind
    ring: slices,                     // the strip under the slide
    content(){
        region(61.8, () => statement("61.8 / 38.2", "A lead", "…"));
        quiet(38.2, () => notes("The minor share is not small", ["…"]));
    },
});
```

**A region is a SHARE, and the share is its flex BASIS.** `61.8%` beside `38.2%` measured
2125 / 1313 at 3440 and 1185 / 733 at 1920 — the golden section at both, with no breakpoint.
A grow weight is *not* a share and the difference is silent: see Watch out.

**Five content kinds, one property between them** — how each answers a wider region.
`statement` and `stage` scale, `wall` adds columns, `notes` caps at its own measure, and
`list` **does not scale at all**. That one line is the whole map:
[`doc/regions`](/imagine/decks/doc/regions/).

## The nine

| | cut | verdict |
|---|---|---|
| [Half](/imagine/decks/half/) | 50 / 50 | The only cut that claims the two things are peers. Wrong for a statement + caption; right for a versus. |
| [Golden](/imagine/decks/golden/) | 61.8 / 38.2 | The workhorse. At 3440 the minor share is 1313px — a capped block *inside* a region, not 1313px of prose. |
| [Aside](/imagine/decks/aside/) | 70 / 30 | 30% of 3440 is 1031px. A bare nav list there is a chevron chasm; the aside has to hold something with prose in it. |
| [Triptych](/imagine/decks/triptych/) | 25 / 50 / 25 | The presenter's shape — place, statement, notes. Flanks of 479px at 1920 are real rails; at 3440 they are 859 and the list caps. |
| [Poster](/imagine/decks/poster/) | 20 / 60 / 20 | **The best cut for a 3440**: 687 / 2062 / 687, a 1092px block and a 142px word in the middle. |
| [Four](/imagine/decks/four/) | 2 × 2 | Four peers with no sequence. Exactly one cell takes the accent or the eye has no entry. |
| [Persistent](/imagine/decks/persist/) | rail + stage | The rail is the PARENT column and the slides are its children — the row already does the whole job. Two tokens, no JS. |
| [Swap](/imagine/decks/swap/) | one screen | The same four slides with `full` on each. The strip under them is redrawn per slide and still reads as persistent. |
| [The pitch](/imagine/decks/pitch/) | six slides | A real deck about the framework, built from the cuts above. Click, arrows and Back all move it. |

**Persistent vs swap, measured on the same four slides:** the kinds that **cap** (wall, list,
notes) want the rail — it costs them nothing, six wall columns either way. The kinds that
**scale** (statement, stage) want the swap — a 16em rail took the statement from 132px to
113px at 1920. [`doc/decisions`](/imagine/decks/doc/decisions/) has the table.

## Watch out

- **`flex: 61.8 1 0` is not 61.8%.** A zero basis is a zero *border* box, so a padded region
  floors at its own padding: measured 1159 / 759 = **1.527** where the page claimed 1.618. A
  percentage basis includes the padding and shrinks in proportion. `decks.css` names it.
- **A vertical share is not available.** A percentage basis inside a `col` would be a percentage
  of a height the flex algorithm is still deciding — regions in a col are equal bands only.
- **A persistent rail is a FIXED track, not a share** — because it holds a list. 22% of 3440 is
  757px around a 416px list; 16em costs the stage 288px instead of 757.
- **The router writes `.active` for an exact url, `.in-path` only for an ancestor.** Keyed on
  `.in-path` alone the rail marked nothing at all. And the slide at a deck's root is the
  `default` child, which has no url of its own — the host's `.active-page` marks that row.
- **A slide does not scroll, except at 400.** A three-region cut on a phone genuinely has no
  room; the bands keep their content and the screen scrolls. It is the only scrollbar here.
- **A keyboard handler must die on deactivate, and only the page you are on may act** — going
  deeper never deactivates an ancestor. Three ⚠s, all from
  [`/imagine/screens/`](/imagine/screens/doc/decisions.md), reused verbatim in `deck.js`.
- **Space advances too, everywhere `arrows` is spread in** — guarded off a focused control so
  it never steals a real link's own Space behaviour: [`doc/decisions`](/imagine/decks/doc/decisions/).
  All nine pages answer arrows/space now, not just `pitch/` `persist/` `swap/`.
- **The footer's N/M numeral lives in `foot()` once, never per cut** — counted from the same
  `items` array the chips are drawn from, so it cannot disagree with them. A `.decks-foot-n`
  label, `flex: 0 0 auto` so it never competes with the ring for the grow a chip earns.

## More

- [`doc/regions`](/imagine/decks/doc/regions/) — the content-kind map: which kind belongs in a
  region of what width, with the measured widths of every cut at 400 / 1920 / 3440.
- [`doc/decisions`](/imagine/decks/doc/decisions/) — the record: the head-to-head table, what
  was measured and rejected, and the slice that was built, shot and cut.
- Files that matter: `deck.js` (the `Deck` class and the five content kinds), `decks.css`
  (the cut, the tone step, the two rails), `slides.js` (the four slides both head-to-head
  decks show — one source, two navigation modes).
