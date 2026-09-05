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

# Wave 3 — the words become behaviours (MODEL v2, 2026-08-27)

Built from the owner's critique of wave 2
([the ask](/framework/ai/2026-08-27/column-pages-2/requirements.md),
[task](/framework/ai/2026-08-27/gen-semantics/)). Five notes, and every one of them said the
same thing from a different side: **the vocabulary was describing pictures, not behaviour.**

## The test a word has to pass

> *"i'm not sure we even need codified structures for some of these... the question of 'what
> goes where' could be exemplified as simple `new Page()` patterns."*

So: **a word earns codification when it changes WHERE A CHILD GOES.** Nine words became five.

| kept | because |
|---|---|
| `wall` | a child opens a new column; the cards are how you pick |
| `list` | a child opens a new column, and the picking column shows *previews* — an inbox |
| `prose` | the leaf: no children, so nothing to place |
| `tabs` | a child lands INSIDE this column, under a strip |
| `vtabs` | the same, beside a rail |

| cut | it was |
|---|---|
| `grid` | a `wall` with a smaller cell — `--column: 8em`, which is a number |
| `flush` | a `wall` with no gap — `--gap: 0`, which is a number |
| `crumbs` | a strip, never a level; core already derives one from `chain()` |
| `rail` | the owner: *"the rail is just a slightly different vtabs"* |

Each cut word is four lines of `new Page()` in [readme.md](/framework/core/Page/generator/readme/),
written against the REAL api (`previews()`, `crumbs()`, `tabs().ac("vertical")`) rather than
against anything in here — which is the point: they were never generator concepts.

`rail`'s *idea* survived, promoted. The owner: *"the concept of a rail is more like... a list?
like an inbox layout, where you have smaller previews on the left, and when you select one, it
launches the detailed view on the right."* That behaviour is **the columns mechanic already** —
a narrow column whose rows are previews, and a detail opening to the right. So `list` became
the inbox and no new machinery was written: it is `.page-gen-item` with a peek, plus a width.

## "Switch in place" is two lines of `container()`

The hard one. `Page.container()` hands a child to the nearest ancestor's `$pages`, which is a
**sibling** of that ancestor's column body — so `display: contents` floats it out as the next
column in the row. Every word behaved that way, tabs included, and picking a tab grew the row.

`ext/tabs` solves this with `regions`: `container()` checks `this.parent.regions.get(this.name)`
first. A generated config cannot fill that map before its parent has rendered, so it overrides
`container()` instead — the same seam, said directly:

```js
container(){
	if (inplace(this.parent) && this.parent.$panel) return this.parent.$panel;

	for (let page = this.parent; page; page = page.parent)
		if (page.$pages && !inplace(page.parent)) return page.$pages;

	return Page.prototype.container.call(this);
}
```

Line one is the tab. **Line two is the one that is easy to miss:** a tab's own children would
otherwise mount into the tab's `$pages`, which is *inside* the panel, and a grandchild would
render stacked under the tab's content instead of opening a column. The loop walks past any
page that is itself in a panel, to the nearest one that still owns a slot in the row. Measured
at 1280: `/tabs/list/` is 2 column bodies, and clicking a preview inside that tab is 3 — the
new column lands to the right of the tab set, which is what it should mean.

Two supporting decisions:

- **An in-place child is not `.page-column-body`.** That class is what core *sizes* — a 40em
  cap, its own scrollbar, a rule down its right edge, a snap point. Content inside somebody
  else's column is none of those, so it wears `.page-gen-inline` and takes the panel's width.
  Its width word is dropped in `gen.js` *and* in `tree.js`, so the roller and a typed spec
  cannot disagree about what the word can mean.
- **The page's own content lives in the panel too**, and steps aside when a tab arrives — one
  `@layer util` rule, `ext/tabs`' own trick on `.tab-panel`. So a tab set with nothing selected
  is never a blank box, and no default child has to be rendered to avoid one.

Core's verdict *"columns and tabs — do not"* ([doc/columns.md](/framework/core/Page/doc/columns.md))
is about a `.block` tab strip **above** a full-height row, whose open tab's bottom edge the row
cuts through. This strip is **inside** one column and never touches that seam.

## Distinct siblings: a key per page, from its place in the spec

> *"adding one of each to any page results in the parent rendering its own unique navigation,
> however each child appears identical."*

Every config now carries `key` — `(parent_key * 31 + index * 131 + word.length * 7 + arity)`,
run through the same mulberry32. `fill.js` draws *everything* from it: the page's name (from a
20-word list, deduped **per sibling list** so a strip of tabs reads as different words), how
many groups, which kind (a headed run of lines / a picture / a row of chips), how many lines,
and how wide each one is. An inbox row and a wall card also get a `peek()` — a line or two of
the page behind the link, off an **offset** stream, because a preview that is the first lines
of the content is a duplicate, not a preview.

The key is a function of the **spec text**, not of the seed, which buys two things: a typed
spec gets distinct children although it has no seed at all, and the same spec twice is the same
page twice down to the last bar.

Two shapes draw no filler, on purpose: `list` (its rows *are* the page — grey bars under the
last message read as a broken column), and any nav word with no children, which shows its
**empty state** instead. `gen()` never draws that, but a typed spec can, and the owner asked
for it to be honest rather than invisible.

