A tag/chip input, plus two variants (`list` — badges, no field; `plain` — a
form field whose value is a comma-separated string) that the page recommends
*before* the pretty chip version.

## The one real override in the directory

`.ui-tags-input` (in `parts.js`, `@layer util`) is the library's one
escalation past a layer: a field nested inside a field has to opt out of the
base theme's `input:not(…)` border/padding rule, whose `:not()` carries an
attribute selector's specificity that a same-layer class would lose to. `util`
wins regardless of specificity, which is what an opt-out needs.

## Why there is no `ui.tags()`

What it built was **inert** — the `×` had no listener, the input had no
handler — so the first real use would have rewritten every line anyway. The
one thing worth keeping was the hard part: the opt-out class, which now lives
in `parts.js` for the next nested-field case.

## Improvements

Nothing ranked: the escalation is singular, deliberate, and already recorded
with its full reasoning in `doc/record.md` §3 and §5.
