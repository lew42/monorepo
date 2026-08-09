# What a doc page is made of

The brief was *"simpler, clearer, easier, on-demand — start super simple, but have
links to more advanced examples."* This changed how every page under `/framework/` is
written rather than any one class.

| piece | replaced |
|---|---|
| `ext/files` — a tree of real files, fetched | a wall of `code.html()` string literals showing `index.html` in full |
| `ext/toc` — a page's own headings, scroll-spied | scrolling to find a section |
| `demo()`'s third pane — the real DOM, read back | "and this renders…", unverifiable |
| `.tabs.vertical` + `classdoc.page()` — a members rail beside a panel | a grid of preview cards you had to leave the page to use |

**The organising principle: a doc page should answer *"where do I click to see X"* in
one glance.** Screen space is finite, so the three navs a page can carry are
deliberately different questions — the site sidebar is *which module*, the vertical rail
is *which member of this module*, the toc rail is *which section of this page*. None
duplicates another, and a page opts into the two inner ones with one call each.

## Why the members nav is `tabs()` and not a new class

`.tabs.vertical` is **CSS only** — no new JS, no new API. A bar of links beside its
panel is a bar of links above its panel with the axis swapped, so the urls, the default
tab, the `.active` marking and the labels are all `tabs()`'s. Getting this for a
stylesheet is the strongest evidence so far that the arrangement contract
(`.active-page` / `.active-ancestor` and nothing else) was the right shape.

It surfaced one real bug: the **default tab's href is the page's own url**, which is a
prefix of every sibling's, so `mark_links()` gave it `.in-path` on every tab in the set
— every bar on the site read as having two things selected. Fixed with a `tab-default`
class written where `owns_url` is known, plus a `:not(.tab-default)` in the CSS. Live
and unnoticed for as long as tabs have existed, which is what a flat bar with one member
does to your eye.

`ext/classdoc/doc/rail.md` has the reversal in full: the "no overflow handling" objection
was about a *horizontal* bar, and a vertical one handles twenty names fine.

## Trap: sticky needs a scrolling ancestor and a grid item that isn't stretched

`ext/toc` shipped as `position: fixed` because the obvious `sticky` did nothing —
**the region scrolls, not the page**, so a sticky element inside a `.page` sticks to a
box that never moves. The rail is a real column now: `position: sticky` in a grid track
with `align-self: start`, because a *stretched* grid item is already as tall as its
track and has nothing to stick within. `fixed` is recorded in that file as the bug, not
the fix.

The same fact bit the scroll-spy listener (it has to be on `.pages`, not `window`) and
the initial "current" marking, which read the *last* heading because a `display: none`
page measures every rect at 0. **Three separate symptoms, one cause, and all three are
silent.**

## The readme / page.js split

Two audiences, two documents, in the same directory, and blurring them is the failure.

- **`page.js` is the reader.** Code first — the first thing under a title is a code
  block or a `demo()`, never a paragraph. Prose is a *caption*, not a preamble, which is
  why `demo(fn, "the sentence")` puts the caption inside the box: prose can never
  detach from its example. A section is a path, not a fan-out — every page ends by
  naming the next one.
- **`readme.md` is the maintainer.** The dilemmas, what was tried, why the current
  shape won, what is still open — as question → options → weighing → verdict. One
  screen; long history moves to `doc/*.md` beside it, cited in one line. A readme is not
  a running commentary on past mistakes.

`classdoc`'s `notes:` list serves those same `doc/*.md` files as pages, so a record is
**written once and read twice**: by the maintainer through the readme's citation, and by
a visitor at a real url.
