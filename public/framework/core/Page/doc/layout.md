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

## `.pages` scrolls; `.page` does not

`overflow-y` on `.page` looks obviously right and is wrong twice:

- A `.page` is a centred measure, so the scrollbar rendered at the **sheet's** right
  edge — 85px inside the window, floating in the grey. A scrollbar belongs to a
  viewport, and a sheet is not one.
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
grid   the sheet + breakout tracks — a child escapes with .wide / .bleed
pad    no measure, an even inset — a gallery, an index, a board
full   nothing — edge to edge inside the region
fill   BE the region's height rather than sizing to content
```

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

**`.page.grid`'s `--measure` is 52em, not 60.** Tracks pay no padding, so `60em`
there measured 17% wider than the sheet's `60em` — 108 characters against 92.

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

`.page-previews` is `auto-fill` off `--column`, the same knob every other wall on the
site reads. `.page-preview` is flex so a `nav` icon can lead and the label takes the
rest, and `.active` / `.in-path` come free from `Router.mark_links()`.

**Spans, not widths** — the wall is `auto-fill`, so asking for a *share* is the only
request that survives a resize. And **spans do not clamp themselves**, which an
earlier comment claimed they did: `auto-fill` must generate at least as many tracks
as the widest span demands, so a `.wide` card forces a second track even at one
column and the wall overflows — 94px of horizontal scroll at 320px, 29px at 390px. A
row span is harmless (it never widens a track); only the column spans need the
`28em` floor.

The gallery card — a preview with a live render in it — lives in `styles/gallery/`.
Page emits none of those classes.

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
