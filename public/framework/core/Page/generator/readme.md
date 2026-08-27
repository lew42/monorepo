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
wall large          <block> [width], indentation is nesting
  list small
    prose
  grid
tabs
```

**Block words** — `tabs vtabs rail wall grid flush list prose crumbs` — say how a page
presents its children. **Width words** — `small large full` — are core's own, stamped as
`page-column-<width>`. `prose` is the leaf: a page with no children is prose.

`gen(7)` is the same tree forever, in any browser, so a permutation is a link: the seed rides
in `#7` and every generated href carries it. **Type in the spec box** and your text is the
tree — and the address, carried whole as `#s=<encoded>`.

Which word may appear under which is `rules.js` — a multiplier per pair, above 1 encouraged,
below 1 discouraged, printed on the wall so you can argue with it. `gen(seed, { chaos: 1 })`
ignores the rules and draws what the flat table drew.

**The [permutation wall](/framework/core/Page/generator/rolls/)** is twenty-four rolls at once
— `#42` there means seeds 42…65 — each a small picture of its tree, each a link to that seed.

## Watch out

- **A seed is only an address against a fixed model.** Change a weight in `gen.js` or a number
  in `rules.js` and seed 7 is a different tree — the pairing rules moved all six proof seeds
  the day they landed. Keep a tree you like as its *text*.
- **A config that overrides `column()` must stamp its own width class.** `width: "full"` is a
  field nobody reads until something writes `.page-column-full`; core's `column()` ends with
  that line and so must yours.
- **A page's view is built when it activates**, so a generated child is invisible until
  something links to it — the host's own column draws that list.
- **Every generated href carries the seed.** `Router.go()` pushes `pathname + search + hash`,
  so a plain href drops it one level in and the reload rebuilds a different tree.
- The rest — a specificity trap, a colour that vanished, why the mulberry32 is copied and why
  `demo.tree()` was the wrong reuse: [`doc/decisions.md`](/framework/core/Page/generator/doc/decisions.md).

## More

- The arrangement is core's: `page.columns()`, `width:`, `.page-column-*` —
  [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md).
- Files: `gen.js` (seed → text), `rules.js` (which word under which), `tree.js` (text → page
  configs), `rolls.js` (the wall, and the tile picture), `page.js` (the controls),
  `generator.css` (one picture per word, twice — at column size and at 3px).
- Not built, on purpose: a chaos dial on the page (chaos is an argument to `gen()`, so `#7`
  keeps meaning one tree), and any rule about which *widths* pair — only blocks have rules.
