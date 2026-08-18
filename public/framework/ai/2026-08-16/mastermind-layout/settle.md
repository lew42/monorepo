# How much of the audit is a fact about the delay?

**Not much, and not where feared.** Of the 17 `high`-carrying rows in the current
336-row baseline, **17 of 17 survive at 3000ms** — none vanish, none downgrade.
The one page that *is* settle-sensitive gets **worse** with more time, not
better: it gains a `high` finding the published 350ms baseline never saw. The
genuinely non-deterministic page in this sample (`ai/2026-08-14/editor-panel-review/`)
isn't in the 336-row corpus at all — `ai/` task dirs are excluded from
`pages.js` — so it can't be costing the audit any rows today, though it does
prove a fixed delay, however long, cannot be trusted for that page shape.

Method: 21 unique pages (the 11 carrying a `high` finding, the readme's own
two worst-case `ai/` examples, 10 clean controls spanning 21–2264 nodes), each
at 350/1000/3000ms, **3 runs per delay**, at 1280 (11 of them also re-run at
3440, since 5 of the 17 rows only exist at that width). 318 navigations total,
**0 stalls, 0 errors** — import hoisted into its own `page.evaluate()`, fresh
context every 40 navigations, per `LayoutTool/readme.md`'s recipe.

## The 17 rows

| Page | Width | Rule | 350ms | 3000ms | Verdict |
|---|---|---|---|---|---|
| `start/example/` | 1280 & 3440 | empty:high | 62/64 D, high=1 | identical | **survives** |
| `start/example/about/` | 1280 & 3440 | empty:high | 62/64 D, high=1 | identical | **survives** |
| `styles/` | 1280 & 3440 | cramped:high | 67/60 D, high=1 | identical | **survives** |
| `styles/layers/theme/guide/` | 1280 & 3440 | cramped:high | 68/63 D, high=1 | identical | **survives** |
| `styles/layouts/` | 1280 & 3440 | gutter:high | 71/70 C, high=1 | identical | **survives** |
| `notes/auth/` | 1280 & 3440 | cramped:high | 70/64 C/D, high=1 | identical | **survives** |
| `ai/` | 3440 | measure:high ×2 | 61/D, high=2 | identical | **survives** |
| `ext/LayoutTool/audit/taste/` | 3440 | measure:high | 73/C, high=1 | identical | **survives** |
| `styles/layouts/fit/` | 3440 | measure:high | 69/D, high=1 | identical | **survives** |
| `styles/layouts/space/compose/` | 3440 | gutter:high | 63/D, high=1 | identical | **survives** |
| `ext/LayoutTool/audit/` | 1280 | measure:high ×0/med-only | 65/D, **high=0** | 46/F, **high=1** (+`cramped`) | **gains a high** |
| `ext/LayoutTool/audit/` | 3440 | measure:high ×5 | 59/F, high=5 | 42/F, **high=6** (+`cramped`) | **worse, not better** |

Three runs at every delay, identical every time, except the two `audit/` rows
(3/3 identical *within* each delay, but different *between* 350ms and
1000ms+) and `editor-panel-review/` (not settle-sensitive — genuinely
non-deterministic, see below).

**Every finding named in the current baseline is real.** The only thing wrong
is that `frame()`'s 350ms default **under-reports** `ext/LayoutTool/audit/` —
the tool's own dashboard, ironically — by one `cramped:high`, because that
page's ranked table keeps mutating the DOM until ~1000ms (2865 → 2972 nodes),
then holds flat straight through to 3000ms. No other page in this sample
moved a single node count between 350ms and 3000ms.

## Which rules are settle-sensitive

- **Stable at every delay, on every page tested (19 of 21):** `empty`,
  `gutter`, `measure` (as a *count*), `hit-size`, `alignment`,
  `heading-offset`, `hierarchy`, `pad-scale`, `line-height`, `rhythm` — and
  `cramped` itself, on the 6 pages where it's a genuine static-layout defect
  (padding that never depends on async content). All 10 control pages: byte-
  for-byte identical score, grade, counts and rule set across all 9
  measurements, no exceptions.
