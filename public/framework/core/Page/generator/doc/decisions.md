# Generator — the record

Built 2026-08-26 as S3 of the column-pages run
([design.md §5](/framework/ai/2026-08-26/column-pages/design.md),
[task](/framework/ai/2026-08-26/page-generator/)).

## The mechanism: nested POJOs, not a mini app

`ext/demo`'s `demo.tree()` also renders a virtual page tree, and it was the obvious thing to
reuse. It is the wrong one: `DemoApp` **plays Router** — it hijacks clicks, walks `child()`
itself, marks what it shows with `.default`, and the browser url never changes. A generator
whose whole point is that Router navigation, `active-ancestor` show/hide and columns work
*for free* cannot start by replacing the Router.

The reusable piece was one rung lower. `Page.declare()` already accepts an array of plain
objects and `add()` builds a real `Page` per entry, recursing into its `children`. So a
virtual tree is a **data structure**, not a machine, and `tree.js` emits it. Nothing new was
written to make the tree real.

Each generated config overrides exactly two methods — `column()` (its picture) and `link()`
(the same url, carrying the seed). Everything else is stock `Page`.

## The DSL deviates from space's, deliberately

`styles/layouts/space/spec.js` reads `<class tokens> > <part> [count]`, because a line there
is a **box** with classes and a payload. Here a line is a **page**, and a page has no class
list to carry — it has one word for how it presents its children and one for how wide its
column is. So the line is `<block> [width]` and there is no `>`. Indentation is nesting in
both; the parser is the same eight lines.

## mulberry32 is copied, not imported

`space/draw.js` opens `import { ROLES, PARTS_ALL } from "./model.js"` — it is not
dependency-free. Importing it would drag space's box vocabulary into `core/`. Ten lines of
mulberry32 are cheaper than the coupling, and the two generators stay independently
retunable.

## The columns seam

design.md split this task from S1 (core columns) and named the width words `small` /
`large` / `full`. S1 landed while this was building, and landed something better than the
brief described:

- `page.columns()` on the host is the whole opt-in; `render_column()` / `column()` draw the
  body, the crumb strip and the reveal.
- The width words are stamped from a page's own `width:` field as
  `.page-column-small` / `-large` / `-full`, driven by `--page-column-flex/min/max` tokens —
  **not** bare `.small` / `.large` / `.full`.

This module was rewritten onto that API and now restates none of the arrangement. A scoped
copy of the five column declarations had been written first (against the demo's stylesheet,
before core owned them) and was deleted: two sets at the same specificity are decided by
stylesheet order, and the copy silently lost a `min-width` to the original.

The control column takes its size the same way a width word does — by declaring
`--page-column-flex/min/max` on itself. A token needs no specificity to win.

## Two traps, both measured

**A base rule out-ranking its own variants.** The stack rule was
`.page--generator .page-column-body { display: flex; flex-direction: column }` at (0,2,0),
and the per-word rules were (0,1,0). `vtabs` and `rail` ask for `flex-flow: row wrap`, lost
the direction half of it, and their `flex: 0 0 100%` head became a full-**height** one — the
column rendered with its nav in the top right and its title at the bottom left, and nothing
threw. Fixed by giving every generated body its own `.page-gen` class so base and variants
sit at the same specificity and file order decides.

**A placeholder that painted nothing.** The filler bars were `--wash`. Core paints the whole
columns host `--wash` and leaves the bodies transparent, so every bar was invisible on it —
the same shape of mistake `--well` made on `/framework/ux/*`. They are `--line` now.

## v1 scope, and what was cut

Shipped: a seed control (step, dice, typed), the spec string visible, the live tree, `#seed`
addressability, and the reproducibility proof drawn on the page — `gen(seed)` is run a second
time on every repaint and the two strings compared, because a seeded generator that cannot
prove bit-identical output on unchanged inputs is not an address.

Cut, and worth doing next: a **permutation wall** (space's twelve-at-once, each tile a tiny
tree), a **typed spec** (the parser already accepts one — only the textarea is missing), and
a **chaos dial** like space's. Also unbuilt: any rule about which block words work well
*together*, which is the question the wall exists to answer.

# Wave 2 — the wall, the typed spec, the rules

Built the same day ([task](/framework/ai/2026-08-26/generator-wall/)), on top of everything
above. All three of v1's cuts, and the question underneath them.

