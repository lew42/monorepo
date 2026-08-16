Fourth of the "Arrangements" group: the `feed` tree overrides `previews()` itself
— a `flex gap` row with `overflowX: auto` instead of the wall's grid — to show
that the method is a normal override point, not a fixed layout.

## The one demo that overrides a method other demos only call

Every other tree in this rail calls `this.previews()`; this is the one that
replaces it, and the replacement still hands each card to `page.preview(nav)`
exactly as the original does — proving the override only needed to change the
container, not the per-card contract.

## Improvements

1. **No `doc/file/overview/strip/page.js.md` existed.** *(simple, important —
   done in this pass.)*
