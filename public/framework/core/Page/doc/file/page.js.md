This module's own page, and the reader's introduction to `Page` — every tab you can
click here is produced by the `Doc` config at the top of this file, `subject: Page`
included.

## `overview:` carries the fourteen-tree rail

`overview: "page children add labels route shapes wall catalog dashboard strip
deep landing docs site"` — one sibling directory per demo, grouped by each demo's
own `group:` rather than by anything named here. `../overview/readme.md` is the
design record for the whole rail.

## `children:` is a second tab strip

`children: "nav children previews shell flow"` are five guide pages, each a
sibling directory, each a top-level tab beside Overview/API/Docs/Files. They are
prose-and-demo walkthroughs, not part of the API surface — the split between a
"guide" and a "member" is exactly what `children:` vs `properties:`/`methods:`
means in `Doc`.

## Improvements

1. **`files:` was never declared** — the Files tab did not exist before this
   pass, for a module with 70 files. *(simple, important — done in this pass.)*
