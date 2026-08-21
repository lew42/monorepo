`restyle(from)` copies the struck panel's **look** onto `this`, once — every
`Panel.shared` key except what would make it a duplicate (`template`, `seed`,
`text`), plus `from`'s `grow` so the pair share the row evenly. It returns `this`,
so it chains: `item.divide(dir, new Panel().restyle(item), at)` is the whole of an
edge click's commit (`split.js`).

Two verbs, two gestures ([design §5](/framework/ai/2026-08-19/workspace-design/design/)):
**split** (an edge) gives you a twin — same tone, display, words, empty; **add**
(the Workspace bar's `+`) gives you a fresh default panel beside the focused one.

Not `mirror()`: a restyled panel shares nothing live — change the original after
and the twin keeps what it was given.
