## `toc.js`

The whole module: one exported factory and five private helpers it never shares. No
class, no state kept outside the closure `fill()`/`spy()` build over a single `$toc`.

## Placement vs. fill

`toc()` builds and returns the `<nav class="toc">` **synchronously**, then
`queueMicrotask(() => fill($toc))`. It has to run in that order: at the top of a page's
`content()` the headings the container is meant to index don't exist yet, and capturing
has to happen before the function returns (`View.captor` is one global stack). See
`readme.md` for the alternatives this was weighed against.

## Ids: slugged and de-duplicated

`slug()` lowercases and strips punctuation; `unique()` appends `-2`, `-3`, … against a
`Set` shared across the one scan. Two headings that both say "Overview" — a real case,
a class page's Overview tab and its own `## Overview` prose — get distinct anchors
instead of two `#overview` links racing each other.

## Scroll spy: geometry, not observers

`spy()` computes one `line` (the scroller's top + a 90px offset) and walks `headings`
top to bottom, keeping the last one whose top has passed it. Run on every `scroll`
(passive), and twice at setup — once immediately, once after
`requestAnimationFrame` — because a page built while off-screen (a tab panel's default,
a cold load) measures every rect as `0,0` until it is actually in the layout.

## `reveal()` nudges, never centers

Scrolls the rail by exactly the overhang (`row.top - box.top` or `row.bottom -
box.bottom`), never re-centers. A rail that already shows the current row does nothing
— important because it runs on every scroll event, not just on navigation.

## Improvements

1. **`toc(...args)` accepts and `.assign()`s arbitrary args, but nothing on the site
   passes any** (checked: 20 call sites, all bare `toc();`). Either it's there for a
   caller that hasn't arrived, or it's unused surface worth dropping until one does.
   *(simple, useful)*
2. **The `90` in `scroller.getBoundingClientRect().top + 90` is an unexplained magic
   number** — presumably a reading-line offset below a sticky header. A one-word
   comment naming what it approximates would save the next reader from re-deriving it
   by trial. *(simple, useful)*
3. **The scroll listener is never removed** (readme's own Open item) — bounded today by
   pages visited, not navigations. Not worth fixing until `Page` starts discarding
   views, but the fix is a `deactivated()` that calls `scroller.removeEventListener`.
   *(medium, useful, deferred deliberately)*
4. **No re-scan after the first pass**, so a heading appended later — `md.file()`
   resolving after `content()` returns — never joins the nav. Also a deliberate
   deferral; a `MutationObserver` is the fix and the readme already prices it.
   *(medium, speculative)*
