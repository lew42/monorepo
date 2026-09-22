# Why four rungs, and not two

Two would have been nicer. The site's own CSS says four.

## What was counted

On 2026-09-17 every `padding` / `margin` / `gap` declaration under `public/` was read and
classified — 1,894 of them, across 125 stylesheets and 918 JavaScript files. The full count
is [the spacing census](/framework/ai/2026-09-17/spacing-census/); the rows are in its
`census.json`.

| what the declaration was | how many | share |
| --- | --- | --- |
| a bespoke number (`0.6em`, `12px`, `2%`) | 1,064 | 56% |
| a token times a multiplier — `calc(var(--gap) * 0.35)` | 451 | 24% |
| plain `0` | 209 | 11% |
| a token on its own — `var(--gap)` | 125 | 7% |
| a control's own `em` | 45 | 2% |

The 451 middle rows are the interesting ones. They are already on the standard — somebody
reached for `--gap` — and then multiplied it by a number they picked themselves. **Twenty-eight
different multipliers** are in use across the site. `0.5` appears 76 times, `0.4` 61 times,
`0.6` 55, `0.3` 45, `0.35` 33, and then a long tail down to `0.05`.

## The fit

Those 451 rows hold 470 multipliers (a shorthand can carry two). A candidate ladder was
scored by asking, for every one of the 470: **is this multiplier within 15% of a rung?** The
ladder with the fewest rungs clearing 80% wins.

| ladder | rungs | covered |
| --- | --- | --- |
| `{1}` — the token alone | 1 | 8.3% |
| `{0.5, 1}` — half and whole | 2 | 27.4% |
| `{0.25, 0.5, 1}` | 3 | 33.4% |
| the best three rungs, wherever you put them | 3 | 72.6% |
| the best four rungs on a readable 0.05 grid | 4 | 79.6% |
| **`{0.25, 0.35, 0.5, 0.7, 1}` — what shipped** | **5** | **83.0%** |
| the best five rungs, wherever you put them | 5 | 85.5% |

So the owner's instinct — two levels, a standard and a section — covers a quarter of what the
site actually wrote. **Four rungs cannot reach 80% at any readable values.** Five can, and the
ladder that does it also lands 373 of the 451 whole rows (82.7%).

**The decision, made rather than parked (2026-09-18):** five rungs ship, and nothing on the
page one click up changes. The two-rung alternative — `--gap` and `--flow` alone, a standard
and a section, the owner's own Figma instinct — stays the alternative: it covers 27.4% of the
470 multipliers within 15%, so the other 72.6% (about seven in ten) would move by more than
15% the day the ladder shrank to two. Two rungs wins on exactly one occasion: a brand-new site
with no existing spacing to fit, where there is nothing yet to be within 15% of.

The best five the search found was `{0.25, 0.35, 0.5, 0.7, 1.05}` at 85.5%. `1.05` is not a
number anyone would type, and `1` is the token itself, so the readable five gives up 2.5
points of coverage and keeps its names.

## The shape, which nobody chose

Written out, the five rungs are **1, 0.707, 0.5, 0.354, 0.25** — every rung is half the rung
two steps above it. That is a root-2 ladder, and the search found it in the data rather than
being given it. It is why the steps feel even instead of lumpy: each one is the same
*proportion* smaller than the last, not the same number of pixels.

## The 80 that missed, and why that is fine

The residue is not noise — it splits cleanly in two.

- **39 multipliers are above the gap** (1.2 through 3). Those do not want a rung. The step
  above `--gap` already exists and is called `--flow`.
- **41 are below 0.21** — a twentieth to a fifth of the gap. At 1280 that is under 3px. A
  value that small is never the space between two blocks on a page; it is a control's own
  geometry, the gap between a meter's label and its bar or between a progress bar's segments.
  Those belong in the control's own `em`, which is the rule the page states.

Which gives the boundary a newcomer can actually use: **if the space you want is under a
quarter of the gap, you are sizing a control, not spacing content.**

## The number that did not add up, fixed (2026-09-18)

Measured live while fitting the ladder: `--flow` was twice `--gap` at 1280 (30.08px against
15.03px) but *smaller* than it at 3440 (45px against 46.19px), because the two clamps capped
at 2.5em and 2.6em. So "the section step is bigger than the row gap" stopped being true at
the widest measured width.

Changing a clamp that every page on the site already renders against was named here rather
than fixed, because it was the owner's call, not a line a task adds on its way past. The
owner's answer: "just make a decision and document the alternative." `--gap`'s ceiling is now
2.4em, one notch under `--flow`'s 2.5em, so the row gap can never again outgrow the section
step. Measured before and after, at 400/1280/1920/2400/3440px:

| width | `--gap` before | `--flow` before | `--gap` after | `--flow` after |
| --- | --- | --- | --- | --- |
| 400 | 14px | 28px | 14px | 28px |
| 1280 | 15.03px | 30.08px | 15.03px | 30.08px |
| 1920 | 24px | 39.67px | 24px | 39.67px |
| 2400 | 30.69px | 44.19px | 30.69px | 44.19px |
| 3440 | 46.19px | 45px | 43.19px | 45px |

Only the last column pair moves. The floor and the `cqi` slope are untouched — the old ceiling
never bound below 3440, so every other width is byte-identical.

Two alternatives were weighed and rejected the same day: raising `--flow`'s ceiling to 2.7em
instead, which undoes the owner's 1.5× paragraph-gap verdict of 2026-09-13; and defining
`--flow` *from* `--gap`, which removes the crossing by construction but welds together two
tokens the rest of the system tunes independently. Both are recorded in
[`styles/doc/decisions.md`](/framework/styles/doc/decisions.md).
