The module's entire stylesheet — 21 lines, two classes. Loaded once, on
import, via `View.stylesheet(import.meta, "md.css")` at the top of `md.js`.

## Why so little

Everything markdown actually *produces* — `<pre>`, `<code>`, `<blockquote>`,
`<table>`, headings — is HTML's own look, not markdown's, and belongs to
`framework.css`'s element rules, not here. This file only styles the two
classes `md.js` itself emits and nothing crawls the DOM to discover: `.md-error`
(the failed-fetch message) and `.md-details` / `.md-details-body` (the
collapsed-readme wrapper `md.details()` builds).

## `.md-details`'s own margin

`margin-block-start: 3.5rem` plus a top border, set deliberately rather than
inherited from page flow spacing — it reads as an end-of-page rule (a design
record folded at the bottom), not a block that happens to come last in the
content.

## Layer discipline

Restates `@layer base, theme, site, util;` in full, as every stylesheet in
this framework must — the first `@layer` statement anywhere fixes the order
for the whole page, so a short list here would silently push `site` past
`util` for every page that happens to load this file before another.

## Improvements

1. **None found.** Two classes, both load-bearing, both simple. A file this
   small carrying more would itself be a finding. *(n/a)*.
