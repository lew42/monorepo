Fifteen rules for geometry that **fails**: text unreachable, boxes
overlapping, content off screen. No DOM here — every rule is arithmetic on
`probe.js`'s array via `ratios.js`'s helpers, which is what lets the same
rules run on a live page, an iframe, or a saved capture. Severity is always a
curve (`over`/`under`, three thresholds), never a single cutoff — a binary
test reported 87 and 300 characters a line identically, which is not the same
bug.

## Every threshold here is a ratio, calibrated in `knowledge/thresholds.md`

Padding against font-size, not against 8px; characters per line, not ems;
overflow against the parent's own size, not a pixel count. One number then
holds at every viewport and every font scale — the general case worked out in
[Ratios](../../knowledge/ratios.md).

## `cramped` and `gutter` are the same measurement at two scopes

Both ask "how close does the nearest text get to an edge, as a multiple of its
own font-size" — `cramped` for a box that draws a visible frame, `gutter` for
a *region* (something that scrolls) with no frame at all. `gutter` exists
because `cramped` structurally cannot see a plain page: nothing about a bare
`.pages` container reads as "an edge" to it, which is exactly how the audit
page's own flush `<h1>` went undetected until this rule was added.

## `unreachable` splits off `clipped`'s top, and `empty` is not geometry at all

Two rules added after an 854-measurement crawl found the ranking authored by the
analyzer's own bugs. `unreachable` takes the spills where **more is hidden than
shown** (ratio ≥ 1) **and it is at least 200px** — the case a severity tier
could not express, since a 3% clip and a 455% clip were both one `high`.
`empty` measures the absence of content rather than any arrangement of it,
because seven dead urls scored 90–94/A by firing nothing. Both are weighted by
name in `score.js`; neither changes what a severity means.

## A table is where three rules had to be told to stop

`TABLE` (`table`/`thead`/`tbody`/`tfoot`/`tr`) is exempt from `cramped`
outright — a row draws a border and cannot hold the padding, so the finding
names an element no declaration would fix. `CELL` (`td`/`th`) stays in at the
**touching band only**, which keeps the `padding: 0` table and drops 175
identical `0.25×` findings from one page. And `measure`'s ladder branch skips
anything inside a cell, ancestors included — the branch's own comment always
said 18–24 characters is normal for a cell, and nothing enforced it.

## `distinct()` — one control, reported once

`hit-size` is the only rule that collapses inside itself, because it is the only
one whose findings are literally the same box drawn again: `input.layout-range`
is 60×17 wherever the layout panel puts it, and one CSS line produced 437
findings across 71 pages. Selector × rounded size is the key; the count rides
along on the surviving issue. Everything else collapses later, in
`LayoutTool.js`'s roll-up.

## `doc-overflow` reports only the outermost offender in a chain

A wide element's children are all wide too by construction; reporting every
one of them is one bug counted twenty times. Same principle as
`LayoutTool.js`'s sibling roll-up, applied along the ancestor chain instead of
across siblings.

## Improvements

1. **`empty` is the only rule here that is not geometry**, and `cat: "content"`
   is a category of one. It earns its place by being the thing that ranks a
   dead url, but if a second non-geometric check ever appears (no headings, no
   landmarks) the two tiers stop being "broken" and "off" and the readme's
   framing needs revisiting rather than extending. *(medium, speculative.)*
2. **`hit-size` divides by `n.escale` to judge "at its own scale," while
   `illegible` multiplies by it to judge "on screen."** Both are correct and
   both are explained in their own comments, but the fact that the same
   `escale` value is used in *opposite* directions by two adjacent rules is
   the kind of thing worth one sentence in `knowledge/ratios.md` rather than
   only discoverable by reading both rules side by side. *(simple,
   useful.)*
