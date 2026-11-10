# Step 5: pages add no CSS

The ask (voice-app, 2026-11-10 22:16 UTC, $4 hard stop including review) was a merge check that fails when a page or card adds its own CSS instead of using the kit. If the existing count is large, report it first: list the offenders on [/live/plan/ui-kit/](/live/plan/ui-kit/) and fail only on NEW CSS in a diff. Where the kit lacks a part that the Figma card system has, list it and don't build it.

## What was built (branch worktree/qf-3)

- `Server/OwnCSS.mjs` (a class) counts the CSS declarations outside the kit, in `.css` files and in `css(\`…\`)` literals. The kit is framework.css, styles/, ui/, core/, ext/ and ux/. A page.js or page.css counts anywhere.
  - `--census` reports every folder, report only.
  - `--diff` lists the files a branch grows.
- `merge.mjs` refuses a branch that grows any such file, unless `--own-css "why"` is given.
- Also new: `Server/OwnCSS.test.mjs`, `Server/doc/own-css.md`, and a line in `Server/readme.md`.

## Evidence

- The census found 15,130 declarations in 130 folders. In LivePage.css it counted 484 declarations, against 500 semicolons.
- None of the last 40 commits on compliance/dev would have been refused.
- A probe commit that adds `.x{color:red;margin:0}` to LivePage.css is refused: 484 → 486, exit 1.
- The census and the Figma gaps are on card 5 of the plan page.

## Decision: where the kit's line is

core/, ext/ and ux/ count as kit, because they are the components and behaviour classes.

- Alternative: count only styles/ and ui/ as kit. That would also gate ext/ component CSS, refusing many legitimate component changes; it wins only once ext/ components move their CSS into ui/.
