# Stacking

Every fill on every floor, measured live — and the alpha ladder that makes **one word**
work on all of them. **Shipped 2026-08-30**; this page is now the regression test.

The defect it found: `framework.css` painted `.btn, button` and `.surface` from the
**same token**, so a default button on a card was a zero-delta fill — 101 invisible pairs
across 76 pages, now 19, and none of those is a control you cannot see.

## Use

- **The rule** — *floors are opaque, fills are alpha.* Nothing else to remember.
- `--fill-aNN` at a call site (`04 · 08 · 16 · 32`, each rung double the last).
- An island that is dark in **both** modes declares `color-scheme: dark`, and the same
  word flips inside it. One that *inverts* with the mode cannot — see the doc.

## Watch out

- The tokens live in `framework.css` `:root`, not here. This page redeclares nothing on
  purpose: a lab that redefines what it measures cannot fail.
- The left chip in every cell is a REAL element wearing real site classes. That is what
  makes the matrix a test rather than a picture — and why some cells still read red: the
  two placement demos are supposed to.
- Every sibling under `/framework/styles/` ships no stylesheet. This one does, and the
  reason is in the head of [`stacks.css`](stacks.css): an argument you cannot see is a
  paragraph.
- The matrix side-scrolls at 400 on purpose. A 36-cell matrix is wide.

## More

- Page: [/framework/styles/stacks/](/framework/styles/stacks/) — the matrix, live, both modes
- [`/framework/styles/doc/stacking.md`](/framework/styles/doc/stacking.md) — the rules, the bill, the fix list
- [`doc/decisions.md`](./doc/decisions.md) — why four rungs, why literal `rgba()`, what the ladder does not fix
- [the lab task](/framework/ai/2026-08-30/color-stacks/) — `hunt.mjs` and its threshold calibration
- [the flip task](/framework/ai/2026-08-30/alpha-flip/) — what moved, what deliberately did not
- Files that matter: `stacks.js` (the colour maths the page AND the scan share), `hunt.json` (the scan), `stacks.css` (the grid only — the tokens are in `framework.css`)
