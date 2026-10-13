# Past style work: what earlier tasks concluded, and whether it is still true

Checked 2026-10-12 against the current code (two Haiku scans over a [digest script](/framework/ai/sessions/2026/10/12/session-cbdc3ef5/style-system/digest.mjs) of 49 past task folders; three rows corrected by hand, marked *corrected*). Old conclusions are not trusted: each row names the evidence. Decisions made from this: [architecture.md](architecture.md).

## What still holds

- The spacing tokens `--pad` `--gap` `--flow` and the four rungs under the gap (2026-09-06 onward).
- `.card` = a padded `.surface` with `--pad-card`, a status edge and child rhythm (2026-09-19 card-word, *corrected*: the Haiku scan missed the rule; it is in framework.css).
- The five layout words live in `core/Page/Page.css`, not framework.css (2026-08-17 layout-primitives, *corrected*: not stale).
- `--measure` exists in Page.css (2026-08-16, *corrected*: partly).
- Lighten/darken are alpha aliases (2026-09-17), `bg-lighten`/`bg-darken` pick their step per ground (2026-10-03).
- [/framework/design/](/framework/design/) and [/framework/code/](/framework/code/) exist (2026-09-30).

## What is stale

- The 2026-09-05 ramp names (`--gap-ramp`, `--pad-default`): replaced by the clamp tokens.
- 2026-08-21 card variants (action/list/filter as child pages of ui/card): gone.
- The 2026-09-24 card consolidation plan (75 box kinds to 36) was planned, never applied; this task's one-card rule picks it up.

## Every row


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
| 2026-09-06 | spacing-constants | 421 of 447 spacing constants now read the ramp (--pad-ramp, --gap-ramp, --flow-ramp) | still true | --flow: 2.5em ceiling in framework.css, tokens defined |
| 2026-09-06 | theme-button | site's button rule deleted; no brand voice kept | still true | 0 matches for .theme-lew42 button/btn in styles.css |
| 2026-09-06 | ui-theme | all controls now 36.09px; one box, every control | still true | framework.css has --pad-card and control tokens; ui/ directory exists |
| 2026-09-13 | paging-spacing-3440 | --flow ceiling 3em → 2.5em, fixes spacing balloon at 3440 | still true | framework.css: --flow ceiling is 2.5em |
| 2026-09-17 | color-lighten-darken | lighten/darken tokens created as aliases (--paper-aNN, --shade-aNN); +34 lines in framework.css | still true | 20 matches for lighten-/darken- in framework.css |
| 2026-09-17 | design-system | one page that IS the design system; minimal 7-length ladder from census | still true | public/framework/styles/system/page.js exists (16KB, Sep 20) |
| 2026-09-17 | spacing-census | 1894 spacing declarations counted; 28 distinct multipliers found; census.json and census.md delivered | still true | census.json exists at public/framework/ai/sessions/2026/09/17/spacing-census/ |
| 2026-09-17 | type-color-study | two pages: where grounds meet (61 specimens), and colored anchor | still true | public/imagine/design/color/sections/page.js exists |
| 2026-09-19 | card-adopt | --pad-card floor moved from 0.5em to 1rem; dev bar cards now 16px | still true | framework.css: --pad-card uses clamp(1rem, ...) |
| 2026-09-19 | card-word | .card exists: padded .surface with --pad-card, --gap, --card-edge, .selected state | partly | tokens in framework.css found; .card class definition not located in CSS |
| 2026-09-24 | card-consolidation | card plan landed: 75 box kinds → 36; 19 padding rules → 5; merges ready but not applied | still true | public/framework/ux/Content/plan/page.js exists |
| 2026-09-25 | ai2-resurface-bar | n/a (process) | n/a | no outcome page; task directory exists |
| 2026-09-25 | css-audit | explorer, ranked plan, padding curves delivered; A curve recommended for --pad | still true | public/framework/ai/sessions/2026/09/25/css-audit/css-audit/page.js exists |
| 2026-09-28 | content-cards-audit | audit on the card; 11 of 17 pages are markdown; proposal for content-cards skill | stale | directory exists but page.js missing; only files.jsonl present |
| 2026-09-29 | dictate-spacing | rows 1-4 applied: gap 133→21px at 400, text width 288→344px, all tabs show | still true | task.jsonl exists in directory; paging pages reference --flow |
| 2026-09-30 | card-measure-gap | n/a (none outcome) | n/a | directory exists with files.jsonl; no page.js |
| 2026-09-30 | design-code | /framework/design/ and /framework/code/ pages delivered with browsable readme trees | still true | both directories exist with readme.md files |
| 2026-10-01 | token-efficiency | n/a (process) | n/a | report.md exists; read-only audit, no code changes |
| 2026-10-02 | token-reduction | n/a (process) | n/a | requirements.md exists; build plan written, no implementation |
| 2026-10-03 | card-measure-colors | n/a (none outcome) | n/a | directory exists with files.jsonl; no page.js |
| 2026-10-03 | ghost-theme-fix | Sortable ghost stays inside parent, not document.body; one line changed in Sortable.js | still true | Sortable.js: this.view.el.after(this.ghost) present |
| 2026-10-04 | token-accounting | two accounting mistakes fixed; cache $ breakdown on Sessions tab; one source of truth | partly | Sessions page exists; cost breakdown likely present but not visually verified |
| 2026-10-07 | token-accounting | real accounting bug found and fixed (find_transcript case-sensitive match); Phase 2 plan written | still true | findings.md exists with fix description and reconciliation proof |
| 2026-10-09 | production-stack | inventory page and doc delivered; no demo run (wrangler not installed); GitHub OAuth pending | still true | public/framework/ai/sessions/2026/10/09/session-54d56780/production-stack directory exists |
