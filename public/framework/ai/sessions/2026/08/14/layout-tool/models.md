# Can a vision model find what the numbers find?

Eight corpus cases — six broken in one named way, two that should read clean —
screenshotted once at 1280px and handed to three models in **fresh sessions,
one image each**, with no ground truth in the prompt. Each was asked for a
`broken | fine` verdict and the single biggest problem.

Method note: fresh session per image is not incidental. The `vision-report`
task measured that a *resumed* session re-reads every prior image as cache-read,
so cost grows with the **square** of image count. One session per image keeps
it flat.

## Result

| | Haiku 4.5 | Sonnet 5 | Opus 5 | **LayoutTool** |
|---|---|---|---|---|
| correct verdicts | 6 / 8 | 7 / 8 | **8 / 8** | **8 / 8** |
| missed | cramped-card, clipped-rail | cramped-card | — | — |
| false alarms on clean pages | 0 | 0 | 0 | 0 |
| cost, 8 images | $0.27 | $1.45 | $0.95 | **$0** |
| wall clock, 8 images | ~57s | ~41s | ~49s | **~0.3s** |

⚠ The first call to each model is 3–6× the rest ($0.52 for Sonnet's first,
$0.34 for Opus's, then $0.15 and $0.08). Cold prompt cache. Per-image steady
state is what the ladder above is really made of.

## The one case that separates them

**`cramped-card`** — three bordered cards with `padding: 0`, so the text sits
flush against a line it can see. This is Mike's original complaint, and it is
the *whole reason the tool exists*.

- **Haiku:** `fine` — "none"
- **Sonnet:** `fine` — "none"
- **Opus:** `broken` — *"The cards have no padding, so their heading and body
  text sit flush against the card borders."*
- **LayoutTool:** `cramped ×3`, frame gap **0.00× font size**, high severity

Two of three models looked straight at it and said nothing was wrong. The
analyzer measures the gap from the nearest text to the frame and divides by that
text's own font size; there is nothing to miss.

Haiku additionally called **`clipped-rail`** fine — eight cards in an
`overflow: hidden` row with the third sliced through. Sonnet and Opus both saw
it, Opus adding *"even though there is ample empty space"*.

## What this settles

**Small-scale spacing is where vision is weakest and arithmetic is strongest.**
Overlap, clipping, and grossly long lines are visually loud and every model got
them. A missing 12px of padding is visually quiet and two of three missed it —
while being, numerically, the least ambiguous finding in the set.

**Opus is genuinely good**, and its reasons are fix-ready ("no padding", "an
overflow-hidden rail", "~150 characters per line"). But at ~$0.12/image steady
state and ~6s, on one screenshot at one width, it is a **reviewer, not a
detector**: 116 pages × 2 widths is 232 images, which is ~$28 and ~25 minutes
against ~40 seconds and nothing for the analyzer — and the analyzer names the
element and the magnitude, which no model here did reliably.

**Nobody produced a false alarm on the two clean pages.** That is worth saying:
the risk with models is missed findings, not invented ones.

## So vision stays, for two jobs

1. **Calibration.** These runs are how a threshold earns its number.
2. **A second opinion on a specific element**, via `ext/LayoutTool/vision.js` —
   which hands the model the screenshot *and* the numeric findings and asks
   which it can actually see. On `/framework/ext/LayoutTool/` it confirmed the
   `measure` findings unprompted and then flagged something no rule encodes:
   "the content ends roughly halfway down the visible area."

That is the division of labour: **the numbers detect, the model judges.**

Raw data: `models.json` beside this file (verdict, problem, cost and duration
per model per case).
