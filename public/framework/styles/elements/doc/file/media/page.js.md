## What this file is

One reset declaration
(`img, picture, video, canvas, svg { display: block; max-width: 100% }`)
covering five replaced elements, and the two with factories that the reset
still misses (`audio`, `iframe`) — left unfixed on purpose because nothing on
the site currently embeds either, and "an unexercised rule is a guess."

## The SVG factory gap is structural, not an oversight

`document.createElement("svg")` builds an HTML element in the wrong
namespace and renders nothing — there is no naive `svg()` factory possible,
which is why real SVG on this site goes through `html_unsafe`,
`createElementNS`, or an `<img src=…>`. Worth knowing before assuming a
missing factory is just unwritten.

## Improvements

1. **`audio`/`iframe` missing from the reset's replaced-elements list is a
   two-word fix**, named here and in `doc/framework-css.md`, deliberately
   unapplied for lack of a real call site to test it against. *(simple,
   useful — same finding as the code page's `kbd`/`samp` gap, same reasoning)*
