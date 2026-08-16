# Generator fitness hunt — 8 sweeps × 120 seeds × 3 widths (390/1280/3440)

Ran headlessly via Playwright (`chromium`, foreground, no throttling) against the
dev server on port 80, driving `space/search.js`'s `sweep()`/`credit()` directly
in-page. Raw data: `hunt.json` (0.34MB). Method note: another session's saves
under `ext/Panel/` were broadcasting live-reload to every open socket, which
destroyed the page's execution context mid-evaluate; fixed by setting
`window.$BLOCKRELOAD = true` before each sweep (`Socket.js`'s documented escape
hatch) plus a 3-try retry. All 8 sweeps completed clean, no retries needed.

## 1. Does chaos hurt?

`worst`, depth 2, 120 seeds each:

| chaos | mean | median |
|---|---|---|
| 0 | 60.5 | 61.5 |
| 0.25 | 59.0 | 59 |
| 0.5 | 56.2 | 56 |
| 1.0 | 51.0 | 50 |

**Yes, monotonically** — mean and median both fall as chaos rises, and the
damage *accelerates*: −1.5 pts from 0→0.25, another −2.9 from 0.25→0.5, another
−5.2 from 0.5→1.0. Full uniform noise (chaos 1.0) costs ~9.5 points of worst-
score off the model's own draws (60.5→51.0, a 16% relative drop). The model is
doing real work — straying from it is not free.

## 2. What is the best depth?

`worst`, chaos 0 (depth 4 only exists at chaos 0.25 in this grid — flagged):

| depth | mean | median |
|---|---|---|
| 0 | 58.6 | **63** |
| 1 | 58.1 | 60 |
| 2 | **60.5** | 61.5 |
| 3 | 60.2 | 61 |
| 4 (chaos 0.25) | 59.4 | 60 |

Best mean is depth 2, but 2 and 3 are a near-tie (60.5 vs 60.2, inside noise).
Depth 0 has the *lowest* mean but the *highest* median — a flat, single-leaf
layout is either fine or fails hard on one range, which mean hides and median
doesn't. Depth 1–4 form a shallow plateau (58.1–60.5, a 2.4-pt spread) — the
`DEPTHS` weighting is not leaving obvious points on the table.

## 3. Which shapes win?

`credit()` on `shape`, pooled over the four chaos-0 sweeps (depth 0/1/2/3, n=480):

| shape | n | mean | lift |
|---|---|---|---|
| mail | 28 | 65.7 | **1.11** |
| split | 64 | 63.8 | 1.08 |
| bands | 56 | 62.2 | 1.05 |
| shell | 32 | 61.5 | 1.04 |
| column | 84 | 60.2 | 1.01 |
| docs | 60 | 59.2 | 1.00 |
| rail | 88 | 57.4 | 0.97 |
| deck | 40 | 50.8 | 0.86 |
| gallery | 28 | 50.4 | **0.85** |

Top three: **mail, split, bands**. Bottom three: **gallery, deck, rail**. Every
row has n≥28 — well clear of the n<8 believability floor, so all nine readings
are trustworthy, including the smallest cells (mail, gallery, both n=28).

## 4. Screen or page?

`credit()` on `fit`, same pool (n=480):

| fit | n | mean | lift |
|---|---|---|---|
| screen | 296 | 59.4 | 1.001 |
| page | 184 | 59.2 | 0.998 |

**Essentially no difference** — lift is within 0.3% either way, n is large on
both sides so this is a real null result, not underpowered noise. `fit` is not
a lever on fitness at all.

## 5. Which ranges separate good from bad?

Mean credit, top-10 vs bottom-10 by `worst`, measured at 1280, pooled over the
four chaos-0 sweeps (40 rows/side unless N is noted — a range with no reading
on a row, e.g. no prose, is dropped rather than scored zero):

