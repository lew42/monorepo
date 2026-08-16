The rail's whole visual contract: `previews()`'s existing grid turned into
one sticky column, plus three small contracts borrowed from neighbours
(`.tab-panel`'s default-hide, `.tab-bar`'s first-tab-lit fallback, and the
page's own axis payback) restated here because a fallback can't share the
selector it falls back from. ~110 lines, one `@layer theme` block and one
`@layer util` rule, `@media (max-width: 64em)` nested inside the theme layer
for the strip.

## The header specificity fight

The very first rule, `.page-catalog:where(:not(.page)) { display: flex; … }`,
exists because this module's own doc page is a directory literally called
`catalog/` — so `render()` stamps `page-catalog` on it, the same string
`.page-catalog` names for its own layout class, and without `:where()` the
two rules become a load-order tie decided by nothing meaningful. Every other
rule in the file is plain `.page-catalog`; only this one needed the escape
hatch, because only this one collides with the class's own name.

## The rail pays two insets back, in opposite directions

`.page.standard > .page-catalog > .page-previews { margin-inline-start:
var(--gutter-x) }` starts the rail on the page's axis instead of 9px off the
app sidebar — but only on a **direct** child of `.page.standard`, because a
catalog nested inside a `Doc` group is already inset by the group's own
padding and would pay it twice. The strip variant (`< 64em`) drops the same
margin to `0`, because a horizontal scrollport has nothing to align against
— an inset start there just spends a phone's width on nothing before the
first card.

## The `< 64em` breakpoint strips three things, not just the axis

Beyond `flex-direction: column`, the media query drops the thumb ceiling to
`4em` (a full-height live thumb scrolled off-screen was reserving 250px of
empty strip above the fold), hides `.page-previews-group` headings (no row
left to span, and a label column would spend 11em of a phone's scrollport),
and hides each card's description (two clamped lines under every card is the
strip's entire height, spent above the detail it heads). Each is commented
at its own rule — read them there before changing one, since each answers a
"why not just—" a future edit will otherwise re-ask.

## Improvements

1. **`--rail: 19em` is a bare value, not a documented token.** It's sized to
   the Page overview's live tree cards specifically (18em of thumb plus
   padding), and the readme's Open section already flags it: six consumers
   now, none fighting it, first one that does is the signal to promote it.
   Worth a one-line comment on the declaration itself pointing at that
   Open item, so the signal is visible without opening the readme first.
   *(simple, useful)*
2. **The first-card-lit fallback duplicates `Page.css`'s selector by hand.**
   Correct today, and the file says so (`Change the lit look in Page.css,
   then here`), but a duplicated selector with no automated link between
   them is exactly the shape that drifts silently — a future recolour of
   the "selected" ring in `Page.css` has no reason to touch this file, and
   won't. *(medium, important — a CSS custom property shared between the two
   rules would remove the duplication without a build step)*
3. **`row-gap: 1.2em` and `--rail: 19em` are the only two numbers in the
   file with no named constant.** Everything else routes through a token;
   these two are magic because they were tuned by eye against four real
   catalogs. Naming them (`--catalog-gap`, `--catalog-rail`) costs nothing
   and makes the next re-tune a one-line change instead of a grep.
   *(simple, speculative)*
