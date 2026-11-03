This module's own page. No `subject:` — `markup.js` exports exactly one
function, so there's nothing for an API tab to list; the Files tab and the
one demo carry the whole module.

## The demo shows its own subject twice

The card it builds renders live, and `markup(card.el)` immediately serializes
that same element back to source, side by side — so the demo is also the
proof that the function does what it claims, on every page load.

## Improvements

1. **None outstanding.**
