# catalog — decisions, in full

The short verdicts are in [`readme.md`](../); this is the reasoning kept, for
whoever hits the same fork later.

## Where does the page's own prose go?

`catalog()` replaces the body, so an index with a paragraph of introduction had
nowhere to put it — which is why only two pages on the site were rails while
sixteen were walls, before this method existed.

| option | weighing |
|---|---|
| prose above the rail, `catalog()` still called from `content()` | the reading measure and the rail's full-bleed screen are two different page kinds stacked; every converting page re-invents where its prose sits |
| a second config key — `intro: () => …` | an option is API surface forever, and it says nothing `content()` doesn't already say |
| **the page's own `content()` becomes the rail's first entry** | ✓ |

**Verdict: `content()` becomes the intro.** `Doc` had already invented this for
its Overview tab (an inline `intro` child, first in the rail, labelled and
iconed like its parent) and it was the only reason previews-as-nav worked
there. Lifted into `catalog()`, it makes the conversion **one line on any
index** — `Doc.js` now declares `content` on the group and calls
`this.catalog()`; the duplicate implementation is gone.

## The call moved from `content()` to `initialize()`

The intro has to be a *real child at a real url* — otherwise its card links
nowhere and a deep link 404s — and children are only routable if they exist
before the router walks. `render()` is far too late. `initialize()` is where
`Doc` already added its groups, and the call site reads as what it means: this
page **is** a catalog, rather than *draws* one.

Two consequences worth knowing. The moved `content` **keeps its original
`this`** — it was written as a method of the page, and `styles/sections`
proves the point by calling `this.whole()` inside it. And the page's own `h1`
is hidden by `catalog.css`, because the intro entry carries the title now —
that mirrors what `Doc`'s group render was doing by hand.

## A method, not a recipe

The demos record (`core/Page/overview/readme.md`) proved master–detail
*buildable* with `flex gap` + `basis` + `$pages` and said no new API was
needed. Three real users later — the Page overview's demo rail, every `Doc`
Overview tab, and the demos teaching page itself — the hand-built version was
about to be pasted a third time, each paste needing the same default-fill and
`mark_links()` repair. The recipe stays (it is the
[catalog demo](/framework/core/Page/overview/catalog/), and the honest
minimum); the method is the recipe plus the two things a permanent page owes:
a filled region on load, and marks on links built after the pass.

## An ext, not core

Same line `tabs()` sits behind: core owns *what a page is*, arrangements are
opt-in. `app.js` imports it once for the site; `ext/Doc` imports it for
itself.

## The rail is `previews()` unchanged

One column via `grid-template-columns` on the same `.page-previews`, so a
child styles its card once and it is right on the wall, in the rail, and in a
strip. No second card, per the five-block rule.

Two of a card's *wall* claims cannot survive the turn, both found by
converting `styles/layouts`: `.two`/`.big` span two tracks, and **a span
invents the track it asks for** — so one `card: "big"` child made the whole
rail two columns wide and ragged. And in the `< 64em` strip the cards are one
row, so the tallest sets the height for all of them; a full-size live thumb
scrolled off to the right was reserving 250px of empty strip above the fold.
The rail drops the span and lowers `--thumb-max`; `tall` still means what it
means.

## The rail is pinned, and it scrolls itself

`sticky` + `max-height: 100dvh` + `overflow-y`. This reverses "just let them
flow, we can limit them later" (2026-08-11) because it bit the same day: the
only scroller was the region, and `Router` scrolls that to the top on every
navigation — so scrolling a 16-card rail and clicking a card threw the rail
back to the top with everything else. The narrow strip never had the bug,
because `overflow-x: auto` had already made it its own scroll container; the
wide rail just never got the same. At rest the rail's foot sits below the
fold by the page's top padding, and a wheel over it chains into the region
and pins it flush — which is why `top` is `0` and not the inset (the inset
varies: 3em + `--flow` on a standard page, a tab bar's height inside a `Doc`
group).

