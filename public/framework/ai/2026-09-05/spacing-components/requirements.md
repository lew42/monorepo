# spacing-components — the components read the tokens (Opus)

Read first: the repo's `CLAUDE.md` (law 2, the Presentation section), `../mastermind-day/requirements.md` (decision 1), `../../2026-09-04/mastermind-platform/minion-rules.md`, then the judge's decision and the audit: `/imagine/design/spacing/decision.md` (`public/imagine/design/spacing/decision.md` — the three ramps `--pad-ramp` `--gap-ramp` `--flow-ramp`, the three levels on one `--spacing` token, the control rule), `/imagine/design/spacing/audit/`, `../spacing-audit/ranked.md`, and the manager's landing in `../spacing-audit/task.jsonl` (its finding 6–8: on 65 of 91 pages the median gap is a constant inside a component; three regressions). Skills: `new-task` (this dir, group `design`), `css` (read `framework.css` — the ramps and the levels are there now), `layout`, `finish-task`.

## The finding you are fixing

The judge's tokens are right and the pages that read them now grow 1.8× from 1280 to 3440. But the median sibling gap sitewide is unchanged (9.7px at 3440) because most gaps are constants inside components: a card's `0.6em`, a rail row's `0.45em`, a chip's padding, a wall's own gap. The owner's "ALL TOO CRAMPED" lives in those components.

## Deliverables (numbered)

1. **The list.** From `ranked.md` and the auditors' json, every component rule whose spacing is a constant where a ramp exists: file:line, the constant, the ramp it should read (and which level, if any — small UI wants `tight`, not a flat number). Two numbers that must agree: rules found vs rules changed + rules deliberately kept (a kept constant has a reason in one line: a 1px hairline, an icon's optical inset).
2. **Apply it**, in `framework.css`, `core/Page/Page.css` (cards, walls, rail rows, the crumb strip, previews), `ext/*/*.css`, `ui/**/*.css`, `styles/**/*.css`, and the realms' own css under `public/imagine/*/` EXCEPT `paging/` (another minion owns it today; write its list in your log for the mastermind). A constant becomes `calc(var(--gap-ramp) * 0.6)` or the `tight` level, never a new literal; the comment carries the old value and the date.
3. **The three regressions** the manager named: `div.page-preview` now reads as a strip 54× (the emptiness moved up one level — the card wants `fit-content` or its wall wants a real `--column`); `a.sidebar-link` 7.1× (the parent's `align-items: stretch`); `a.decks-chip` absolute padding on a 92px box. Fix each at its cause.
4. **Re-measure** with the auditors' method (`../spacing-study/` and the manager's scripts): the median sibling gap at 1280 and 3440 sitewide, before and after, and per realm; the growth ratio. The target from the judge: about 1.8× growth wherever gaps read tokens, and the sitewide median moving with it. Zero regressions on the `layout` skill's three invariants across the 91 pages (the auditors' page list); nothing at x:0; no new overflow; no fold pushed on the 20 audited pages.
5. **The audit page gets an "after the components" row**: `/imagine/design/spacing/audit/` — append the sitewide medians and ten before/after crops of the biggest movers; one plain sentence.

## Fences and budget

Write: the css files named in 2 (never `public/imagine/paging/`), `public/imagine/design/spacing/audit/` (append), this task dir. Private server (kill by the pid you started); never `find /`; never spawn agents; never `git stash`/commit. Budget ~450k tokens. Report in ≤ 10 plain lines: rules changed / kept, the sitewide median before/after at 3440 and the growth ratio, the three regressions' fixes, the paging list handed back.
