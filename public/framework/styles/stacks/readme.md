# Stacking

Every fill on every floor, measured live — and the alpha ladder that makes **one word**
work on all of them.

The defect it documents: `framework.css` paints `.btn, button` and `.surface` from the
**same token**, so a default button on a card is a zero-delta fill. `code` on `.wash` and a
`--tint` badge in a `.tint` panel are the same sentence with different nouns.

## Use

- **The rule** — *floors are opaque, fills are alpha.* Nothing else to remember.
- `--fill-aNN` at a call site (`04 · 08 · 16 · 32`, each rung double the last).
- An island that is dark in **both** modes declares `color-scheme: dark`, and the same
  word flips inside it.

## Watch out

- The tokens live on `.stacks-lab` here, not in the theme — this page is a **proposal**,
  and no token was flipped. The flip is its own wave.
- Every sibling under `/framework/styles/` ships no stylesheet. This one does, and the
  reason is in the head of [`stacks.css`](stacks.css): a proposal you cannot see is a
  paragraph.
- The matrix side-scrolls at 400 on purpose. A 36-cell matrix is wide.

## More

- Page: [/framework/styles/stacks/](/framework/styles/stacks/) — the matrix, live, both modes
- [`/framework/styles/doc/stacking.md`](/framework/styles/doc/stacking.md) — the rules, the bill, the fix list
- [`doc/decisions.md`](./doc/decisions.md) — why four rungs, why literal `rgba()`, what the ladder does not fix
- [the task](/framework/ai/2026-08-30/color-stacks/) — `hunt.mjs` and its threshold calibration
- Files that matter: `stacks.css` (the proposed tokens), `stacks.js` (the colour maths the page AND the scan share), `hunt.json` (the scan)
