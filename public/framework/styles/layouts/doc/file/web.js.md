## What this file is

`web(config)` — one fictional site's content (a topbar, hero, sections, cards,
rows, tiles, toolbar, notes, footer), as parts. Ten of the seventeen layouts
import the same shared `site` instance and write no content of their own; what
differs between two layout pages is only where the boxes go.

## `notes()` is the one ragged part

Every other part is **uniform** by design — `tiles()` picks two aspect ratios,
`cards()` and `rows()` repeat one shape. That is right for the sixteen layouts
that were here first and useless for a masonry wall, which is a plain grid
unless its children differ in height. `notes(count)` is the exception, and it
is bare (a loop, no wrapper) like `sections()` — the **wall** is the caller's
class string.

⚠ Its lengths are a **fixed cycle** (`LENGTHS`), never random. A `twin: true`
card renders the same function twice at two widths, and a wall that reshuffles
per render cannot be compared between them — which is the entire point of the
two-up. The tallest is about 5× the shortest, which is where a ragged wall
stops reading as a grid that failed.

## `blurb` is short on purpose

The comment above it names the reason directly: a page's height at 390px is
what sets the two-up card's height (`doc/twin.md`), and the same words stack
roughly four times taller there than at 3440px — every extra sentence costs
the stage about four of its own lines. This is the file where that budget is
actually spent, one string at a time.

## One content object, sixteen arrangements

The functions capture rather than return (`div.c(…)` auto-appends to
whatever is collecting), which is what makes every layout page's source
identical in shape to something you'd paste directly into a `page.js` — the
whole point of a layout catalog being copyable.

## Improvements

1. **`web()` flatters the reading layouts and stretches for Mail and Chat**
   — already named as open in `readme.md`'s `doc/twin.md`: a second content
   object (`web({ topics: … })`) would be the honest fix if the rail grows
   past its current two content-object outliers. *(medium, speculative —
   the module's own stated position)*
