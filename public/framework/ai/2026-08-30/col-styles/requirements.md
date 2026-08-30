# col-styles — column render CONTROL

Owner's question: "the page columns system, do we have control over how this renders?"
Answer by demonstrating every hook, and building styled variants.

## Scope

Create `/imagine/vary/colstyles/` (add `colstyles` to the `children:` line in
`/imagine/vary/page.js` — that one line is the only edit outside the new dir).

1. **The hooks page** — one page that SHOWS each control point live in a small
   columns tree: the tokens (pad, min/max/flex per column), `width:` words,
   `column()` override (a custom body), `index:`, `bleed`, the drag seam.
   Each hook: the live thing + a 2-line code caption.
2. **Three styled variants** — same small content tree, three complete looks:
   (a) Finder (default: hairlines, wash floor), (b) Cards (floating surface,
   card shadow, gap between columns), (c) Ink (dark/bold, theme-token based).
   Screenshot each at 1920 + 3440.
3. **Interaction notes** — what survives resize/reveal/full-swap, what tokens
   can't reach (gaps are findings, not hacks).

## Fence

`public/imagine/vary/colstyles/**` + the one children line in
`public/imagine/vary/page.js`.

## Steps

1. Read columns.md, Page.css columns section, existing consumers
2. Run code/css/layout/new-page/new-css-class skills
3. Build hooks page (live control points + captions)
4. Build Finder variant
5. Build Cards variant
6. Build Ink variant
7. Screenshot verify at 1920/3440/400, console errors, resize/reveal
8. Documentation + finish-task
