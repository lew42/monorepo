# Card architecture — one class, `.card`, and the stylesheet does the rest

The card page ([`page.js`](./page.js), live at [`/framework/ui/card/`](/framework/ui/card/)) shows the site's one card. A card is `div.c("card", …)`: the whole look lives in `.card` in [`framework.css`](/framework/framework.css). This module owns no CSS; the page shows the template and its variants.

## One class, no module CSS
**Decided:** `.card` in `framework.css` supplies padding (`--pad-card`), spacing between children (`--gap`), radius and shadow. The page adds no card CSS.
**Why:** a card built from `surface pad flex v gap` plus a `--gap` override was a hand-copied second version of the same rule, repeated per variant.
**Instead:** a `Card` component or per-variant CSS; either forks the look and needs a fix in every copy.
**Detail:** [styles architecture §3](/framework/styles/doc/architecture.md)

## `.card` shares `.surface`'s selector
**Decided:** `.surface, .card` is one declaration; `.card` adds only padding and child rhythm.
**Why:** one look for every filled box, so a fix lands once.
**Instead:** a separate `.card` rule, which would drift from `.surface`.
**Detail:** [styles architecture §3](/framework/styles/doc/architecture.md)

## Nesting darkens by rule, not by class
**Decided:** `:where(.card) .card` steps one shade darker automatically; a ground class (`bg-white`, `bg-light`, `bg-prime`, `bg-dark`) sets ink too and still wins.
**Why:** a card on any ground must read, and `:where` keeps the nesting rule at one class of weight so an explicit ground overrides it.
**Instead:** a "nested" or "inner" class on each inner card, which every author must remember.
**Detail:** [styles architecture](/framework/styles/doc/architecture.md)

## Variants are words on the same card
**Decided:** `linked`, `media`, `action` and `list` are the same `.card` with different content; the only extra styling is `media`'s one negative margin plus `overflow: hidden`.
**Why:** the variant that needs more than `.card` should need one line, not a second component.
**Instead:** a variant class per kind, or a compact/contrast rule per template.
**Detail:** [page.js](./page.js)

## One card page; the other card pages stay linked
**Decided:** this is the one card page; [`core/Page/card/`](/framework/core/Page/card/) (earlier lab) and [`ux/Card/`](/framework/ux/Card/) (the AI board card, a different thing) are linked from it, never deleted.
**Why:** one page per thing, and a shared word is not a shared system.
**Instead:** merging them, which would lose the history and conflate two classes.
**Detail:** [readme.md](../readme.md)
