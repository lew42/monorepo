# The visual scoring rubric — what to hand a production scorer

**Ship the v1 axes, unchanged.** They are the only version with measured reliability.
The rewrite this task built and tested (fact-based anchors, `contrast` split) is a
**regression** and is documented at the bottom so nobody rebuilds it.

Numbers: `agreement.json` and `task.jsonl` here. Corpus: the 18 frozen 1280×800 PNGs
in `../vision-baseline/`, hashes verified byte-identical before every pass.

## The scorer, and the protocol that makes it reliable

- **Model: `claude-sonnet-5`.** Measured test-retest over three independent passes on
  the 18-image corpus: mean pairwise Spearman **+0.683** (0.704 / 0.669 / 0.675),
  **ICC(3,1) 0.711** on the mean of its axes. Opus on the same rubric reproduces itself
  at ICC 0.510 — *the cheap tier is the more repeatable scorer here.*
- **Run two passes per page and average them.** One pass is a lottery: the same model,
  rubric and pixels gave Spearman +0.117 to +0.625 against the same reference across
  four runs. Spearman–Brown on ICC 0.711 gives **0.83 for a 2-pass mean** and 0.88 for
  3. Two is the value-for-money point.
- **Report the mean of the five axes as the headline. Do not ask for a judged
  `overall`.** Asking for one produced the mean anyway (Spearman 0.968–0.995 with it),
  and the mean is the more reliable of the two (ICC 0.711 vs 0.693). One less judgement,
  free reliability.
- **Do not rescale.** The `70.2 + (s − 66.2) × 2.04` map is monotone and provably
  leaves rank correlation untouched — verified, delta Spearman 0.000 — but it raises MAE
  above a constant, cannot reach the corpus tail (no monotone map can), and its two
  parameters are the reference set's own mean and sd, which do not exist for unscored
  pages. Publish the raw score and its spread.
- **Publish the headline only.** Per-axis numbers are not yet fit to show — see
  *Which axes to trust*.

## The axes — v1, verbatim

Five dimensions, 0–100, plus one sentence of prose per dimension **naming what in the
image drove the number**. The prose is not a nicety; it is how a score you disagree
with gets audited.

1. **layout** — Structure, alignment to a visible grid, grouping, whether the 1280 gets
   used or left as gutters.
2. **typography** — Type scale, measure (line length), leading, whether heading levels
   out-rank their body.
3. **contrast** — Legibility of text on its ground, whether emphasis actually reads,
   anything washed out or harsh.
4. **density** — Information per screen: cramped jumble vs empty stage; is the whitespace
   grouping or just padding.
5. **hierarchy** — Can you tell what this page IS and where to look first, in one second;
   does the eye have a path.

Headline = the mean of those five.

### The anchors

- **30 — unfinished.** You would not show it. Elements visibly misalign or collide; a
  wall of undifferentiated text, or scattered boxes on no grid; one type size doing every
  job; text you squint at; either a cramped jumble or ~70% empty screen with a strip of
  content in it. No path for the eye — you cannot say what the page is for in three
  seconds.
- **60 — competent, undesigned.** Nothing is broken. A consistent grid and a readable
  type scale exist. But something obvious holds it back: dead space where content should
  be, a heading that does not out-rank its body, a measure running long, uniform grey
  where emphasis is needed, or a layout ignoring half the width. Reads as a developer's
  page — functional, not designed.
- **90 — designed.** Clear first read: you know what the page is and where to look
  within a second. Deliberate alignment, whitespace that groups rather than pads, a type
  scale with real contrast between levels, comfortable measure, one or two accents doing
  work, the full 1280 used without stretching prose to it. Only nits remain.
- **Extremes** — ≤20 actually broken (overlap, error state); ≥95 nothing you would
  change; **100 is not awarded.**

### One check, borrowed from the failure it prevents

Before submitting a page: if all five numbers land within 4 points of each other, you
have probably formed one impression and copied it five times. A scorer that does that
wins on mean absolute error while carrying no information — v1's Haiku run scored MAE
5.06 with 14 of 18 rows flat, sd 1.65 and Spearman +0.207, beaten by a constant. Six
near-equal numbers is legitimate for a genuinely even page; it should be rare.

