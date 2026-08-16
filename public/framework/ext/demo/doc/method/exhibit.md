`demo.exhibit({ page, stage, def, file, note })` is the one shape every detail
page on the site is built from: the thing running, on a stage you can drag
narrower; a layout bar wired to it; the definition that built it, open, below.
`demo.page()`, `demo.tree()` and `demo.layout()` are all two lines of config over
this — nothing on the site should hand-roll a stage plus a bar plus a source
block a fourth time.

## `stage` is a function, because the target moves

`stage` receives `steer` and must call it — every time the thing it's steering
changes, not just once. A tree demo navigates inside its own box, so the bar has
to be told again each time or it goes stale pointed at a page that scrolled away.
This is the same contract `demo.stage(fn, steer)`'s second argument keeps.

## `ext/layout` is hard-imported, on purpose

Not feature-tested like `ext/markdown` and `ext/highlight` (`demo.js`'s two soft
dependencies) — `ext/layout` is the site's one control surface, and a bar every
detail page has to remember to add is a bar half of them won't have. This is the
one place `ext/demo` leans on another `ext` unconditionally.

## The definition is the DEFINITION, not the file

`def` is stringified — `String(def)`, dedented — so the reader sees the tree or
the render being taught, not the imports and `export default` wrapped around it.
`file` is for whoever wants those too, as a one-click link beside the summary.
⚠ A comment *inside* the definition prints with it — the one place in this repo
a comment is doc, not debt.

## `overrides()` reads the definition's own source

A private helper in `exhibit.js`, not exported: it regexes the definition's
argument list and any `"--token"` literals out of `String(def)` and captions them
as `**Overrides:** …` under the source. Free documentation pulled from the code
that's already on the page, never a second thing to keep in sync.

## `page` turns children into Variants

Hand it `this` and, if the page has children, `demo.exhibit()` renders an
`h2("Variants")` and `page.previews()` below the band — the same card system any
rail is made of, so a demo can be the category for its own complex variants
without inventing a second preview mechanism. ⚠ It reads `page.children` and
`page.previews()` off the argument, never off a bound `this` — `demo.exhibit()`
is called, not attached to a prototype.

## Improvements

1. **`overrides()` is unexported and untested by anything but eyeballing.** Its
   two regexes (`/^[\w\s]*\(([^)]*)\)/` for the argument, a token-literal scan
   for `--x`) are a reasonable guess at "what can this consumer change," and a
   definition shaped unusually (a destructured argument, a token built from a
   template literal) will silently print nothing rather than something wrong —
   which is the safe failure mode, but worth a line saying so. *(simple, useful.)*
2. **No guard against a `def` that isn't a function.** `demo.source(def, …)`
   inside `exhibit.js` already handles a string (`is.fn(src) ? … : src`), so
   `demo.exhibit({ def: "already a string" })` would actually work — undocumented,
   but free. *(simple, speculative — worth a line in this file's own comment if
   it's ever relied on.)*
