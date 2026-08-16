## What this file is

The ring's paint, in one `util`-layer block: a fixed 6px border plus a soft
inset glow around the whole viewport, a breathing opacity animation, and a
tag pinned to top-centre for the who/note text. Nothing here is loaded
unless `claim.js` imports it.

## `pointer-events: none` is why the tag can't be a link

The ring has to sit over everything — `z-index: 2147483000` — without ever
intercepting a click meant for the page underneath, so the whole thing, tag
included, is inert. `readme.md`'s own Open list names the cost directly: the
task slug in `.claim-note` can never be clicked through to its
`/framework/ai/<date>/<slug>/` page.

## Top-centre because nothing else on the site sits there

No rail, bar or scrollbar on this site occupies that spot, which is why
`.claim-tag` docks there rather than a corner — a corner risks colliding
with the browser's own UI or a page's fixed chrome.

## `prefers-reduced-motion` turns off the breathing, not the ring

`claim-breathe` (opacity 1↔0.55, 2.6s) and `claim-blink` (the dot) are both
purely cosmetic — the ring's border and glow stay static and still
unmissable with the animation disabled.

## Improvements

1. **`#241206` is a hardcoded hex, not a token**, on both `.claim-tag`'s text
   colour and `.claim-dot`'s background. Likely deliberate — the ring has to
   read against `--prim` regardless of which theme is active — but the file
   doesn't say so, and a fixed hex is exactly the kind of thing a future
   retheme misses silently. One comment would close the question. *(simple,
   speculative)*
