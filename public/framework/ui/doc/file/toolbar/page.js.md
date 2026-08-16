A padded surface row: button groups, a growing search field, icon buttons —
no `toolbar.js`, because "what goes in the bar" is exactly the part a
function can't decide for its caller.

## `flex-1`, not `split`

The one real lesson: `split` (`space-between`) spreads *three* groups into
thirds and leaves the field its intrinsic width, while `flex-1` on the one
element that should absorb slack works for any number of groups — and fixes
the input, which `framework.css` makes `width: 100%` (meaning "as wide as
you can" inside a flex row, not "grow"). `wrap` needs a `min-width` on that
same element or the field collapses to a couple of pixels before dropping to
the next line, since `flex: 1` implies `flex-basis: 0`.

## Improvements

Nothing ranked: the `flex-1` vs `split` distinction is the page's whole
point and is already stated as prose, with the joined-segmented-control
alternative explicitly weighed and rejected in the exhibit note.
