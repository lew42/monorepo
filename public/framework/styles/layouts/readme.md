# Layouts — design record

Eight page layouts, each rendered twice: full size on its own page, and small in
the index gallery. The section exists to make one claim falsifiable — *the
utility set is enough* — so the interesting output is not the layouts, it is the
short list of times a rule had to be written.

---

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

## 3. "Maximize", with a router that only knows path segments

**Question.** A layout wants to be seen without a docs column around it. How is
that expressed?

**Options.**

1. `?full` on the same url.
2. A button that toggles a class.
3. A child page, `<name>/full/`, rendering only the layout.

**Weighing.** (1) cannot work: `Router.load_segments()` splits on `/` and
`Page.child()` walks declared names, so `…/holy-grail/?full` **is**
`…/holy-grail/` — the query is dead data. (2) is state that no url describes:
not linkable, not shareable, and Back does not leave it.

**Verdict: (3), a child page.** `layouts/full.js` is a three-argument factory, so
each of the eight `full/page.js` files is three lines and there is one place that
decides what "full" means.

Two details worth recording:

- **It overrides `render()`, not `content()`.** `Page.render()` draws an `h1` for
  whatever `title` it has, and a maximize view with a heading above it is not
  maximized. The alternative — `title: ""` to make the `if (this.title)` falsy —
  also empties `document.title`, because `Router.activate()` does
  `document.title = page.title ?? document.title` and `""` is not nullish. A
  five-line `render()` override is cheaper than a lie in the tab bar.
- **What "full" actually removes.** `hides-nav` takes the site nav (an inert
  class `/styles.css` reads) and `.layout-full` takes the region's paper measure
  and gives the layout the region's height, so a `flex-1` band has something to
  take and a footer lands at the bottom. It does **not** hide `/framework/`'s
  sidebar. It could — one `.app:has(…) .topic > .sidebar { display: none }` — but
  that is a layouts stylesheet reaching into a class it does not emit to overrule
  a decision the section made, and it would leave the reader with no way back.
  **Kept deliberately:** maximize means "the width it was drawn for", not
  "chrome-free". Under `/framework/` the site nav is *already* hidden by the
  section, so `hides-nav` on these pages is currently a no-op that would matter if
  the section moved.
- **The height rule is `.page.layout-full.active-page`, and the `.active-page` is
  load-bearing.** A bare `.page.layout-full { display: flex }` has the same
  specificity as `.page { display: none }` in Page.css and loads later, so it wins
  — leaving all eight maximize views on screen for every route on the site. The
  arrangement contract decides *whether* a page shows; a stylesheet like this one
  may only say *how*. `/styles.css` records the identical trap for `.page.topic`.

---

## 4. Which layouts needed CSS

Three rules — the other five in `layouts.css` are the gallery window and the
maximize view, which are this section's own machinery, not a layout's cost.

| layout | rule |
| --- | --- |
| cards, split, masthead | **none** |
| holy grail, dashboard | `.layout-rail` — `flex: 0 0 var(--column)` |
| sidebar | `.layout-side` — `flex: 0 0 var(--sidebar)` |
| centered, stack | `.layout-measure` — `max-width: 34em; margin-inline: auto` |

### The gap: there is no utility for a flex basis

`flex-1` names the *fluid* half of a two-column row and nothing names the fixed
half. Every sidebar layout in existence needs both. The workarounds all cost
more than the missing class:

- `.style({ flex: "0 0 19em" })` — inline, the top rung of the escalation
  ratchet, and it hardcodes a number `--sidebar` already holds.
- `grid` with `grid-template-columns` — no utility for an asymmetric template
  either, so it is the same inline style with more syntax.
- `flex.auto` with a `--column` override — makes the columns *equal*, which is
  [Split](/framework/styles/layouts/split/), not a sidebar.

**Proposal, not applied** (this section may not edit `framework.css`): a `basis`
utility reading a token, e.g. `.flex > .basis { flex: 0 0 var(--basis, var(--column)); min-width: 0 }`,
so a sidebar is `div.c("basis").style("--basis", "var(--sidebar)")`. Worth
discussing; three call sites in one docs section is not yet the bar.

