# audit-baseline

Dispatched by the mastermind run `mastermind-layout` (2026-08-16). Verbatim brief:

> A generated baseline just grew to 2.0MB, and the reason it was small before was
> a bug. `audit/findings.json` is the audit page's committed baseline. Its readme
> states the rule: only rows worth opening (score < 80) carry their issue list,
> keeping issues for all 232 runs made an 854KB file. Regenerating it today
> surfaced two problems: (1) the old file's per-row issues cap (3-4 entries) did
> not match its own `counts.total` — 221 of 237 sub-80 rows mismatched, and the
> cap sometimes dropped the single worst finding on the row; (2) following the
> documented rule honestly produced a 2.0MB file. Both cannot stand. Design the
> honest format (a judgement call to make and defend): a documented consistent
> cap with `counts.total` recorded; fields the page never reads, dropped; or a
> split (small ranking file, per-row detail fetched on click — weigh carefully,
> since a clean row already re-measures live, so this may be closer to the
> existing design than it looks). Whatever is chosen, the file must state its own
> rule in a header field. Regenerate to the new format, make `audit/page.js` read
> it correctly (including showing honestly when a list is truncated). Verify at
> 1280 and 3440 with `mcp__site__shot`.

**Fence** — may write only: `public/framework/ext/LayoutTool/audit/**` and this
task dir. Never touch `probe.js`, `rules.js`, `polish.js`, `score.js`,
`taste/**`, any `page.js` outside `audit/`, or `public/framework/ext/Panel/`.

## Proposal / steps

1. Read `audit/page.js`, `audit/pages.js`, `LayoutTool/readme.md`'s baseline
   section, `report.js`, `twin.js`, `vision.js` — what the page actually reads
   out of a row.
2. Measure the current (uncommitted, 2.0MB) regenerated file and the previously
   committed one to confirm both halves of the bug precisely.
3. Design the honest format: drop full per-instance finding detail (selector,
   path, fix, prose `detail`) from the baseline entirely — `open()` already
   re-measures a row live via `frame()` when it lacks full detail, today only
   for clean rows; extending that to every row removes the need for any cap.
   Keep a compact per-instance `rules: [{rule, title, sev}]` (no cap, no
   truncation possible) so `problems()`'s site-wide grouping — which reads
   every row's issues, not just the opened one — keeps working unchanged. Add a
   top-level header object (`generated_at`, `format`) stating the rule.
4. Regenerate via a headless Playwright sweep (scratchpad, not committed)
   driving `analyze()` per page × width, 168 pages × [1280, 3440].
5. Update `audit/page.js`: read the new header/rows shape, `open()`'s live-vs-
   cached check, `problems()`'s per-row issue read, the "Leading" column.
6. Verify: `mcp__site__shot` at 1280 and 3440, confirm the table ranks, a row
   opens with its full findings including its worst one, and `problems()`
   still renders a non-empty grouping from the saved baseline.
7. Land: log the format decision, before/after size, and proof no row's worst
   finding is dropped.
