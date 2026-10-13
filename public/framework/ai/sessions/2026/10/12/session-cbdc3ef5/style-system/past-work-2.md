# Style-system past work — current status check

| Date | Task | Conclusion | Status | Evidence |
|------|------|-----------|--------|----------|
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
