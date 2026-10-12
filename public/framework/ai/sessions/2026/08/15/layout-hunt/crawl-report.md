# Crawl report — agent B, 2026-08-15

854 measurements, 0 load failures. 182 corpus pages × 4 widths (400/1280/1920/3440) + 42 sampled link-only urls × 3 widths. Measured against a frozen snapshot of `public/` served on :8181 (agents A/C were editing the live tree); re-measuring the worst 20 afterwards, 39 of 40 identical.

Deliverables: `scan.jsonl` (672 lines: url · width · score · grade · nodes · metrics · top-6 issues with proposed declarations · screenshot path), regenerated `ext/LayoutTool/audit/findings.json` (364 rows, +`viewport` field — report.js already read `data.viewport?.w` and fell back to 1280 on every 3440 row) and `audit/pages.js` (182 urls, derived by walking for `page.js` dirs). 392 screenshots (90 MB) in the session scratchpad `screens/`.

## The page list, de-drifted

Old hand-typed list: 2 dead urls (`ext/classdoc` renamed to `ext/Doc`, still linked from five ai log pages), **63 pages missing** — all of `/notes/` and `/web/`, every ai day, `/framework/audit/`, the root. Beyond page.js dirs the routable surface is ~561 urls: `ext/Doc` mints one per member/file (225), ai task pages render from task.jsonl with no directory (154). Stratified 42-url sample: ai task pages are the worst family (median 42–50), doc api/docs/files members 52–72, doc notes 90–94.

## The 20 worst (min score across 400/1920/3440) — UNDER THE V1 RULES

| # | min | url | 400/1920/3440 | cause |
|---|---|---|---|---|
| 1 | 0 | /framework/ai/2026-08-09/ | 0/52/53 | measure — 10.7 ch/line, 98px column |
| 2 | 0 | /framework/ai/2026-08-11/ | 0/26/24 | rhythm — gaps 6–126px around 7px median (18×) |
| 3 | 0 | /framework/ai/2026-08-13/panel/ | 0/0/6 | measure — 9.5 ch/line, 117px column |
| 4 | 0 | /framework/ai/2026-08-14/editor-panel-review/ | 0/22/28 | measure — 10.2 ch/line, 90px column |
| 5 | 0 | /framework/core/new/starter/ | 0/17/19 | measure — 10.7 ch/line, 91px column |
| 6 | 0 | /framework/ext/Panel/ | 0/41/61 | measure — 1.8 ch/line, 0px column (real: demo rail collapses at 400) |
| 7 | 14 | /framework/ai/2026-08-08/ | 14/62/72 | measure — 10.6 ch/line, 126px column |
| 8 | 16 | /framework/core/new/0/ | 16/38/43 | measure — 11 ch/line over 25 lines |
| 9 | 19 | /framework/ext/catalog/ | 19/49/53 | measure — 10.9 ch/line, 117px column |
| 10 | 19 | /framework/ext/catalog/overview/intro/ | 19/49/53 | same page, doc-member url |
| 11 | 20 | /framework/core/new/1/ | 20/26/29 | rhythm — gaps 6–80px around 8px (10×) |
| 12 | 23 | /framework/ext/editor/ | 23/30/28 | measure — 9.8 ch/line over 23 lines |
| 13 | 24 | /framework/ext/LayoutTool/audit/ | 44/24/29 | cramped — text 0px from its frame |
| 14 | 24 | /framework/ext/layout/ | 24/37/54 | zero-size — 0×0 box holding text |
| 15 | 25 | /framework/ai/2026-08-13/sessions/ | 25/57/59 | measure — td 10.4 ch/line |
| 16 | 26 | /framework/ai/2026-08-12/apps/ | 26/37/38 | rhythm — gaps 8–259px around 8px (32×) |
| 17 | 26 | /framework/ai/2026-08-13/manifest-vs-log/ | 26/67/67 | rhythm — 13× |
| 18 | 26 | /framework/core/Page/ | 26/46/46 | rhythm — 12.8× |
| 19 | 27 | /framework/ext/LayoutTool/ | 46/27/27 | zero-size — 0×0 box holding text |
| 20 | 28 | /framework/ext/Doc/ | 28/57/57 | rhythm — 10.4× |

