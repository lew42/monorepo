# Generator — pages without the filesystem

A seed draws a **spec string**; the spec builds a **real page tree** under this url. Real
urls, the real Router, the real `active-page` contract, core's columns — all of it, and not
one file on disk. It is [`styles/layouts/space/`](/framework/styles/layouts/space/) one level
up: there a line is a box, here **a line is a page**.

Live: [`/framework/core/Page/generator/`](/framework/core/Page/generator/) — a top tab on
core/Page.

## Use

```js
import { gen } from "./gen.js";
import { tree } from "./tree.js";

this.children = new Map();
tree(gen(7), "#7").forEach(config => this.add(config.name, config));
```

That is the whole mechanism. `children:` already takes nested plain objects and `Page.add()`
turns each into a real `Page`, recursively — so a virtual tree needs no new machinery.

The spec:

```
wall large cols=3   <block> [width] [key=value …], indentation is nesting
  list
    prose
  tabs
vtabs
```

**Five block words**, and every one says **where a child goes when you pick it**:

| word | picking a child | looks like |
|---|---|---|
| `wall` | opens a NEW column, right | cards, each with a peek at the page behind it |
| `list` | opens a NEW column, right | an inbox — previews left, the detail beside them |
| `prose` | (the leaf — no children) | the page itself |
| `tabs` | swaps IN PLACE, same column | a strip over a panel |
| `vtabs` | swaps IN PLACE, same column | a rail beside a panel |

**Width words** — `small large full` — are core's own, stamped as `page-column-<width>`. An
in-place child never gets one: it lives in a panel, and a width word is a track in the *row*.

`gen(7)` is the same tree forever, in any browser, so a permutation is a link: the seed rides
in `#7` and every generated href carries it. **Type in the spec box** and your text is the
tree — and the address, carried whole as `#s=<encoded>`.

A word the box does not know still draws — as `prose`, the leaf — but the line under the box
now names it (`not recognised, becomes prose: widget`), inline and quiet, so a typo teaches the
vocabulary instead of silently swallowing it.

## The controls

Every column head carries **its own two words as menus** — switch a page from `tabs` to `list`
and watch its children stop swapping in place and start opening a column. A `wall` or a `list`
also gets a chip row for its arrangement, and the generator's own header sets the defaults for
the whole tree:

| where | control | writes |
|---|---|---|
| any column head | kind · width `default small large full hug fill` | the spec line: `list large` |
| a `wall` / `list` | flow `grid`/`flex` · cols `auto 1 2 3` · gap `snug flush airy` | the spec line: `cols=3 gap=0px` |
| the header | size `small default large hug fill` · gap · look `finder cards ink` | tokens on the host: `--page-column-*`, `--gen-gap`, and one `page-gen-look-*` class |

**A control edits the SPEC, never a live column** — so a switched tree is a link (`#s=…`), a
reload lands on it, and the box shows you the text you just wrote by clicking. The seed is
never touched: `#7` still means one tree, and the reproducibility line goes on proving it.

**The header's three are not the spec, and not the address.** `size`, `gap` and `look` are how
you like a tree *dressed*, so the split is: **the url carries the tree, `store()` carries the
dressing** — plus the last tree, for an arrival with no hash at all. A link someone sent still
wins; the store is only read when the address names nothing.

The copy icon beside the seed stepper takes the address (`hash()`, whole) — a click, a beat of
confirmation, nothing typed.

## The three looks

`look` is [`/imagine/vary/colstyles/`](/imagine/vary/colstyles/)'s answer — a columns tree can be
re-dressed without being rearranged — worn by a tree that was never built. `finder` is the
shipped default and has no rule; `cards` floats every column on a `--wash` row; `ink` goes dark.

Ink is the one worth reading, because it is **five tokens on the body, not a rule per part**:
everything a generated column draws is already written in `--line` / `--tint` / `--surface` /
`--ink` / `--subtle`, so redeclaring those redresses the bars, the chips, the media stand-ins,
the item colours and the sketches at once. The rules are `generator.css`'s own, not colstyles' —
`core/` may not import from `/imagine/`, and half of that stylesheet would miss anyway
([`doc/decisions.md`](/framework/core/Page/generator/doc/decisions.md)).

