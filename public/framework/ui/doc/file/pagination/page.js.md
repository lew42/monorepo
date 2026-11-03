Real `<button>` elements, one `.c(cond && "prim", …)` conditional class for
"current" — the whole component. No CSS file: `framework.css` already gives
`button`/`.btn` fill, hairline, radius and `text-decoration: none`.

## Why there is no `ui.pagination()`

The removed function compared "current" by **string**, and its callback
received `"prev"`/`"next"` alongside real numeric labels — every caller had
to decode a string union the component invented instead of just calling the
same handler with a number. Recorded as the sharpest example in the review of
a template being simpler than the function it replaced.

## Improvements

Nothing ranked: this page is also where `doc/record.md` records that
`.btn`'s missing `text-decoration: none` was fixed upstream in
`framework.css`, which is why this page carries zero CSS of its own — a
closed loop, not an open one.
