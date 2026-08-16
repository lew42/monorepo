The shape every other surface-backed component in this library reuses:
`surface pad flex v gap`. No `card.js`, no `.ui-card` — both were demoted for
naming a rule (`framework.css`'s `.surface`) that already existed upstream.

## The one non-obvious line

`color: var(--ink)` on the surface is load-bearing, not decoration: a card
with no explicit ink inherits whatever color surrounds it, and on a dark or
accent band that measured as **white text on white** in the testimonials,
pricing and team sections before this was caught. `pad flow` looks like the
right inner class and is wrong — `flow` is *page* rhythm (heading-to-body
spacing), not a component's own `flex v` + small `gap`.

## Improvements

Nothing ranked: the page already states both traps (`color`, `pad flow` vs
`flex v gap`) as prose, which is exactly where a reader building a card next
will see them.
