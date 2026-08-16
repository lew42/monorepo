Every number the rules use, what it's a ratio *of*, and what it was calibrated
against — including the direct vision-model comparison (Haiku/Sonnet/Opus vs.
this tool, 8 images, ground truth withheld) that is the strongest external
evidence anywhere in this module for any of its thresholds.

## It's honest about which numbers are derived vs. observed

The `measure` alarm point (`> 95` characters) has direct external support —
two independent models called the same text broken at the same threshold. The
frame-gap ratios (`0.35×`/`0.12×`) are explicitly labeled "derived, not
observed" — reasoned from the smallest deliberate padding on the site, not
from a model's judgment. That distinction is stated plainly rather than
presenting every number with equal confidence.

## Two weights belong to a RULE, and the table says which and why

`unreachable` at 75 and `empty` at 30 are the only numbers here attached to a
rule name rather than a severity, and the table gives each its measured
motivation: 4099px of unreachable content scoring 82/B, a dead url scoring
94/A. It also records the option that lost — a fourth severity tier — and the
reason, which is that three separate consumers read `counts.high`.

## The corpus result is a detection test, not a severity test

"92/92 at 400, 1280, 1920, 3440px" means every `bad` case trips its named rule
and every `good` case stays clean — it does not mean any case's *score* lands
in the intended band, which nothing currently checks (same gap named in the
readme's Open section and in `tests/cases.js.md`). The wide columns are real for
the first time: the run post-dates the measuring frame's `max-width` fix.

## Improvements

1. **`empty`'s 128-character threshold is stated with its margin** (dead urls
   63–64, sparsest live page 141) **and it is the only threshold here with
   almost none.** Every other number in this file has an order of magnitude
   between the two populations it separates. Worth re-measuring the moment a
   deliberately sparse page lands. *(medium, useful.)*
