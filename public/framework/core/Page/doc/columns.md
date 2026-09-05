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

**Four real screens** built out of nothing but these words, each answering a different
"what goes where": [Docs](/framework/core/Page/overview/columns/uses/docs/) — a deep tree
of content · [Inbox](/framework/core/Page/overview/columns/uses/inbox/) — a preview rail
opening a reader, with unread state two pages up ([roles](/framework/core/Page/doc/roles/))
· [Workbench](/framework/core/Page/overview/columns/uses/workbench/) — three and four
columns at 3440 · [Split](/framework/core/Page/overview/columns/uses/split/) — a columns
host inside one half of a height-split screen ([panels](/framework/core/Page/doc/panels/)).

## The six width words

`width:` is the page's own word; `column()` stamps it on the body. Every value is a token, so a
page can retune one number (`--page-column-max`) instead of asking for a seventh word.

| word | track | for |
|---|---|---|
| `small` | `clamp(14em, 16cqi, 24em)` — 14em until the row passes ~87em, then 16% of it | rails, lists, item pickers, an index |
| `hug` | its content, 6–24em | a rail whose own labels decide the number |
| *(none)* | 16em floor, ceiling `clamp(40em, 42cqi, 46em)` | the default — prose, a form, two columns of content |
| `large` | 28–64em | a grid, a table, wide content |
| `fill` | everything left over | the one page in the row that has something to spend it on |
| `full` | the whole host | one page at a time; the ancestors collapse into the crumb strip |

`full` is the "swap into the correct area" case. Its ancestors come back the moment you navigate
anywhere else — the crumb strip above the row is what you click.

⚠ **`full` does not touch the site's sidebar, and a probe that says it does is measuring the wrong
one.** Reported 2026-08-29 as "collapsed to 0×0", re-measured and closed: the site ROOT is a topic
with a sidebar of its own, so `document.querySelector(".sidebar")` finds *that* one first and it is
0×0 on every route except `/` — the arrangement contract has hidden its page. The real sidebar
holds **229 / 243 / 274px at 1280 / 1920 / 3440**, identical on a `full` column, on the finder root
with nothing open, on `/framework/`, and on a Doc page; the `full` column owns **1051 / 1677 /
3166** of its row. Stamping `page-column-full` on a *host's* own body — the one combination no page
ships — changed neither number. Take the visible one: `[...document.querySelectorAll(sel)].find(e
=> e.getClientRects().length)`.

**`fill` is `full` that lets its neighbours stay**, and the difference is two values. Both start
from a 100% basis; `fill` *shrinks*, so every column left of it keeps its floor instead of being
hidden, and it has a 16em floor of its own. There is no `:has()` rule for `fill` and there must
not be one — collapsing the ancestors is the whole of what makes `full` a different word.

⚠ **`fill` is for a page whose content is not prose.** It removes the ceiling, so at 3440 it hands
one paragraph a 2410px line — the [`layout`](/framework/styles/rules/) rule "widening a column is
never the fix for dead space" applies to it exactly. A grid, a table, a canvas, a preview wall:
those earn it. Prose does not, and has the default's 40em for that reason.

⚠ **`hug` needs its ceiling, and that is not a compromise.** `flex-basis: auto` on a column is
its **max-content** width, and the max-content width of a *paragraph* is the paragraph on one
line. So hug hugs a **list** — the rows are short and the widest one is the answer — and gives
prose a 24em note. A hug column that ships with a `content()` line is measuring the line, not the
list; the Finder's `Notes` rail has none for exactly that reason. Its 6em floor is
`Page.column_floor` said in `em`: the narrowest a *drag* may leave a column and the narrowest a
*word* may ask for are one number.

## `index` — a column whose cards ARE the nav

A column normally lists its children as rows under its prose. An **index** column has
already drawn them, as a `previews()` wall in its own `content()` — so the rows say the
same things a second time, once as cards and once as a rail.

```js
export default new Page({
    meta: import.meta,
    width: "large",
    index: true,                            // core leaves its row list out
    children: "left right both foot …",
    content(){ md("Ten app shells."); this.previews(); },
});
```

