# `Page.class.js`

Where lazy children first appear: `declare()` accepts a space-separated string
of names (imported when walked to) alongside already-imported `Page`s, stored
in one `Map` where `null` means "declared, not loaded" and `undefined` means
"not mine — try `route()`". `naming()` derives `url`/`name`/`title`/`label`
idempotently (every line `??=`) so a `page.js`-backed page and an inline
`add()`-built one converge on the same shape from opposite directions.

## The column layout's structural limit lives here

`activate()` calls `this.container().show(this)` — `container()` is `parent ??
app`, so a 3-deep url runs **three different objects'** `show()` methods, one
rung per level. A topic overriding `show(child)` only ever controls its
direct child; a grandchild falls through to the default. That's the whole
reason this tier is superseded — see the readme's "The column problem, in
detail" for the four rejected fixes and the CSS one that actually worked
(`display: contents`, landed in `new/1`).

## `show(child)` / `hide(child)` are gone by the end of the file's own history

The readme documents removing them mid-tier: they collided with `View`'s own
`show()`/`hide()`, and `child.activate()` / `parent.show(child)` were one
action wearing two names. What's in the file now is the post-removal shape —
a page places itself; a parent supplies only `$pages`.

## Improvements

1. **None ranked.** Superseded by `new/1/Page.class.js`.
