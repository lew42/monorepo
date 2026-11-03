The `timeline()` function and its CSS. See
[the `timeline` API page](/framework/ui/api/timeline/) —
`doc/method/timeline.md` — for what the function itself guarantees; this file
covers what the stylesheet is doing.

## The line is a border, not a pseudo-element

`::before` with `position: absolute` would also satisfy tooltip's
relationship-and-state test, but needs a selector either way — an empty
`flex-1` div's inline-start border achieves the same hairline **in the flow**,
owned by the row that draws it, with no pseudo-element at all.
`:last-child` rules stop the line and the trailing padding on the final row,
replacing what used to be an index compared against `items.length` and a
`last` flag threaded through the loop.

## Improvements

Nothing ranked: the simplification from JS bookkeeping to two `:last-child`
rules is already the file's headline change, recorded in `doc/record.md`
§11.
