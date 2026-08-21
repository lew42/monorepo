`sample(root)` — one fictional site, nine children (`HTML`, `CSS`, `JS` a level
deeper), rendered many different ways by whatever demo takes it and overrides
the root. Renamed from `web()` (2026-08-15, design record §21) once a second,
unrelated `web()` turned up in `core/Page/layout/web.js` and two files ended up
calling both a line apart.

## Overriding the root is the whole mechanism

`{ ...root }` is spread last in the returned `Page` config, so any key a caller
passes — `content()`, `previews()`, a card claim — replaces the default. What
stays constant between demos is the nine children; what changes is exactly the
one thing each demo is teaching, which is the point of sharing one tree instead
of each demo writing its own.

## Content is `p()`, not `md()`

A deliberate, small instance of the module's own soft-dependency rule (`demo.js`'s
§3): nine one-line descriptions don't justify pulling in `ext/markdown` just for
this file, so they're plain paragraphs.

## ⚠ Object children only

Nothing in this tree is on disk, and the root's own url comes from its title
(`Web` → `/web/`) rather than a filesystem path — a name string in `children:`
(as opposed to an object) would make `Page.child()` probe the real server for a
`page.js` that was never going to be there.

## Improvements

1. **The nine children's `content()` bodies are one-liners with no shared
   pattern to lint against** — fine at this size, and any inconsistency (a
   child that forgets `content()` entirely) would just render a blank page
   rather than throw. *(simple, speculative.)*
2. **No test that the sample tree's shape (nine children, three of them one
   level deeper) still matches what callers like `core/Page/old/nav/` assume about
   it.** A structural change here silently changes four demos elsewhere.
   *(medium, speculative.)*