### The gap: there is no utility for a centred measure

`max-width` alone leaves the column flush left, and `flex.h-center` has nothing
to centre until a child has a width. This one has a stronger case than the
basis: `.page.paper` already hardcodes `max-width: 60em`, every page on this site
is a measure, and `--column` is a token for exactly this kind of number. Two
hardcodes plus two uses here is close to the "an existing hardcode to replace"
bar that adding a token or class requires.

### Two things the utilities did better than expected

- **`--column` is a knob, not just a default.** `grid.auto` reads it, so setting
  `--column: 8em` on the tile row turns a card wall into a stat strip with no new
  selector, and `--column: 18em` on `flex.auto` sets a split's stacking point. A
  token override where a rule was expected, twice.
- **`flow` was already the answer for vertical rhythm.** `Page.css` applies it to
  page copy; a form stack is the same thing, so [Stack](/framework/styles/layouts/stack/)
  needed nothing but the measure.

---

## 5. The tint, and why `layouts.css` has no colours in it

**Question.** A layout demo needs its regions to be *visible*. A background and a
border are a look, and rung 4 of the ladder is layout only.

**Options.**

1. A `.layout-box` class in `layouts.css` carrying background/border/radius.
2. An inline token-valued `.style()` per box.
3. Reuse `.page-preview`, which is already a bordered surface.

**Weighing.** (1) reads best at the call site and is exactly the rule the ladder
forbids — and a docs section is the last place to be sloppy about its own rule.
(3) is a nav card pretending to be a region, and its `display: flex` fights being
a container.

**Verdict: (2), factored into `parts.js`.** `box()` writes
`background: var(--wash); border: 1px solid var(--line); border-radius: var(--radius)`
once, and `styles/util/page.js` already tints its demo cells the same way — so
this is the house answer, not a new one. `layouts.css` therefore contains no
colour at all, which is the only reason the "three rules for eight layouts" count
above means anything.

The cost: a reader of `demo(layout)` sees `box("Nav", …)` and not what a box is.
Paid for with a `<details>` on the index holding `parts.js` in full, via
`code.file(import.meta, "parts.js")`.

---

## 6. The gallery card reuses `.page-preview`

`a.c("page-preview layout-card")`, and `.layout-card` is two declarations:
`flex-direction: column; align-items: stretch`. Everything else — surface,
border, radius, hover, `text-decoration: none`, and the accent state
`Router.mark_links()` paints on the card for the page you are heading to — comes
free from the class `Page.previews()` already emits. Rung 3 before rung 4, and the
active-state marking is the part that would have been forgotten if this had been
a new component.

One constraint it imposes: **no `<a>` inside a layout.** Nav items are `p()`, not
links, because an anchor inside the card's anchor is invalid HTML and swallows the
click. That is fine — a layout skeleton with eight `href="#"` in it would be worse
— but it is the reason `items()` builds paragraphs.

---

## 7. What I would cut

- **`stack` and `centered` overlap.** Both are `.layout-measure` with different
  contents; `stack` earns its place only because it demonstrates `flow` and
  `textarea.auto`. If the section needs to be seven pages, these merge.
- **The eight `full/` pages.** Two would have made the point (the brief asked for
  two); eight is 24 lines of file for consistency. Kept because an inconsistent
  affordance is worse than a repeated one, and because `full.js` means the
  repetition is three lines with no logic in it.
- **`tile()` in `parts.js`** is one call site (`dashboard`) and is a one-liner
  over `box()`. It stays because it names the thing the dashboard is *made of*,
  which is what the demo source needs to read as prose.

## 8. Open

- **`--sidebar` is 19em, and at a docs measure that is 39% of the row.** The
  demos are therefore cramped on their own pages and correct at full size, which
  is a real argument *for* the maximize link and a mild argument that `sidebar`
  should preview at `full` by default. Left alone: a layout that only looks right
  in a special view is worth seeing honestly.
- **`.layout-full` picks `padding: 1.5em`.** Zero would be more honest ("nothing
  around it") and looked wrong — the back link ended up welded to the viewport
  edge. If a `--page-pad` token ever exists, this should read it.
