# columns-polish — fix brief (Sonnet)

Read first: the repo's `CLAUDE.md` (law 2), `../mastermind-day/requirements.md` (decisions 2 and 3 are yours to build), `../../2026-09-04/mastermind-platform/minion-rules.md`, `public/framework/core/Page/doc/columns.md`, `public/framework/core/Page/Page.css` (the width words ~line 264–300, the head ~348, the close ~362, `.page-column-fill`). Skills: `new-task` (this dir, group `layout`), `code`, `css` (read framework.css's spacing tokens), `ui-test`, `documentation`, `finish-task`.

## Deliverables (numbered)

1. **`fill` yields to an open child.** Add the rule: when a `fill` column's page is an active ancestor (a child column is open beside it), the column falls back to the default flex (`1 1 0`) and the `large` ceiling (64em), so the child gets a readable width. `.page.active-ancestor > .page-column-body.page-column-fill { … }` or the token override the vocabulary uses — read how the words set `--page-column-flex/min/max` and override those. Then restore `width: "fill"` on `public/imagine/research/page.js` and `public/imagine/platform/research/page.js` (both were put back to `large` on 2026-09-04 because of this). Measure at 3440: alone, the front fills the row; with a topic and a verdict open, the row reads about rail 432 / hub 500 / front ~1150 / topic ~700 / verdict ~700 — every column over 600px. Also `/imagine/research/stone/barabar-caves/`.
2. **Column heads breathe.** The head's vertical padding becomes `var(--page-column-pad-y)` (it is a hard `0.55em` today; pad-x already scales); the × sits in a square inset of pad-y on both axes at the corner (its right inset is pad-x today — 41px at 2474 vs 11px from the top); the title keeps pad-x. Measure at 1280 / 2474 / 3440: the head's height, the × inset on both axes. Alternatives measured on 2026-09-04: matching vertical to horizontal made a 108px bar — do not.
3. **Docs:** two lines in `core/Page/doc/columns.md` (the `fill` yield, the head's tokens) and the decisions record (`core/Page/doc/decisions.md`) dated, with the numbers.

## Prove it

`ui-test`: open the cloudflare verdict path from the platform hub and read every column's width at 3440; open a topic under `/imagine/research/`; shots at 1280 / 2474 / 3440 of a head with its ×. Zero console errors on the pages touched.

## Fences and budget

Write: `core/Page/Page.css` (the two rules), `core/Page/doc/columns.md`, `core/Page/doc/decisions.md`, the two research `page.js` (one word each), this task dir. Private server only (kill by pid); never `git stash`/commit. Budget ~120k tokens. Report in ≤ 8 plain lines: the two rules as written, the five column widths with the verdict open, the head numbers at three widths.
