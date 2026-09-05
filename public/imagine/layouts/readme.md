# Layouts — every way a page divides its room, numbered; for anyone choosing a shape

One idea and an index of everywhere it goes. **A STACK is what a `div` does on its own** —
things follow each other down the page, each as tall as its own content. **A SPLIT divides a
fixed or specified area into pieces** — by percent, by fixed sizes, by `flex-grow`/`flex-basis`,
or by `fr` tracks. Both are live and side by side at the top of
[/imagine/layouts/](/imagine/layouts/).

**The numbering:** the number is how many columns the layout has at its widest, the word after
the dot is how the room is divided. `2.golden` lives at `/imagine/layouts/2/golden/`.

## Use

A new entry is one object in `system.js` — no page, no CSS:

```js /imagine/layouts/system.js
{
    id: "golden", n: 2, title: "Golden", split: true,
    intro: "Two tracks at 61.8 / 38.2 — …",       // two sentences
    when: "A page with a clear main thing …",     // one sentence
    rules: { display: "grid", "grid-template-columns": "61.8fr 38.2fr", gap },
    boxes: [{ label: "Main", note: "61.8" }, { label: "Aside", note: "38.2" }],
    word: { label: ".cols-row.cols-golden", href: "/framework/styles/layouts/cols/" },
    config: 'div.c("cols-row cols-golden", () => { div("Main"); div("Aside"); })',
}
```

It appears in its number's scroll, gets a full-screen page at that url, and joins the
previous/next walk — all from that one object. `rules` is applied to the live box **and**
printed in the readout column, so the code shown is the code that ran.

## Watch out

- **A part's class NAME is its CSS class.** `View.classify()` kebab-cases every constructor in
  the chain, so a view called `LayoutsPair` wears `.layouts-pair` — the flex row it builds — and
  lays out sideways with nothing thrown. [`doc/decisions.md`](./doc/decisions.md)
- **A layout inside a flex row needs `flex: 1 1 0`, never `1 1 auto`.** Every arrangement here
  sizes its tracks as a percentage of its box, and a percentage against an `auto` basis is
  circular. [`doc/decisions.md`](./doc/decisions.md)
- **Every surface carries the same 1px border**, transparent where it does not show — otherwise
  the surface chip moves the measured track widths, which is a chip changing what it does not
  name.
- **Measure a zoomed box with `offsetWidth`**, never `getBoundingClientRect()` — the viewport
  chip zooms, and a rect follows the zoom.
- **Nothing is remembered** — not in storage, not in the url. A changed card shows a *modified*
  mark and a reset chip.
- **The card stacks under 52rem**, the same floor a three-track row carries. At 1280 in the
  columns row that is the honest result; the full-screen page is where the three columns come
  back. [`doc/decisions.md`](./doc/decisions.md)

## More

- [Overview](/imagine/layouts/) — the two moves, live, then the catalogue
- [`doc/decisions.md`](./doc/decisions.md) — why numbered, why chips instead of pages, what it
  is to the approved five and to `styles/layouts/`, what was measured, what is open
- The numbers: [1.\*](/imagine/layouts/1/) one column · [2.\*](/imagine/layouts/2/) two ·
  [3.\*](/imagine/layouts/3/) three · [4.\*](/imagine/layouts/4/) four or more
- Files: `system.js` (the catalogue and the vocabulary, imports nothing) · `LayoutsCard.js` (the
  3-column card and its three parts) · `number.js` (a number page, its full-screen children, the
  persistent bar, the crumb switch) · `layouts.css` · `page.js` (the hub) · `1/`–`4/`
- What this stands on: [the five layout words](/framework/styles/doc/layout-system.md) ·
  [`styles/layouts/`](/framework/styles/layouts/) the real arrangements ·
  [`styles/layouts/cols/`](/framework/styles/layouts/cols/) the distribution words ·
  [core columns](/framework/core/Page/doc/columns.md) `full` and the crumb strip ·
  [`/imagine/paging/`](/imagine/paging/) the surface and mechanism vocabulary ·
  [the approved five](/imagine/design/layout/approved/) — this is that gate's catalogue, not a
  sixth layout
