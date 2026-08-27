# Columns — a page whose subtree is a row

One call, and every page under this one is a full-height column that opens to the right of its
parent. The tree is real; `display: contents` is what flattens it.

```js
export default new Page({
    meta: import.meta,
    title: "Finder",
    width: "small",                    // this page's own column
    initialize(){ this.columns(); },   // the whole opt-in
    children: { Guides: { width: "small", children: { … } } },
});
```

**Live:** [/framework/core/Page/overview/columns/finder/](/framework/core/Page/overview/columns/finder/) — page height, real
urls. The same tree in a box, with the source: [/framework/core/Page/overview/columns/](/framework/core/Page/overview/columns/).

## The four width words

`width:` is the page's own word; `column()` stamps it on the body. Every value is a token, so a
page can retune one number (`--page-column-max`) instead of asking for a fifth word.

| word | track | for |
|---|---|---|
| `small` | fixed 14em | rails, lists, item pickers, an index |
| *(none)* | 16em floor, 40em ceiling | the default — prose, a form, two columns of content |
| `large` | 28–64em | a grid, a table, wide content |
| `full` | the whole host | one page at a time; the ancestors collapse into the crumb strip |

`full` is the "swap into the correct area" case. Its ancestors come back the moment you navigate
anywhere else — the crumb strip above the row is what you click.

## Measured 2026-08-26 (headless, the live page, 900 tall)

| viewport | row | `small` | default | `large` | `full` |
|---|---|---|---|---|---|
| 400 | 400 | 400 | 400 | 400 | 400 |
| 1280 | 1051 | 211 | 241 | 421 | 1051 |
| 1920 | 1677 | 224 | 410 | 1005 | 1677 |
| 3440 | 3166 | 252 | 720 | 1152 | 3166 |

Under 32em of ROW the arrangement pages one column at a time and the snap does the rest — 400 is
that regime, which is why every word measures the same there.

**Arriving and navigating agree.** A cold load straight at a five-deep url and the same page
reached by clicking down from the root produce the identical row at every width — five columns,
same widths, same `scrollLeft`. That is the one thing the first sketch got wrong (below).

## The mechanism

Every page keeps its `$pages` region **inside its own view**, so the DOM is an ordinary nested
tree and [the arrangement contract](/framework/core/Page/doc/css/) is untouched: a column closes
because it lost its mark, not because anything moved it. Then `display: contents` on every
descendant page and every region deletes those boxes from *layout*, so the only flex items the
row ever sees are the column bodies. Peers on screen, a tree in the DOM.

The shape is asked for at **render** time (`column_host()` walks `chain()`), never walked over the
tree — so a child that only loads when you navigate to it is a column too.

Colours: transparent bodies over one `--wash` floor, every seam a 1px `--line` hairline. Never
`--well` — it is a translucent shadow, not a palette colour, and stacking it is what banded
`/framework/ux/*`.

## What has bitten

- **`:has()` does not care whether a page is painted.** A closed page is still in the DOM, so the
  rule that collapses the ancestors under a `full` column went on matching after you navigated
  away and hid them for the rest of the session. The mark is part of the test:
  `:is(.active-page, .active-ancestor, .default)`.
- **Going up the chain activates nothing.** `Router.activate()` only touches what changed, so a
  crumb strip refreshed only from `activate()` kept the departed leaf forever. `deactivate()`
  refreshes it too, from the shallowest page to leave.
- **Two sheets cannot own one class name.** `old/overview/columns/` shipped its own
  `.page.columns` and `View.stylesheet` is global, so both landed on both demos. The snapshot is
  deleted; the live one is the only copy.
- **`scroll-snap-type: x mandatory` undoes the reveal** — a mandatory row re-snaps on every
  relayout and the deepest column arrives clipped. `proximity`. And a container query never
  matches its own container, so the narrow rule can only restyle the body.
- **`requestAnimationFrame` never fires the first reveal.** A page is built *detached*; every rect
  is 0. A `ResizeObserver` on the row is the trigger that works, and it is also right on resize.
  The rAF is still needed for later navigations — marks land *after* `activate()`.
- **`--page-pad` inherits** from the region, so the host says `padding: 0` or it sits inside its
  own box. And the body reads `--page-column-max`, **not** `--measure`: a demo region sets
  `--measure: none`, which would silently uncap every column.
- **Columns and tabs — do not.** A full-height row under a `.block` tab bar cuts through the open
  tab's bottom edge and loses the flush tab-to-content effect. Columns are their own screen.

## Open — the owner decides

- **Dead space at 3440.** Three `small` columns and one `large` fill 1908px of a 3166px row. A
  column has a measure, so the answer on a wide screen is a wider *word* (`large`, `full`), not a
  column that grows past its own reading width — but "let the last open column absorb the rest" is
  a real alternative and nobody has looked at it yet.
- **The `×`** on every non-host column closes it and everything right of it (href = the parent's
  url). Keep, or a plain head?

Related: [`css.md`](/framework/core/Page/doc/css/) — the visibility contract this leaves alone;
[`layout.md`](/framework/core/Page/doc/layout/) — nested vs `full`.
