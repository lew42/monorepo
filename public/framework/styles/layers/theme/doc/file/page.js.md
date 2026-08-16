## What this file is

The base theme's own reference page: every token (`--prim` through `--mono`),
the six-level type scale, the code box's two component tokens, the elements
the browser styles badly, and the control block. It is the longest of the
four layer pages because `@layer theme` is the layer with the most surface
area — base is a reset, util is opt-in classes, site is one file; theme is
the look everyone gets for free.

## The reframe this page states plainly

"This layer is a theme — the one you get when you load no other." That
sentence is what makes `theme/guide/` (how to write your own) and
`theme/lew42/` (the one this site wears) siblings rather than something
bolted on: they are both proof that loading zero themes is itself a supported
theme, not a placeholder waiting for one.

## The token table doubles as a hardcode registry

Every row names what the token replaced — `#fff` in four files, `rgba(0,0,0,…)`
borders in about eight — which is the bar `layers/theme/lew42/readme.md`
cites when explaining why the Figma port didn't invent eight more tokens for
the type scale. Reading this table before reading either child page saves
re-deriving that bar.

## Improvements

1. **Nothing ranked.** The one open item this page names — `select`'s
   eviction-list status — is already tracked in the root `doc/audits.md`
   and doesn't need a second home.
