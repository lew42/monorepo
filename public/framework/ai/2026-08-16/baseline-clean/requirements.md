# baseline-clean

Dispatched by the mastermind run `mastermind-layout` (2026-08-16). Verbatim brief:

> `LayoutTool/audit/findings.json` carries three error rows: `styles/layouts/document/`
> at 1280 and 3440, and `ui/tooltip/` at 1280 — all `"deadline exceeded (25000ms)"`.
> An Opus judge established those pages are fine: `analyze()` never hung, headless
> Chrome's renderer main thread wedges permanently after ~85-110 navigations in one
> reused browser context, so the `await import()` in front of `analyze()` never
> resolved. Full record: `ai/2026-08-16/mastermind-layout/hang.md`. The fix is
> documented in `LayoutTool/readme.md`: hoist the `import()` into its own
> `page.evaluate()`, and recycle the browser context every ~40 navigations — proven
> 336/336 measured, 0 stalls, 145s.
>
> Regenerate `findings.json` and `taste.json` with the corrected recipe, matching
> each file's existing `format`/note contract exactly (findings.json: uncapped
> `rules` summary, `rules.length === counts.total`; taste.json: keep the `tier`
> fingerprint, update `generated_at`). Both must come back 336/336 with zero error
> rows — any row that still errors is a real finding, not something to paper over.
> Verify the audit page still reads both files at `/framework/ext/LayoutTool/audit/`
> and `/framework/ext/LayoutTool/audit/taste/` at 1280 via `mcp__site__shot`, scoped
> to `.active-page`. Report what the three formerly-erroring pages actually score.

**Fence** — may write only: `public/framework/ext/LayoutTool/audit/findings.json`,
`public/framework/ext/LayoutTool/audit/taste.json`, and this task dir. Never touch
`audit/page.js`, `audit/readme.md`, any source file, `taste/**`, or
`public/framework/ext/Panel/`.

## Proposal / steps

1. Read `hang.md`, `LayoutTool/readme.md`, `doc/cost.md`, `audit/readme.md` for the
   corrected recipe and the exact committed-file contract (both files).
2. Read `audit/page.js`, `LayoutTool.js`, `score.js`, `taste/taste.js`,
   `taste/ranges.js`, `taste/read.js`, `audit/taste/page.js` to pin the exact row
   shapes both files must produce.
3. Write a headless Playwright sweep script (scratchpad, not committed) — import
   hoisted into its own `page.evaluate()`, fresh context every ~40 navigations,
   `waitUntil: "load"` + fixed settle, never `networkidle`, `$BLOCKRELOAD`.
4. Run the sweep for `findings.json` (analyze() per page x width), foreground,
   confirm 336/336 with zero errors.
5. Run the sweep for `taste.json` (rate() per page x width), foreground, confirm
   336/336 with zero errors and the `tier` hash unchanged (probe.js + taste/{read,
   ranges,taste}.js + score.js + rules.js untouched).
6. Write both JSON files matching the existing shape exactly.
7. Verify with `mcp__site__shot` at 1280: `/framework/ext/LayoutTool/audit/` and
   `/framework/ext/LayoutTool/audit/taste/`, scoped to `.active-page`.
8. Report the three formerly-erroring pages' real scores and whether the site's
   worst-ten changed.
