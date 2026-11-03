## `toc.css`

One `@layer theme` block, one breakpoint. The rail is `display: none` until `82em`,
where a structural selector turns it into a real grid column.

## The selector is load-bearing, not decorative

`.pages > .page:not(.standard):has(> .toc)` does two jobs at once: it switches the
`.page` to a two-column grid **and** gates the whole rail's existence on the DOM shape
actually matching — direct child of `.pages`, not a "standard" layout page. Nothing
else in the module checks this; if the structure ever doesn't match, `.toc` silently
stays `display: none` from the rule above it. See the readme's Traps for the one case
that currently hits this (a `Doc` with `overview:` declared).

## Sticky needed a real grid track

`position: sticky; align-self: start` on `.toc` only works because it is a genuine grid
track (`grid-column: 2`), not an element floated beside the content. The full story —
`fixed` shipped first and worked by accident — is in the readme's Decisions.

## Two silent traps recorded in comments

`15rem` (not `13`) and `scrollbar-width: none` (a 32px overflow otherwise buys a second
scrollbar one gutter from the window's real one) are both explained inline, in ASCII —
the file's own comment at the top explains why: a host serving CSS with no charset
decodes UTF-8 as Windows-1252, and this file once shipped double-encoded em-dashes.

## Improvements

1. **`scrollbar-width: none` here vs. `thin` on `ext/catalog`'s rail** (`catalog.css`,
   the Overview's own sticky rail) — two sticky-and-scrollable rails on the same site,
   one hides its scrollbar entirely and one shows a thin one. Worth picking one
   convention, though neither is wrong on its own. *(simple, speculative)*
2. **The `:not(.standard)` guard is a two-layout-only solution** — it works because
   exactly one other layout (`.standard`) currently claims `grid-template-columns` in
   `@layer theme`. A third breakout layout would need the same guard added here, and
   nothing enforces that. Already flagged in the file's own comment; recording it here
   too because it's the kind of thing an audit is for. *(medium, speculative)*
