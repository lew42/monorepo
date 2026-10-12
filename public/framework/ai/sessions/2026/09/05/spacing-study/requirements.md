# spacing-study — study brief (Sonnet)

Read first: the repo's `CLAUDE.md` (law 2), `../mastermind-night/requirements.md` (the night's rules), `../../2026-09-04/mastermind-platform/minion-rules.md`. Skills: `new-task` (this dir, group `design`), `code`, `layout` (its spacing section is the current rule set), `css` (read framework.css's spacing tokens), `new-page`, `finish-task`.

## The owner's words

> these imagine pages are still quite cramped... try to study the vertical spacing in particular, but padding, margin, gap, --flow, whatever... if one value is small, and nearby it's way different... we need to consider spacing relative to the spacing of nearby neighbors, siblings, etc. if neighbors have vastly different spacing, it becomes more evident, or at least suggests there should be a legitimate reason for it.

## Deliverables (numbered)

1. **A measurement, not an opinion.** Headless, private server, at 1280 and 3440, for every realm under `/imagine/` (landing page only) and `/imagine/design/padding/` as the control: walk the visible boxes of the active page and record, per box, its vertical padding, margin-top/bottom, the gap of its container, the `--flow` it inherits, and the actual vertical distance to its previous and next sibling. Save the raw table as `spacing-<width>.json` in your task dir (two numbers that must agree: boxes counted vs rows written).
2. **The neighbour ratio.** For every pair of adjacent siblings, the ratio of their vertical spacing (the larger over the smaller). Report the distribution, and list every pair over 2.5× with the page, the two selectors, the two values, and — this is the study — whether there is a legitimate reason (a section break, a heading, a card boundary) or not. The list of "no reason" pairs, ranked by ratio, is the finding.
3. **The cramped test.** Per page, the median vertical distance between siblings at 1280 and at 3440, and the ratio between the two widths. A page whose spacing does not grow with the screen is cramped at 3440 by definition (the spacing clamps exist for this). Rank pages by that ratio.
4. **`/imagine/design/spacing/`** — the study page (the `design` realm holds studies; the mastermind wires it): opens with the plain sentence that says what was measured and the one rule the numbers suggest; then the top twenty "no reason" pairs as a table with a small crop of each (jpg ≤ 60KB); then the cramped ranking; then the proposal: which tokens or rules would fix the most pairs at once (a `--flow` step, a section gap token, a rule that a heading's space-above is N× its space-below) — with the count of pairs each proposal fixes. Fix nothing in the realms; the fixes are the next minion's, from your list.
5. **The rule for the skill**, in one sentence with its evidence, appended to `.claude/skills/layout/improvements.md`.

## Fences and budget

Write only `public/imagine/design/spacing/` (new), your task dir, the one improvements line. No CSS changes. Budget ~200k tokens. Report in ≤ 12 lines: the study url, the pair count over 2.5× with and without reason, the five most cramped pages with their ratios, the top proposal and how many pairs it fixes, tokens.
