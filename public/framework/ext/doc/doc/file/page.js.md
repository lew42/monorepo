This module's own page, and the system documenting itself — every tab you can click
here was produced by the config at the top of this file.

It is also the honest test: `subject: Doc` means the API tab is reading this
module's live prototype, so a method renamed and not re-listed prints a console
warning the moment anyone opens the page.

## Improvements

1. **This page documents `Doc` with `Doc`, so a rename that misses this file warns
   in the console rather than failing** — good, but only if someone opens the page.
   The same "nothing detects a stale list" problem the whole audit found.
   *(noted, not fixable here)*
2. **The Overview is long.** It earns it — this is the system's front door — but if
   it grows again, the `overview:` rail is the answer it recommends to everyone else.
   *(simple, useful)*
