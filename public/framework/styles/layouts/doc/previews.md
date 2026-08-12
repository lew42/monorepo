# Previews — how a thumbnail can be the page

Split out of `readme.md`. **Scope:** what goes *inside* a card. Two kinds of thumb
sit in the same card shape now — a live `page.frame()` painted down (`detail.js`;
it was `Layout.js` and a `page.layout()` until the exhibit conversion — readme.md),
and a schematic shape with no content at all (`preview.js`, drawn by `word.js`).
The card itself is core's, and §6 records why it stopped being this section's.

## 1. `zoom` or `transform: scale()` for the previews?

**Question.** A gallery cell is a fixed window showing a whole page layout. What
shrinks it?

**Options.**

1. `zoom: 0.25` — the existing `.zoom-*` utilities in `framework.css @layer util`.
2. `transform: scale(0.25)` with `transform-origin: top left`, on a box given an
   explicit width four times the cell's.
3. A screenshot per layout.

**Weighing.** (3) loses immediately: a picture drifts from the code the moment
anyone edits the layout, and this section's whole argument is that the previews
are the same functions the pages run.

Between (1) and (2) the difference is *layout*. `zoom` participates in it: a
`width: auto` child of a zoomed box resolves against the cell width **divided by
the zoom**, so the layout is genuinely laid out at desktop width and painted at
card size. Everything intrinsic then behaves correctly at the larger width —
`flex.auto` wraps where a 900px page would wrap, `grid.three` holds three
columns, a `var(--sidebar)` rail is the right fraction of the row. `transform`
does none of that: it scales a finished box, so the layout is laid out at the
*cell's* 234px, where `grid.three` has already flipped to one column and every
rail is most of the width. You would then have to hardcode `width: 936px` to undo
it, which reintroduces the number the tokens exist to avoid.

`transform` has one advantage — it needs no fresh support (Firefox only shipped
spec'd `zoom` in 126). But `.zoom-25` is already a documented, shipped utility on
this site; a doc page is not the place to hedge against the browser matrix its own
utilities assume.

**Verdict: `zoom`.** Two declarations of CSS for the window
(`aspect-ratio` + `overflow: hidden`) and one utility class for the scale.
Measured in Chromium: at a 1440 viewport `.layout-thumb` paints **234 × 146** and
its contents lay out at **934 × 584** — exactly 4×, which is `zoom: 0.25` taking
part in layout rather than only in paint. At a 700 viewport it paints 274 × 171 and lays out
1096 × 685: the cards get bigger as the grid drops to 2-up, and the preview stays
a desktop page either way. A preview looks *shrunken*, not squashed, which is the
whole requirement — and it is the same behaviour the `util` page already
advertises ("scales a whole subtree including its layout").

**Worth knowing.** Media queries do **not** follow the zoom — they read the
viewport. A layout that responds with a breakpoint would preview wrongly, while
one that responds intrinsically (`flex.auto`, `grid.auto`, `grid.three`) previews
correctly. That is an accidental but real argument for the intrinsic techniques,
and it is why no layout here contains a media query.

---

## 6. The card is core's — this section only supplies the thumb

It started as `a.c("page-preview layout-card")`: a couple of declarations over the
class `Page.previews()` already emitted. Rung 3 before rung 4, and reusing the class
is what kept the accent state `Router.mark_links()` paints on the card you are
heading to.

That reuse became the whole answer. The gallery module is gone and `Page.preview_card(nav,
thumb)` is the one card shape; a page that wants a live render **overrides
`preview()`**, which in `detail.js` is one line:

```js
preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.frame())); }
```

*(`frame()` and not `layout()` since the exhibit conversion: the card paints down
the layout **in its `.page` box**, so a thumbnail wears the same `full`/`pad`/`fill`
as the page it links to and the two cannot disagree about the page shape.)*

Two constraints the card imposes, both silent when broken:

- **No `<a>` inside a layout.** The label is the card's only link and its `::after`
  covers the card, so a thumb is `pointer-events: none` and an anchor inside it
  would be an `<a>` in an `<a>` — invalid, and un-nested by the browser. That is why
  `items()` builds paragraphs.
- **A schematic thumb needs `surface`.** A card with a thumb is bare as of Aug 2026 —
  no board, no card background — so a shape whose whole subject is empty boxes has
  nothing to sit on. `word.js` adds the one utility class. (Before the cards went
  bare the same line was needed for the opposite reason: the checkered floor meant
  "this render painted nothing", which was misleading here.)

---


---

## OVERTURNED — the per-layout `layout.js` files

The record below argued for one `layout.js` per directory, default-exporting a
builder, imported by the page AND by the index. It shipped and then rotted in one
specific way: the index had to hand-maintain a `gallery` map of the eight imports
*beside* its `children` string, so there were two lists and a `gallery[name] &&`
guard on every read of them. `fit` fell through that guard and silently missed the
wall for months.

The layout function was never a separate concern from the page — it *was* the
page's content. Each one is now a `layout()` method in a `detail()` config, the page
shows it on a stage at full size and the index renders the same method inside a
gallery card. One list (`children`, auto-imported), and the test for "is this a
layout" is `page.layout` rather than a map somebody has to remember to extend.

## 2. Why a separate `layout.js` instead of markup in the page?

**Question.** Each layout is needed in three places — the demo on its own page,
the thumbnail in the gallery, and the `full/` view. Where does it live?

**Options.**

1. Write the markup in `<name>/page.js` and duplicate it for the gallery.
2. Export a builder from `<name>/layout.js` and import it three times.
3. Put all eight in one `layouts.js`.

**Weighing.** (1) is the drift the `demo()` ext exists to prevent, one directory
up: the gallery would show a layout that no longer matched the page it links to,
and nothing would fail. (3) is one import instead of eight, but it puts a
layout's code somewhere other than beside the page that documents it, and
`demo(fn)` reads `fn.toString()`, so a reader following the source would leave
the directory.

**Verdict: (2), one file per layout, default-exporting a function.** The
functions **capture** rather than return — `div.c(…)` auto-appends to whatever is
collecting — because every one of the three call sites is a capture position, and
because it makes the source that `demo()` prints identical to what you would
paste into a `page.js`. The whole point of a layout library is that the code is
copyable.

The gallery imports all eight eagerly, which is normally the thing laziness
exists to avoid. It is correct here: the index *renders* all eight, so there is
nothing to defer, and the modules are 8–20 lines each with one shared dependency.

---