## The rules are DATA, and they moved every seed

`rules.js` is one table: `PAIRS[parent][child]` is a **multiplier** on the child word's base
weight, with a one-line note per row. The roller consults it, and the wall prints it — a
weight nobody can read is a weight nobody can hone.

This is a **deliberate change to what a seed draws**, and the module's own law says to name it
rather than let it be discovered. Measured before and after in node, seeds 0 / 1 / 7 / 42 /
1234 / 999999: **all six moved.** Three are the same length and every word inside differs —
seed 0's second child is `list small` where it was `tabs small` — which is exactly why size is
not proof and the strings are pasted in the task log.

What did **not** move is the draw sequence: `pick()` consumes one `next()` whatever the
weights say, and the table it is handed has the same keys in the same order. So
`gen(seed, { chaos: 1 })` is byte-for-byte the pre-rules output — diffed on all six seeds,
zero differences. The old trees are reachable, as an argument rather than an address.

**What that costs, concretely.** Wave 1 landed
`/framework/core/Page/generator/tabs/rail/crumbs/#1234` as a link. Under the rules that path
does not exist — seed 1234's third level is `rail` where it was `crumbs` — so the url 404s,
exactly the way `…/generator/zzz/` does, and core's 404 takes the whole page (both measured
cold, 2026-08-26). The same tree is at
[`…/generator/tabs/rail/rail/#1234`](/framework/core/Page/generator/tabs/rail/rail/#1234),
and the wave-1 tree is still what `gen(1234, { chaos: 1 })` draws. **A deep generated url is
a link into one model — when a weight changes, re-derive it; nothing here repairs it for
you,** and nothing should: a generated page that claimed unknown child names would swallow
real 404s for the sake of stale ones.

`chaos` is deliberately **not** on the page. A dial would make `#7` mean two trees, and the
whole module rests on `#7` meaning one.

## A tile is a picture, not a page

Twenty-four live trees would be twenty-four subtrees of real `Page`s, mounted, marked and
routed, to show something the size of a stamp. So `rolls.js` draws instead: `gen(seed)`,
`parse()`, and one nested `div` per line, arranged by its own word — the nine word rules a
second time, at 3px. Verified 24 tiles / 24 distinct pictures at 1920.

Two names earned their way in:

- **`rolls`, not `wall`** — a generated page is named after its block word and `wall` is one of
  the nine; two children of one name and only the last survives.
- **`grow()` adds it first, every time** — `grow()` replaces `children` wholesale, so a stable
  child has to be re-added on every reroll or the wall disappears on the first dice roll.

Paging (`‹ ›`) repaints the tiles in place and `replaceState`s the url. No page is rebuilt and
the Router is not involved, because a tile is only a drawing — which is also why the first
paint must NOT write the url: it runs during render, before the navigation that is landing
there has written its own.

## The trap: an overridden `column()` drops the width class

`width: "full"` did nothing. Core's `column()` ends with
`.ac(this.width && "page-column-" + this.width)` and `tree.js` copies that line; the wall's
`column()` did not — so nothing ever wrote `.page-column-full`, the `:has()` rule that stands
the ancestors down never matched, and the wall rendered inside a 40em column: **639px wide,
three tiles a row at 1920**. With the line, 1675px and eight a row. A field is not a
behaviour; the class is the behaviour.

## A typed spec is addressed by its own text

The parser always took a string, so the spec is now a `textarea` rather than a `pre` — the box
you read it in is the box you write it in. A typed tree has no seed, so its **text is the
address**: `#s=<encodeURIComponent(spec)>`, decoded in `land()` before anything renders, and
carried by every generated href through the one `hash()` method. Round-trip and cold reload
both verified.

Two small ones: a textarea's value is not its `textContent` (`.text()` writes the *default*
value and is ignored once a human has typed — `el.value`, always), and framework.css's base
layer gives every textarea `width: 100%`, which with inline margins is 1.6em wider than its
column (`width: auto` on the rule).

## Wave 2's own cuts

A chaos dial on the page (above); pairing rules for the **width** words (the ask is about
layouts working together, and widths are a track, not a layout); a wall of *typed* specs (the
wall rolls seeds, and a typed spec has no neighbours to roll).
