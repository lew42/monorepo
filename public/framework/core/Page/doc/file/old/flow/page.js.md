The vertical-rhythm guide — not really about `Page` at all. It documents
`framework.css`'s `--flow` token and the `:where(.flow, blockquote)` selector,
using `Page.render()`'s `div.c("page flow", …)` as the one worked example of a
consumer opting in by wearing a class.

## Why it lives under `core/Page/` rather than under styles

Because the trap it exists to prevent is Page-shaped: a page that overrides
`render()` into a flex or grid layout silently loses `flow` and has to own its own
`gap`, and a reader debugging "why did my spacing disappear" is standing in
`Page.class.js`, not in a CSS module. The token itself, and its authoritative
record, belong to `framework.css` and are only *demonstrated* here.

## The one live demo earns its place

Two identical `.flow` boxes, the second at `font-size: 0.8em`, nothing else
declared — it is the single fact ("`--flow` resolves against the font-size of the
element that uses it, because it's an unregistered custom property") that a
paragraph of prose could state but not make visible.

## Improvements

1. **No `doc/file/flow/page.js.md` existed.** *(simple, important — done in this
   pass.)*
2. **This page's subject (`--flow`, `framework.css`) is not owned by `core/Page/`
   at all.** It is accurate and well-placed as a guide, but a reader browsing
   `framework/styles/` for rhythm would not find it here. A cross-link from
   wherever `framework.css` is documented would close the gap. *(medium, useful
   — outside this module's fence.)*
