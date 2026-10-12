# spacing-constants — hand-typed spacing in page files reads the ramps (Sonnet)

Three laws: less is more; clear beats brief; prioritize. Length budget: the report is 8 plain lines; the log carries the numbers.

Read first: the repo's `CLAUDE.md`; `../../2026-09-04/mastermind-platform/minion-rules.md`; `/imagine/design/spacing/decision.md` (the decision: three ramps, three levels — read the exact token names in `framework.css` `:root`, do not guess them); `/imagine/design/spacing/audit/` (how before/after was measured on 20 pages — reuse its script if one is in the repo, else write your own in the scratchpad under `spacing-constants/`). Skills: `new-task` (this dir, group `layout`), `css`, `layout` (the 3440 rules), `finish-task`.

## The job

The components now read the spacing tokens (365 rules, 09-05). Page files do not: `.style()` calls and inline css in `page.js` files still carry hand-typed `padding`, `margin`, `gap`, `row-gap`, `column-gap`, `inset` constants — the mastermind's earlier estimate was 289 spacing constants; a broad grep finds 908 `.style()` calls with any length unit across 229 page files, most of them widths and heights, which are NOT your target. Census first, by property name, and log the count. Then convert each spacing constant to the token that means the same thing (a pad → the pad token, a gap → the gap token, a stacked margin → the flow token; a multiple stays a multiple, `calc(2 * var(--…))`).

## Leave alone, and say why in the log

- A hairline or a nudge under 4px (a 1px border offset, a 2px optical fix).
- A page that DEMONSTRATES a constant on purpose: everything under `/imagine/design/spacing/` and `/imagine/design/padding/`, and any demo whose caption says so.
- `public/imagine/paging/**`, `public/imagine/sections/**`, `public/imagine/layouts/**` — another wave rewrites them; touch nothing there.
- `core/`, `ext/`, `framework.css`, any `.css` file — components were done yesterday; you edit `page.js` files only.

## Prove it

Before and after, at 1280 and 3440, the same 20 pages the audit used (or 20 you pick across `/framework/`, `/notes/`, `/imagine/` — list them): median gap and median pad in px, in a table in your log. Two numbers that must agree: constants found by the census − constants left alone = constants converted. Zero console errors on the crawl of every page you touched, at 400/1280/1920/3440. One before/after screenshot pair of the page that changed most, saved in your task dir and linked.

## Fences and budget

Write `page.js` files under `public/` (minus the exclusions above) and this task dir. Private server (`PORT=8096 node server.js` from the repo root; kill the pid you started; never port 80; never the owner's tabs). Never `find /`; never spawn agents; never `git stash`/commit. Budget ~300k tokens. Report in ≤ 8 plain lines: found / left / converted, the median table, the screenshot link, anything you doubted.
