# `readme.md`

The long-form record: everything `core/App/readme.md`, `core/Page/readme.md`
and `core/Router/readme.md` summarize points back here for the measurements.
Covers the removal of `mode`, the `.active-ancestor:has(.active-page)`
visibility rule, tabs, `route()`'s ordering relative to declared children, a
full "Measured" section (module counts, `mark()` timing, `:has()` cost), the
one unbounded thing (`route()` views are never evicted), and the fourteen-seat
council round in full — applied changes, kept-deliberately verdicts, the
"one failure mode in four costumes" (a label depending on what happens to be
imported), and a four-rule motion contract needing zero framework changes.

## Structure worth knowing

Longest of the three tier readmes (~590 lines) and the most table-heavy —
`## What replaced the Pager tier` and the council's `## Applied` block are both
two-column comparisons, which is what makes this readable as a diff against
`new/starter` and against `core/Pager/` rather than as prose alone.

## Improvements

1. **None ranked.** This is the file CLAUDE.md itself names as "the long-form
   record, with measurements" — not a candidate for trimming.