The arrangement chips write **framework words** — `.grid.auto` / `.flex.auto` / `.gap` and the
`--column` and `--gap` they read (`framework.css`), so what you learn here transfers to any
page. `cols=3` is `--column: calc((100% - 2 * var(--gap)) / 3)`; `gap=0px` is the cut `flush`
word as the number it always was.

Which word may appear under which is `rules.js` — a multiplier per pair, above 1 encouraged,
below 1 discouraged, printed on the wall so you can argue with it. `gen(seed, { chaos: 1 })`
ignores the rules and draws what the flat table drew.

**The [permutation wall](/framework/core/Page/generator/rolls/)** is twenty-four rolls at once
— `#42` there means seeds 42…65 — each a small picture of its tree, each a link to that seed.

## The spec gallery

A seed is an address against one `MODEL`, and every model bump redraws every seed — so a tree
worth keeping is kept as its **text**. [`specs.js`](/framework/core/Page/generator/specs/) is
where: eight page shapes that are real things — a docs site, an inbox, a settings rail, a shop —
as a wall of the same sketches the permutation wall draws, each with a sentence saying what it
is for. Pick one and it becomes the tree; the address turns into `#s=<the text>`.

**"Yours"** is the same idea for a tree of your own: name the box below the eight and it joins a
band underneath them, kept in the same `store()` the header's dressing already lives in — no
second key, and a reload survives it. A ⨉ on your own card removes it; the curated eight have none.

It is a **list, not a generator**: nothing there is seeded, so nothing there moves when `MODEL`
does. Adding one is one entry in `SPECS` — `{ title, note, spec }` — written in the same five
words the roller draws and the controls edit.

## Export — the tree, as files

The button under the spec box writes the tree you are reading to disk: **one directory per
page**, each with an ordinary `page.js`, under
[`/imagine/generated/<name>/`](/imagine/generated/). Nothing in there imports anything from
here — it is a module like any other, and you edit it like one.

```js
// /imagine/generated/seed-7/vtabs/wall/page.js
import { Page } from "/app.js";

// A wall of cards; picking one opens a column to the right.

export default new Page({
	meta: import.meta,
	title: "Queue",
	index: true,

	children: "prose list",

	content(){ return this.previews(); },
});
```