## Which axes to trust — and this is not a property of the rubric

Per-axis reliability differs **by model**, on the same rubric and the same images.
Axes whose centred re-score error beats their own best-constant control (ratio < 1.0):

| axis | Sonnet, 3 passes | Opus, 2 passes |
|---|---|---|
| layout | **0.74** ✓ (ICC 0.748) | 1.05 ✗ |
| typography | 1.30 ✗ | 1.25 ✗ |
| contrast | 1.49 ✗ (ICC 0.296) | **0.60** ✓ (ICC 0.728) |
| density | **0.68** ✓ | **0.56** ✓ (ICC 0.822) |
| hierarchy | **0.70** ✓ | 1.16 ✗ |

Only `density` survives for both. The two models' strong axes are otherwise *opposite*.
So the rubric is not pinning down a shared construct — each model has its own stable,
idiosyncratic reading of four of the five words. **Consequence: per-axis scores are
diagnostic prose, not comparable numbers, until this is fixed. Publish the headline;
show the axes as the sentences that justify it.**

## What was tested and rejected

- **A fact-anchored rewrite of all six axes** — every anchor restated as a countable
  fact (distinct left-edge counts, dead-gutter percentages, character counts), plus an
  attribution table. Tested head-to-head against v1, same harness, same images, only the
  rubric differing. **Result: ICC 0.041 against v1's 0.711**; layout, typography and
  legibility all fell to Spearman ≈ 0. Cause: multi-criterion anchors with no rule for
  combining them, and 30-point bands. `/notes/git-branch-names/` scored **90** by one
  pass ("a single left edge at 50px, nothing clipped") and **35** by the other ("a dead
  region of ~447px, 34.9% of the width") — both correct under the rubric as written.
  Discretising a graded judgement amplified noise instead of removing it.
- **Splitting `contrast` into `legibility` + `emphasis`** — the construct analysis holds
  (v1's own prose shows the two jobs cancelling on the same page, and the two halves
  correlate only +0.527/−0.300 with each other, so they are not one thing renamed). But
  the split axes reproduced *worse* than the fused one (legibility ICC −0.102, emphasis
  0.135, vs contrast 0.296). It gave the noise two places to go. **Revisit only with one
  criterion per anchor.** The two axes as tested, kept here so the next attempt starts
  from them rather than reinventing them — **not for production as written**:

  > **legibility** — whether every piece of text reads against its ground. Count the
  > distinct regions holding text you could not comfortably read at 100%, and name each.
  > **90** zero such regions. **60** exactly one, and it is secondary chrome (a control
  > strip, a badge, a caption). **30** two or more, or one holding primary content, or any
  > text under ~8px, or a patterned ground running directly behind body copy.
  >
  > **emphasis** — whether the things that stand out are the things that should. Count the
  > emphasis devices (bold, colour, chip, underline, filled button, size jump, box); check
  > whether each carries exactly one meaning and whether any is applied to more than ~15%
  > of the text it sits inside. **90** 2–4 devices, each with one consistent meaning, none
  > over-applied, and at least one accent pulling the eye somewhere worth looking. **60**
  > devices consistent but nothing pulls the eye (near-uniform grey), or one device
  > carries two meanings. **30** a device applied to over ~15% of its surrounding text so
  > it marks nothing, or a device that means nothing at all (words tinted like links that
  > are not links), or the only emphasis is on chrome.

  The 18 images scored on them, both passes: `experiment.json`.
- **`polish`** — stays rejected on v1's original grounds: it overlaps everything and
  becomes a fudge factor.

## The open blocker

There is no validated reference. Sonnet reproduces *itself* at ICC 0.711 but agrees with
the designated source of truth at only Spearman +0.12 to +0.26 — and that source of truth
reproduces itself at 0.510, making it the least repeatable scorer measured. The rubric can
therefore rank pages **relative to each other, self-consistently**, and cannot yet be said
to rank them by how they look. Closing it needs a reference that is not one pass by one
model: Mike ordering the 18 by eye, or an averaged panel. Everything else in this program
is blocked behind that one artifact.
