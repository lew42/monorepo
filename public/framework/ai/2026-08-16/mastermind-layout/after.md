# After the catalog-scroll fix — the site, re-measured

Both `audit/findings.json` (`analyze()`) and `audit/taste.json` (`rate()`) regenerated
2026-08-17T01:47Z from `audit/pages.js` (168 urls, unchanged from today's filesystem-walk
regen). One combined sweep fed both files at once — a single `probe()` per page/width,
passed to `analyze(model)` and `rate(model)` together — so the two files describe
*exactly* the same DOM state, not two independent runs.

**Method**: dev server on :80 (not restarted), `chromium.launch({headless:true})`,
`page.addInitScript(() => window.$BLOCKRELOAD = true)`, `goto(url, {waitUntil:"load"})`
+ a fixed 900ms settle (no `networkidle` — every page holds a live-reload socket that
never idles; matches the last four sweeps on this run). Retry once on failure, then
record and move on. **168 pages × 2 widths (1280, 3440) = 336 measurements, 0 failures,
0 retries needed, 489s.** Script: session scratchpad (`sweep.mjs`, not committed).

`findings.json`: **2,069,578 bytes** (2.0MB, up from 822,797). `taste.json`:
**84,175 bytes** (82.2KB, essentially flat vs 83,817). Tier fingerprint recomputed and
confirmed **unchanged** (`fcbcd7454a25b751` — sha256[0:16] of `probe.js` +
`taste/{read,ranges,taste}.js` + `score.js` + `rules.js`): none of the five tier files
moved since the last taste pass, only site pages did, so the taste baseline is a clean
re-measurement, not a retune.

⚠ **Why `findings.json` grew 2.5× despite fewer rows (336 vs 410):** the previous
committed baseline capped each row's `issues` array at 3–4 entries, undocumented in the
readme and inconsistent with its own numbers — **221 of its 237 sub-80 rows had
`issues.length` that didn't match `counts.total`** (one sample: `counts.total: 42`,
`issues.length: 4`, and the 4 kept weren't even the worst — the top `escape:high`
finding was dropped while three lower-severity `cramped` entries were kept). The readme
documents only the score-gate ("rows worth opening keep their issue list"), not a
per-row cap, so this regeneration follows that literally: **every sub-80 row's `issues`
now matches its own `counts.total` exactly (0 mismatches, verified)**. That's a real
integrity fix, and the honest cost of it is a bigger file — flagging rather than
inventing a second, undocumented truncation policy to keep the old size.

## What did the catalog fix buy?

**Every `unreachable` finding on the site is gone.** Before: 21 instances (11 distinct
urls, both widths mostly) — after: **0, anywhere.**

| page | before → after (1280) | before → after (3440) |
|---|---|---|
| `/web/nav/sidebar/` | 7 → **82** | 72 → 84 |
| `/web/nav/drawer/` | 8 → **83** | 9 → 84 |
| `/web/nav/drill/` | 18 → **88** | 19 → 89 |
| `/web/nav/tabs/` | 21 → **96** | 22 → 97 |
| `/web/nav/jumps/` | 21 → **96** | 22 → 96 |
| `/web/layout/flex/` | 9 → **84** | 9 → 84 |
| `/web/layout/flow/` | 21 → **96** | 21 → 96 |
| `/web/layout/grid/` | 79 → 91 (no `unreachable` at this width) | 21 → **96** |
| `/web/layout/measure/` | 19 → **94** | 21 → 96 |
| `/web/layout/respond/` | 18 → **88** | 19 → 89 |
| `/web/layout/screens/` | 17 → **87** | 19 → 89 |

(The dispatch brief's live spot-check cited 7→77 and 8→82 for sidebar/drawer; this
baseline sweep reads 7→82 and 8→83 — same qualitative jump, small variance expected
between an independent live check and a full committed sweep.)