400px is the worst width (57 F of 182); 3440 the best median (partly structural: dead-space caps at medium, so a widescreen miss costs at most ~4 points).

## Analyzer bugs that author this ranking

Recomputed score.js arithmetic over the captured issue lists with each class removed:

| suspect | evidence | site median |
|---|---|---|
| `zero-size` ignores `boxed()` | 360/371 findings are `div.tabs.block` (`display: contents`) — false-positive class #2 in the tool's own knowledge base, guarded everywhere except rules.js:179. High sev, 12 pts, 84 pages. | 66 → 74 |
| `cramped` has no table exemption | 3277/3414 findings are tr/td/th — a `<tr>` draws a border but holds no padding; its padding is the cell's. | 66 → 67 |
| `measure` ladder branch fires on cells | 173/203 HIGH measure findings are td/tr/th; 200/203 are the ladder branch. The rule's own comment says table cells run 18–24 legitimately; nothing enforces it. This one rule authors the worst-20 ranking. | 66 → 67 |
| `hit-size` counts one component 437× | all 437 med findings are `input.layout-range` (60×17) — real, but ONE CSS line reported on 71 pages. | 66 → 69 |
| alignment roll-up is one level deep | fired 20,924×. Repeated ROWS (each its own parent) never collapse: div.ai-card/.ai-line/.ai-figures = 190–326 findings per ai dashboard; `span.sidebar-label` alone 2,504 site-wide — one Sidebar fix. | — |
| `clipped` exempts crops only via max-height | `p.page-preview-desc` uses `-webkit-line-clamp: 2` with `max-height: none` — knowledge base names line-clamped descriptions intended-exempt; ratios.js:38 tests `!p.maxh` only. ~12/79 clipped:high. | — |

All four score-affecting guards together: **median 66 → 79, F grades 269/854 → 61/854.** Four rules never fired anywhere in 854 runs: `doc-overflow`, `collision`, `double-pad`, `invisible`.

## The real bug the ranking buries

**All 18 leaf pages of `/web/` clip their content off with no way to reach it.** Outer `div.pages` is `overflow-y: hidden` at clientHeight 900 while scrollHeight runs 1683–4999 — verified in the DOM at every width. Worst: `/web/nav/drill/` at 400px, 4099px unreachable (455% of its height). On `/framework/styles/elements/` the inner `.pages` correctly carries `overflow-y: scroll`; the `/web/` tier renders straight into the app region instead. Proposed: `overflow-y: auto` on `div.pages`. **This page scores 82 (B), rank 149/182** — unreachable content must outrank every wobble; today it does not.

**A 404 scores an A.** `/framework/audit/modules/` and six `<module>/doc/` urls (Item, Draggable, Saver, catalog, doc, tabs) render "404 — nothing matches" and score 90–94; emptiness passes every rule. Census of all 481 link-only urls incomplete — the `<module>/doc/` family (23 urls) likely all dead.

## Sweeps — 17/20 pages, 174 edges (data: scratchpad/sweeps.json)

- Nothing on the site rearranges above 1400px (24 edges above 1400 all belong to `editor-panel-review`, the one non-deterministic page). Below 800: 75 edges; 800–1400: 75.
- Recurring chosen edges (+8px bisect grain, 15px scrollbar): 840→52em, 896→56em, 976→60em, 1032→64em, 648→40em.
- Edges nobody chose, recurring: **368px** (5 pages), **624px** (4), **1080px** (3), **1272px** (5).
- Method caveat: most edges are a single borderline rule crossing its threshold (at 1272px five pages "changed" only because `line-height` dropped out). Signature treats rule presence as discrete; real rearrangements would move `cut` count or scroll flag, which barely move. `frame()` is deterministic (6/6 repeats identical); this is a signature-design issue.
- Three sweeps hung (`ext/LayoutTool`, `ext/Doc`, `ai/2026-08-12/apps/navigation`) — in-page `sweep()` via `page.evaluate` has no timeout; wire a timeout before the audit page ever calls sweep.

## Anomalies

`/framework/ai/2026-08-14/editor-panel-review/` is not deterministic at a fixed width (22 then 7 at 1920; 36 sweep edges, 2× any other page). All its numbers unreliable until understood.
