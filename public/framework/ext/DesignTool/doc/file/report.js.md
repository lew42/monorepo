A report as a view. `report(data)` is the whole panel — census, metrics, ranked
issues; `report.card(data)` is the one-line verdict a gallery or an audit row
shows instead; `report.badge(data)` is smaller still, for a table cell. Three
sizes of the same data, so the audit page's table row, `live.js`'s panel and
this page's own self-check never disagree about what a score means.

## Issues are grouped by rule, not listed flat

A page with twelve `measure` violations shows one card ("12×") with the worst
instance's detail and up to `limit` example selectors, not twelve identical
cards. `weight()` sums each group's severities so the worst *category* of
problem sorts first, independent of how many individual findings it produced.

⚠ The `n×` is the sum of each finding's `count`, not the number of rows. Since
the roll-up collapses repeated structures, one row can stand for three hundred
elements, and counting rows would report "1×" for the largest thing on the page.

## The `content` metric is the empty-page signal in the panel

`metrics.text` — characters under the content region — reads out beside measure
and frame gap, with the number a dead url falls under (128) in its caption. A
404 scoring well used to be indistinguishable from a page scoring well; now the
metric says so even before the `empty` finding does.

## Every line that names an element points at it

The group heading and each instance row go through `point()`
(`highlight.js`): hover to ring the element on the page, click to keep the ring
and scroll to it. ⚠ The heading points at the **exemplar** — the box that
actually broke — while its `sel` and its proposed fix stay on the container a
sibling roll-up landed on, which is the box you would actually edit. Those were
the same address until 2026-08-17, and ringing the container meant ringing a
page-tall box. A finding with nothing honest to ring gets no affordance at all;
`point()` is the one place that decides.

⚠ **Only with a live `root`.** A path is exact relative to the root it was
walked from, and the audit page reports on a frame that is long gone: there the
rows stay inert and `mirror()` is the way to the element. One ternary, so the
two callers need no flag.

## `mirror()` and `defer()` are built on click, not up front

"Show me this element" costs a hidden iframe load — expensive enough that
building it for every issue on a page with forty findings would be wasteful.
`$slot.append(() => mirror(...))` defers the cost to the one click that wants
it.

## ⚠ `root` is the analysis root, and it has to be passed

```js
report(data, { root });      // the element analyze() walked, if you still have it
```

A finding's address is a `:nth-child()` path **from the analysis root**, so
before/after can only resolve it against that same root — see
[Addressing](../../docs/addressing/). `data` is plain JSON and cannot carry an
element, so a caller measuring the live document (`dev/DevBar/layout.js`) hands
the element over beside it. Without it the mirror falls back to `data.url`,
reloads the page in a hidden frame and reconstructs the root from `root_path` —
correct for the audit page, whose frames are long gone, and a second document
to get wrong for everyone else.

The button appears if there is *either* a `root` or a `url`; a report recomputed
from a saved capture with neither simply has no before/after to offer.

## Improvements

1. **`fix.decl` renders as raw text inside a `code()` element with no syntax
   highlighting**, unlike the rest of the site's code blocks (which go through
   `ext/highlight` when loaded). A one-declaration CSS fragment is short
   enough that this probably doesn't matter, but it's an inconsistency with
   how code reads everywhere else on the site. *(simple, speculative.)*
2. **`band()` (used for the score's color) and `SEV` (used for a finding's
   severity color) are two independent three-way mappings with different
   thresholds and no shared name** — reasonable since they classify different
   things (a 0–100 score vs. a `high`/`med`/`low` enum), but worth a comment
   saying so explicitly, since both end up as `dt-ok`/`dt-warn`/`dt-bad` /
   `dt-sev-*` classes a reader could otherwise assume are the same scale.
   *(simple, speculative.)*
