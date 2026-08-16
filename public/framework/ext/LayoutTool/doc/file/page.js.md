The module's own front page, a `Doc` — Overview, Docs (two notes), Files (every
file in the module), plus `library`/`tests`/`audit`/`knowledge` as declared
children (top tabs). `library` is first: it is the catalog a reader wants, where
`tests` is the analyzer's own ground truth.

## The self-check is the demo

Rather than a separate "here's an example" block, this page runs `analyze()`
on itself and renders the live report + vision button under "This page,
measured." "The tool measures whatever is on screen, including itself" is
literally true — the Overview *is* a working instance of the thing being
documented.

## `look()` waits 600ms on purpose

`content()` is still building when it returns, and every `md()` call on this
page resolves a fetch after that — a single animation frame isn't enough.
Measured too early, this reported 50 nodes and a row of em-dashes, because
none of the page's own prose existed yet to measure.

## Children stay visible two ways

`this.previews()` draws cards for every declared child inside the Overview
body, above the fold, in addition to their being reachable as top
tabs — a deliberate choice recorded in the file's own comment: "the audit
tool isn't linked to on the LayoutTool page" was a real complaint once, and
every destination now costs one click from above the fold, not a tab click
plus a scroll.

## Improvements

1. **No `doc/file/page.js.md` existed before this pass**, and the page itself
   was a plain `Page`, not a `Doc` — no Files tab, no Docs tab, and every
   member (`analyze`, `frame`, `sweep`, …) was undiscoverable except by
   reading source. *(simple, important — done in this pass; see the audit
   report for the full before/after.)*
2. **`this.previews()` and the top-tab bar both link to the same three
   children**, which is intentional (see above) but means a reader sees each
   destination named twice on first load. Not worth removing either — the
   comment explaining why previews() exists is itself evidence it was removed
   once and had to come back — but worth knowing it's deliberate duplication,
   not an oversight, if a future pass is tempted to "simplify" it away.
   *(simple, speculative.)*
