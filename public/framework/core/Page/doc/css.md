# The CSS record — visibility, the sheet, rhythm, the cards

`Page.css` is the whole arrangement tier. There is no `Pager` class; an arrangement
is a stylesheet reading two classes the Router writes.

## The visibility contract lives in `@layer util`, so a page can BE a layout

**The question:** can `.page` be a grid? `div.c("page grid gap auto")` — the site
already has the utility grammar for it.

**What happened instead: every inactive page on screen, on every route.** `.grid`
and `.flex` are in `@layer util`, the last layer, so they beat a `display: none`
written in `theme` at *any* specificity. Nothing throws, and the symptom reads like
a router bug rather than a cascade one. It was already known in smaller form —
`/styles.css` restated the contract's own selectors for `.page.topic`, and
`layouts.css` had a load-bearing `.active-page` in a selector, commented as such.
Same bug, worked around twice.

| | |
|---|---|
| `.page` is a slot; layouts go in a wrapper div | correct and unbreakable, but every layout page grows a div |
| `display: var(--page-display, block)` | a util `.grid` still beats `display: none` — fixes nothing |
| `display: none !important` in `@layer base` | works (important reverses layer order), and makes the hide unbeatable — no page transition could ever animate a page out |
| **move the hide rule up into `util`** | ✓ |

**Verdict: the hide rule moves into `util`** and wins on specificity instead — four
classes against one. Two load-bearing consequences:

- **It has to be phrased as "hide unless."** A plain `.page { display: none }` in
  `util` is `(0,1,0)`, exactly `.grid`'s, and the winner would be whichever `<link>`
  loaded last. The `:not()` chain is what buys the margin.
- **Nothing says `display` for a page that IS showing.** A div is already a block;
  putting `display: block` on `.page.active-page` takes the choice back off the
  utility class.

The cost is a dent in what `util` means — "opt-in classes you typed on purpose",
plus one structural rule.

## `.default` asked "is the leaf mine?" when it meant "am I in the chain?"

```css
.pages:not(:has(> .page.active-page)) > .default { … }         /* wrong */
.pages:not(:has(> .page.active-page, > .page.active-ancestor)) > .default   /* right */
```

On `/framework/ext/demo/` the leaf mounts in ext's **tab panel**, so framework's
region held only `.page-ext.active-ancestor` and never an `.active-page`. The test
passed, framework rendered its index page too, and because a region is a flex row
you got **two columns** — the index squeezed to 281px beside the ext page.

It needs a leaf that mounts somewhere other than its nearest region, which is why it
hid for so long. **`.active-page` and `.active-ancestor` are one question asked two
ways: "is any of this mine."** `.tab-panel`'s twin fallback had the identical shape
and was fixed alongside it — a pair that drifts is a pair where one gets fixed.

## A demo never hand-writes `.active-page`; it writes `.default`