- **Settle-sensitive, but reproducibly (needs a settle contract):**
  `cramped` — but only on `ext/LayoutTool/audit/`, where it's not the
  padding that's wrong, it's that the page isn't done rendering at 350ms.
  Reproducible: 3/3 runs at 350ms say no, 3/3 runs at 1000ms and 3000ms say
  yes, at both widths.
- **Genuinely non-deterministic, not settle-sensitive (no delay fixes it):**
  on `editor-panel-review/` — `escape` (sev flickers low↔high), `measure`,
  `clipped`, `illegible` (sev flickers low↔med), `whitespace`, occasionally
  `hit-size`'s severity — flicker **run to run at the same delay**, not
  delay to delay. `alignment`, `cramped`, `heading-offset`, `hierarchy`,
  `line-height`, `pad-scale`, `rhythm` fire in all 9 runs regardless.

## Does node count keep climbing at 3000ms?

**On the one page that's actually settle-sensitive, no** — `ext/LayoutTool/audit/`
grows once (2865→2972 nodes, ~1000ms) and is flat through 3000ms at both
widths. A longer *fixed* delay would in fact fix this one.

**On `editor-panel-review/`, it isn't climbing — it's jittering.** Nodes at
350ms: 3610–3754. At 1000ms: 3645–3702. At 3000ms: 3619–3691. Same band at
every delay, no trend, and the score swings 0→41 within that band. This is
the stronger finding: **no fixed delay, however long, would make this page
deterministic** — it needs an actual quiet-signal, not a bigger number. (The
readme's *other* named worst case, `ai/2026-08-13/sessions/`, is now fully
stable — 3287 nodes, score 59, identical across all 9 runs. That example has
gone stale; whatever made it non-deterministic no longer does.)

**Not counted, and not this study's to resolve:** `styles/elements/lists/`,
the page named in the dispatch brief (92/A → 87/B → 800ms-remeasured B84).
Its `page.js` is mid-edit under an uncommitted diff right now (`git status`
confirms), almost certainly the other session this task's fence points at.
I measured a fourth, different reading — 92/A, no `whitespace` finding, at
**all four** delays including 350ms — which means none of the three prior
readings reproduce against the current file. This is a live-editing confound,
not a settle data point, and I'm not folding it into the tally above.

## What the fix buys, and what it costs

**Verified: 2 of 336 rows are wrong today** (`ext/LayoutTool/audit/`, both
widths) — and wrong by *under-reporting*, a false negative, not the feared
false positive. Zero of the other 19 tested page-widths moved. This sample
was deliberately adversarial (every `high` row plus the readme's own worst
cases) and still only 1 of 21 pages changed — I won't stretch that into a
percentage of 336; the sample was chosen to find trouble, not to be
representative, and extrapolating a rate from it would overstate confidence
in either direction.

**Cost, measured directly** (avg navigation time × 336, this corpus, this
delay): a full sweep is **~153s at 350ms** (matches `hang.md`'s 145s),
**~371s at 1000ms** (+218s), **~1043s at 3000ms** (+890s, +14.8 min). A
blanket longer fixed delay is expensive precisely because *every* row pays
it, for a fix that only 1 row needed. A real wait-for-quiet would cost close
to nothing on the 19 pages that never mutate after paint, and only pay the
real price on pages like `ext/LayoutTool/audit/` and `editor-panel-review/`
that actually need it — cheaper *and* more correct than any fixed number.

## Recommendation

**The settle problem is real but narrow — not a fact about most of the
audit, a fact about a handful of self-updating pages** — so the row-count
evidence doesn't justify rewriting `frame()` for every caller (that's the
RULE#1 call, left to Mike); a targeted, cheap fix — a longer `settle` passed
just for `ext/LayoutTool/audit/`'s own baseline row, since it's currently
under-reporting itself by a `high` — is justified on its own and doesn't
touch the shared default.