**Three pages had suppressed it by hand** before this word existed — `/imagine/shells/`
wrote the whole of `column()` out again (ten lines, identical minus the rows),
`/imagine/screens/` did it in CSS, and `/imagine/vary/` shipped the double list — all
three wear the word now (the tidy pass, later the same day). Measured on shells at 1280
and 1920: **10 rows + 10 cards → 0 rows + 10 cards**, and the page.js override became
one word.

It is a **field**, not a method — `nav:` would shadow `nav()` the way `opens` shadowed
`opens()` (below), and `rail:` is already four pages' own word (`overview/site`,
`overview/docs`, and two under `old/`). Grepping the consumer pages for the name is the
step that picked it.

⚠ **`index` is for a column that shows its children ANOTHER way, not for hiding them.**
A column with no wall and no rows is a dead end — the `×` and the crumb strip are the
only way on. `layout` Q4 is the test: *does the page show each thing exactly once?*

## Resize — drag the seam

Every column has a 6px seam at its inline end. Drag it and that column keeps the width you left
it at; **double-click it** and the page's word comes back.

The drag writes the **same three tokens the width words set**, one level stronger — an inline
custom property out-ranks a class — so there is no second mechanism and nothing to keep in step:

```
--page-column-flex: 0 0 374px;  --page-column-min: 0;  --page-column-max: none;
```

Measured (headless, the live Finder at 1920, the root `small` rail):

| gesture | before | after |
|---|---|---|
| drag right 150px | 224px | **374px** — the move exactly |
| drag left 120px | 374px | **254px** |
| drag left 300px | 254px | **96px** — `Page.column_floor`, the clamp |
| double-click the seam | 96px | **224px**, and the inline style is empty again |

The row's `scrollWidth` equals its `clientWidth` at every one of those steps: **the seam costs the
row nothing.** It is `flex-basis: 6px` with `margin-inline-start: -6px`, an outer size of zero
pulled back onto the column it resizes, so the arithmetic below is still nothing but the bodies.

- **Per visit.** Nothing is stored — reload and every column is back on its word.
- **It is a sibling of the body, not a child of it.** `.page.column` is `display: contents` and
  cannot host an event; the body is a scroller, so an overlay inside it would scroll out of view.
  `column_grab()` puts the seam between the body and the child region, where the row sees it.
- **Nothing to drag under 32em.** The row is already one column at a time down there.
- **The `×` never collides**: it sits one `--page-column-pad-x` (14px) further in, and the seam is
  the outer 6px. The seam *does* overlay the outer few px of a scrolling column's thin scrollbar —
  the wheel is the other way to move a column. (No probe on this repo can see that: headless
  Chromium has overlay scrollbars.)

## `default` — the column a host arrives with

A column browser showing only its own rail leaves **80–93% of the row empty** at 1280–3840
(measured below), and three of the seven recipe labs shipped that way. A host names the child
that opens on arrival with the word the arrangement contract already has:

```js
children: {
    Overview: { width: "large", classes: "default", content(){ … } },   // open on arrival
    Metrics:  { width: "large", content(){ … } },
}
```

`Page.default_column()` finds it and the host *builds* it — a page is only constructed when it
activates, so a mark alone would have nothing to show — and `Page.css` stands it down the moment
a real column is routed beside it. Nothing changes in the url: arriving at the host and clicking
that child give the same screen.

⚠ **`classes` is additive on a column**, where `render()` lets it replace a page's shape. A column
has no shape to choose, so a declared class can only be an extra — which is also what lets a
columns host be marked `default` itself and live in a panel it is never routed to.

⚠ **A default column is never routed to, so it never got an `app`.** `child()` is where a page
is handed the app, and nothing calls `child()` for a page the host builds itself — so
`this.app.router` inside a default column's content threw *"Cannot read properties of undefined"*
(`/imagine/screens/deck/`, 2026-08-29). `render_column()` now assigns `app` as it builds the
child, which makes it the **second** place the app is handed down. The general shape of this
bug: `add()` copies `app` at *declaration* time, when a `page.js` at module scope has none yet,
and only a later routing fills it in.

