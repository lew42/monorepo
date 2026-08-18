# settle-study

Dispatched by the `mastermind-layout` run (`ai/2026-08-16/mastermind-layout/`)
as a minion task. Verbatim ask:

> How many of this site's audit findings are facts about the delay?
> `ext/LayoutTool`'s `frame()` waits a fixed 350ms after load before
> measuring. Measure how big this problem is — do not fix it (`frame()`'s
> settle is a RULE#1 call reserved for Mike). Sample: every page carrying a
> `high` finding (11 pages, 17 of 336 rows) plus ~10 clean controls, at
> least two `ai/` pages. Measure each at 350ms/1000ms/3000ms, 3 runs each, at
> 1280. Record score, grade, counts.high, metrics.nodes, and which rules
> fire per page per delay. Write the report to
> `ai/2026-08-16/mastermind-layout/settle.md`.

Fence: write only `settle.md`, this task dir, and the scratchpad. No source
file, `page.js`, JSON baseline (`audit/findings.json`) or readme may change —
measuring only.

## Steps

1. Read `audit/findings.json` + `LayoutTool/readme.md`'s Open section; pick
   the sample (11 high pages, 2 extra `ai/` worst-cases named in the readme,
   10 clean controls).
2. Build + smoke-test the Playwright driver (hoisted import, recycled
   context, `frame()`'s own `settle` semantics reproduced via
   goto→import→wait→analyze, matching how `audit/page.js` actually produces
   the baseline).
3. Run the primary sweep: 23 pages × 3 delays × 3 runs @ 1280.
4. Supplementary sweep @ 3440 for the 11 `high` pages (5 of the 17 rows only
   exist at that width — a width effect, not a delay effect, needed to
   answer the question honestly for all 17 rows).
5. Case-study check on `styles/elements/lists/`, the page named in the
   dispatch brief itself.
6. Analyze: per-row survival at 3000ms, rule-level settle-sensitivity,
   node-count trend, cost/benefit of a wait-for-quiet fix.
7. Write `ai/2026-08-16/mastermind-layout/settle.md`.
