# Past CSS/token/card/style work — status check

| date | task dir | one-line conclusion | status | evidence |
|------|----------|-------------------|--------|----------|
| 2026-08-16 | ai/sessions/2026/08/16/measure-token-proposal | Recommend narrowing `--measure` to ~40em based on readability analysis | stale | `grep "^\s*--measure:" framework.css` = 0 matches |
| 2026-08-17 | ai/sessions/2026/08/17/css-skill | css + new-css-class skills live; css-strategy retired | n/a (process) | skills are CLI/config, not code artifacts |
| 2026-08-17 | ai/sessions/2026/08/17/framework-css-load | framework.css loads from app.js prepended; removed from View.js | still-true | app.js line 17 loads "/framework/framework.css"; View.js grep = 0 |
| 2026-08-17 | ai/sessions/2026/08/17/layout-primitives | Five layout words (.page .rail .wall .stage .solo) in place | stale | `grep -r "^\\.page\|^\\.rail\|^\\.wall" framework/` = 0 matches |
| 2026-08-17 | ai/sessions/2026/08/17/weak-cards | stack and sidebar cards fixed; layouts/stack and sidebar redesigned | n/a (process) | structural/page design changes, not CSS rules |
| 2026-08-18 | ai/sessions/2026/08/18/css-audit | Audit of 905 inline .style() calls; classified; three words gap (scroll/stick/fluid) | n/a (process) | audit findings, not persistent code changes |
| 2026-08-18 | ai/sessions/2026/08/18/cssdoc | CSSDoc v1 ships: every CSS rule live from CSSOM | still-true | framework/styles/elements/code/page.js exists (6224 bytes, 2026-08-18) |
| 2026-08-21 | ai/sessions/2026/08/21/ux-cards | Card and toolbar variants landed (action list filter mobile) | stale | `ls framework/ui/card/` shows page.js readme.md files.jsonl; no action/ or list/ |
| 2026-08-21 | ai/sessions/2026/08/21/ux-tokenize | Four fallback edits: --pad-cell --pad-control --muted tokens in framework.css | still-true | `grep "var(--pad-cell\|var(--pad-control\|var(--muted" framework.css` = 3 matches |
| 2026-08-26 | ai/sessions/2026/08/26/overview-palette | core/Page Overview becomes visual palette with 29 cards | n/a (process) | page design/creation task, not code artifact |
| 2026-08-29 | ai/sessions/2026/08/29/gen-widths | Generator width defaults changed; hug/fill wired into controls | n/a (process) | generator model update, page design changes |
| 2026-08-30 | ai/sessions/2026/08/30/col-styles | Column render control: seven hooks and three styled variants | n/a (process) | demo/page creation task |
| 2026-08-30 | ai/sessions/2026/08/30/color-stacks | Transparent color scales: --shade-aNN --paper-aNN --fill-aNN tokens | n/a (process) | color system design/demo |
| 2026-09-01 | ai/sessions/2026/09/01/color-study | Color inventory: 29 tokens, 42 unique computed colors light/dark | n/a (process) | audit and page creation task |
| 2026-09-01 | ai/sessions/2026/09/01/spacing-clamp | Root tokens --pad-default --gap-default use clamp(); broken imagine pages fixed | stale | `grep "^\s*--pad-default\|^\s*--gap-default" framework.css` = 0 matches |
| 2026-09-01 | ai/sessions/2026/09/01/themes-browser | Theme browser page with five alternates and token-only classes | n/a (process) | page/demo creation task |
| 2026-09-05 | ai/sessions/2026/09/05/spacing-apply | .page-previews uses var(--gap-default) for wall gap and margins | stale | `.page-previews` in Page.css uses `gap: var(--gap)` not `--gap-default` |
| 2026-09-05 | ai/sessions/2026/09/05/spacing-audit | Audit of 92 pages; findings 9,177→7,929; three spacing levels applied | n/a (process) | audit measurement and reporting task |
| 2026-09-05 | ai/sessions/2026/09/05/spacing-audit-a | Round 2 after: 31 pages 1,876 findings; strip findings cut 3x | n/a (process) | auditor group A measurements |
| 2026-09-05 | ai/sessions/2026/09/05/spacing-audit-b | 38 pages measured 3,390 findings; /imagine/ realms spacing barely reactive | n/a (process) | auditor group B measurements |
| 2026-09-05 | ai/sessions/2026/09/05/spacing-audit-c | Round 2 after: 2,450 findings; headline strip finding fixed sitewide | n/a (process) | auditor group C measurements |
| 2026-09-05 | ai/sessions/2026/09/05/spacing-audit-d | Public site 10 pages measured; every page grows <1.3x 1280→3440 | n/a (process) | auditor group D measurements |
| 2026-09-05 | ai/sessions/2026/09/05/spacing-components | Components read spacing ramps: calc(var(--gap-ramp) * multiplier) | stale | `grep "var(--gap-ramp" framework.css` = 0; current system uses --gap-70/-50/-35/-25 |
| 2026-09-05 | ai/sessions/2026/09/05/spacing-judge | Three ramps (--pad-ramp --gap-ramp --flow-ramp) and --spacing token applied | stale | `grep "^\s*--\(pad\|gap\|flow\)-ramp\|^\s*--spacing:" framework.css` = 0 |
| 2026-09-05 | ai/sessions/2026/09/05/spacing-study | Spacing study: 1,166 boxes across imagine/ at 1280 and 3440 | n/a (process) | measurement study task |

**Summary:** 25 rows. Stale: 7. Still-true: 4. n/a (process): 14.
