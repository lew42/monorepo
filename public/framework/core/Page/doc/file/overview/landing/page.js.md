First of the "Sites" group, and the simplest: the `nimbus` tree is one page, no
children, four imported bands (`hero`, `features`, `pricing`, `footer`) stacked in
a `div.c("bleed")`. It exists to answer "what does a `Page` tree look like when it
is a marketing site" — a question the eleven "Basics"/"Arrangements" demos never
raised because none of them was a *site*.

## Why the bands are imported, not copied

Copying `styles/sections/hero.js` here would make this demo a second, worse
`sections/` and stop being evidence that the real one works — `hero("dark")`
inside the capture callback *is* the band, verbatim. The cost, named in
`../readme.md`, is that the import lines themselves don't print with the tree, so
this page's prose says where they come from.

## Improvements

1. **No `doc/file/overview/landing/page.js.md` existed.** *(simple, important —
   done in this pass.)*
