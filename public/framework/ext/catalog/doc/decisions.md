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
opt-in. `app.js` imports it once for the site; `ext/doc` imports it for
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