| range | top mean | bottom mean | gap |
|---|---|---|---|
| **frame-gap** | 1.00 | 0.19 | **0.81** |
| **pad-share** | 0.99 | 0.42 | **0.58** |
| width-used | 0.85 | 0.59 | 0.26 |
| contrast | 0.47 | 0.24 | 0.23 |
| lanes | 1.00 | 0.89 | 0.11 |
| measure (n=37/8) | 0.91 | 0.86 | 0.05 |
| slivers (n=40/8) | 1.00 | 1.00 | 0.00 |
| depth | 1.00 | 1.00 | 0.00 |
| repetition | 0.02 | 0.05 | −0.03 |
| scale | 0.82 | 0.85 | −0.03 |
| gap-share | 0.92 | 0.97 | −0.04 |

**Two ranges do almost all the discriminating**: `frame-gap` and `pad-share` —
padding, at two different scales, is what separates the top 10 from the bottom
10 in this generator. `width-used` and `contrast` add a real but smaller signal.
**Five ranges are carrying no information about this generator**: `lanes` is
nearly saturated (0.11 gap on an already-high floor), and `slivers`, `depth`,
`repetition`, `scale`, `gap-share` show ~0 or *negative* gap — the bottom 10
score the same as or slightly better than the top 10 on these. The generator
never drifts into the zones those ranges exist to catch (it doesn't nest deep
enough to sliver, doesn't over-repeat, keeps a tidy gap scale) — a real finding
about the model, not a broken range: those five are pre-satisfied by the model
as written and aren't currently earning their weight in this search.

## 6. What is the ceiling?

Best **worst** anywhere in the grid: **81**, tied by two rows:
- seed 99, `depth:2 chaos:0.25`, fit `screen`, shape `column`, masthead `hero` — mean 85.
- seed 118, `depth:4 chaos:0.25`, fit `screen`, shape `bands`, foot `footer` — mean **86**, also the best **mean** anywhere in the grid.

Neither chaos-0 sweep reached 81 (best chaos-0 worst was 80, depth 1). The
single best specimen in the whole grid came from a chaos-perturbed sweep even
though chaos hurts the *average* (§1) — chaos widens the tail in both
directions, so an occasional roll beats anything the strict model drew, while
the bulk of chaos-drawn rolls score worse.

Seed 118's spec (`depth:4 chaos:0.25`, the overall best):
```
full fill flex v --pad:0.94em --gap:0.23em
  flex v gap flex-1 scroll
    flex v gap pad --pad:1.37em tone --tone:var(--ink)
      flex v gap tone
        flex wrap gap tone
          fluid pad tone > cards 5
          fluid pad tone > cards 11
        flex v gap tone
          flow measure start --measure:31.72em pad tone > notes 14
          flow measure start --measure:36.54em pad tone > sections 2
          pad tone > hero 1
      flex v gap tone
        flow measure start --measure:30.63em pad tone > cards 2
        flow measure start --measure:25.3em pad tone > sections 2
    pad --pad:3.86em tone --tone:var(--ink) > cards 8
  tone --tone:var(--ink) > footer
```

## What I would change in `model.js`

- **§3** — raise `SHAPES.mail`'s weight (currently 2, tied for lowest) and
  `SHAPES.split`'s (currently 4): they're the top two performers by a clear
  margin (lift 1.11, 1.08, n=28/64) and are under-weighted relative to how
  often they should win. Lower `deck` (w:3) and `gallery` (w:4): both sit at
  lift 0.85, the two worst shapes, despite mid-table weights.
- **§1** — chaos costs 16% of mean worst-score at full uniform (1.0) and the
  cost compounds rather than being linear-feeling; if chaos is exposed as a
  user-facing slider, the default should stay near 0, and the UI should signal
  that pushing right is a real, accelerating quality trade, not just "more
  variety."
- **§5** — `AUTHOR.pad` and `AUTHOR.bandpad` (feeding `frame-gap`/`pad-share`)
  are carrying almost the entire discriminating signal in this rulebook (gaps
  0.81 and 0.58) — they're the two bands most worth tightening further if the
  generator needs to get pickier, since everything else it's already drawing
  well inside forgiving territory.
- **§5** — `DEPTHS`, `COUNTS`/repeat, and the gap bands behind `scale` and
  `gap-share` show ~0 or negative separation between the top and bottom 10:
  the model already keeps every roll inside the safe zone for depth, slivers,
  repetition and gap-scale, so tuning those further buys nothing measurable at
  current settings — the rulebook's weight on them (`slivers` 6, `depth` 3)
  could move toward `frame-gap`/`pad-share` without losing anything today.
- **§2/§4** — `DEPTHS` (depth 1–4, spread 2.4 pts) and the `fit` pick
  (`screen`/`page`, lift 0.998/1.001) are both already close to flat on
  fitness — no evidence either dial needs retuning; effort is better spent on
  §3's shape weights and §5's padding bands.

---

# Re-run against the corrected ranges — 2026-08-16, same day

Three bugs in `taste/read.js`/`taste/ranges.js` were fixed after the first run
(not by me): `width-used` now spans content leaves, not text leaves, and lost
its upper penalty (`ideal` was `[0.72, 0.96]`, now `[0.7, 1]`); `frame-gap` and
`pad-share` now only count framed boxes that hold text, excluding decorative
`.wash` swatches. Re-ran 5 sweeps, same harness, same 120 seeds, same 3 widths,
`$BLOCKRELOAD` still set. All 5 completed clean, no retries. Raw: `hunt2.json`
(0.21MB). The original run is left intact above — it's the before-picture.

### Chaos, redone

`worst`, depth 2, 120 seeds each (chaos 0.5 wasn't in this smaller re-run):

| chaos | mean (run 1 → run 2) | median (run 1 → run 2) |
|---|---|---|
| 0 | 60.5 → **65.5** | 61.5 → **67** |
| 0.25 | 59.0 → **63.6** | 59 → **65** |
| 1.0 | 51.0 → **59.4** | 50 → **59.5** |

**The monotonic fall survives** — chaos still costs score, still in the same
order — but it's a smaller bite now: chaos-0→1.0 was −9.5 mean pts (−16%) in
run 1, it's −6.1 mean pts (−9.3%) in run 2. Every row's absolute score rose
(the fixes were pure corrections, not new penalties), and about a third of the
apparent chaos penalty in run 1 was the width-used/frame-gap bugs exaggerating
how much a wilder draw got punished. The remaining ~6-point, ~9% effect is real.

### Shapes, redone

`credit()` on `shape`, pooled over depth 1/2/3 chaos-0 (n=360; run 1's pool was
depth 0/1/2/3, n=480, so not a perfectly matched population, but the same
metric):

| shape | run 1 mean (lift) | run 2 mean (lift) |
|---|---|---|
| shell | 61.5 (1.04) | **74.1 (1.14)** ← now #1 |
| bands | 62.2 (1.05) | 67.7 (1.04) |
| split | 63.8 (1.08) | 66.6 (1.02) |
| mail | **65.7 (1.11)** ← was #1 | 66.6 (1.02) |
| docs | 59.2 (1.00) | 65.4 (1.00) |
| rail | 57.4 (0.97) | 64.7 (0.99) |
| column | 60.2 (1.01) | 63.0 (0.97) |
| gallery | 50.4 (0.85) | 60.6 (0.93) |
| deck | 50.8 (0.86) | 58.8 (0.90) |

**Yes, gallery and deck recovered** — gallery's mean rose 50.4→60.6 (+10.2 pts,
lift 0.850→0.931), deck's rose 50.8→58.8 (+8.1 pts, lift 0.855→0.904). Their
shortfall below the pool average shrank from 15.0%→6.9% (gallery) and
14.5%→9.6% (deck). **The original penalty was real but overstated** — roughly
half of gallery's gap and a third of deck's was the width-used-on-text-only bug
(both are the two most text-poor shapes in the model, so they were
structurally punished by it), and the rest is a genuine, smaller gap that
survives the fix: gallery and deck are still the bottom two shapes.

The bigger surprise is the reshuffle above them: `shell` jumped from mid-table
(#4, lift 1.04) to the clear winner (#1, lift 1.14), and `mail` — run 1's best
shape — fell to a four-way tie for #3 (lift 1.02). §3's original "raise mail's
weight" recommendation does not survive this fix; see below.

### §5 redone — which ranges separate now

Top-10-vs-bottom-10 credit gap at 1280, pooled over the three chaos-0 sweeps
(30/side):

| range | run 1 gap | run 2 gap | verdict |
|---|---|---|---|
| frame-gap | 0.81 | **0.52** | still the top discriminator, roughly halved |
| pad-share | 0.58 | **0.28** | still #2, roughly halved |
| measure | 0.05 | **0.16** | **woke up** — was noise-level, now real |
| contrast | 0.23 | 0.15 | still informative, weaker |
| gap-share | −0.04 | 0.03 | flipped sign, still ~0 — no practical change |
| lanes | 0.11 | **0.02** | **went quiet** — was moderate, now near-zero |
| slivers | 0.00 | 0.00 | still no information |
| depth | 0.00 | 0.00 | still no information |
| **width-used** | 0.26 | **0.00** | **went quiet** — collapsed to total saturation |
| repetition | −0.03 | 0.00 | still no information |
| scale | −0.03 | −0.07 | still no information |

Two ranges **woke up or went quiet**, and the second is the headline: `measure`
went from a 0.05 noise-level gap to a real 0.16 (and its N recovered from a
thin 37/8 split to a healthy 23/22 — the earlier reading was on too few rows to
trust). But `width-used` — fixed specifically to stop over-penalizing — swung
the other way and **collapsed from run 1's third-best discriminator (0.26) to
exactly 0.00**: every one of the top-10 and bottom-10 rows now scores full
credit on it. The fix didn't just correct a bias, it removed width-used as a
signal for this generator entirely — this population of layouts now clears
70% width-use so reliably that the range can no longer tell a good roll from a
bad one. `lanes` quietly dropped too (0.11→0.02), for reasons the fixes don't
directly explain — likely a side effect of which rows now rank in the top/bottom
10 having changed. Net: the informative set is now **frame-gap, pad-share,
measure, contrast** (four, not §5's original six) — `lanes` is barely alive and
`width-used` no longer belongs in the "separates good from bad" list at all.

### The new ceiling

Best **worst** in the re-run: **87** (seed 85, `depth:2 chaos:0`, fit `screen`,
shape `rail`, masthead `topbar`) — mean 88, and the same row is also the best
**mean**. **The ceiling moved up substantially: 81 → 87.** More telling than
the new max is what happened to the *same* seed: run 1 scored this exact
layout `worst:63, mean:73` (marks `[87, 70, 63]` — 3440 was the failure); run 2
scores it `worst:87, mean:88` (marks `[87, 88, 88]`) — a **24-point swing at
3440 alone**, purely from the measurement fix, no change to the generator.
That one row is the cleanest evidence in this whole exercise that the bugs
were real and were hiding good layouts, not just inflating bad ones. (Caveat:
this re-run's grid is narrower — 3 depths × 3 chaos levels vs run 1's 5×4 — so
81 vs 87 isn't a fully matched comparison, but the seed-85 before/after is.)

### What changed and why

- **The fixes were corrections, not new penalties** — every pooled mean rose
  (pool-average worst ~59.3→~65.1), confirming direction: the old ranges were
  net-punitive on real layouts, not net-lenient.
- **§3's shape recommendation flips**: run 1 said raise `mail`, lower
  `gallery`/`deck`. Run 2 says raise `shell` instead (now #1 at lift 1.14,
  clear of everything else) — `mail` is merely fine (lift 1.02, tied for 3rd),
  and while `gallery`/`deck` are still the bottom two, their gap to the mean is
  roughly half what it looked like in run 1, so any weight correction there
  should be about half as aggressive as §3 originally proposed.
- **Something got worse, honestly**: `width-used` and `lanes` were both real,
  moderate discriminators in run 1 (gaps 0.26 and 0.11) and are now dead
  weight (0.00 and 0.02) — not because they're broken, but because the
  width-used fix made this generator satisfy that range almost unconditionally.
  §5's "carrying no information" list should read differently post-fix:
  `width-used` joined it, and `frame-gap`/`pad-share`/`measure`/`contrast` are
  now the only four ranges actually earning their weight in a search over this
  model.

---

# Run three — after the padding fix and the weight fit — 2026-08-16, same day

Four changes since run two, all already landed: `gen.js` makes every leaf
reclaim `--pad` so a band's inset stops cascading onto its cards; `ranges.js`
redefines `pad-share` against `min(3.5%, 3.5em)` (raises `frame-gap`'s ceiling
to clear 3.5 to match) instead of a raw width share; `scale` now counts the
gap *vocabulary* (values covering 80% of gaps) instead of every distinct
value; and `model.js`/`draw.js` carry run 2's cubed-lift shape weights, with
`DEPTHS` extended to 0–10 so chaos can reach the dial's whole range. Same
harness, same 120 seeds, `$BLOCKRELOAD` set. All 4 sweeps completed clean.
Raw: `hunt3.json` (0.17MB).

### 1. The chaos sign, settled

`worst`, depth 2, n=120 each:

| chaos | mean | median |
|---|---|---|
| 0 | **73.8** | **75** |
| 0.25 | 72.6 | 74 |
| 1.0 | **65.9** | **67.5** |

**Chaos still hurts, and the sign is settled at n=120** — the hand-check's
12-seed median (67→63) had the right sign but the wrong shape; at full sample
the fall is smoother and slightly smaller in relative terms than run 2's own
number (−7.9 mean pts / −10.7% here, vs run 2's −6.1 pts / −9.3%, both well
clear of noise at this n). The one-time flip the coordinator caught — chaos
measuring as an *improvement* when depth was drawn uniformly over `0..max` —
does not reappear now that `level()` draws from the (widened) `DEPTHS` table
instead. Settled: **chaos costs roughly 8 points of mean worst-score, monotonically, at n=120.**

### 2. Did the padding fix land?

`worst`, depth 2 chaos 0, n=120, against run 2's own number:

| | mean | median |
|---|---|---|
| run 2 | 65.5 | 67 |
| run 3 | **73.8** | **75** |
| Δ | **+8.3** | **+8** |

**Yes — landed almost exactly on the hand-check's estimate** (~10 pts on 14
seeds; +8.3 at n=120, same direction, same order of magnitude).

Top-10-vs-bottom-10 credit gap, pooled over the two chaos-0 sweeps (depth 2 +
3, 20/side):

| range | run 2 gap | run 3 gap | verdict |
|---|---|---|---|
| pad-share | 0.28 | **0.22** | **stayed informative** — softened, not saturated |
| frame-gap | 0.52 | **0.01** | **saturated** — same fate as `width-used` in run 2 |

The redefinition kept exactly one of the two alive. `pad-share` against
`min(3.5%, 3.5em)` still separates good from bad (gap 0.22, both sides full
N) — it resolved the band-vs-card conflict without going flat. `frame-gap`
did **not** survive: raising its ceiling to clear 3.5 pushed the range so wide
that both the top 10 and bottom 10 now score ~1.0 (0.99 average on the
bottom), the same saturation pattern `width-used` hit in run 2. The whole
"informative set" moved again — `contrast` is now the single strongest
discriminator (gap 0.44, up from 0.15 in run 2), and two ranges that were
dead in run 2 stirred: `gap-share` (0.03→0.12) and `width-used` (0.00→0.09).
Current informative set, ranked: **contrast, pad-share, gap-share, lanes,
width-used** — `frame-gap` has now joined `slivers`/`depth`/`measure`/`repetition`/`scale`
in the "not discriminating this population" column.

### 3. The shape table, one more time

`credit()` on `shape`, pooled over depth 2+3 chaos-0 (n=240 — smaller pool
than runs 1–2 since this grid only re-ran two chaos-0 depths). **Seed→shape is
not comparable to run 2** (the weight fit re-addresses the space); only the
per-shape means are:

| shape | n | mean | lift |
|---|---|---|---|
| shell | **6** ⚠ | 82.5 | 1.12 |
| bands | 42 | 76.3 | 1.04 |
| gallery | 24 | 73.6 | 1.00 |
| column | 28 | 73.2 | 1.00 |
| docs | 36 | 73.1 | 0.99 |
| mail | 16 | 72.4 | 0.98 |
| split | 32 | 72.2 | 0.98 |
| rail | 44 | 72.1 | 0.98 |
| deck | 12 | 71.9 | 0.98 |

Every shape's mean rose from run 2 (expected — the padding fix lifted the
whole population), and the table is far flatter than either previous run:
lift now spans only 0.98–1.12, versus run 2's 0.90–1.14. `shell` still leads
nominally, but **its n fell to 6 — below the n<8 floor** — so its #1 spot
here is a hint, not a result (the fit's `screen`-vs-`page` direction-doubling
in `gen.js`'s `weights()` interacts with its already-modest base weight of 3
to thin its sample in this two-sweep pool; a wider re-run would settle it).
Everything from `gallery` down to `deck` is within 2 points of the pool mean —
the shape choice has stopped mattering much at all post-fix, which is itself
the finding: the weight fit closed most of the gap it was correcting for.

### 4. The new ceiling

Best **worst**: **86** — seed 18, `depth:2 chaos:0`, fit `screen`, shape
`shell`, masthead `topbar`, foot `footer` — and unlike every previous run's
ceiling, this one is **flat across all three widths** (marks `[86, 86, 86]`,
so `worst = mean = 86`) rather than one width dragging the others down.

```
full fill flex v --pad:1.16em --gap:1.13em
  tone --tone:var(--prim) > topbar
  flex wrap gap flex-1 scroll
    basis --basis:14.54em scroll pad --pad:2.62em tone --tone:var(--ink) > menu 5
    flex v gap fluid tone --tone:var(--subtle)
      > topbar
      flex wrap gap tone
        basis --basis:23.23em scroll pad --pad:1.34em tone > rows 12
        flow measure start --measure:32.65em fluid scroll pad --pad:0.97em tone > sections 4
        flow measure start --measure:32.78em fluid scroll pad --pad:1.3em tone > notes 4
    basis --basis:14.59em stick scroll pad --pad:2.51em tone --tone:var(--prim) > toc 6
  tone --tone:var(--subtle) > footer
```

Worth flagging even though not asked: the single best **mean** in this grid
(90) came from a `chaos:1.0` draw (seed 50, `depth:2`, shape `column`,
`worst:82`) — the same tail-widening effect noted in run 1: chaos still costs
the average, but the widest outlier it can produce still beats anything the
strict model drew in this particular 120-seed sample.

### What improved, what got worse, what's next

- **Improved**: the padding fix is the whole story of this run — every
  chaos-0 mean rose ~8 points (65.5→73.8), the shape table flattened
  (0.90–1.14 lift → 0.98–1.12), and the ceiling is now flat across widths
  (86/86/86) instead of one width dragging a strong layout down.
- **Got worse**: `frame-gap` saturated (gap 0.52→0.01) the moment its ceiling
  was raised to accommodate `pad-share`'s new formula — the third range in two
  runs to go from informative to dead the moment its own bug got fixed
  (`width-used` in run 2, `frame-gap` now). And `shell`'s run-2-winning weight
  bump combined with the new direction-doubling in `gen.js` thinned its
  sample to n=6 in this pool — its #1 ranking here isn't trustworthy yet.
- **Next**: re-run the shape table alone at a bigger `count` (or pool more
  chaos-0 depths) before touching `SHAPES` weights again — `shell` needs n≥8
  to say anything, and the table is now flat enough (all lifts within 0.98–1.12)
  that another retune risks chasing noise rather than signal.
