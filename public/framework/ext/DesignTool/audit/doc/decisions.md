# audit — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## `findings.json`'s rule — stated in the file itself

The file is `{ generated_at, format, rows }`, not a bare array — `format` is
the rule in prose, read it there first. Short version: every row carries what
it takes to **rank** (`counts`, `metrics`) plus a compact, **uncapped**
per-instance summary (`rules: [{rule, title, sev}]`, no selector, path, fix or
prose detail). `rules.length` always equals `counts.total` — by construction,
since nothing here is ever capped. No row carries full finding detail;
`open()` fetches it live via `frame()` on click, for every row.

## ⚠ THIS TABLE IS A WORKLIST, NOT A RANKING OF QUALITY (2026-08-17)

**There is no `score` and no `grade`, in the file or in `analyze()`.** Measured
against eighteen hand-rated screenshots the old aggregate came out
*anti*-correlated with how pages look — Pearson **−0.393**, and against DOM node
count Spearman **−0.519** — because it counted findings and findings scale with
content, so it rewarded emptiness: grade A / 96 to the worst-looking page in the
corpus, its lowest score to the best, and never a reading below 70 across a
36-point reality. Evidence: `ai/2026-08-17/vision-baseline/`. The removal and the
rebasing: `ai/2026-08-17/tier-calibration/`.

**Every rule survived. Only the average did not** — the same rules found the
catalog scroll boundary that was hiding content on 18 pages. Rows sort by
`score.js`'s `worst_first`: high desc, then med, then low. That census shares the
old score's bias (an empty page fires nothing and sorts best) *without* dressing
it up as a grade, which is the whole difference. [`taste/`](taste/) is the tier
that ranks quality, and `report.badge()` — a graded chip — is now only ever
handed a taste row; a findings row gets `report.census()`.

**Why not a cap instead of dropping detail entirely (2026-08-16).** The
previous format tried a cap — 3–4 issues per row — and it was never checked
against `counts.total`: 221 of 237 sub-80 rows mismatched, and 89 of those
were missing the row's own worst finding, undetected because nothing reads
the field back and checks it. A cap is a promise a future regeneration has to
keep by hand; dropping the heavy fields (`sel`, `path`, `fix`, `detail`) and
keeping only what `problems()`'s site-wide grouping actually reads removes
the promise instead of trying to keep it honestly. Result: 336 rows, 304KB —
smaller than the 854KB this same design note used to warn about, and the
133KB→2.0MB swing a truncation-honest regeneration produced is no longer
possible because there is no truncation.

## Regenerating

A headless Playwright pass driving `analyze()` per page × width — see
`DesignTool/readme.md`'s baseline section for the `page.evaluate()` shape.
Method and scripts: `ai/2026-08-16/audit-baseline/`.

## Traps

- **`open()`'s live-vs-cached check is `row.issues?.length`.** A saved row
  must never have an `.issues` key — if it does, `open()` will show it
  directly instead of re-measuring, and a saved row only has the compact
  `.rules`, not full detail. Don't rename `.rules` to `.issues` "for
  consistency" — that silently reintroduces the old bug in a new shape.
- **A live `run()` row and a saved row must expose the same rank-support
  shape** (`rules`, `leading_rule`) so `problems()` and the table read either
  one the same way — see `rank_shape()` in `page.js`.