**Superseded, in part, 2026-08-16.** The paragraph above assumed "the only
scroller was the region" — meaning the OUTER `.pages` — would always still be
a scroller for a catalog page. It stopped being one the day `/styles.css`
picked up `.pages:not(:has(> .page.active-page))… { overflow-y: hidden }` for
the `.page.topic` nested-region pattern: that rule also fires on a catalog's
outer `.pages`, correctly, because the active leaf there is never its direct
child either. Nothing chains into a hidden region, so "a wheel over it chains
into the region and pins it flush" became false, and the rail's known
below-the-fold overshoot (footnoted here as tolerable) went from *cosmetic*
to *unreachable* along with the whole region beside it — see readme.md's
Traps entry. The fix gives `.page-catalog` a real height ceiling
(`align-items: stretch`, fed by a definite height on the `.page` itself, the
same trick `.fill` uses for `.page.topic`) instead of leaning on the outer
region to bail it out. `sticky` stays — harmless, and cheap insurance if a
future caller mounts a catalog somewhere that genuinely does still scroll
above it — but it no longer does any of the work; the ceiling does.

## The ceiling had to stop at the `.pages` boundary

The first pass wrote the new `overflow-y: auto` straight onto
`.page-catalog-pages`, unscoped — global, like everything else in this file.
It fixed all 18 named pages and broke every `Doc` Overview tab
(`core/App`, `core/Page`, `ext/ui`, six more), verified live before it shipped
by auditing every `catalog()` caller rather than trusting the named 18. A
`Doc` Overview is a catalog inside a `.tab-panel` — plain block, nothing above
it ever hands down a definite height — and CSS gives a flex item an automatic
minimum size of `0` the moment its `overflow` isn't `visible`. With no floor
and `flex: 1 1 0`'s shrink free to act, the region collapsed to
`clientHeight: 0` — content gone entirely, worse than the bug being fixed,
since a `Doc` Overview's outer scroll was never broken (its `.pages` is the
topic's own nested one, direct child of the routed leaf, never hidden).

