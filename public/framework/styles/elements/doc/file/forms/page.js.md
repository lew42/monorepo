## What this file is

Every form control as a catalog rail (`demo.page()` per control, ten cards),
plus the page's own prose on the one reset rule that matters most:
`input, button, textarea, select { font: inherit }` — controls opt out of
the document font by default, in every browser.

## Carries the module's one local stylesheet-ish thing

`css(`@layer site { .range-soft { … } }`)` at the top is a candidate slider
skin kept local to this page until a winner graduates — the one deliberate
exception to "no stylesheet in this directory," and it says so via being
scoped to one page rather than living in `framework.css`.

## The two `:not()` lists that disagree

The `types` demo card is the whole finding: the base layer's `:not()` list
(what gets `width: 100%`) is longer than the theme layer's (what gets
padding and a border), so a submit input is full-width-exempt but still
takes border-and-padding. Comment in `framework.css` says someone already
hit the reason (a border changes a submit input's height/bg/hover).

## Improvements

1. **`range` and `unlisted` (file, date) are explicitly on the design record
   as awaiting the same judgement** that got `[type=range]` added to the
   eviction candidates. Not this file's call — flagged as inherited from
   `doc/framework-css.md`. *(simple, speculative)*
