# Re-crawl report — agent F, 2026-08-15 (after the rule fixes)

Corpus 182 → **205 pages** (the page.js walk plus the 21 LayoutTool library entries, which are inline POJO children with no directory — `audit/pages.js` header records the second derivation). **820 measurements, 0 errors.** `scan.jsonl` rewritten: 615 lines (205 × 400/1920/3440), v1 schema + `settle` + `metrics.text`. `audit/findings.json`: 410 rows (1280+3440), audit page smoke-tested green. Screenshots: +100 (LayoutTool/DevBar pages re-shot — C/E/A changed their pixels); every one of the 149 rows scoring <70 has a PNG; the 12 `/web/` pages (37 shots) and 13 library entries finally captured. `screens/` now 485 PNGs, 110MB, in the session scratchpad.

## Settle (the fix for measuring half-built pages)

Quiescence = no DOM mutation, no in-flight fetch, no new resource entry, no incomplete image for 300ms — **plus a 2500ms floor**, cap 5000ms. The floor matters: `ai/2026-08-13/sessions/` goes quiet at ~600ms then lands waves at 1476ms and 2042ms **on a timer**; a pure quiet-watcher exits at 382ms and scores 84/B instead of 70/C. Recorded per row: `settle`, `first_quiet`, `mutations`, `capped`. Median settle 2730ms, 0 rows capped. 350ms-fixed vs settled (92-page sample): 17 differ, 7 by ≥10 points, mean |Δ| 16.6. Stability: worst-20 re-measure 19/20 identical — the one mover is genuinely non-deterministic (below).

## The 20 worst (min across 400/1920/3440)

