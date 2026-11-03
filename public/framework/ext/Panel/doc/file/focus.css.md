The selection's two rings, and nothing else: `.panel.focus::after` (the orange ring,
written by `focus.js` and nobody else) and `.panel.panel-hover::before` (lighter — what a
click would select, from the same `drill()` the click runs). Both inset, so a panel's box
never moves when either appears; the hover ring sits under the focus ring and never on the
selected panel. Moved here from `panel.css` on 2026-08-19 so the selection's look and its
logic live side by side. Record: `doc/focus.md`.
