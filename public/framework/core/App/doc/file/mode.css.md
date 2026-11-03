One class, `.mode-btn` — the fixed pill the mode toggle renders as. Small on
purpose: a `Sidebar` footer out-specifies the placement with two classes rather
than this file growing a variant.

## The z-index is a ladder, stated where it's used

`z-index: 60` is commented in place as "above `.demo.max` (30) and `.layout-full`
(20)" — this control must be reachable from both. There is no single file that
lists the whole ladder; each layer states its own position relative to its
neighbours.

## Improvements

1. **The z-index ladder has no single source of truth** — three numbers, three
   files, each commenting only its own rung. Fine at three; a fourth overlay
   competing for top-of-stack would want a real registry (a CSS custom property
   list, or a note in `framework/styles/`) rather than a fourth scattered comment.
   *(medium, speculative — no fourth overlay exists yet.)*