The fix: scope the new declarations to
`.pages > .page:has(> .page-catalog) > .page-catalog > .page-catalog-pages` —
matching only a catalog that is a direct child of a `.pages` (the app's, or a
topic's own nested one), which is precisely the shape whose outer scroll
`/styles.css` can hide. A `.tab-panel`-nested catalog never matches, keeps its
pre-fix behaviour (content-sized, reachable through the topic's working
scroll), and never sees the new rule at all. The broader lesson: a shared
method's fix has to be checked against every DOM shape it's mounted in, not
just the shape of the pages that happened to score badly enough to get found.

## The ceiling had to stop at "nothing routed", too (2026-08-16, catalog-gutter)

An audit run after the ceiling shipped found `/framework/ai/` newly scoring a
`gutter: high` — text 0px from the outer `.pages`'s edge — and read it as a
missing-padding regression the ceiling fix owed a token for. It wasn't. Tracing
the flagged node (`text_bounds()`'s own clamp-to-clipping-ancestor comment
names the mechanism) to the actual DOM showed the "gap" was a hard clip: the
ceiling's `overflow: hidden` now caps `/framework/ai/`'s own page height
unconditionally, but that page's rail is `/framework/ai/page.js`'s
`previews(){ return rail(this); }` override — `ai.css`'s `.ai-index-rail`, the
only non-`.page-previews` rail on the site. In its "board" state (nothing
routed — the common case, the dashboard's own front page) `ai.css` already
declares `.ai-index-rail { overflow: visible }`, commented *"a board is not a
scrollport — the page scrolls"*: a deliberate bet that the ancestor page would
grow to its natural height and the outer `.pages` would scroll it, exactly
like any ordinary page. The ceiling's unconditional cap broke that bet — the
page could no longer grow, so `.pages` never learned there was 15000px more,
and none of it had a scrollbar, a wheel, or a keyboard path to reach it.
Confirmed via `clientHeight`/`scrollHeight`: 900 vs 15937 on the page, 900 vs
900 on `.pages` (it never saw the difference). Confirmed via `git stash` of
just this file that the pre-ceiling code had neither the clip nor the finding.

**Fix: the ceiling only applies once something is actually routed inside
`.page-catalog-pages`.** Both halves of the original fix —
`.page:has(> .page-catalog) { align-self: stretch; overflow: hidden; … }` and
the scoped `.page-catalog-pages { overflow-y: auto }` — gained the same
`:has(> .page-catalog-pages > .page:is(.active-page, .active-ancestor))` test
`ai.css` was already keying its own board-vs-split column layout off. Reusing
that exact test (not inventing a new one) is the point: catalog.css and ai.css
now agree on the one question that decides which shape applies, instead of
catalog.css assuming a shape ai.css had already opted out of for one state.
When something IS routed — the split view, rail beside region, both bounded —
the ceiling behaves exactly as it did before; verified unchanged (still
`overflow: hidden`, still a definite height, still its own internal scroll).
When nothing is routed, the page reverts to plain document flow and the outer
`.pages` scrolls it, restoring the pre-ceiling behaviour for exactly the one
state that needs it.

**Second collapse, caught before landing, same shape as the original ceiling
bug.** Relaxing the ceiling for "nothing routed" removed the definite height
`.page-catalog-pages`'s `flex: 1 1 0` was resting on — and since its own
`overflow-y: auto` still isn't `visible`, its automatic minimum size is still
`0` regardless of a definite ancestor. At the `< 64em` strip breakpoint (where
`.page-catalog` is already a column) this collapsed `.page-catalog-pages` to a
true `0×0` box on *every* catalog caller's default view, not just `/framework/
ai/`'s — a 375×0 box still holding real content, DesignTool's `zero-size` rule
caught it immediately. Same fix, same test: the scoped `overflow-y: auto` rule
now carries the identical `:has(...)` condition as the ceiling, so the two
rules can never disagree about which state they're in.

**Left unfixed, out of this module's fence:** `/framework/ai/<day>/` (and any
task beneath it) is still unreachable at `< 64em` *while routed* — a third,
independently pre-existing regression from the same ceiling, confirmed via
`git stash` to predate `catalog-gutter` entirely. `ai.css`'s own mobile media
query (`@media (max-width: 64em) { .page-catalog > .ai-index-rail { flex: 0 0
auto; position: static; max-height: none; } }`) doesn't carry the routed/
unrouted split its desktop board-mode rule already does — so at mobile, while
routed, the rail keeps `max-height: none` and its full natural height (tens of
thousands of px, `shrink: 0`) consumes the entire bounded column, squeezing
`.page-catalog-pages` to `clientHeight: 0` again (confirmed: 0 vs a
`scrollHeight` of 9029 on a real day page). The fix belongs in `ai.css`, not
here: give `.ai-index-rail` the same self-bounding treatment at mobile
(`overflow-y: auto` plus a real `max-height`) that it already gets on desktop,
gated on the same `:has(> .page-catalog-pages > .page:is(.active-page,
.active-ancestor))` test its own board-mode rule already uses — or fold the
mobile query into that same selector split outright, the way the desktop rule
already reads.

## `reveal()` — the deep-link case, closed

The lit card is scrolled into view once, after `app.ready`, with
`scrollIntoView({ block: "nearest", inline: "nearest" })`: one call for the
rail (which scrolls down) and the strip (across), a card already showing is
left alone, and neither shape has to know its own top inset — which is what
makes it hold inside a `Doc` group, where the rail sits in a tab panel.
`tabs()` bans that same call on its bar, because a bar is in the flow and
reaching a tab must not move the region; a sticky full-height rail *wants*
the remainder, since taking it is what pins the rail flush.

## The rail's own shape, tuned against four catalogs (Aug 2026)

It pays `--gutter-x` back as a `margin-inline-start` so it starts on the
page's axis instead of 9px off the app sidebar; `row-gap` is `1.2em` — the
rail's own, never `--gap`, which inherits and would retune a live thumb's
`.gap` utilities; the scrollbar is `thin`; and the page's hidden `.page-title`
gets its flow margin reclaimed, because `.page-title + *` was handing the
catalog 1.5 × `--flow` on top of `--pad-y` and every standard catalog paid its
top inset twice.

## A catalog is a screen, so `bleed` is the method's, not the call site's

`styles/elements/forms` was the one page that knew to write `.ac("bleed")`,
with a comment explaining the doctrine beside it — a rule living at one of
its call sites is a rule the next call site will miss. The block knows what
it is.

## Two contracts are restated, with their sources named

The default-hide rule is `.tab-panel`'s, re-anchored to
`.page-catalog-pages`. The first-card-lit fallback is `.tab-bar`'s first-tab
rule, and its declaration is `Page.css`'s lit card verbatim — a fallback
cannot share the selector it falls back from. Change the lit look in
`Page.css`, then here. It costs **one** declaration now (`outline-color`)
because the card's ring is always drawn and only ever recoloured. ⚠ It asks
`:has(> .page-preview > a…)`, the same child combinator `Page.css` warns
about: with a bare `:has(a…)` a live thumb's own back-link marked the whole
rail as "something is selected," and no card lit at all on three of six
catalogs.

## A rail can be headed, and the headings are `previews()`'s

A child that declares `group:` makes `previews()` emit an `h4` at the top of
that run (`Page.class.js`), so fourteen near-identical cards read as
Basics / Arrangements / Sites instead of a list of nothing. Nothing here
knows about it — it is the same wall, the same cards, and the rail is that
wall in one column. ⚠ **The strip hides them** below `64em`: a full-row span
has no row to span once the rail is one column, and a label in a column of
its own would spend 11em of a phone's scrollport.

## Why `screen()` re-awaits `this.loading`, which is usually already settled

`Router.load()` awaits a page's own `this.loading` before it ever calls
`render()`, so by the time `screen()` runs from inside a normal navigation the
promise is already resolved and `Promise.resolve(this.loading).then(...)`
fires on the next microtask — not a real wait. The re-await exists for the
case `Router` doesn't cover: a catalog mounted directly, e.g. inside
`demo.app()`, where nobody awaited anything first. Worth knowing before
"optimizing" it away.

# catalog — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Two arrangements of `previews()`, patched onto `Page` the way `tabs()` is —
`catalog()`, a persistent rail beside the routed child, and `browse()`, a
filterable wall of bands. **The distinction is whether the reader is choosing
from the set or reading it in order.** Neither invents a card: both draw the
same `preview()` the child already has (RULE#7).

## `browse(bands, tokens)` — the wall (2026-08-17)

```js
const BANDS = { Surfaces: "card toolbar panel", Data: "table timeline" };
content(){ return this.browse(BANDS, { "--column": "18em", "--gap": "2em" }); }
```

A sticky rail of band counts and a search, beside **one grid per band**. Two
pages are one call to it — `styles/layouts/` (29 cards) and `ui/` (19
components) — and it exists because they were the same ninety lines twice.
Full contract, including the borrowed-grandchild `owner/name` form:
[`method/browse.md`](./method/browse.md).

Four things it knows that are not obvious, each measured on the way in:

- **One grid PER BAND.** `previews()` emits one flat run with a full-width
  heading per group, so a band of one renders a row holding one card.
- **The heading sits OUTSIDE its grid.** A `.page-previews-group` spans
  `1 / -1`, so every track holds an item and `auto-fit` has nothing to
  collapse — a five-card band drew eight tracks and used 1640px of a 2752px
  wall at 3440.
- **`auto-fit`, not `Page.css`'s `auto-fill`**, which keeps the empty tracks.
- ⚠ **`1fr` as the track maximum, and this is not "every track needs two
  bounds".** A *length* as the maximum is what the repeat COUNT is computed
  from: `minmax(18em, 26em)` measured **one** column at 1280 where
  `minmax(18em, 1fr)` measures two. The cost of `1fr` is that a short band
  stretches its cards, which is why band sizes are load-bearing.

⚠ **`browse`, not `browser`.** `Doc.browser()` is the Files tab's file
browser, so `this.browser(BANDS)` on a `Doc` resolves to *that* and draws a
file tree where the wall should be, with nothing in the console. The class
name is the registry, and so is the method name.

## `catalog()` — the rail

`previews()` as a persistent rail, a `$pages` region beside it, the first
child rendered `.default` so the region is never blank. One line converts any
index:

```js
initialize(){ this.catalog(); }
```

It is not a component with an API of its own — it is a rearrangement of
`Page`'s existing tree and its existing `previews()` wall, ~60 lines of JS
(`catalog.js`) and one CSS file (`catalog.css`) that turns the wall on its
side and pins it. There is no class here; `page.js` documents it as a
patched `Page` method (`subject: Page`), the same way a patched `View`
method gets documented on `View`'s own page.

## What it does

`catalog()` moves this page's own `content()` into a new first child,
`"intro"`, wearing this page's title/label/icon — a real child at a real
url, so it gets a card, a deep link, and the marking every other entry has.
Everything else that was already a child keeps its name, order and `Page`
instance. `content` is then replaced with a renderer that draws the rail
(`this.previews()`, one column) beside a `$pages` region the children mount
into. Full mechanism: [`method/catalog.md`](./method/catalog.md).

## Why `initialize()`, not `content()`

A child only has a url once the router has walked it, and `render()` — where
`content()` runs — happens long after that. `initialize()` runs inside the
`Page` constructor, before children resolve, which is the one place adding a
real routable child is safe. The full fork, including what almost shipped
instead (`intro:` as a config key): [`decisions.md`](./decisions.md).

## The rail is `previews()`, turned sideways

One `grid-template-columns: 1fr` on the same `.page-previews`, `position:
sticky` so the rail scrolls itself instead of getting thrown to the top on
every navigation, and a `< 64em` breakpoint that turns the column back into
a horizontal strip above the detail. No second card shape exists anywhere in
this file — a card styled once is right on a wall, in a rail, and in a
strip. Full CSS tour: [`file/catalog.css.md`](./file/catalog.css.md).

## Who calls it

Grepped across all of `public/`. Direct callers — `initialize(){
this.catalog(); }` on their own page:

| page | url | rail of |
|---|---|---|
| `framework/ui/page.js` | `/framework/ui/` | by inheritance — its Doc Overview rails one intro, and the 19 components are a `browse()` wall inside it (2026-08-17) |
| `framework/ai/page.js` | `/framework/ai/` | one entry per working day |
| `framework/styles/sections/page.js` | `/framework/styles/sections/` | 15 page bands |
| `framework/styles/layouts/400/page.js` | `/framework/styles/layouts/400/` | 5 specs, one column at 400px |
| `framework/styles/elements/forms/page.js` | `/framework/styles/elements/forms/` | every form control |
| `web/nav/page.js` | `/web/nav/` | 11 nav patterns — also the page's own subject |
| `web/layout/page.js` | `/web/layout/` | 7 layout principles |
| `core/Page/nav/page.js` | `/framework/core/Page/nav/` | a live demo, inside a `demo()` box |

**`styles/layouts/` gave this up on 2026-08-16** and is worth reading as the boundary:
a rail is right for a tier you read *through*, and wrong for a tier you *choose from* —
twenty-three cards in one column, six visible at a time, on a page whose whole argument
is that layouts use their width. It is a `browse()` wall now — the panel went too, on
2026-08-17. `styles/layouts/readme.md` has the reasoning; nothing about `catalog()`
changed, and the wall it left for is the sibling method at the top of this file.

And one structural caller that fans out to every module with docs:
**`ext/Doc/Doc.js`** imports `catalog.js` directly and calls
`this.catalog()` from `overview_section()` — so every `Doc`'s Overview tab
*is* this method, `overview: "a b c"` being sugar for naming sibling
directories as the children it rails. Eight `Doc` pages exist today
(`core/App`, `core/View`, `core/Page`, `core/Router`, `core/Sidebar`,
`dev/Socket`, `ext/Doc` and this page), and every one of them is a caller
by inheritance rather than by import.

`app.js` is the only unconditional importer (`import
"./framework/ext/catalog/catalog.js";`), which is what makes the direct
callers above able to write `this.catalog()` without importing anything
themselves — the same shape `tabs()` uses.

## Decisions

| question | verdict |
|---|---|
| where does the page's own prose go once `catalog()` owns `content`? | it becomes the rail's first card — no `intro:` config key |
| call from `content()` or `initialize()`? | `initialize()` — children must exist before the router walks |
| hand-build the rail per site, or a shared method? | a method, once three real users pasted the same recipe |
| let the rail scroll with the page, or pin it? | pinned (`sticky`) — the region scroller was throwing a scrolled rail back to the top on every click |
| core or ext? | ext — arrangements are opt-in, core owns what a page *is* |
| the region's scroll bound (2026-08-16): a `calc(100dvh - chrome)` guess, or a real ceiling from the flex chain? | the chain — a guessed constant breaks the moment the nav bar wraps (390px), the chain never can |

Full reasoning for each: [`decisions.md`](./decisions.md).

## Traps

- **⚠ The rail and the region need an explicit height CEILING, not just
  `overflow-y: auto`.** `Page.css`'s `.pages` never stretches its children, so
  without `align-items: stretch` on `.page-catalog` and a matching
  `align-self: stretch` + `grid-template-rows: minmax(0, 1fr)` on the `.page`
  itself (the same definite-height trick `.fill` gives a `.page.topic`), both
  children grew to fit whatever was mounted — and `/styles.css` correctly
  hides the OUTER `.pages`'s scrollbar whenever the active leaf isn't its
  direct child, so **the bottom 55%+ of every catalog page was clipped with
  no scrollbar, no wheel, no keyboard, and no visual sign** (found 2026-08-16,
  18/205 pages: all of `/web/nav/*` and `/web/layout/*`). `/styles.css` didn't
  need to change — a `calc(100dvh - chrome)` guess would have too, the moment
  the nav bar wraps at 390px.
- **⚠ The new `overflow-y: auto` on `.page-catalog-pages` has to stay SCOPED
  to `.pages > .page:has(> .page-catalog) > .page-catalog > …`, never the bare
  class.** A `Doc` Overview tab is a catalog too, inside a `.tab-panel` (plain
  block, nothing above it ever stretches) — unscoped, this regressed every
  `Doc` page: a flex item whose `overflow` isn't `visible` gets an automatic
  minimum size of `0` (spec), so `flex: 1 1 0`'s shrink took the region to
  `clientHeight: 0` — worse than the original bug, since it used to render
  fully (reachable via the topic's own working scroll). Caught auditing every
  `catalog()` caller, not just the named 18. Full account (both traps):
  [`decisions.md`](./decisions.md).
- **⚠ The ceiling only belongs once something is ROUTED.** The gutter it always
  lacked was invisible until the ceiling above made a region scroll — but the
  `gutter: high` an audit found on `/framework/ai/` right after wasn't that
  gutter: the ceiling's `overflow: hidden` is unconditional, and `/framework/
  ai/page.js`'s `previews()` override (`ai.css`'s `.ai-index-rail`) has its own
  "board" state that deliberately sets `overflow: visible` and leans on the
  PAGE growing so the outer `.pages` can scroll it — the ceiling silently
  capped that at 100dvh, clipping ~15000px of dashboard with no scrollbar
  anywhere (2026-08-16, `catalog-gutter`). Fixed by scoping both ceiling rules
  to `:has(> .page-catalog-pages > .page:is(.active-page, .active-ancestor))`
  — the same routed/unrouted test `ai.css` already uses for its own column
  switch — so the ceiling only ever applies to the bounded split it was built
  for. Un-scoping it also collapsed `.page-catalog-pages` to a true `0×0` box
  at the `< 64em` strip on every caller's default view (same automatic-
  minimum-size-0 mechanism as the trap above); the scoped `overflow-y: auto`
  rule carries the identical test now, so it can't disagree with the ceiling.
  One regression from the same ceiling is left unfixed, out of this module's
  fence — `ai.css`'s own mobile media query. Full account:
  [`decisions.md`](./decisions.md).
- **⚠ Inside a `demo.app()` miniature, the bled rail's own edge IS the box's
  edge.** `demo.app()`'s `.demo-app-pages` (ext/demo) is a boxed, scrolling
  shell, not a screen — this module's own doc page had `gutter: high` at
  390/720 on its "wall or rail" comparison, the strip's last card clamped
  flush against `.demo-app-pages`'s own vertical scrollbar with none of its
  0.5em padding to spare (found & fixed 2026-08-16, `catalog-demo-gutter`).
  Same doctrine as the sidebar-start case above, paid back on
  `margin-inline-end` this time (padding doesn't move the clip boundary
  DesignTool clamps against — margin does), scoped to `.demo-app-pages` so
  no real page pays a gutter it doesn't need.
- **⚠ The wall-vs-rail comparison row sized its two `demo.app()` boxes by raw
  content, not by the row.** Default flex (`flex: 0 1 auto`, `min-width:
  auto`) let the rail's card-filled box refuse to shrink and starved the
  wall's plain paragraph to a collapsed sliver at any width, worst at 390
  (`zero-size`/`measure`, high — a 42px box holding a 6px-wide text column,
  "Web" laddering one letter per line). Fixed 2026-08-16
  (`catalog-wall-demo`) by giving the row the existing `.flex.auto` utility
  instead of inventing anything — both boxes now share it equally and shrink
  together, which also makes the comparison fair at every width, not merely
  unbroken at 390 (previously 198px vs 525px at 1280 with no rule tripped).
- **⚠ Must run from `initialize()`.** Calling it from `content()` builds the
  intro as an unroutable child — its card would link to a 404.
- **⚠ The moved `content` keeps its original `this`.** It was written as a
  page method before the move; `catalog()` wraps it, it doesn't rebind it.
- **⚠ A second call isn't guarded.** Nothing on the site calls `catalog()`
  twice, but nothing stops it either — it would re-wrap an already-wrapped
  `content` and insert a second `"intro"` over the first. See
  [`file/catalog.js.md`](./file/catalog.js.md) for the one-line fix.
- **⚠ `--rail` (19em) and `row-gap` (1.2em) are un-named magic numbers**,
  tuned by eye against four real catalogs rather than derived from a token.

## Open

- **`--rail`'s width has no token yet.** More pages render a visible
  multi-card rail than the six the original tuning pass (Aug 2026) checked
  against — none fighting the default yet; the first one that does is the
  signal to promote it (`catalog.css`). Not every caller above shows a rail:
  a `Doc` whose Overview has no `overview:` key gets a single hidden-rail
  intro, same as a rail of one anywhere else.
- **No guard against calling `catalog()` on a page that's already one.**
  Theoretical today — recorded so it isn't rediscovered the hard way.
- **`/framework/ai/<day>/` (and any task inside it) is unreachable at `< 64em`
  while routed** — a pre-existing regression from the same ceiling, confirmed
  via `git stash` to predate `catalog-gutter`, but the fix lives in `ai.css`
  not here: its mobile media query gives `.ai-index-rail` `max-height: none`
  unconditionally, so at mobile-while-routed the rail's full natural height
  (`flex-shrink: 0`) consumes the whole bounded column and squeezes
  `.page-catalog-pages` to `clientHeight: 0` (confirmed against a
  `scrollHeight` of 9029 on a real day page). Needs the same routed/unrouted
  split its desktop board-mode rule already has. Full account:
  [`decisions.md`](./decisions.md).