⚠ **A `default` column may not also be a PARENT you route into.** `Page.css` hides
`.page-column-pages:has(> .page:is(.active-page, .active-ancestor)) > .page.default`, and a
routed default page satisfies that test *itself* — the whole branch goes blank. Measured
2026-08-29 twice, from `imagine/gallery/lists` and from a team-board draft. Whatever must stay
visible goes **up** the tree, not across it.

## `bleed` — reaching the column's edge

A column's content sits in `.page-column-prose`, inset by the host's pad tokens —
`clamp(0.7em, 0.8cqi, 1.6em)` / `clamp(0.9em, 1.6cqi, 3em)` since 2026-09-01, so a wide row pads
generously and a narrow one keeps yesterday's constants; the crumb bar, every head and every item
row read the same `--page-column-pad-x`, one indent per row. Prose text (`p`, headings, lists,
`.md`) is also capped at `--measure` — a `full` column is not a license for a 3410px line; an
`.md` holding a table marks itself `.ac("wide")` to stand the cap down.
`table-equal` (`framework.css`) is the companion word for the table itself — `.ac("wide table-equal")` splits its columns evenly instead of by content.

⚠ **`bleed` is for PAINT** (the owner, 2026-09-01): a wash or a background image may butt the
column's edge. A framed box — a card wall, a figure, a table — or bare text never bleeds; the
padding study's own "CLOSEST REAL MISS" caption sat 0px from the viewport edge on a bled card
wall. A **picker list or a flush wash** wants the real edge, and the word
for that is the one the page shell already uses:

```js
content(){
    md("Pick one.");
    div.c("bleed flex v", () => items.forEach(item => button(item.from)));   // flush to the column
}
```

`.page > .bleed` spends the page grid's gutter tracks; `.page-column-prose > .bleed` spends the
column's inset. One word, two containers — and the inset is now the tokens
`--page-column-pad-x` / `--page-column-pad-y`, so nothing hand-types the number a second time.

⚠ **Direct child only.** A nested column's own prose is three levels down through
`.page-column-pages`, and a descendant selector would have it unpick its own inset.

⚠ **The block ends are cancelled only at the ends** (`:first-child` / `:last-child`). A bled block
between two paragraphs keeps its rhythm; the local hatch this replaced
(`examples/grids/grids.css`, `margin: -0.7em -0.9em`) cancelled both ends unconditionally and got
away with it only because it was always alone in its column.

## Measured 2026-08-29 (headless, the live page, 900 tall / 1400 at 3440)

⚠ Historical: measured before 2026-09-01, when `small` and the default ceiling became
row-scaled clamps (the table above) and the pad tokens moved to the host as `cqi` clamps —
at 3440 a `small` rail is now 432px, not the 252px below, and the default ceiling 46em.
The shape of the columns (who floors, who caps, who fills) is unchanged.

| viewport | row | `small` | `hug` | default | `large` | `fill` | `full` |
|---|---|---|---|---|---|---|---|
| 400 | 400 | 400 | 400 | 400 | 400 | 400 | 400 |
| 1280 | 1051 | 211 | 100 | 241 | 421 | 420 | 1051 |
| 1920 | 1677 | 224 | 107 | 410 | 1005 | 1005 | 1677 |
| 3440 | 3166 | 252 | 120 | 720 | 1152 | **2410** | 3166 |

Read the last two columns together — that is the whole of `fill`. At 1920 `large` and `fill` are
the same 1005px, because `large` has not reached its 64em ceiling yet and there is nothing else
asking. At 3440 `large` stops at its ceiling (1152) and leaves 1258px of empty slots; `fill` takes
**2410 = row − the three rails**, and the row is exactly the sum of its columns. `hug`'s numbers
are the Finder's two-row `Notes` rail measuring itself — they are that page's, not the word's.

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

