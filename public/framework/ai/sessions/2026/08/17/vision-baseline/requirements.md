# The image + scoring baseline — the source of truth

Mike, 2026-08-17, verbatim:

> the idea here, is to establish an Image + Scoring baseline, per image, the
> "source of truth". This is kind of like LLM training. The reason is, then we can
> test cheaper models, and also test against the DesignTool's mathematical
> computational results. But we need that baseline to hone in on. If we need Fable
> to figure it out, fine. If we need a combination of Fable + full layout metrics
> (bounding box, etc) in order to doubly hone in on these scores, fine.

> also, what kind of feedback do we get from the screenshots? I'd want to be able
> to see the raw feedback, but that's harder to process. if we can condense the
> feedback into some ratings (a layout score, a contrast score, a density score,
> etc). that way, I can see the progression from lesser scores to higher scores,
> and see if i agree. we need this progress for visual design, layout,
> typography, everything.

> try different models to see which gets the best results and at what token cost.

**You are building the baseline and measuring who agrees with it.** Not a tool, not
a UI — a frozen corpus, a rubric, per-image scores with raw feedback, and
agreement numbers.

## Why this is worth doing: the two existing tiers already disagree

The site has two numerical tiers and **they disagree by up to 29 points on the
same page**. From the frozen audit baselines at 1280:

| url | taste | math |
|---|---|---|
| `/web/layout/flow/` | 67 | **96** |
| `/framework/` | 49 | **70** |
| `/framework/ext/toc/` | 63 | 77 |
| `/notes/git-branch-names/` | 91 | 96 |

Nobody knows which is closer to how a page actually *looks*. **The image baseline
is the tiebreaker.** That is the real product of this task.

## The corpus — freeze it, then never re-shoot it

Use these 18 urls. They span the taste range 49→91 and deliberately avoid every
fenced directory:

```
/framework/                                  /web/nav/wall/
/framework/ext/LayoutTool/tests/             /framework/styles/layers/theme/lew42/
/web/nav/sidebar/                            /web/nav/crumbs/
/framework/ext/toc/                          /framework/core/Page/overview/children/
/framework/ui/panel/                         /framework/audit/
/framework/ui/tags/                          /framework/core/Page/nav/
/web/layout/flow/                            /framework/styles/layers/util/
/framework/core/Page/                        /notes/git-branch-names/
/framework/ext/layout/                       /framework/ai/
```

- **One width: 1280.** One canonical shot per url. Mike's constraint, and it
  generalises: *"Do not recompute screenshot + image on resize!!!"* Shoot once,
  score once, **key the score by the image's content hash** so a re-run is free
  and a re-score only happens when the pixels actually changed.
- Full-page or above-the-fold: **pick one and apply it to all 18.** State which
  and why. Consistency matters more than which you choose.
- PNGs go in the session scratchpad, **never the repo** (RULE#12). **Log every
  image's absolute path in your `task.jsonl`** — another agent is building the
  dashboard that will surface exactly those lines, so this is the contract.

## The rubric

Define and document the dimensions before scoring anything. Mike named layout,
contrast, density and typography, and asked for "visual design, layout,
typography, everything". Cover at least those four; add hierarchy and polish if
they earn their place. **Keep it small — a rubric with twelve axes is a rubric
nobody reads.** For each dimension: 0–100, plus **one sentence of raw prose
feedback naming what in the image drove the number**, plus one overall score.

The raw feedback is a requirement, not a nicety: *"I'd want to be able to see the
raw feedback."* It's also how Mike audits a score he disagrees with.

Anchor the scale explicitly — write down what a 30, a 60 and a 90 look like —
otherwise scores drift between images and the whole baseline is uncalibrated.

## The three measurements

1. **The baseline.** Score all 18 images yourself, carefully. You are the strong
   model; this is the source of truth. Look at each image properly.
2. **Cheaper models.** Score the same images with the same prompt on a cheaper
   tier (Sonnet and/or Haiku — spawn subagents for this, one per tier, and give
   them the identical rubric and identical images). Report **mean absolute error
   and rank correlation vs your baseline, plus tokens per image**. The question is
   commercial: *is a cheap tier good enough, and how much cheaper?*
3. **The two math tiers.** Correlate `taste.json`'s score and `findings.json`'s
   score against your baseline, both at 1280. **Which of the two is closer to how
   pages actually look?** Name the specific pages where each math tier is most
   wrong, with the image as evidence — those are the calibration bugs worth
   fixing, and they're the reason this task exists.

## Optional, if the numbers ask for it

Mike authorises pairing vision with hard metrics: *"a combination of Fable + full
layout metrics (bounding box, etc) in order to doubly hone in."* If your scores
feel unstable on some dimension, pull that page's metrics from the frozen
baselines (read-only) and say whether the numbers sharpen the judgement. Report it
as a finding; don't build a pipeline.

## Files you own

- `public/framework/ai/2026-08-17/vision-baseline/**` — your task dir, including
  **`baseline.json`**: the per-image scores and raw feedback. That file is a
  *conclusion*, so it belongs in the repo even though the images do not.
  ⚠ It will move into the DesignTool module once the rename lands — keep it
  self-contained and don't wire it into any page yet.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Read-only everywhere else, and these are hard fences:**
`ext/LayoutTool/**` (frozen, mid-rename, and another agent may be running it),
`styles/layouts/**` (being redesigned right now — that's why none of its urls are
in the corpus), `ext/Panel/**` (another session), `Server/**` and `ext/JSONL/**`
and `ext/AITask/**` (the dashboard agent owns them).

**Do not edit any site page.** Scoring pages you are also changing makes every
number meaningless.

## Deliverables, in this order

1. **`baseline.json`** — 18 images, per-dimension scores, raw feedback, image
   paths, content hashes.
2. **The agreement table**, as `log` lines in your `task.jsonl`: cheap models vs
   baseline (MAE, rank correlation, tokens/image), and each math tier vs baseline.
3. **The verdict in two sentences:** which math tier is closer to how pages look,
   and whether a cheaper model can carry this work.
4. The rubric written down, with its 30/60/90 anchors.

Running short? Cut the second cheap tier before the first, and cut 4 last.
**Never cut 3** — it's the whole point. Say plainly what you didn't reach; a
silent truncation reads as "covered everything".

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md` — the
harness blocks subagents writing report files.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.png)) { Start-Sleep 15 }`
- Playwright is installed **globally** — LAW#4, add no npm dependency. Reuse the
  dev server on port 80; do not restart it, other sessions are on it.
- Assert `document.visibilityState === "visible"` before any shot: a hidden tab
  runs no rAF and no ResizeObserver and returns frozen geometry — you would
  screenshot a page that never laid out.
- Never wait for `networkidle` (the live-reload socket never idles). Recycle the
  browser context every ~40 navigations.
- Check usage before wide work — image analysis is not cheap, and the token cost
  per image is itself one of the numbers you're reporting.