Each word writes what the next section writes by hand: `wall` is `previews()`, `list` is
**nothing at all** (core's column already draws children as rows, which is what an inbox is),
`prose` is a line of `md()`, and `tabs` / `vtabs` are `ext/tabs`. `cols=` and `gap=` become
`--column` and `--gap`; `flow=` has no page.js form and is dropped.

**Dev only, by design.** The writer is the dev server's `rpc:write`, so on the static site the
button is disabled and says why — the rest of the page is untouched. A name that already exists
is **refused**, never overwritten: an export is a scaffold you are meant to edit, and deleting
the directory is how you say you meant it.

## The four words that were cut, and what to write instead

`grid`, `flush`, `crumbs` and `rail` changed how the child links *looked*; not one of them
changed where a child went. A shape with no behaviour is a **pattern**, not a word — so here
they are, as the `new Page()` you would actually write.

**A denser wall** (was `grid`) — `previews()` already draws the cards; the cell is a token:

```js
new Page({ meta: import.meta, title: "Icons", children: "…",
	content(){ return this.previews().style("--column", "8em"); } });   // a wall's default is 14em
```

**The same wall, no gaps** (was `flush`) — one more token:

```js
content(){ return this.previews().style({ "--column": "8em", "--gap": "0" }); }
```

**A trail** (was `crumbs`) — core derives it from `chain()`, so it cannot be wrong, and a
columns host already draws one above the row:

```js
content(){ this.crumbs(); md("…"); }
```

**A side rail of sections** (was `rail`) — this is `ext/tabs` turned on its side, and it is
where the generator's `vtabs` came from:

```js
import "/framework/ext/tabs/tabs.js";        // once, anywhere in your app

new Page({ meta: import.meta, title: "Guide", children: "intro api faq",
	content(){ return this.tabs().ac("vertical"); } });
```

Inside the generator itself, a denser wall is `--gen-cell` on `.page-gen-wall`.

## Watch out

- **A seed is only an address against a fixed MODEL.** `gen.js` exports the number and the
  page prints it. v1 → v2 (2026-08-27) and v2 → v3 (2026-08-29, `small` reweighted rare) each
  moved **all six** proof seeds — keep a tree you like as its *text*, not as `#7`.
- **A config that overrides `column()` must stamp its own width class.** `width: "full"` is a
  field nobody reads until something writes `.page-column-full`; core's `column()` ends with
  that line and so must yours.
- **A page's view is built when it activates**, so a generated child is invisible until
  something links to it — the host's own column draws that list.
- **Every generated href carries the seed.** `Router.go()` pushes `pathname + search + hash`,
  so a plain href drops it one level in and the reload rebuilds a different tree.
- **A word rule must select `> .page-gen-nav >`.** A tab's page now renders *inside* its
  parent's column, so a descendant selector dresses a grandchild as its grandparent.
- **A bare `0` in a token is not a length.** `gap=0` makes `calc(100% - 1 * var(--gap))`
  invalid at computed-value time, which throws away `--column`, which throws away
  `.flex.auto`'s whole `flex` shorthand. Three cards shrank to 62px, silently. `0px`.
- **A global cannot reach a component that DECLARES the token** — `--gap` on the host loses to
  `--gap` on the nav at any distance. A global arrives as the *fallback* (`var(--gen-gap, …)`),
  which is the one indirection `--gen-list` and `--gen-gap` exist for.
- **A look's class does not travel with the look.** Adding `vary-colstyles-look-ink` to this
  host changes nothing measurable: that stylesheet is only loaded under `/imagine/`. Loaded by
  hand it *does* dress the row, bodies, heads and titles — those read core's own class names —
  but never an item, because a generated column draws `.page-gen-item` and colstyles styles
  `.page-column-item`. Measured; the numbers are in
  [`doc/decisions.md`](/framework/core/Page/generator/doc/decisions.md).
- **A look must be (0,4,0).** Core's body rule is `.page.columns .page-column-body`; a plain
  `.page-gen-look-x .page-column-body` ties it and stylesheet order decides. Restate
  `.page.columns` — colstyles paid for this one first.
- **An in-place page whose child opened a column went `display: none`.** Core's arrangement
  rule shows an ancestor only if the active page is *inside* it; a tab's child mounts out in
  the row. Worked around in `generator.css` (`@layer util`) — the core hook is named there.
- **An export is a READ of the live tree**, never a second draw — so what lands on disk is what
  was on screen, and no seed is re-rolled. `flow=` is the one spec setting with no page.js form;
  `--column`'s gap fallback is `1em` there and `0px` here, and reusing the wrong one silently
  drops a three-card wall to two.
- The rest — how "in place" is two lines of `container()`, a specificity trap, why
  `demo.tree()` was the wrong reuse, how a control edits the spec, and both halves of the
  dev-only gate: [`doc/decisions.md`](/framework/core/Page/generator/doc/decisions.md).

## More

- The arrangement is core's: `page.columns()`, `width:`, `.page-column-*` —
  [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md).
- Files: `gen.js` (seed → text, and `MODEL`), `spec.js` (the text format — parse, read a line,
  edit one node), `rules.js` (which word under which), `tree.js` (text → page configs, and
  where a child mounts), `controls.js` (every control, and the framework words behind them),
  `fill.js` (the seeded-distinct content), `rolls.js` (the wall, and the tile picture),
  `specs.js` (the eight kept shapes, and the gallery), `export.js` (the tree → files, and the
  shape of every exported page), `page.js` (the header, the store split, and the one place the
  tree is replaced), `generator.css` (one picture per word, twice — at column size and at 3px —
  and the three looks).
- Not built, on purpose: a chaos dial on the page (chaos is an argument to `gen()`, so `#7`
  keeps meaning one tree), any rule about which *widths* pair (only blocks have rules), the
  header's own settings in the address (`#7` has to keep meaning one **tree**; how wide you
  like your columns is not the tree), a delete control for an export (that is `rm` on a
  directory somebody may have edited), and reading files back into a spec.