⚠ **`column_host()` returns the SHALLOWEST columnar ancestor** — `chain().find(…)`, not
`findLast()` the way [`nearest()`](/framework/core/Page/doc/roles/) works. So a columns host
*inside* another one is not a host: its `columns()` call is inert and its subtree simply joins
the outer row. `/imagine/gallery/` calls `columns()` and is a plain column of `/imagine/`'s row.
**That is the current contract, not an oversight** — one row, one crumb strip, one scroller —
and a page that needs a row of its own escapes the tree instead (`imagine/shells/Shell.js`
overrides `container()` and `render()`; `demo.app()` is the only way to put a real row inside
one). Nested rows are open, and flipping to `findLast()` is not the whole of it: the crumb
strip, the `×` and `reveal_column()` all assume one host per screen.

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
- **A hover fill is chosen against the box it lands on, not from the palette's middle.** The nav
  rows carried `background: var(--tint)` and read as having *no hover at all* — in lew42 `--tint`
  (`#f8f8f8`) is LIGHTER than the `--wash` (`#f2f2f2`) a column body sits on, so the row lit up by
  six points in the wrong direction. A translucent `color-mix(in srgb, var(--ink) 6%, transparent)`
  cannot have that bug: it darkens whatever it is over, so one declaration covers the ambient body
  and the `--tint` / `--surface` recipe columns alike.
- **A `.pages` region squashed a columns host it was showing as `default`.** The region's
  presentation rule — a 40em cap, a 3em inset and `display: block` for a page with no layout of its
  own — computes to (0,4,0) and beat `.page.columns` (0,2,0) outright, so a host inside a panel lost
  its whole row. The rule is now split: the sheet half says `:not(.columns)`, and a host asks the
  region for a flex share and nothing else.

## The empty room — absorb was tried, and the answer is empty SLOTS

**The finding (UX recon, 2026-08-27):** a host that has opened one column leaves 80% of the row
grey at 1280 and **93% at 3840**, and a flat grey field reads as a page that failed to render.
Every columns host on the site arrived that way.

**"Let the last open column absorb the rest" was implemented and measured. It is a no.** The rule
was one selector — the leaf test below, negated, raising the leaf's `flex-grow` and ceiling — and
it does close the numbers (80–93% dead → 8–68%). It closes them by breaking the thing the width
words exist for:

| | before | absorbing |
|---|---|---|
| the Finder's `small` rail at 3440 | 252px | **1152px** — three nav rows with the chevron 900px from its label |
| the deepest prose column at 3440 | 720px | **1152px** — one sentence past the 40em measure |
| dead space at 3840 | 93% | **68%** — and the void is still the headline |

So it trades a measure it was told to keep for a void it does not close. `layout`'s own rule
already said it — *widening a column is never the fix for dead space* — and
`examples/grids/measure-3440` had measured the same trade on itself.

**Shipped instead: the leftover is drawn as the column slots it is.** One `repeating-linear-gradient`
of the row's own `--line` every `small` track, and an opaque `--wash` floor under the real bodies so
the hairlines cannot paint through them. Nothing moves, nothing is measured, no DOM: the screen says
*more opens here* instead of *nothing rendered*. A scrolled row has no leftover and never shows one.

The two real answers to a wide screen are unchanged and both are declarations: a wider **word**
(`large`, `full`) for a page that earns it, and a **`default` column** so the host arrives with
something open.

⚠ The body's fill is `:where(.page-column-body)`, at specificity **zero**, so every appearance
recipe out-ranks it with one class. Written at its own `(0,1,0)` it would have tied `looks.css`'s
`.page--tint > .page-column-body` on load order; written at the `(0,3,0)` it was first drafted
with, it silently erased all four backgrounds the `looks/backgrounds` lab exists to show.

## Open — the owner decides

- **Should a dragged width survive?** Resize is per visit today, which is the honest default —
  nothing is written, so nothing can be stale or wrong on the next machine. Making it stick needs
  three answers first: **what owns the width** (the page? the url you were on when you dragged it?
  the *slot* — "column 2 of this row", so it holds while you browse), **where** (`localStorage` per
  url is a line; the path-based store the imagine program is scoping is the other), and **how you
  get out of it** — a saved width that outlives the layout is a bug you cannot see, so a reset has
  to be reachable from the page, not just from the seam.
- **The `×`** on every non-host column closes it and everything right of it (href = the parent's
  url). Keep, or a plain head?
- **Should `default` cascade?** A `default` child that is itself a host opens *its* default too, so
  a tree could arrive several columns deep. Nothing does it yet, and nothing stops it.

Related: [`css.md`](/framework/core/Page/doc/css/) — the visibility contract this leaves alone;
[`layout.md`](/framework/core/Page/doc/layout/) — nested vs `full`.