## Every seed moved, and the model number says so

`MODEL` is exported from `gen.js` and printed beside the seed on the page: *"seed 42, model v2"*.
Measured in node, v1 vs v2, seeds 0 / 1 / 7 / 42 / 1234 / 999999: **6 of 6 moved, and all six
kept their exact line count** — the draw sequence is untouched (one `pick()` per node either
way, and the width pick is drawn-then-discarded under an in-place parent rather than skipped),
so only *which word* each pick lands on has changed. Seed 7 was `flush small / list / …` and is
now `vtabs small / wall / …`.

As in wave 2: **a deep generated url is a link into one model.** Wave 2's
`…/generator/tabs/rail/rail/#1234` does not exist under v2 and 404s; nothing here repairs a
stale one, and nothing should.

`PAIRS` is four rows now instead of eight — only the words that can *have* children. `prose` is
the leaf and never parents anything, and a pattern is not a word, so there is nothing left to
weigh it with.

## Three traps, all measured

**A flex line is only as tall as its tallest item.** `vtabs` was a `flex-flow: row wrap` with a
100%-wide head, and the rail's dividing rule stopped where the panel's text ran out — the column
looked half-drawn. It is a two-row grid now (`grid-template-rows: auto minmax(0, 1fr)`), and
`minmax(0, …)` not `1fr`, or the panel keeps its content minimum and squeezes the rail.

**Two `margin-inline-start: auto` SPLIT the free space.** The head's new word chip and core's
`.page-column-close` both claimed it, and the chip floated to the middle of the head.

**A headless probe that writes its screenshots into `public/` reloads the page it is probing.**
The dev server watches the tree, so every `shot()` fired LiveReload and the next click landed on
a page mid-reload: column counts came back `[]` at 1920 and 3440, intermittently, with **zero
console errors**. It reads exactly like a routing bug. Shots go in the session scratchpad and
are copied into the task dir at the end.

## Wave 3's cuts

