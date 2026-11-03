# taste-audit

Dispatched by the mastermind run `mastermind-layout` (2026-08-16). Verbatim brief:

> Rank the whole site by how GOOD its pages are, not by how broken. `taste/` (the
> third tier, landed today) rates against eleven weighted ideal ranges and can rank
> two pages that both have nothing wrong — nobody has pointed it at the site. Build
> `audit/taste/` matching the shape of `audit/` (worst-first, `analyze()` findings).
> Two fixes while in there: (1) regenerate `audit/pages.js` from an actual
> filesystem walk (every `public/**/page.js`, minus personal sandboxes, minus
> `framework/ai/` task dirs, minus `core/new/**`) — committed as a plain JS array,
> LAW#1 forbids walking at runtime; (2) generate `audit/taste.json`, the same way
> `findings.json` was, under 300KB, storing only what can't be recomputed. The new
> page: ranked table above the fold, sortable/filterable by band, the two-axis
> comparison (`analyze()` grade beside taste grade) as the headline finding in
> prose naming actual pages. Reuse `ui.table()` and utility classes — no new CSS
> file unless unavoidable. Update the readme's Open item and add one pointer
> sentence on the audit page.

**Fence** — may write only: this task dir, `public/framework/ext/LayoutTool/audit/**`,
`LayoutTool/readme.md`'s Open item, and the audit page's pointer sentence. Never touch
`taste/**` (the instrument), `probe.js`, `rules.js`, `polish.js`, `score.js`,
`ratios.js`, `styles/**`, or `ext/Panel/**`.

## Proposal / steps

1. Read `audit/page.js`, `audit/pages.js`, `audit/findings.json`, the readme's audit
   section, `taste/taste.js`, `taste/ranges.js`, `taste/readme.md`.
2. Build `audit/taste/page.js` (child of `audit/page.js`), register it, add the
   pointer sentence.
3. Regenerate `audit/pages.js` from a real filesystem walk (168 pages).
4. Write a headless-Playwright sweep (scratchpad, not committed) driving `probe()`
   once per page/width and feeding the same model to both `analyze()` and `rate()`.
5. Run the sweep at 1280 and 3440 for all 168 pages, retry-once on failure.
6. Produce `audit/taste.json` from the results, under 300KB.
7. Verify the taste page renders clean in a live tab; fix any issues.
8. Update `LayoutTool/readme.md`'s Open section (retire the pages.js item).
9. Land: log headline numbers, link the new page from its parent (done in step 2).
