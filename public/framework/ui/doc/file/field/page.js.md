A template-only page — no `field.js` in the directory. Label, control, note:
three elements and two utility classes, with three variant children
(`invalid`, `select`, `form`) covering the shapes a real form actually needs.

## Why there is no `ui.field()`

The page states its own thesis in its exhibit note: every real form
immediately wants a fourth thing a function can't anticipate — a checkbox row,
a unit suffix, a character counter — and an option per case is API surface
forever. Documented here rather than exported, so the reader edits markup
they already have in front of them instead of learning a config shape.

## The message-size decision

The invalid state renders its error at **body size**, not `h4` (the type
scale's small level, which is uppercase-and-tracked and reads as an alarm on
a sentence). Recorded as open in `doc/record.md` §5 — no sixth type level
exists to reach for instead.

## Improvements

Nothing ranked: the page's own prose already states the trade (function vs.
template) and the open type-scale question is tracked at the module level,
not duplicated here.
