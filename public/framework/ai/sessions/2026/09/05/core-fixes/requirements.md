# core-fixes — two measured core defects, fixed at the cause (Sonnet)

Read first: the repo's `CLAUDE.md` (law 2; every CSS rule in a layer — the four layers and their order live once in `framework.css`), `../../2026-09-04/mastermind-platform/minion-rules.md`, then the two proposals you are applying, written by minions who measured them and were fenced out of `core/`: `../nav-stability/proposals.md` (proposal (a) only: the `--page-column-*` tokens INHERIT into a nested columns row, which made a demo column 1202px wide in a 1202px row; one rule in `Page.css` fixes it — (b), the `fixed` word, is a feature, not yours) and `../sections/task.jsonl` + `public/imagine/sections/doc/decisions.md` (the bleed finding: `framework.css`'s util-layer `:first-child { margin-top: 0 }` beats `Page.css`'s theme-layer bleed rule at any specificity, so the block half of `bleed` is dead in every column — `margin-inline` applies, `margin-top` does not, leaving a 15px strip; fix: move Page.css's two block-margin lines into `util`, or narrow framework.css to `:first-child:not(.bleed)`). Skills: `new-task` (this dir, group `layout`), `css` (read `framework.css` and the layer rules first), `ui-test`, `documentation`, `finish-task`.

## Deliverables

1. **Nested columns keep their own tokens.** Apply the one rule from proposal (a) in `core/Page/Page.css`; then measure the page that reported it (`/imagine/paging/navigation/columns/` or wherever nav-stability's demo lives — its log says) before and after: the nested column's width; and re-shoot three columns pages that must NOT change (`/imagine/`, `/imagine/platform/research/cloudflare/verdict/`, `/imagine/research/stone/`) — identical column widths.
2. **`bleed` bleeds vertically too.** Choose the narrower fix (say why): `framework.css`'s `:first-child:not(.bleed)` or moving Page.css's two lines into `util`. Then `/imagine/sections/` (its sheet restates the rule in `util` as a workaround — remove the workaround once core is right, in coordination: that realm is not yours, so write the removal as a one-line note in your log) and two other bled pages (`/imagine/design/padding/`, `/imagine/mag/`) measured before and after: the first bled child's top margin and the strip above it.
3. **Docs:** one line each in `core/Page/doc/columns.md` (tokens do not inherit into a nested row, dated) and `framework/styles/readme.md` or `doc/cascade.md` (the util `:first-child` rule and `bleed`, dated), and the decisions record.

## Prove it

Before/after numbers on the named pages at 1280 and 3440; zero console errors; no page other than the reporting ones changes its measured layout (state which pages you checked). The `layout` skill's three invariants on everything touched.

## Fences and budget

Write: `core/Page/Page.css`, `framework.css` (one selector), `core/Page/doc/columns.md`, `core/Page/doc/decisions.md`, `styles/readme.md` or `styles/doc/cascade.md`, this task dir. Private server (kill by the pid you started); never `find /`; never spawn agents; never `git stash`/commit. Budget ~120k tokens. Report in ≤ 8 plain lines: the two rules as applied, the before/after numbers, the unchanged-page check, what you left and why.
