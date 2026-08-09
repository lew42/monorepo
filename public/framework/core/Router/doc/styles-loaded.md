# Where `styles_loaded()` is awaited, and why not one line later

A page imported on *this* navigation has just called `View.stylesheet()` at module
scope, and its `<link>` is not in `document.styleSheets` yet — so without the
await its first render paints unstyled and then snaps.

It is awaited in `load()`, **not** inside `activate()`, which must stay
synchronous. That "no awaits past this point" guarantee is what lets a site wrap
the whole swap in `document.startViewTransition()`. Found by a seat whose missing
animation was simply louder than a missing margin would have been.

It uses `allSettled`, not `all`: a 404'd stylesheet must cost a warning, not every
subsequent navigation.

The chain's `loading` promises are awaited in the same spot, for the same three
reasons: draw once with real titles instead of names-then-sharpen, keep
`activate()` synchronous, and never let a broken child block navigation
(`allSettled` again). `loading` is every page's declared subtree, imported at
construction — the full record, including what the old redraws looked like and why
waiting won, is in `core/Page/doc/declaring.md`.
