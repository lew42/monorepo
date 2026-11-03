`Panel.shared` is a static array — `["template", "tone", "align", "display",
"seed", "text"]` — read by `get()` and `set()` to decide whether a key
belongs to a panel's *content* (delegated to its master, when it has one) or
its *slot* (always local).

The rule of thumb: everything a screenshot of the panel would show is shared;
everything that only answers "where does it sit, and how big" is not. `grow`,
`mode` and `dir` are deliberately absent — a live duplicate dropped into a
narrow column stays that column's width even while its template, tone and
alignment keep tracking the master.

⚠ **`text` depends on `template` sitting beside it in this same list.**
`text.js` keys every edit by the drawing it belongs to (the template's name,
plus its seed) — sharing `text` only produces a correct duplicate *because*
`template` is guaranteed to be the same drawing on both sides. Sharing `text`
without `template` would let a copy's edits address a run in a drawing the
copy no longer shows.

⚠ **This list is the one place "what counts as content" is decided.** A
future word added to a panel's data (`Panel.defaults` gains a key) has to be
added here explicitly if a duplicate should track it — nothing infers the
answer from the key's shape. Full reasoning:
[Decisions](/framework/ext/Panel/doc/decisions/).
