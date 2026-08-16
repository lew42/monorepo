`demo.app()`'s own chrome: the url strip that doubles as a breadcrumb, the
optional rail, the region pages mount in. Deliberately quiet — everything
interesting inside the box is a real page wearing its real classes, and chrome
that competed with that would be noise.

## Two tokens are re-declared, not inherited

`.demo-app-pages` sets `--measure: none; --page-pad: 1.2em` because those
tokens inherit, and a page rendered inside a 30em-wide box would otherwise pay
the whole site's reading measure and 3em of padding meant for a full window.
⚠ `.demo-app .demo-app-pages .page.standard` then re-tunes `--gutter-x` and
`--pad-y` a *third* time, on purpose: the standard shape declares its own
tokens that the region's reset above can't reach by inheritance, and a page
inside a demo app has to answer to the demo app around it, not to whatever
happens to be outside that.

## `aria-current` is marked in `site`, not `theme`

`.demo-app .page-link[aria-current]` lives in `@layer site` specifically to beat
the "nothing selected yet" fallback style that would otherwise light up a first
entry beside the one actually showing — a layer-ordering decision, not a
specificity one.

## Improvements

1. **The comment explaining the triple token re-declaration
   (`.demo-app-pages`, then `.page.standard` a second time) is dense enough
   that a skim easily misses which of the two rules is doing what.** Splitting
   it into two shorter comments, one per rule, would read faster.
   *(simple, useful.)*
2. **No dark-mode-specific rule anywhere in this file** — everything rides
   `light-dark()` tokens from `framework.css`, which is correct and worth
   confirming stays true if this file ever grows its own colour.
   *(simple, speculative.)*
