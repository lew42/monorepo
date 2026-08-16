`keys()` and its box. See [the `keys` API page](/framework/ui/api/keys/) —
`doc/method/keys.md` — for what the function guarantees; this file covers the
CSS.

## Why the box is the component's, not the base theme's

`framework.css` puts `kbd` in the mono list **by meaning** and stops there —
a key looks like a chip on one site and a plain word on another, so the box
(`padding`, a heavier `border-bottom-width`, `0.85em`) belongs here. The size
is a judgment call, not a new type-scale level: it's the same optical
correction `.demo-code` already makes for a mono pane, because mono at body
size reads a size larger than the words beside it.

## Improvements

Nothing ranked: six declarations, and the size decision is explicitly framed
as "not a new level in the type scale" so nobody reaches for it as a
precedent.
