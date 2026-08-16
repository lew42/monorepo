A surface with a head/body/foot, plus one variant (`raised`, no header) — and
the discovery this library is proudest of: `flex gap reverse` as a
right-aligned action row.

## `reverse` instead of a missing `flex-end`

The utility set names `h-center` and `split` but nothing for "push to the far
end." `flex-direction: row-reverse` does it with the `gap` intact — at the
real cost that **DOM order reverses too**, so the primary action is first in
source order and first in the tab order. Right for a confirm dialog, wrong for
a wizard's Back/Next; the page states both sides rather than picking one as
universal.

## Why there is no `ui.panel()`

It took three slots by *position* (`panel(null, body, foot)` was a real call
site), and the one page on the site that wanted a panel wrote its own markup
instead of importing it. Omitting a row is now deleting three lines — shorter
and impossible to get backwards, unlike a positional argument.

## Improvements

1. **A `.flex.end { justify-content: flex-end }` utility** would give the
   *other* half of this trade — no DOM reorder — one declaration, proposed
   in `doc/record.md` §5 but not applied (one dialog in the whole set wants
   it today). *(simple, speculative until a second caller wants it)*