| # | min | url | 400/1920/3440 | leading finding |
|---|---|---|---|---|
| 1 | 0 | /framework/ai/2026-08-13/panel/ | 0/0/0 | measure — `div.ui-timeline-entry.flex.v` is **0px wide × 2259px tall holding real text**, every width; appears only in the second render wave (350ms measurement reads 79/B) |
| 2 | 0 | /framework/ext/LayoutTool/library/bad/chosen-height/ | 0/0/0 | unreachable (a deliberate don't — working as intended) |
| 3 | 0 | /framework/ext/Panel/ | 0/61/75 | measure — 2.2 ch/line laddering at 400 |
| 4 | 4 | /web/nav/sidebar/ | 6/4/72 | unreachable — 1226px hidden (136%) |
| 5 | 5 | /web/nav/drawer/ | 6/5/9 | unreachable — 1254px (139%) |
| 6 | 6 | /web/layout/flex/ | 14/6/9 | unreachable — 1262px (140%) |
| 7 | 11 | /web/layout/tracks/ | 11/77/77 | unreachable — 1086px (121%) |
| 8 | 11 | /web/nav/bar/ | 11/68/74 | unreachable — 924px (103%) |
| 9 | 14 | /web/layout/screens/ | 14/19/19 | unreachable — 2652px (295%) |
| 10 | 16 | /web/layout/grid/ | 16/79/21 | unreachable — 1412px (157%) |
| 11 | 17 | /web/layout/respond/ | 17/19/19 | unreachable — 2531px (281%) |
| 12 | 19 | /web/layout/flow/ | 19/21/21 | unreachable — 1314px (146%) |
| 13 | 19 | /web/layout/measure/ | 19/21/21 | unreachable — 1594px (177%) |
| 14 | 19 | /web/nav/drill/ | 19/19/19 | unreachable — 4099px (455%) |
| 15 | 19 | /web/nav/jumps/ | 19/22/22 | unreachable — 2682px (298%) |
| 16 | 19 | /web/nav/tabs/ | 19/22/22 | unreachable — 1693px (188%) |
| 17 | 20 | /framework/ai/2026-08-14/editor-panel-review/ | 33/28/20 | measure — non-deterministic page, rank is a coin flip |
| 18 | 25 | /framework/ai/2026-08-11/ | 25/39/37 | rhythm — 5 × div.md.flow |
| 19 | 31 | /framework/ai/2026-08-09/ | 31/62/64 | rhythm — gaps 6–83px around 8px |
| 20 | 37 | /framework/ext/editor/ | 37/46/48 | measure — 10.1 ch/line over 23 lines, div.panel-body |

Only 6 of v1's worst 20 survive. `unreachable` reordered the site exactly as intended: 13 `/web/` leaves rank 4–16 (v1 scored them 64–82, rank ~149).

## New vs old

| | v2 (honest rules + settle) | v1 |
|---|---|---|
| median | **79** | 66 |
| A/B/C/D/F | 48/284/310/88/**90** | 52/127/181/225/**269** |
| 400 median | 78 | 67 |
| 3440 median | 79 | 68 |

Paired rows (728): median Δ +12. Biggest drops all `/web/` (84→21); biggest rises the pages v1's false positives authored (`core/Page/` 34→81, `ext/layout/` 24→74). Tallies collapsed as designed: cramped 3414→100, measure:high 203→42, zero-size 371→12, alignment 22890→3586.

## Dead-url census — complete (scratchpad: dead-final.json, census.json)

> **Correction (agent D, same day):** 181 is really **143** — 38 "dead" urls are the census normalising a live `.md`/`.png` link down to its directory (the file itself returns 200). The "36 urls from ext/Doc nav" family below is that artifact. The real families, re-ranked by linking pages, are in `audit.md` §dead-links, including the actual `undefined`-href emitter (`ext/tabs/tabs.js:46` when `this.url` is undefined for a Page the Router never adopted).

**1325 link-only urls checked, 181 dead** (`empty` fires; the 404 shell is exactly 14 nodes). Caveat: text-marker detection over-reports — 56 *live* ai pages quote the phrase in their logs; `empty` is the reliable signal. 46 dead urls are linked directly from corpus pages:

- `<module>/doc/` + `doc/{file,property,method}/` — **36 urls** emitted by ext/Doc nav across 18 modules; `/framework/ext/LayoutTool/doc/` alone linked from 27 pages.
- `<module>/overview/docs/<name>/` — **43 urls** (docs/shot ×14, docs/task ×14, docs/chaining ×13) — a doc-nav relative-url bug.
- **`undefined` in the href — 18 urls** (`/framework/ext/tabs/undefinedwhy/` …) — a template emitting `undefined` where a segment belongs.
- `/web/` topic stubs — 12 urls linked from core/Page/* and ext/catalog (`/web/html/`, `/web/css/`, …).
- Singles: `/framework/audit/modules/` (linked from 22 pages), `/framework/ext/AISession/`, `/framework/styles/layouts/cards/`, four `ai/2026-08-12/strategy/*` subpages, `ai/2026-08-14/vision-sonnet/shots/`, `ai/2026-08-15/panel-ui-overhaul/doc/`.

## Sweeps under the new signature — flicker halved, not gone

20/20 completed, 0 hangs (v1: 3 hung). 90 edges over 20 pages (4.5/page) vs 174 over 17 (10.2/page). editor-panel-review: 36 → 6 edges. Edge sole-cause split: **band 49 · rules 29 · cut 10 · scroll 0 · mixed 2**. Recurring unchosen edge: **1032px (9 pages)**, then 432/656/840.

## Remaining rule suspects (reported, not fixed)

1. **The measure band is the new flicker**: 49/90 sweep edges are band-only crossings, 26 of which move the score by 0. `BANDS = [45,85,100,130]` buckets a continuous metric — the same failure sweep.js's own comment rejects for width_used. `scrolls_sideways` changed at 0 of 90 edges — contributes nothing here.
2. **`empty` fires on 17 live pages** — 14 routing demos under `core/new/1/site/`, and 3 corpus pages: `/framework/start/example/`, `/about/`, `/about/team/` (all 62/D purely from `empty`). The sparsest live page is 132 chars; the margin is thinner than the readme's "~13 chars" suggests.
3. **`rhythm` is the biggest remaining prose-shaped suspicion**: 176 findings/73 pages, leading on 59 runs, costs 14 runs their F; 80 findings are heading-spacing on prose flows. But removing it moves the site median by **0** — it no longer authors the ranking.
4. **Sweep numbers for `/framework/ai/` pages are shell numbers** — `sweep()` still rides `frame()`'s fixed 350ms; the settled crawl scores `ai/2026-08-13/panel/` 0 while its sweep reads 65–84. Sweep edges for two-wave pages describe a state no reader sees.
5. `/framework/ai/2026-08-14/editor-panel-review/` is genuinely non-deterministic (43/7/44 at 2.5s floor; 44/39/0 at 4.5s). Rank 17 is a coin flip.

## Failures

One: the 350ms-vs-settled control run stopped at 92/205 pages (its own tool timeout). All else complete. Only the three fenced files + scratchpad touched.