The contract cannot tell the Router's mark from one a widget wrote. On 2026-08-19
four new Overview cards marked their demo boards `.active-page` so they would show,
and the boards also rendered inside the wall's thumbs — so the Doc's view matched
`.active-ancestor:has(.page.active-page)` *through a thumb* and stayed visible beside
the routed leaf: two columns again, the leaf at 545px. `ext/demo/app.js` already had
the answer: **`.default` is the contract's word for "shown without being routed to"**
— it displays and triggers nothing. Two rules for a demo board: it wears `.default`,
and it is not a direct child of a `.pages` box (lines 42–45 rewrite *that* `.default`
into the region's empty state, block and measure-capped — the real `.pages` belongs
in the routed page's stage only).

## `.pages` scrolls; `.page` does not

`overflow-y` on `.page` looks obviously right and is wrong twice:

- A `.page` is a measure inside a wider region, so the scrollbar rendered at the
  **sheet's** right edge — 85px inside the window, floating in the grey. A scrollbar
  belongs to a viewport, and a sheet is not one.
- A page inside a tab panel got its own scroller *inside* its ancestor's:
  `/framework/ext/markdown/` had an inner bar at x=586, mid-content, that you had to
  exhaust before the outer one moved.

`align-items: flex-start` on the region is the non-obvious half. The default
`stretch` looked right and was wrong: in a single-line flex container with a
**definite** cross size — which this has, because the `height: 100%` chain above it
is definite — the line's cross size is the *container's*, not the content's. So
every page was forced to the region height and its content painted past the bottom
of its own background. Measured: a page reporting `height: 900px` with
`scrollHeight: 4241`.

## The sheet is the default; the vocabulary is four words

`papers` / `paper` retired. Every region (`.pages`) hands its pages the sheet —
`--measure: 60em; --page-pad: 3em clamp(0px, 6%, 5em)` — so **a page that says
nothing is a readable page**, which is the product's whole pitch. The old verdict
("the framework does not decide paper; there is no default") died with its own
premise: by the end, every region on the site had typed the opt-in.

```
standard   the sheet + breakout tracks — a child escapes with .wide / .bleed
pad        no measure, an even inset — a gallery, an index, a board
full       nothing — edge to edge inside the region
fill       BE the region's height rather than sizing to content
```

**`standard` is the default shape (Aug 2026), not just the first word.** `render()`
applies `this.classes ?? "standard"`, so a page that says nothing is the *standard*
page — the measure plus the `.wide` / `.bleed` breakout tracks — and a
declared `classes:` opts out whole. What forced it: half the site's pages declared
the shape and the other half sat 60em wide and **left-aligned** in the
region, because a flex item with a `max-width` parks at `flex-start` while the
grid centred itself with its own `1fr` gutters. Two fixes shipped together: the
default, and `margin-inline: auto` on `.page`, so the shapes that do opt out
agreed with the grid about where the middle was. **The auto margins were reversed
four days later** — the grid no longer centres, so agreeing with it means flush
left (*One axis*, below). The default lives in `render()`
rather than `naming()` so a custom `render()` that never reads `classes` — the
Doc root, the topic pages — is untouched. One trap, recorded in
`doc/property/classes.md`: declaring `classes: "anything"` **forfeits** the shape;
a standard page with extras writes `classes: "standard extra"`.

**It was called `grid` until Aug 2026, and the word was the wrong one.** An
opinionated three-track template with a measure is not what `grid` means anywhere
else on the site — `.grid` in `util` is `display: grid` and nothing more — and the
page shape was squatting on it, which is why `framework.css` carried a
`.grid:not(.page)` carve-out for the margin reset. Renaming the shape retired the
carve-out: `page.ac("grid")` now means what it says. Cost: every rule keyed on
`.page.grid` had to move with it, `ext/toc`'s `:not(.grid)` opt-out included —
that one would have silently applied the ToC's own `grid-template-columns` on top
of the default template, and a dropped template does not throw.

**Rejected: default to paper, opt out with `full`.** `full` already means "no
measure"; making it also mean `position: fixed` would give one word two independent
meanings, so you could never ask for full-bleed-without-fixed.

**How a page opts out: the tokens.** `.page.topic` and `.tab-panel` declare
`--measure` / `--page-pad` on themselves — **a value declared on an element beats
one it inherited, at any specificity, in any layer**, because inheritance is not a
declaration and the cascade has nothing to compare. The reset on plain `.pages` is
not decoration: without it a nested region would inherit the sheet width from an
ancestor it has nothing to do with.

**`fill` was earned, not added on spec.** `.page.topic` had paid for it by hand for
months (`align-self: stretch; overflow: hidden`), and the layout showcase pages
needed the identical thing plus `min-height: 100%` for a short page. Two real
consumers is the bar a new word clears. All three declarations are load-bearing:
`min-height` makes a SHORT page fill, `overflow` stops a TALL one pushing its footer
off the region.

**`.page.standard`'s `--measure` is 52em, not 60.** Tracks pay no padding, so `60em`
there measured 17% wider than the sheet's `60em` — 108 characters against 92.

## One axis, and it is the left one

**The diagnosis.** A page was running two compositions at once. The title and the
prose sat on a centred measure; the walls and exhibits took `wide` or `bleed`,
packed from the left, and read as left-anchored. Two axes on one page, so there
was no stable edge to read down — and it recursed: a `demo.app` is a miniature
site having the identical fight inside a box that is already off the outer axis.

**Verdict (blessed by the owner, 2026-08-12): title, prose, walls and exhibits share
ONE left edge; wider blocks grow rightward only.** The opt-in
`.page.standard.left` variant *became* the template. The gutter is fixed —
`--gutter-x: clamp(2em, 4%, 5em)`, so 400px pays 32px and never more than 5em —
`main` and `wide` start on the same grid line, and the whole leftover `1fr` is
spent on the right. `.page` lost its `margin-inline: auto` in the same change: a
shape that opts out of the template (`full`, a page in a tab panel) agrees
with the grid by staying flush left, which is now what the grid does too.

**`--gutter-x` IS the axis**, which is why the wall pays back exactly it
(`.page.standard > .page-previews { padding-inline: var(--gutter-x) }`) — a
bleeding wall's padded edge lands *on* `main`'s edge rather than near it.

**Weight: revisable like everything here — but this one settles a fight that
machinery alone could not.** The centred default was defensible on its own terms,
and the standing counter-argument is real: a left-anchored page on a 3440 monitor
leaves the right half empty. That is a `--breakout` problem — the exhibits should
take the room — not a case for a second axis. Reopen this with evidence about the
right half, not about the left edge.

**A FRAMED exhibit joins the edge; an unframed band does not.** A demo stage or a
`Layout` panel is a box with its own border sitting in a prose flow, so it pays the
gutter back exactly as the wall does — `.page.standard > .demo-stage.bleed` in
`ext/demo/stage.css`, `.page.standard > .layout.bleed` in `ext/layout/layout.css`,
each rule living in the ext that owns the class. A bare `div.c("bleed")` holding
colour bands or sections keeps the whole region: with no frame of its own there is
nothing for an inset to square up, and that is what `.bleed` means for it.

⚠ `.bleed` still *spans* the whole page — the payback is padding a framed exhibit
opts into, not a change to the track. `.page-catalog` bleeds and is deliberately
left alone: a catalog is a **region**, not an exhibit — it hides the page's own
title, so there is no in-page edge to join, and the axis recurses into the standard
page it holds.

⚠ **The rail inside it was the exception (Aug 2026, the owner).** The region keeps the
whole width, but its cards sat 9px off the app sidebar and read as glued to it, so
`.page.standard > .page-catalog > .page-previews` pays `--gutter-x` back as a
`margin-inline-start` — a margin, so `--rail` still measures the cards. Scoped to a
direct child of `.page.standard`, because a catalog in a Doc group is already
inset by the group's own `--page-pad` and would pay twice; and dropped again in the
`< 64em` strip, which is a scrollport across the whole region.

⚠ Measuring this: **demo apps are zoomed**, so `getBoundingClientRect()` returns
scaled pixels while `getComputedStyle()` returns unscaled ones. Mixing the two
invents an 8–10px misalignment that is not there. Compare rects to rects.

## The breakout scales; the measure never does

**The question**, asked from a 3440 monitor: *"`styles/elements/forms` is way too
narrow — and it's a major problem with a lot of the pages."* The cause is one
line in `framework.css`: the type ramp tops out at `1.125rem` at a **~2491px
viewport**, and every width on this site is expressed in `em`. Past that point
the region keeps widening and the content is frozen. Measured across 166 routes,
average fill was 81% at 1600 and **63% at 3440**.

| | |
|---|---|
| a step at 2500px → `--measure: 60em` | 52em at the 18px ceiling is already 936px ≈ **104 characters**. This widens the one thing that is right |
| `clamp()` on `--measure` | the same objection, continuously |
| **leave `--measure` alone; make `--breakout` responsive** | ✓ |

**Verdict: the main track never scales. `--breakout: max(7em, (100% - 96em) / 4)`.**
A `.wide` block measures 1024px at 1600 — *byte-identical* to the old `7em`,
because the `max()` floor holds until a ~1700px viewport, so no laptop sees any
change — and 1655px at 3440, up from 1188. Nobody has ever complained that a
paragraph was too narrow; the complaints are *"the exhibit is too narrow"* and
*"the page is empty"*, and both of those are the breakout's job. **Record this as
a keep verdict** — it will be re-litigated.

The `100%` resolves against the **grid**, not the window, so a grid nested in a
tab panel or a catalog region breaks out of the right box. ⚠ A percentage inside
`minmax()` is exactly the class of thing that silently drops a whole template:
after touching this, re-measure that `main` is still 936px at 3440 and that the
gutters never fall below `2em`.

## Rhythm: one flow token, and registration reversed

**The bug, as reported:** *"in some `.md` containers we have `p` that aren't directly
in the page. I tried some `.page > *` margins, but they failed to reach into these
sections."* Two competing systems existed when it was found — `Page.css`'s
`.page > h2` in `theme` and `/styles.css`'s `.page > *:not(…)` in `site` — and
**neither could reach a paragraph markdown generated**, because `md()` emits
`div.md > p`.

| | |
|---|---|
| `.page > *, .page > .md > *` | works, and stops at two levels — `details > .md`, `blockquote > p`, a `.md` inside a demo all miss |
| margin on the elements themselves | what the UA already does, and the thing being fixed: `em` on a heading compounds with the type scale |
| **a flow scope** | ✓ |

**Verdict: rhythm is a property of the container, and the container is named.** A
flow zeroes its children's block margins and spaces *between* them with the owl
selector, so `.md` nested anywhere is a flow in its own right and depth stops
mattering. It lives in `framework.css` now, not here: two of the three selectors
were never Page's (`blockquote`, `.flow`), and `render()` emits `"page flow"` so
`.page` opts in by wearing the class — the same move `md()` and `demo()` make.

Notes that cost something to learn:

- **Every selector is `:where()`d to specificity zero.** A component that genuinely
  wants its own spacing wins by being an ordinary class, with no out-specifying.
- **Order is the mechanism.** All the heading rules are specificity-zero, so the
  last one to match a pair decides it. `heading + *` is written before `* + h2`,
  which is what makes `h1 + h2` take the air.
- **Margins had to be evicted from generic elements upstream.** `table { margin: 1em 0 }`
  in `framework.css` is `(0,0,1)` and beats a `:where()` rule at `(0,0,0)`. That was
  rhythm living in the base theme — deleted, not out-specified. `figure`'s UA
  `margin: 1em 40px` needed the same treatment, because a flow only zeroes *block*
  margins.
- **`.grid > * { margin: 0 }`** joined `.flex > *` in `util`. A laid-out container
  owns its spacing via `gap`.
- **Never retune by writing a margin.** A margin on a component is `(0,1,0)` against
  the flow's `(0,0,0)`, so the component always wins, silently, and only on pages
  that happen to hold one. `demo.css` had `margin: 1.75em 0` and gave every demo box
  a rhythm nothing else had; it was deleted rather than matched.

**Registration, and its reversal.** A middle verdict registered the token —
`@property --flow { syntax: "<length>"; inherits: true }` — so it computed against
the element that *declared* it and a heading structurally could not multiply it.
That was reversed after living with it: an `h2`'s gap became the same absolute 32px
as a paragraph's, which reads as ~1em of the h2, and the heading looked cramped. The
"can't compound" property turned out to be the bug, not the fix. The 96px-hero-h1
case that justified registration no longer exists, because sections use `flex v gap`
rather than flow.

Now: one unregistered `--flow: 2em` on `:where(.flow, blockquote)`, resolving at
each child — so a heading takes air in proportion to its own type size, and an area
that changes its `font-size` retunes its own rhythm with nothing declared. Retune by
redeclaring the token in a later layer. `--flow-section`, `--flow-tight`,
`--flow-sub` and the `--rhythm` knob all went; `* + h3/h4` and the gap under a page
title read `calc(var(--flow) * 1.5)`.

**Where `.flow` does NOT belong:** inside components and sections. A laid-out box
owns its spacing with `gap`. Page rhythm inside a card once put an eyebrow 32px from
its own title — that is why `--flow` and `--gap` are two tokens.

**The three options that recur for any "which boxes get this" question:** opt-in (a
forgotten class is invisible), opt-out (the list grows once per layout), or an
inherited token each box zeroes locally (elegant, except inheritance isn't scoping —
zeroing it on a topic zeroes it for every prose page inside the topic, so the central
list comes back as the re-assert list). The asymmetry decides it: a missing opt-in
looks slightly wrong everywhere and nobody reports it; a missing opt-out looks broken
in one place and gets fixed that afternoon.

## Choosing, and combining

The strategies are one vocabulary, not competing systems: a **shape** is a class
on the page, an **arrangement** is the parent's `content()`, and they nest through
regions. The whole decision:

| you want | reach for |
|---|---|
| prose, with the odd wide band | nothing — the default `standard`; `.wide` / `.bleed` on the band |
| a gallery or board, no measure | `classes: "full pad"` — `pad` is the utility |
| an edge-to-edge screen | `classes: "full"`, plus `fill` to own the height |
| children as an index | `content(){ this.previews(); }` — the wall |
| children as persistent nav beside a detail | `this.catalog()` — cards (`ext/catalog`); or `this.tabs().ac("vertical")` — a text rail, better past ~10 entries |
| sections of one doc as top tabs | `this.tabs("a b c")` |
| a live tree in a box, urls and all | `demo.app(tree)` — `ext/demo`, fictional urls only |

**They combine by nesting, and nesting follows the chain.** A tab panel or a
catalog region is a region; the page inside it is again a default standard page, so
the vocabulary recurses with nothing declared. The region resets the sheet tokens
at its boundary (`--measure`, `--page-pad` — declared beats inherited), which is
why a page inside a panel never pays the sheet twice. The worked example is any
Doc: top `tabs()` on the root, a `catalog()` **or** vertical `tabs()` inside
each group, an ordinary standard page in every panel — three levels, all real urls,
and the leaf still escapes with `.bleed` when its demo wants the full width.

## A link in prose is not the same as an anchor

Same shape of question, same answer: **scope to the container, not the element.**

A flat `a` rule in the base theme is the obvious home and it is wrong twice.
`font-weight: 600` bolds the navigation — which is all anchors — and erases a state
signal, because `.sidebar-link.active` says *600* too. And **`a:visited` is
`(0,1,1)`**, which out-ranks `.sidebar-link`, `.tab`, `.toc-link` and `.nav-link`;
the navigation would grey out behind you as you read the site.

So the rule is scoped to the box: `:where(p, li, td, th, dd, blockquote, .md) a`,
`:where()`d to `(0,0,1)` for the flow rules' reason. **`:visited` gets colour and
nothing else** — browsers restrict it to properties that can't be measured back out
of the layout, so the state has to be carried by hue, and every declaration degrades
to the unvisited look if a browser declines it. You cannot verify it from
`getComputedStyle`, which deliberately reports the unvisited values.

`.page-link` carries `color: inherit` for a related reason: without it a `.page-link`
outside prose fell through to the UA's blue, so six call sites wrote the inline
colour by hand — and an **inline** colour out-ranks `.page-link.active`, so a marked
row silently stopped being marked. `text-decoration` is deliberately not declared;
it would strip the accent underline off every `page.link()` in a sentence.

## The cards

One card, three classes: `.page-preview` is the shell, `.page-preview-thumb` the
optional crop, `.page-preview-link` the label. `.page-previews` is the wall —
`auto-fill` off `--column`, the same knob every other wall on the site reads.

**`auto-fill`, not `auto-fit`.** The utility `.grid.auto` picks `auto-fit` because a
wall that centres its own content reads better at the wide end; a wall of *cards* wants
the opposite, or two children render as two enormous cards.

**The wall takes `bleed`, and hands its own inset back.** `previews()` used to add
`wide`, which at 3440 froze `/framework/ui/`'s nineteen cards at three columns with
six below the fold. On `bleed` the same wall is eight columns and **all nineteen are
one screen**; every wall on the site gains a column at 1600 and none loses one. Card
width barely moves, because `auto-fill` holds the track near `--column`.

The comment this overturned claimed `bleed` *"would spend the page's own inset and put
the left column against the sidebar."* Half right — it does spend it, and measured,
the cards sat flush against the sidebar at 3440 and against the window edge at 400,
where the page title stayed inset and the wall did not. So `.page.standard >
.page-previews` pays `--gutter-x` back. **The child combinator is load-bearing:** a
wall nested inside another wall (`walls()`, a ladder) is already inside the inset and
must not pay it twice. The cost is two pixels' worth of a column at 3440 — nine fit
flush, eight fit inset — and the inset is worth more than the ninth.

**`align-items: start`.** A cell is as tall as what it shows, so stretching would hand
the short ones their dead space straight back. That is also why nothing here sets a card
height, and why the thumb's `--thumb-max` ceiling replaced an `aspect-ratio`: one ratio
was a single box for nineteen unrelated shapes, so most of a wall was blank and the one
genuinely tall render was cropped.

**The floor went with the chrome (Aug 2026).** `--thumb-min` padded a short render out
to 4em, and what filled the difference was the transparency board — so a one-line
component read as a bare checkered strip with a label under it. Auto height, ceiling
only. The token is gone rather than defaulted to `0`; `ext/catalog` had been zeroing it
by hand for the same reason.

**Spans, not widths** — the wall is `auto-fill`, so asking for a *share* is the only
request that survives a resize. And **spans do not clamp themselves**, which an
earlier comment claimed they did: `auto-fill` must generate at least as many tracks
as the widest span demands, so a `.wide` card forces a second track even at one
column and the wall overflows — 94px of horizontal scroll at 320px, 29px at 390px. A
row span is harmless (it never widens a track); only the column spans need the
`28em` floor. `grid-auto-flow: dense` earns its place the moment one card spans two
columns: the span cannot start mid-row, so it leaves a one-cell hole behind it.

**The thumb is inert, and the label is the only link.** A live render inside a card that
was itself an `<a>` would be an anchor inside an anchor — invalid, and the browser
un-nests it silently. So the card is a `div`, the thumb takes `pointer-events: none`, and
`.page-preview-link::after` covers the card at `inset: 0`. **The label below the thumb is
structural, not decoration** — it is the anchor, and `Router.mark_links()` only marks
anchors.

**A card with a thumb goes bare (Aug 2026).** Surface, border, inset *and* a checkered
board around a render that already has its own edges is four frames; the verdict was
that the hybrid read as busy. So the chrome is scoped to
`.page-preview:not(:has(> .page-preview-thumb))` — the plain icon-and-label card, which
has nothing else to show and still wants one. Two consequences worth knowing:

- **The states split, then un-split into one ring (Aug 2026).** The first pass left the
  marked rule alone — `border-color` inert without a border-style, plus a tint and an
  `inset 3px` bar — and gave hover its own 1px outline on the *thumb*. On a bare card
  that mark paints nothing you can see: the thumb covers the bar and the tint, so all
  that survived was a lit strip under the picture, reading as a highlighted label
  detached from the render above it. **Now every card carries `outline: 2px solid
  transparent` at `outline-offset: 3px`, and hover and the mark set only
  `outline-color`** — 45% `--prim` for hover, solid for marked. The ring encloses thumb
  and label together, which is the one mark a card with no frame can wear, and it makes
  the restatement a single declaration wherever a card is lit without the Router
  (`ext/catalog`'s first-card fallback, `ext/demo`'s `aria-current`). The chrome card's
  hover shadow went with it; a ring works in dark, a `rgba(0,0,0,0.08)` lift does not.
- **`checkered` left the card, not the site.** It stays in `framework.css` for the
  `ext/demo` stage, where "did this render paint its own background?" is the actual
  question. On a card it was answering a question nobody had asked.

**Marking follows from that.** `Router.mark_links()` only touches anchors, so `.active` /
`.in-path` land on the link and the card asks
`:has(> a:is(.active, .in-path))`. **The child combinator is load-bearing** — a live
thumb can hold marked links of its own, and `:has(a.active)` would light the card up for
one of them.

All of it arrived from the deleted gallery module, whose `card()` / `wall()` this
replaces (Aug 2026). The verdict and the reasoning: `../readme.md`.

## `.cols` — deleted

Equal drill-down columns, the whole of what `ColumnPager` used to do. The section
here previously said *"if it is still unclaimed next time someone reads this file,
delete it."* It was. **A pre-committed deletion works** — it turned a judgement call
into a mechanical one, and it survived a rewrite that invalidated most of the prose
around it. Worth reusing on anything speculative.

The reasoning is worth keeping, because the question recurs: columns are **jumpy**.
Adding one reflows every column already on screen, so the thing you are reading
slides sideways while you read it. Replace, plus an adaptive sidebar, gives the same
navigation with nothing shifting. One detail if a drill-down is ever rebuilt: use
`minmax(0, 1fr)`, never bare `1fr` — `1fr` means `minmax(AUTO, 1fr)`, and that auto
floor is the item's min-content, so one long `<pre>` refuses to shrink and pushes the
page past the viewport.