The palette band on core/Page kept all 29 cards — the four cut words moved from *Building
blocks* down to *Recipes*, where a composed shape belongs, and `columns` moved up to keep the
first band at six (`browse()`'s grid stretches a band under six). Their demo pages under
`core/Page/overview/` are untouched: the words stopped being generator vocabulary, not
framework shapes.

Not done, and worth naming: `wall` and `list` still differ only in how they *present* the pick,
so a stricter reading of the rule would merge them and make "previews" a token. The owner asked
for the inbox by name, so it is a word — but that is the next thing to argue about.

# Wave 4 — the controls (2026-08-27)

Built the same day as wave 3, on top of it
([the ask](/framework/ai/2026-08-27/column-pages-2/requirements.md),
[task](/framework/ai/2026-08-27/gen-controls/)). Three lines of the owner's note: *"let's add
ui controls to switch any page to any other page"*, *"create ui controls for grid and flex
control: size, number of columns, whatever — study the flex/grid css utilities"*, and *"add
some controls to the generator's page's header, to control size, or whatever"*.

## A control edits the SPEC, and nothing else

The tempting build is a control that writes a class onto the live column. It would work until
the first regrow, the first reload, or the first time someone tried to send you what they were
looking at.

So there is one rule and `spec.js` is it: **a control rewrites one line of the spec text**, the
generator regrows from that text, and the address carries the text. Everything follows.

- A switched tree is a **link** (`#s=<encoded>`), a reload lands on it, and the box shows you
  the text you just wrote by clicking a chip. Verified at 1280 / 1920 / 3440: the spec shown
  and the spec parsed back out of the url are the same 14 lines after every switch.
- A control cannot reroll, because it never calls `gen()`. `MODEL` stays 2, the seed is
  untouched, and `gen(seed) === gen(seed)` still holds on all seven proof seeds. What a switch
  does change is that the tree stops being `#7` and starts being its own text — which the proof
  line already knew how to say.
- The line grammar grew a third part: `<block> [width] [key=value …]`. `gen()` never writes a
  setting, so every old spec parses unchanged, and `read()` / `write()` are one pair.

**Indices, not names.** `edit(text, at, change)` addresses a node by its position, because a
generated page is *named* after its block word: switching `list` to `tabs` renames it and every
url under it. The same index path is what `place()` captures before a regrow and `resolve()`
turns back into a url after one — so a switch three columns deep leaves you reading the same
column, one word different, instead of back at the host.

## The grid and flex controls are framework words

`--gen-cell` was the generator's own token for a wall's cell. It is gone. The nav wears
`grid auto gap` (or `flex auto gap`) and the chips write `--column` and `--gap` —
framework.css's own vocabulary, so what a reader learns here is true on any page of the site,
and swapping grid for flex needs no rule of ours at all.

⚠ The old `grid-template-columns` restatement had to be **deleted**, not out-specified:
`.grid.auto` is `@layer util` and beats a component's `@layer theme` rule at any specificity.
Two sets would not have disagreed — ours would simply never have painted.

`cols=3` is `calc((100% - 2 * var(--gap)) / 3)`: exactly three tracks, because `auto-fit` fits
three and cannot fit a fourth. `cols=9em` is a floor, which is what `--column` means everywhere
else. Same token, both readings, one `track()`.

Two globals were measured and thrown away:

- **A cell size is a no-op.** `.grid.auto` is `auto-fit`, which collapses empty tracks and
  stretches what is left — three cards fill their column at `--column: 8em` and at `20em` alike
  (`321px 321px 321px` both times).
- **A count is off by one.** The track is `(100% - gaps) / n`, and a custom property is computed
  on the element that declares it — so on the host, `var(--gap)` is the *host's* gap, not the
  nav's. `cols 2` rendered one column, `cols 3` rendered two. A count has to be computed where
  the gap is, which is exactly what the per-column chips do.

The header's second global is **gap**, through the same one-token indirection `--gen-list` uses:
each word declares `--gap: var(--gen-gap, …)`, so the host can reach past a component default
that plain inheritance loses to. **A global has to arrive as the fallback, never as the value.**

## The header's four sizes, and `fill`

`size` writes core's own `--page-column-min/max` on the columns host — a token needs no
specificity, and every column that names no width word of its own takes it. Measured at 1920:
the default track moves 256 / 320 / 416px across `small` / `med` / `large`.

`fill` is the exception that needed a **rule**: a width word declares its ceiling on its own
element (`.page-column-large { --page-column-max: 64em }`), and no inherited token reaches past
that. At 3440 a `large` column sat at 1152px with 1256px of the row empty beside it. So `fill`
also stamps `.page-gen-uncapped` on the host, and one (0,2,0) rule uncaps every open column —
`:not(.page-column-full)` because `full` claims the row by its own means, and
`:not(.page-gen-controls)` because the control column is a deliberate 22em.

Row usage with only the auto-opened first root: **34% → 100% at 1920, 20% → 100% at 3440.**

⚠ And with ONE column open at 3440, `fill` is a 2768px reading column — which is the 40em cap
demonstrating why it exists. `fill` is worth its chip because it is the answer when three
columns are open on a wide screen; it is a control, not a recommendation, and the page lets you
see both.

Deliberately **not** in the address. `#7` has to keep meaning one tree, and how wide you like
your columns is not the tree — the same reason `chaos` is not on the page.

## Four things the ux recon found, and what each one was

The sweep ([task](/framework/ai/2026-08-27/ux-recon/)) ran against a mid-edit snapshot, so every
finding was re-measured before it was believed.

**#1, the blank panel — real, and it is core's rule reading this shape wrong.** Page.css's
arrangement contract is
`.page:not(.active-page, .active-ancestor:has(.page.active-page), .default)`: an *ancestor*
shows only if the active page is somewhere inside it. A tab's page is inside the panel; its own
child mounts out in the **row** (`container()` walks past any page that sits in a panel). So
`tabs > list > leaf` left the list marked `.active-ancestor` with nothing under it —
`display: none`, 0px wide, a strip of tabs over an empty box, and no console error. Measured
before and after a scoped override: **0 → 507px**.

It is worked around locally, in `generator.css`'s `@layer util`, at (0,5,0) — the core selector
computes to (0,4,0), since `:not()` and `:has()` each take their most specific argument, and a
tie in the same layer would be settled by stylesheet order. **The core hook wanted:** that guard
should also pass an ancestor whose active descendant moved to another region.

**#2 / #6, near-identical children — does not reproduce.** Five sibling `prose` pages under one
`list`, measured: 5 of 5 distinct in title, group count, group kind and every bar width.
`fill.js` is fully wired.

**#7, the blank media box — real.** `--tint` is 3.5% of ink and the host is painted `--wash`, so
an empty tinted rectangle read as a failed render rather than as a stand-in picture. It carries
an `image` glyph now.

**#5 and #3, dead space — real.** The 24-tile wall was pinned by `aspect-ratio: 4 / 3` on the
sketch, so the tiles sat in a strip whatever height the row had: **~30% of the row at 3440**.
The tiles claim the height now (`flex: 1 1 auto`, `grid-auto-rows: minmax(8em, 1fr)`) — **69% at
3440, 79% at 1920, 87% at 1280**, the rest being the printed rules table. And a columns host
with nothing open is one 22em column and a screen of grey, so the first root **opens itself,
once per load** — once, because a page that re-opened whenever it became active would make Back
unusable.

## Two bugs the build found in itself

**A bare `0` is not a length.** `gap=0` put a plain number in `calc((100% - 1 * var(--gap)) / n)`
— a percentage minus a number, invalid at computed-value time, which throws away `--column`,
which throws away `.flex.auto`'s whole `flex` shorthand. Three cards fell to 62px with nothing
in the console. Any bare number is given `px` now.

**The content key contained the block word.** `key = seed*31 + at*131 + word.length*7 + arity`,
so switching how a page presented its children also renamed it and redrew every bar inside it —
"Reports, vtabs" became "Bulletin, tabs". That is a silent reroll, and it is the one thing a
control may not do. **A page's content is a function of where it is**, so the word is out of the
key. Urls are unaffected: a name is the block word plus an ordinal, never the key.

## Wave 4's cuts

A control panel or a drawer (`ext/layout`'s `open()`): the controls belong on the thing they
control, and a head that already carried a word chip could take two menus for free. Importing
`ext/layout`'s `pick` / `menu` / `knob`: **`core/` must not depend on `ext/`**, and a select is
five lines — the shape is borrowed, the module is not. A `prose` option on a page that has
children (it would present none of them). Any control over `tabs` / `vtabs` beyond the kind
switch: a strip is one line and has no arrangement to tune. And the header's own settings in
the url.

# Wave 5 — default is the majority track, and two words wait on their CSS (MODEL v3, 2026-08-29)

The owner: *"make the default width for the generator the 'default' size, the small ones are
super small."* `small` is a fixed 14em — narrow enough that it should be a **deliberate** pick,
not a coin flip landing one roll in four. `WIDTH` in `gen.js` is `{ "": 8, small: 1, large: 2,
full: 1 }` now (was `{ "": 6, small: 3, large: 2, full: 1 }`): `small` reweighted down to
`full`'s own rarity — one roll in twelve, same table the "one roll in twelve" comment already
described for `full` — and `""` (the default track) climbs from one in two to two in three.

**A weight move is a MODEL move.** `MODEL` is 3. Measured in node, the six proof seeds (0 / 1 /
7 / 42 / 1234 / 999999): **all six moved**, every one losing `small` lines to the default track
and none gaining or losing a line — the draw sequence is untouched, only which width each pick
lands on. `gen(seed) === gen(seed)` still holds on all six. Old deep links into a `small`-heavy
tree 404 or land on a different tree the same way v1→v2 already taught: a generated url is an
address into one model, and re-deriving it is the answer, not a repair.

## `hug` and `fill` — two words, no CSS yet

A core sibling is adding `hug` (content width) and `fill` (spend leftover, distinct from
`full`'s ancestor-collapsing takeover) to the four width words. Both are in `WIDTHS` now, so the
per-column menu offers `default small large full hug fill` and a typed spec accepts either —
`tree.js`'s `column()` already stamps `.page-column-<width>` for whatever `page.width` holds, so
no new code was needed there.

**Neither is in the roller's `WIDTH` weight table.** The roller only draws what a human can
already see rendered; `hug`/`fill` land in the vocabulary through a control or a typed spec, not
through `#seed`, until the CSS is real and worth drawing.

**Not drawn on this page yet, verified 2026-08-29:** `Page.css` has `.page-column-small` /
`-large` / `-full`; no `.page-column-hug` or `.page-column-fill` rule exists. Picking either from
the per-column menu stamps the class and renders exactly like the default track — no console
error, just no picture — until core lands its CSS. **The header's size options got a plain
`hug` entry with no tokens** (`{}` in `SIZES`), for the same reason: guessing at
`--page-column-min/max` numbers core hasn't written yet would be a number to un-teach later,
so it is an honest no-op instead. `default` (was `med`) is the header's fourth entry's new name,
matching the per-column menu's own word for "no width word" — one name for the same idea in
both places.

# Wave 6 — a library, a costume, and a memory (2026-08-31)

Three additions, and the rule they all obey: **an addition is a control or it is data, never a
new `page.js` per state.** [task](/framework/ai/2026-08-31/improve-generator/)

`MODEL` is untouched at **3**. `gen.js` and `rules.js` were not edited, and the six proof seeds
hash identically before and after the wave (sha1 of `gen(seed)`, run in node):

```
#1     991d25bc543f    #42    a332499027a8    #1234   dbe5a58ae750
#7     1d5901c444dc    #99    1d34ff076163    #90210  aa993d0f6e9f
```

## The spec gallery — the missing half of "keep it as text"

The readme has warned since v1 that a seed is only an address against one `MODEL`, so **keep a
tree you like as its text**. There was nowhere to keep it. `specs.js` is that place: eight page
shapes that are real things — a docs site, an inbox, a settings rail, a shop, a handbook — as a
`SPECS` array of `{ title, note, spec }`, rendered as a wall at `/generator/specs/`.

**It is a list, not a generator, and that is the whole value.** Nothing in it is seeded, drawn or
rolled, so nothing in it can move when `MODEL` does — which is exactly the failure mode the eight
entries exist to survive. Every spec is written in the same five words the roller draws and the
controls edit; a gallery in its own dialect would be a second vocabulary to keep in step.

**Reused, not rebuilt.** The tile picture is `rolls.js`'s `sketch()` and the card is
`.page-gen-tile` plus a name and a note — the gallery adds one grid rule and two text rules to
`generator.css` and nothing else. The page config is `rolls.js`'s shape verbatim: `width: "full"`,
its own `link()` carrying `host.hash()`, and no `at` field, which is what keeps `first()` and
`place()` from ever counting it as part of the tree.

**`pick()`, not `type()`.** A picked spec opens its own first root the way a fresh load does.
`type()` alone lands you on the host looking at a nav and no column, which reads as nothing
having happened — the same finding `first()` was written for (ux recon 2026-08-27, #3).

## The three looks — and what colstyles' own CSS actually reaches

`/imagine/vary/colstyles/` asked whether a columns tree can be **re-dressed without being
rearranged** and answered yes, three looks deep. The generator is the one page that can put an
arbitrary tree under them, so `look` joins `size` and `gap` in the header.

**The rules are written here, not imported, and the reason was measured** rather than assumed.
On `/generator/#42`, adding `vary-colstyles-look-ink` to the host and reading the CSSOM:

| | row bg | body bg | title | a nav item |
|---|---|---|---|---|
| plain generated tree | transparent | `#f2f2f2` | 600, none | `#6a6a6a` |
| **+ class, stylesheet not loaded** | transparent | `#f2f2f2` | 600, none | `#6a6a6a` |
| + class + `colstyles.css` loaded by hand | `#3f3f3f` | `#3f3f3f` | **800, uppercase** | `#6a6a6a` |

Two findings, one line each. **A look's class does not travel with the look** — that stylesheet
is `View.stylesheet`'d by a page under `/imagine/`, and `core/` may not import from there. And
**the structural half carries verbatim while the item half never matches**: row, body, head and
title read core's own class names, but colstyles styles `.page-column-item` and a generated
column draws its own `.page-gen-item`. So even the import that is forbidden would have arrived
half-dressed.

**Ink is five tokens on the body, not a rule per part.** Everything a generated column draws —
the fill bars, the media stand-in, the chips, the item colours, the 3px sketches — is already
written in `--line` / `--tint` / `--surface` / `--ink` / `--subtle`. Redeclaring those five on
`.page-column-body` redresses the whole tree in one block. That is worth saying out loud because
it is a property of the module, earned by `fill.js` and `generator.css` being token-driven from
the start: **a look here is a token block, and only what a token cannot reach needs a rule** —
the sticky head's own background, and the title's voice.

**`:not(.page-gen-controls)` throughout.** A look is a costume for the generated tree; the
control column is the instrument you change it with, and an instrument that goes dark with its
subject is a control you cannot read. The `fill` size already makes the same exception for the
same reason.

**(0,4,0), and colstyles paid for this one first.** Core's body rule is `.page.columns
.page-column-body` (0,3,0). A plain `.page-gen-look-ink .page-column-body` ties it and the winner
is stylesheet order — so `.page.columns` is restated on every body rule.

**`finder` has no rule.** It is the shipped default, and the word exists only so the control can
name it. A default that writes declarations is a second base to keep in step with the first.

## `store()` — the url carries the tree, the store carries the dressing

The address has always been the tree and only the tree: `#7` a seed, `#s=…` a typed spec, and
`size`/`gap` deliberately left out because *how wide you like your columns is not the tree*. That
decision stands. What was missing was the other half — a preference that resets every visit is a
control nobody touches twice.

So core's new `this.store()` (`doc/method/store.md`) holds `sized`, `gapped`, `looked` and the
last `hash()`, and `land()` reads it in the constructor beside `location.hash`.

**The url wins.** A link someone sent has to open what it says, so the remembered tree is read
only when the address names none of one — the bare `/generator/` arrival, which is the only case
"back where you left" is even a question. Verified: `#42` under a stored Inbox spec still lands
on seed 42 with the proof line green.

**`store_key` is declared, not derived.** The key defaults to the page's own url, and this page
sits deep enough that a rename anywhere above it would silently orphan every saved preference.

**The three are applied in `column()`, not `initialize()`.** Every one of them writes to
`this.view`, which `render_column()` creates one line before it calls `column()` — so they can
run synchronously, and the costume is on before the first paint rather than a frame into it.

## What this wave did not build

- **A copy-address button.** The address is this module's whole artifact and there is still no
  button to take it. Extra-small, and the obvious next thing.
- **Arriving deeper.** `first()` opens one root, which is why 1920 is still mostly grey with a
  shallow tree. Walking the first branch two levels would fill the row but fights Back — the
  same tension the `opened` flag exists for. Needs a verdict, not a patch.
- **Feedback in the spec box.** An unrecognised first word silently becomes `prose` (`read()`).
  A line saying "2 words not recognised" would teach the vocabulary instead of swallowing it.
- **Saving your own spec into the gallery.** This is the gallery plus the store, and it is the
  natural next step now both exist — deliberately not built in the same wave that introduced
  either.
- **Exporting a tree as real `page.js` files.** The actual "library of reusable pages" endgame,
  and the largest thing on this list.

# Wave 7 — a copy button, a quiet teacher, and a shelf for your own trees (2026-08-31)

The top three items wave 6 left. [task](/framework/ai/2026-08-31/generator-round-2/)
`MODEL` untouched at **3** — `gen.js` and `rules.js` were not opened for writing, only read.
sha1 of `gen(seed)`, in node, before AND after every edit in this wave, identical both times:

```
#1     991d25bc543f    #42    a332499027a8    #1234   dbe5a58ae750
#7     1d5901c444dc    #99    1d34ff076163    #90210  aa993d0f6e9f
```

## 1 — copy the address

`copy()` (page.js) is `location.origin + this.url + this.hash()`, written to the clipboard and
kept on the instance (`this.copied`) besides — the same belt-and-braces `ext/Panel`'s
`Item.copy()` already uses, because `navigator.clipboard.writeText` needs a permission a
headless run has to be GRANTED before it can even be asked for. **Measured both ways**: a
Playwright context with `grantPermissions(["clipboard-read","clipboard-write"], {origin})` read
back the exact address via `navigator.clipboard.readText()`; `this.copied` carried the same
string regardless, for a prover with no grant.

The confirmation is the icon, not a class: `content_copy` swaps to `check` for 1.2s and back.
A colour change alone reads as decoration on a control this small; a different glyph reads as
done. It sits in `.page-gen-dials` beside the seed stepper and inherits that row's own button
padding — nothing new in `generator.css` for it.

## 2 — the spec box names what it doesn't know

**Measured first, in the code, not by guessing.** `read()` (spec.js) is one ternary:
`BLOCKS.includes(word) ? word : "prose"`. An unrecognised first word has always silently BECOME
the leaf — no error, no console line, nothing — which is right for the draw path (a typo must
never blank the tree) and useless for a reader with no way to see why their `widget` line
rendered two grey bars and nothing else.

**The validation lives in `controls.js`, not `spec.js`.** `unknown(text)` re-`parse()`s the
same text a second time and collects every first word that is not one of the five block words —
changing nothing about what `read()` does with it. The draw path (`spec.js`, `gen.js`,
`rules.js`) was read for this task and not edited once. `page.js` wires it to the spec
textarea's `input` event (live, while typing) and calls it again from `draw()` (so the line
survives a commit too, and a page landed on `#s=` with a stray word straight from a link shows
it immediately).

**Quiet is a font, not a colour.** `.page-gen-hint` reuses `.page-gen-ok`'s voice (`--subtle`,
italic) — never `.page-gen-bad`'s red-and-bold, because a typo is not a broken page. No `alert`
anywhere; verified by listening for the `dialog` event through the whole run and getting none.

## 3 — "yours": save the tree you're looking at

A save control in the gallery, next to the eight curated cards: a title field and a button that
reads `host.spec` — the generator's OWN live tree, not anything about the gallery column itself
— and pushes `{ id, title, spec }` into `store()`.

**The store-key call.** `saved` rides in the SAME key `sized`/`gapped`/`looked`/`hash` already
live in (`store_key: "/framework/core/Page/generator/"`), not a sibling one. A second
`localStorage` key would be a second address to keep in step with `store_key`'s own warning
(doc/method/store.md — a page that moves silently orphans what it saved); a saved spec is
exactly as dressing-adjacent as the three already there — a preference this reader built, never
part of the curated list `specs.js` ships.

**That choice broke something on the way in, and the fix is worth the line.** `remember()`
(page.js) called `store().set(...)` — a REPLACE of the whole record — every time `size`, `gap`
or `look` changed. The moment `saved` lived in that same key, the very next dressing change
would have silently erased every saved spec. Changed to `store().patch(...)`, which merges.
**Measured**: saved a spec, switched `look` to `ink`, reloaded — the saved card and the ink look
both survived. Without the fix this was checked for and would have failed silently (no error,
no console line — a card just gone).

**Repainted, not regrown.** `render_saved()` re-`empty()`s one `div` (`this.$saved`) the way
`rolls.js`'s own `paint()` repaints the tile grid — a save or a remove never calls `host.grow()`
or moves the reader off the gallery column, the way `host.show()` (a spec-box commit) would.

**Removed by id, not index.** Each saved entry carries a random id (`Date.now()` plus four
base36 characters); `remove()` filters by it. An index would have re-targeted entry #3 as soon
as entry #2 was removed from under it.

**No `<button>` inside the card's `<a>`.** The curated cards are already anchors (`pick()` on
click); a remove control on a SAVED card is a `div` with a click handler and
`stopPropagation()`, not a nested `<button>` — interactive content may not nest inside
interactive content, and Chromium's own handling of the invalid nesting was not worth trusting.

**Verified, headless, with a real reload** (not a soft repaint): saved a spec titled "My proof
tree" on `/generator/specs/`, `page.reload()`, the card and its title were still there and the
`localStorage` record carried both the dressing and the `saved` array. Removed it, reloaded
again, gone both times. Zero console errors and zero `dialog` events across the whole run
(clipboard grant, spec-box typing, gallery save/remove/reload) — [screenshots in the task dir].

# Wave 8 — the way out: a tree, as real `page.js` files (2026-08-31)

The last thing on wave 6's list, and the reason the whole module exists: a generated tree
could be looked at, linked, switched and saved as text — but never *kept*. Now an Export
control writes it to disk as ordinary modules under `/imagine/generated/<name>/`, one
directory per page, and the result is browsable exactly like something typed by hand.
[task](/framework/ai/2026-08-31/generator-export/)

`MODEL` untouched at **3**. `gen.js`, `rules.js`, `spec.js` and `tree.js` were read and not
opened for writing. sha256 of `gen(seed)`, in node, before and after every edit in this wave —
identical both times:

```
#1     1357c1d31849c58c   #42    702e57b146d7dd15   #1234    6dd8ed7b80413e67
#7     1ca867f96c935491   #99    fed4a1642dbb7c14   #999999  9452a20e52c51226
```

## The export is a READ of the live tree, never a second draw

`export.js` walks `host.children` — the same `Page` objects on screen, filtered on `at` the way
`first()` and `place()` already filter — and reads five fields off each: `name`, `title`,
`width`, `block`, `opt`. It never calls `gen()`, never re-`parse()`s the spec, and never
touches a seed.

That is not a style choice, it is the reproducibility law: anything that re-ran the draw would
be a second place the vocabulary lives, and a wave that changed one and not the other would
export a tree nobody was looking at. **What lands on disk is what was on screen**, by
construction — which is also why the round trip could be checked by comparing the two trees
field for field rather than by eye.

## The exported file is the readme's own answer, not a new one

The readme already had a section called *"the four words that were cut, and what to write
instead"*, written to say what a shape looks like when a person writes it. That section IS the
code generator:

| word | what gets written |
|---|---|
| `wall` | `index: true` + `content(){ return this.previews(); }` |
| `list` | nothing — core's `column()` already draws my children as rows, and that IS an inbox |
| `prose` | one line of `md()` |
| `tabs` | `import "/framework/ext/tabs/tabs.js"` + `content(){ return this.tabs(); }` |
| `vtabs` | the same, `.ac("vertical")` |

So the export invents no vocabulary. `list` writing **no content at all** is the one worth
reading twice: an inbox is what core's column does by default, and the honest export of that is
an empty page.

**A childless page is a leaf, whatever word it wears.** `gen()` already draws it that way and
`kind()` (controls.js) already offers `prose` only to a page with no children — but a *typed*
spec can still say `tabs` with nothing under it, and `tabs()` on an empty set reaches for
`list[0]` and throws. One rule, and now three places agree.

**`index: true` on every word whose content draws its own children.** Without it core's column
lists them a second time, as rows under the wall or under the tab bar.

## `flow=` has no exported form, on purpose

`cols=` becomes `--column` and `gap=` becomes `--gap`; both are tokens `.page-previews` already
reads. `flow=flex` does not travel: it swaps the *generator's own nav* between `.grid.auto` and
`.flex.auto`, and `previews()` is one grid. Exporting it would mean inventing a rule for a wall
core does not have — the opposite of "reads like a person wrote it". The chip still works in
the generator; it is simply not part of what a page.js can say.

⚠ **`--column`'s gap fallback is `1em` here and `0px` there.** `controls.js`'s `track()` writes
`calc((100% - 2 * var(--gap, 0px)) / 3)` because the generator's nav sets its own gap. Core's
wall gap is `1em`, so reusing that function would have made each track a third of the *ungapped*
width — too wide for three, and `auto-fill` silently drops to two columns. `export.js` has its
own three-line `cell()` for exactly one changed default.

## No manifest — the directory IS the list

`/imagine/generated/page.js` is the seam, and its `children:` is rewritten on every export. It
learns the names from **one `rpc:ls` of the target directory**, which is also the call that
proves a dev server is listening and the call that decides whether the name is taken. A
`.jsonl` manifest appended beside it would have been a second copy of a list the filesystem
already keeps, and a second thing to keep in step when somebody deletes a directory by hand.

⚠ **`children:` is OMITTED when the list is empty**, never written as `""`. `"".split(/\s+/)`
is `[""]`, not `[]` — an empty string declares one child called `""`, and the index would draw
a nameless row that 404s.

⚠ **The index is written LAST**, after every page under it. A parent that names a directory
which is not there yet is a 404 for however long the writes take.

## Never overwrite, and why refusing is the whole feature

An export is a scaffold somebody is expected to edit — that is the point of exporting it — so a
second run under the same name is **refused**, quietly, in the line under the button:
`/imagine/generated/seed-7/ already exists — pick another name.` Not merged, not versioned, not
prompted. Deleting the directory is the "yes I meant it", and it is a thing a person does on
purpose.

`Page.slug()` decides what a directory may be called, not the input field: a name is typed by a
human and lands on a filesystem, and `../` is not a tree name.

## Dev only, and both halves of that were proven

`core/` imports nothing from `dev/`. The socket arrives as **`host.app.socket`** — `app.js`
already builds the App with `socket: Socket.singleton()` — so the export reaches its writer
through the app that owns it and the static import graph stays clean.

Two states, both measured:

- **Rendered.** Off localhost `dev/Socket` sets `disabled = true` in its constructor, so
  `control()` renders the button `disabled` with one grey line: *"Dev only — the site is static
  in production, so there is no server to write to."* The page still rolls, types, switches and
  links — nothing else on it depends on a server.
- **Forced.** Past the attribute, `async_rpc()` returns `undefined` on a disabled socket and a
  live-but-unanswered one never replies at all, so every call is raced against a 2.5s clock
  (`/imagine/stream/`'s own probe) and the answer is a line, never an exception: *"no dev server
  answered — nothing is listening to write the files."*

⚠ **Proving the production state needs a secure context AND a non-localhost hostname.** The
obvious try — load the private port over the machine's LAN ip — renders nothing at all:
`crypto.randomUUID()` exists only in a secure context, and without it `ext/Panel` throws inside
`framework/page.js` long before the generator draws. Nothing to do with this feature, and it
will bite anything else that tries the same proof. `http://127.0.0.2:8097` is the origin that
is both: Chrome trusts all of `127.0.0.0/8` as secure, and the gate's list is `localhost`,
`127.0.0.1`, `*.localhost` — which `127.0.0.2` is not.

## The round trip, which is the only proof that matters

Seed 7 (all five words, 14 pages) exported to `/imagine/generated/seed-7/` — 15 files — then
loaded as real modules with `load_all_children(12)` and walked. The `{name, title, width}` tree
of the generator's live render and of the loaded modules are **string-identical**, 14 pages
each. Every stop rendered: the `vtabs` rail as a tab strip, the `wall` as two cards, the `list`
as rows, the `tabs` set swapping in its panel, the leaf at the end of eight columns. Zero
console errors; no horizontal body scroll at 400, 1920 or 3440.

## What this wave did not build

- **A delete control.** Removing an export is deleting a directory — `rpc:rm` exists and was
  deliberately left alone. A button that erases files somebody has since edited is a different
  feature with a different conversation about confirmation.
- **A target other than `/imagine/generated/`.** One place, so the index seam is one file.
- **Round-tripping a directory back INTO a spec.** Reading page.js files to rebuild the text is
  a parser, and the text was never the thing that was missing.
- **Exporting the dressing.** `size`, `gap` and `look` are how you like a tree worn, not the
  tree — the same split `store()` already keeps. A `look` in an exported file would be a class
  from `/imagine/vary/colstyles/` that core may not name.

# The magazine, and the `code` tab (2026-09-04, `paging-explorer`)

Two asks from the same brief: put `/imagine/mag/`'s shape in `specs.js`, and give every
generated page a `code` child that shows how it was built.

## The magazine needed no sixth word

`/imagine/mag/` is three real levels: a `full` cover with one child, a `large` contents column
that lists six articles as previews, and an article — no width word, the plain 40em measure.
That is `wall full` / `list large` / six `prose`, letter for letter the five words already had.
`specs.js`'s ninth entry, appended after Handbook — inserting one moves every card after it
(the reproducibility law is about the *drawn* trees, but the gallery is a fixed list a reader
points at by position too, so the same rule was kept).

## The `code` tab reuses `export.js`, doesn't reprint it

The obvious wrong move was a second little printer living in `tree.js`. Instead `export.js`'s
`module()` was split into three pieces — `shape_for(page)` (which `SHAPES` entry, the same
"a childless page is always the leaf" rule it already had), `content_line(page)` (the
`content(){ … }` body) and `width_line(page)` (the `width:` field) — and `module()` was
rewritten to call them. **Behaviour-preserving by construction**: `module()`'s own output is
now `wline ? "\t" + wline : ""` where it was `page.width ? "\twidth: …" : ""`, and the two are
the same string for the same input. Proved, not just reasoned: seed 7 / 42 / 1234 exported
(`files()`, called directly against the live `gen.js`/`tree.js`/`export.js` in a browser —
never through the dev-only `rpc:write`, which this task's fences don't reach) **before** every
edit and **after** all of them — six diffs (three specs, three file sets), all empty, byte
counts identical (5211 / 4217 / 6746).

`route("code")` is the one new mechanism: `Page.child()` already tries memory, then `route()`,
then a filesystem probe, for any UNDECLARED name — so `.../code/` exists without a directory
and without a line in any `children:`. The returned config has no `.at`, which is what keeps
it OUT of `export.js`'s own `kids()` filter (the same trick "rolls" and "specs" already use to
stay off the exported tree). Its `container()` is the SAME function every real child now
shares (factored out of the per-node closure it used to be) — `this.parent` is the generated
page either way, so a `code` tab under a `tabs`/`vtabs` page lands in that page's own panel,
exactly where a real child would.

**The calls transcript is keyed by `page.at`, not held on the page instance.** Every control
funnels through `host.swap(at, change)`, and `swap()` now also calls `log_call(at, change)` —
which resolves the FRESH page at `at` (`page_at()`, factored out of `resolve()`) and pushes
`width_line(page)` or `content_line(page)` onto `this.calls.get(JSON.stringify(at))`. Keyed by
position and stored on the HOST because `grow()` throws every generated `Page` away and rebuilds
from the spec text on every single click (`page.js`'s own law); a log on the page itself would
be erased by the very edit it was recording. The code tab reads `host.calls` at render time —
no reactivity needed, because by the time a reader opens `.../code/` the clicks that produced
the transcript have already happened.

## A link INTO the generator needs `target="_blank"`

`/imagine/paging/explorer/`'s "open the generator with the magazine selected" link is the first
place in this codebase that links to `#s=<spec>` from OUTSIDE the generator. It silently failed
on a plain in-app click: `Router.go()` (`core/Router/Router.js`) resolves the whole segment walk
— constructing every module along the way, `land()` included — and only calls
`history.pushState()` once that succeeds. `land()` reads `location.hash` at construction time,
so a soft navigation hands it the OLD hash, and the generator falls back to whatever tree this
browser last stored. Every EXISTING hash-carrying link in this module (`link()`, item hrefs, the
close button) is built and clicked from INSIDE an already-live generator instance, where a
click never reconstructs the page at all — `swap()`/`pick()` mutate the live instance directly
and only touch the address as a courtesy. Nothing prior ever needed a spec hash to survive a
FRESH construction. Fixed with `target="_blank"` — `Router.js`'s own `link_clicked()` already
excludes any anchor with a `target`, so the browser loads it as a real navigation and
`location.hash` is correct from the first line. Verified: the popup's `gen.typed`/`gen.spec`
match the magazine spec exactly, zero console errors either side.
