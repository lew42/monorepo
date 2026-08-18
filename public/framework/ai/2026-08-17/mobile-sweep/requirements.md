# mobile-sweep

Dispatched by the `mastermind-layout` run.

## The ask, verbatim

> The gap: nobody has ever measured this site on a phone.
>
> `ext/LayoutTool/audit/findings.json` covers all 168 pages at 1280 and 3440.
> No sweep has ever crawled the site at 390 or 720, and the prime objective is
> explicitly mobile to mega. Three mobile-only defects were found last night,
> every one invisible at 1280 — a demo box collapsing to 42px wide at 390
> stacking "Web" one letter per line; `.page-catalog-pages` collapsing to
> `clientHeight: 0` below 64em on every catalog caller; `/framework/ai/<day>/`
> unreachable while routed at 390, region 0 tall against 8725 of content. All
> three were found by accident. This is the first deliberate look.
>
> 1. Crawl every url in `ext/LayoutTool/audit/pages.js` at 390 and 720 —
>    including `/framework/audit/browsable/` (missing from the list, added
>    after it was generated) — and report anything else missing by comparing
>    against `public/**/page.js`.
> 2. For each: `analyze()`, record score/grade/high count/rules fired, compare
>    against the committed 1280 row for the same page. The delta is the
>    interesting column.
> 3. Rank by severity of the mobile-only failure, in classes: zero-size /
>    unreachable (top always), measure laddering, doc-overflow / escape,
>    everything else.
> 4. Look at the worst ones — `mcp__site__shot` at 390 for top offenders,
>    checked against `knowledge/false-positives.md`. Say which findings were
>    actually confirmed by eye.
>
> Measuring, not fixing — no CSS/page.js/anything under `public/` changes
> except this deliverable.
>
> Deliver `public/framework/ai/2026-08-17/mobile-sweep/findings.md`: table
> first, ranked worst-first by mobile-only severity, confirmed screenshots,
> then a one-line verdict on whether the site meets its own mobile objective.
> If the answer is "fine on a phone", say that plainly and first.

## Scope / file-ownership fence

Write ONLY: this task dir, the generated `public/framework/ai/usage.json`,
and the session scratchpad. Do NOT touch any source file, any `page.js`, any
CSS, any JSON baseline, or anything under `public/framework/ext/Panel/`
(owned by another session).

## Proposal / steps

1. Inventory: read `pages.js`, diff against `public/**/page.js`, load the
   1280 baseline `findings.json`, read `knowledge/false-positives.md`.
2. Build the crawl harness: Playwright (global install, direct file URL
   import), dev server on port 80 already running (do not start/restart),
   `window.$BLOCKRELOAD = true`, hoist `import()` of LayoutTool's `analyze()`
   into `page.evaluate()`, recycle browser context every ~40 navigations.
3. Sweep pass at 390 — every page, retry once on failure then record failed.
4. Sweep pass at 720 — same.
5. Compare each page's 390/720 result against the committed 1280 row; compute
   deltas; classify into the four severity buckets.
6. Screenshot the worst offenders with `mcp__site__shot` at 390; confirm or
   refute against `knowledge/false-positives.md`.
7. Write `findings.md` — table first, worst-first, confirmed screenshots,
   final verdict.
8. Land: link findings, close out task log.
