# Generator round 2 — the ask, verbatim

TASK — build the three top roadmap items the 08-31 generator improver left
(`ai/2026-08-31/improve-generator/task.jsonl` has context; the module is
`/framework/core/Page/generator/` — read its readme + doc/decisions.md first):

1. **Copy-address button** (XS) — one control that copies the current `#s=`/`#seed` url to
   the clipboard, with a beat of visual confirmation. Clipboard in headless needs
   permissions — prove via `navigator.clipboard.readText()` after grant, or fall back to
   proving the string it would copy.
2. **Spec-box feedback for unrecognized words** (S) — typing an unknown word in the spec
   textarea currently does what? (measure first). Make the box say which word it doesn't
   know — inline, quiet, never an alert. The parser is in rules.js/gen.js territory: READ
   them, but put the validation in the CONTROL layer (controls.js) so the draw path is
   untouched.
3. **Save your spec to the gallery** (M) — the specs/ gallery currently renders 8 curated
   shapes from specs.js. Add "yours": a save control that stores the current spec+title via
   the page's `store()` (the split the improver built: url carries the tree, store carries
   the dressing — saved specs are dressing-adjacent, keep them in the same store or a
   sibling key, your call, document it). Saved cards render in their own band under the
   curated ones, with a remove ×. Survives reload; proven with a store round-trip through a
   real reload.

FENCE — `core/Page/generator/**` only.

VERIFY: 6-seed sha proof, all three features headless-proven (screenshots: feedback state,
saved band), zero console errors, 400/1920/3440 on generator + specs pages, docs updated
(readme one line each, decisions.md the store-key call). Keepers + `links`. Report: built ×3
with proof each, cuts.

⚠ SEEDED GENERATOR LAW: no edit may change a draw — same-seed sha-identical before/after on
6 seeds, paste both sets; a deliberate change bumps MODEL, but this task has no reason to.

## Scope note

`gen.js` and `rules.js` are read-only for this task (no MODEL reason to touch them). All
three features are additive: a header control, a spec-box validation line, and a store-backed
save/remove on the gallery.