**Totals, high-severity findings** (apples-to-apples: the 155 urls present in both the
old 205-url corpus and today's 168-url corpus):

- Urls carrying at least one `high` finding: **30 → 12** (18 urls went clean; the 11
  `unreachable` urls above account for most of that, plus a few where the `unreachable`
  fix also removed a chained `escape`/`clipped` finding on the same box).
- Grade distribution across the whole new corpus (336 rows): **A:26 B:174 C:103 D:26
  F:7** vs the old corpus's **A:15 B:158 C:168 D:29 F:40** (410 rows). Median score
  79 → 82.

(The old corpus is 205 urls, today's is 168 — `pages.js` was regenerated *this
morning*, before the catalog fix, dropping 50 stale/sandbox/ai-task urls and picking
up 13 new ones; that's unrelated churn from `taste-audit`, not this fix, and every
comparison above is restricted to matching urls so it isn't conflated.)

## What is the site's worst page now?

**With `unreachable` gone, this is the first time the ranking reflects real layout
quality instead of one bug.** Worst ten by `analyze()` (worst width shown), excluding
`library/bad/*` and `ext/Panel/`:

| score | page (@width) | leading finding | verdict |
|---|---|---|---|
| 42 F | `/framework/ext/LayoutTool/audit/` @3440 | `measure` high — its own intro prose runs 149–184 ch/line | **real** — self-referential (the audit tool's own paragraphs have no `--measure`), but real |
| 49 F | `/framework/ai/` @3440 | `measure` high (258 ch/line log lines) + **new** `gutter` high on `div.pages`, 0px | **real, and see below** — the `gutter` finding is new since the pre-fix baseline |
| 53 F | `/framework/ext/editor/` @3440 | `measure` high (173 ch/line) + `gutter` high on `div.panel-body.panel-d-block`, 0px | **real** — Panel-body scroller with no edge padding; unrelated to catalog (editor isn't a `catalog()` caller) |
| 60 D | `/framework/ext/files/` @3440 | `gutter` high, same `panel-body.panel-d-block` pattern | **real**, same family as above — likely today's `files-panels` work |
| 60 D | `/framework/styles/` @3440 | `cramped` high — text 0px from an 18px frame | **real** |
| 61 D | `/framework/ext/LayoutTool/` @3440 | `measure` med — own readme prose at 102 ch/line | **real**, minor, self-referential |
| 62 D | `/framework/start/example/` @1280 | `empty` high — 19 chars in a 1051×900 region | **false positive** — deliberately minimal Start-guide example site, reachable and linked in prose, not a dead page |
| 62 D | `/framework/start/example/about/` @1280 | `empty` high — 48 chars | **false positive**, same reason |
| 62 D | `/framework/start/example/about/team/` @1280 | `empty` med — 78 chars | **false positive**, same reason |
| 62 D | `/framework/styles/layouts/space/compose/` @3440 | `gutter` high, `panel-body.panel-d-block` again | **real**, same Panel-body family |

Checked against `knowledge/false-positives.md`'s ten-item checklist: the three
`start/example/*` rows match the "deliberately sparse page" shape the checklist already
knows about (same reasoning as `/notes/` at 378 characters — legitimately small, not
broken). The `alignment` near-misses riding alongside several of these rows (9–13px off
a shared lane) are the documented "near-miss window is the site's padding scale" false
positive and aren't counted as separate defects above.

**Five real defects, worst first: `/framework/ext/LayoutTool/audit/`, `/framework/ai/`,
`/framework/ext/editor/`, `/framework/ext/files/`, `/framework/styles/`.**

## Did anything get WORSE?

**Yes — one real regression plausibly tied to the fix, and it's worth a follow-up.**

**`/framework/ai/` dropped 84→49 (3440) and 82→70 (1280)**, and picked up a **new**
`gutter:high` finding — text sitting **0px** from the edge of `div.pages` — that could
not have fired before the fix, because `.page-catalog-pages` had no `overflow-y`
(the `gutter` rule only inspects scroll containers). `/framework/ai/` *is* a direct
`catalog()` caller (`initialize(){ this.catalog(); }`, one rail entry per working day),
so this looks like a real, previously-unmeasured side effect of the new
`align-items: stretch` / `grid-template-rows: 1fr` chain: catalog-scroll's own
verification checked *reachability* (nothing clipped) on this family, not whether the
new scroll boundary sits flush against unpadded content. Not fixed here — out of fence
— but worth a look.

**`/framework/ui/` also dropped** (76→70 @3440, 76→75 @1280) with new `alignment`/
`dead-space`/`heading-offset` findings — same shape, smaller, less certain it's the
fix rather than today's `ui/*` churn.

**Everything else that moved down is unrelated same-day churn, not this fix**, checked
against the catalog `readme.md`'s caller list — none of these call `catalog()`:
`/framework/ext/Panel/` (−40 @3440; fenced off, owned by another session, actively
worked today), `/framework/dev/` and `/framework/dev/DevBar/` (three DevBar tasks
landed today), `/framework/ext/files/` and the `panel-body.panel-d-block` family above
(today's `files-panels`/panel work, not catalog), `/framework/styles/layouts/` and
`/framework/styles/layouts/space/` (this module **left `catalog()` for `ext/Panel`
today**, per its own readme — its regression is Panel's, not catalog's),
`/framework/ext/LayoutTool/audit/` (self-measuring the measurer — its own table/detail
view got heavier, unrelated to catalog), `/framework/ext/` (new children discovered by
today's walk). The 18 named catalog-family pages themselves (`web/nav/*`,
`web/layout/*`) show only trivial ±1–2 point noise on their own index pages, dwarfed by
the +70 to +75 point gains on their children. The other ~14 `catalog()` callers
(`styles/sections/`, `styles/layouts/400/`, `styles/elements/forms/`, `core/Page/nav/`,
and all eight `Doc` pages including `core/App`, `core/Page`, `ext/Doc`, `ext/catalog`
itself) are **unchanged** — confirming the pre-landing regression fix (scoping the new
CSS to `.pages > .page:has(> .page-catalog) > …`) held.

## The two-axis picture

`analyze()` and `taste()` disagree most (excluding `mostly_picture` rows) on pages that
are clean-but-thin rather than broken-but-lively — the same shape the taste tier was
built to catch:

| page (@width) | analyze | taste | gap |
|---|---|---|---|
| `/notes/team-note/` @3440 | 89 (B) | 52 (F) | −37 |
| `/web/layout/` @1280 | 96 (A) | 60 (D) | −36 |
| `/framework/ext/Doc/overview/urls/` @1280 | 91 (A) | 58 (F) | −33 |
| `/framework/styles/rules/` @1280 | 91 (A) | 58 (F) | −33 |
| `/notes/` @3440 | 90 (A) | 57 (F) | −33 |
| `/web/layout/grid/` @3440 | 96 (A) | 63 (D) | −33 |

Nothing broke by `analyze()`'s reading — these are all A/B pages — but `taste` marks
them thin on measure, pad-share and contrast: short lists and index pages with little
prose to grade. Same story as the readme's own "clean but dull" characterization from
the prior pass; the catalog fix didn't move this axis, it only cleared the largest
`analyze()`-side bug that was crowding it out.
