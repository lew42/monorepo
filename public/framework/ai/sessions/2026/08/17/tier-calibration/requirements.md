# Fix the four calibration bugs the vision baseline found

Mike, 2026-08-17: *"we need the feedback from the layout tool to be accurate."*

`ai/2026-08-17/vision-baseline/` scored 18 frozen screenshots against an anchored
rubric and used them to convict both numerical tiers. **Read that task's
`task.jsonl` and `baseline.json` first** — every claim below has its evidence
there, including the raw prose naming what in each image drove each score.

The module is now `ext/DesignTool` and **you own all of it**. No other agent is
inside it.

## ⚠ The rule that governs this whole task

**Fix mechanisms, not thresholds. Do not tune anything to make the 18 baseline
images agree better.**

n=18. Tuning bands until they match those 18 scores is overfitting to a sample
that cannot support it, and it would destroy the one instrument we have for
judging instruments. Every change you make must be defensible as *"this
measurement was computing the wrong thing"* — never as *"this number now matches."*

Report agreement-with-baseline **before and after as a check**, and expect it to
improve. If it doesn't, that's information: say so and leave the mechanism fix in
place if the mechanism argument is sound.

## Bug 1 — `width-used` is broken in both implementations (highest value)

This is the prime objective as a number, and neither tier can measure it.

- **Taste reads 6–10% on seventeen of eighteen pages**, against an `ok` floor of
  0.28. So every page scores a hard zero and **taste silently forfeits 13% of its
  total weight, uniformly** — a dead band contributing nothing but noise.
- **Math reads 208% and 149%** on the two pages holding CSS-transform-scaled
  previews.

Work out what each is actually measuring versus what "how much of the available
width does the content use" should mean. ⚠ A `zoom`/`transform`-scaled subtree is
almost certainly implicated in the >100% readings — a scaled element's
`getBoundingClientRect` and its layout box disagree.

⚠ **A band that reads a hard zero on 17 of 18 pages is not a strict band, it is a
broken one.** The same reasoning applies anywhere else you find a band whose
values cluster entirely outside its own range — check all eleven for this pattern
and report any others.

## Bug 2 — `heading-offset` has a false positive and a false negative

It fired **twice on `/framework/`, whose alignment is fine**, and **zero times on
`/web/layout/flow/`, where the h1 sits 214px left of the content it heads.**

`/web/layout/flow/` scores 96 (grade A) from math and is the **worst page in the
corpus at 44** — a 52-point miss. Its other defects: a 280px band empty
full-height, and two blocks of ~8px demo text unframed on the page ground at two
different offsets. Whether existing rules should catch those too is worth your
judgement; the heading rule is the one that's provably wrong in both directions.

## Bug 3 — chrome contaminates content measurements

`/framework/` is the **best page in the corpus (80)** and taste scores it **49, its
worst**. Four of five zeroed bands are app-shell artifacts:

- `measure` reads **26 characters** because 14 nav labels drag the prose's real
  ~100 under the floor.
- `contrast` reads **8.38** because the *median* font size includes 10px chrome.

**The fix is to measure prose bands over prose**, and type contrast over content
rather than over every text node on the page. This is the highest-leverage
mechanism fix after bug 1, because it affects every page with navigation — which
is every page.

## Bug 4 — kill the aggregate score in the rules tier, keep the rules

The math tier's overall number is **anti-correlated with how pages look**: Pearson
−0.393, and against DOM node count Spearman −0.519 — **it rewards emptiness.** It
also never emits below 70, so it structurally cannot call a page bad.

**Decision, already made: remove the aggregate score and the grade derived from
it. Keep every rule.** Those same rules caught the catalog scroll boundary that
was hiding content on 18 pages and drove unreachable-content from 21 findings to
0. A rule that finds real defects is not at fault for a broken average built on
top of it.

So `findings.json` keeps its per-rule findings and its counts, and loses `score`
and `grade`. Update whatever displays them — including the audit pages, which are
yours. ⚠ Anything that *sorts* or *ranks* by that score needs a new basis; ranking
by high/med/low counts is the obvious candidate, but say what you chose.

## Then regenerate the baselines — exactly once

`audit/taste.json` and `audit/findings.json` are stale: `generated_at` is
2026-08-17T05:52Z, which predates both the rename and the complete rebuild of
`styles/layouts/`. Their urls were updated but their measurements were not.

⚠ **Freeze the tier first, then regenerate once.** An earlier run in this repo
burned roughly 1M tokens regenerating baselines six times because the tier kept
moving underneath them. Finish every mechanism fix, verify it, *then* run the
sweep — and if you find another bug after regenerating, log it for a later pass
rather than re-sweeping.

Report the new score distribution: mean, the count of pages with a `high`, and
which pages moved most. A page whose score moves 20 points deserves a sentence
explaining which fix moved it.

## Not yours, but note it

`ai/2026-08-17/loss-budget/` measured `width-used` as **28.1% of the layout
generator's quality gap** — its single largest band. That magnitude was computed
with the broken band, so **it must be re-measured once you've fixed it.** The
mechanism that task found is independent and stands. Log a line saying the number
is now re-measurable; don't re-measure it.

## Files you own

- `public/framework/ext/DesignTool/**` — all of it.
- `public/framework/ai/2026-08-17/tier-calibration/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Fenced off:** `styles/layouts/**` (another agent is in it now — so do not *edit*
there, though measuring it in the regeneration sweep is expected and fine),
`ext/Panel/**` (another session), `ai/2026-08-17/rubric-v2/**` and
`vision-baseline/**` (read-only; `baseline.json` is the source of truth and must
not change).

## Deliverables, in this order

1. **Bug 1 and bug 3 fixed** — the two mechanism fixes that affect every page.
2. **Bug 4** — the aggregate score removed, ranking rebased, display updated.
3. **Bug 2** — `heading-offset` correct in both directions.
4. **One regeneration**, with the new distribution and the biggest movers.
5. **Agreement-with-baseline before and after**, as a check, with the
   spread/flat-count caveat: a band that stops discriminating is not an
   improvement. (A constant 72 scored better on MAE than either real tier — never
   quote an error figure without its spread.)

Running short? Cut 3 first, then 4 — but if you cut 4, say so loudly, because the
baselines are then knowingly stale. **Never cut 1.**

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.json)) { Start-Sleep 15 }`
- Playwright is installed globally (LAW#4 — no npm dependencies). Reuse the dev
  server on port 80; **do not restart it**.
- Assert `document.visibilityState === "visible"` before trusting any measurement
  — hidden tabs run no rAF and no ResizeObserver and return frozen geometry, and
  this is a measurement task.
- Never wait for `networkidle` (the live-reload socket never idles). Scope
  selectors to `.active-page`; the Router keeps parents as hidden
  `.active-ancestor`. Recycle the browser context every ~40 navigations — the
  renderer wedges after ~85–110 in one.
- RULE#9: comments near zero, except a trap the code can't show. A threshold's
  provenance belongs in `knowledge/`, which is yours — update
  `knowledge/thresholds.md` and `false-positives.md` for every number you change.
