# Screens — full-screen experiences, and what navigation does to one

Eight experiments at [`/imagine/screens/`](/imagine/screens/), each a real url tree you can
walk. `/imagine/` is a columns host, so a screen here is not a shell: it is the width word
**`full`**, which folds the rail and the index into the crumb strip and leaves you the
viewport ([columns](/framework/core/Page/doc/columns/)).

## Use

```js /imagine/screens/<name>/page.js
import { Screen, area, sheet } from "../screen.js";

export default new Screen({
    meta: import.meta,
    title: "Divide",
    shapes: ["1", "1 1"],                            // the card's diagram, hop by hop
    content(){ area("One", "Click to split.", this.url + "two/"); },
    children: [ new Screen({ title: "Two", width: "fill", content(){ … } }) ],
});
```

`area(label, note, to)` is the shorthand; `sheet(to, build)` is the same two boxes with
anything inside them.

**Two words are the whole space.** `full` (the default) **replaces** the screen you were on;
`fill` **joins** it and the screens left divide the row evenly. An experiment is which word
each hop picks. The root is always `full` — it has to collapse the site's own columns.

**Every area is two boxes.** `sheet()` draws them: the **area** is the paper (full bleed, the
click target, the tone) and `.screens-block` inside it is what the screen composes into —
capped, centred, and the query container, so a word is 14% of its own composition rather than
of however much screen was left. Below ~1030px of area the cap never bites and the block is
simply the column. [`doc/decisions.md`](./doc/decisions.md) has the before/after numbers.

## The eight, and what each one measured

| | hops | verdict |
|---|---|---|
| [Divide](/imagine/screens/divide/) | 1 → 2 → 3 → 4 columns | The row divides for free: 1920/960/640/480 at 1920, and nothing re-renders. |
| [Stack](/imagine/screens/stack/) | 1 → 2 → 3 bands | The height has no row to open into, so each band count is a screen that redraws. A band has no url. |
| [Title Slide](/imagine/screens/title/) | cover → cover + doc | 733 + 1187 at 1920 — the cover keeps its column and takes the *minor* share, from one `:has()`, with no second render. |
| [Peek](/imagine/screens/read/) | doc → doc + cover | The same two pages leading the other way: 1696 + 224. Whichever page leads keeps the room — and a 14em rail cannot hold display type, which is the cost. |
| [Deck](/imagine/screens/deck/) | slide ↔ slide | `full` slides hide each other, so swap is free: a url per slide, cold-loadable, Back walks it backwards. |
| [Uneven](/imagine/screens/uneven/) | 1 → φ → three | A basis IS a share: 61.8/38.2 measured 1187/733 at 1920 and 2126/1314 at 3440 — the golden section at both. |
| [Quad](/imagine/screens/quad/) | 2×2 menu → quadrant | The menu stacks when its own column runs out (531px at 1920), not at a guessed breakpoint — and a quadrant is an ordinary column, head and all. |
| [Mix](/imagine/screens/mix/) | 1 → 2 → 3 areas | Both axes compose: a cover beside a column that splits its own height, and the bands open a third column. |

## Watch out

- **A screen cannot escape its host's row.** `column_host()` finds the *shallowest* columnar
  ancestor, so nothing under `/imagine/` can start a second row. `full` is the only way out
  and it is enough.
- **`full` alone would push the second screen off the row** (`min-width: 100%`). `screens.css`
  re-tunes its three tokens to `fill`'s — that one rule is the progressive division.
- **`hides-nav` is already site-wide**, because the site root carries it and is an
  `active-ancestor` everywhere. These screens do not need the word; measured `display: none`
  on all 24 urls.
- **A band's type cannot be sized by width.** At 1920 a full-width band took a full-width
  headline in a third of the height; `container-type: size` is not a fix (it stops a box being
  sized by its own contents). Bands take a narrower **block** instead, and the ramp follows.
- **`.in-path` is not "behind you".** It is `mark_links()`'s and it lands on *anchors*, so on
  Divide it marks three of four areas including the one you are standing on. The screen you
  came through is `.active-ancestor`, on the **page**.
- **A tone rule can outrank a hover** and nothing throws — the area is still a link, it just
  stops responding. `:where()` on the state half keeps it at (0,1,0).
- **A column body is `--wash`** (Page.css), which is exactly the tone a screen behind you steps
  down to — the quad's quadrants take `--surface` so the seam survives.
- **Prose in a `fill` column** gets a 1389px line — the quadrants cap it at 40em.
- Under 32em of row, core pages one column at a time: at 400 every hop is a swipe, by design.

## More

- [`doc/decisions.md`](./doc/decisions.md) — the record: the constraint that shaped it, the
  composition pass with its before/after numbers, what was rejected, what was cut.
- Files that matter: `screen.js` (the `Screen` class, `sheet()`, `area()`, `frames()`),
  `screens.css` (two rules do the work — `full` re-tuned, and the block),
  `page.js` (the index — cards as nav).
