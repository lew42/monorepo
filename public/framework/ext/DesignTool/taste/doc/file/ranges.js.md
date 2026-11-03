THE RULEBOOK, and it is data, not code: eleven dimensionless ratios — `measure`,
`frame-gap`, `pad-share`, `gap-share`, `scale`, `lanes`, `repetition`, `slivers`,
`depth`, `width-used`, `contrast` — each an `ideal` band, a wider `ok` band, and
a `weight`. `read.js` derives the eleven values from a probe model; `taste.js`
grades them against this table. Nothing here touches a DOM.

## `AUTHOR` is the same table, read from the writing side

`RANGES` grades a measured layout; `AUTHOR`, exported from the same file, says
what to *write* — in `em`, not ratios — so a generator (`styles/layouts/space/gen.js`)
can sample declarations that land inside the bands `RANGES` will grade. The loop
between the two is the whole self-improving story: a generator drawing from the
same rulebook the analyzer marks it against. `AUTHOR.measure` deliberately does
**not** match the site's own `--measure: 52em` — Montserrat runs ~2 characters
per `em` here, so 52em measures ~104 characters a line at every viewport, above
this file's own band. That gap is a finding about the font, not a disagreement
between the two tables.

## ⚠ A threshold fitted to a broken reading looks right and is wrong

`measure`'s band was justified twice over — by the typographic consensus (45–85)
*and* by the site's own measured interquartile range (52–68) — and the second
justification was withdrawn on 2026-08-17. That IQR had been measured over a
population admitting card captions and table cells, and it landed inside the
ideal band only because **two errors cancelled**: prose at 75–103 characters
averaged against captions at 19–26. Read over prose alone the site runs 59–78.
The numbers did not move; their reason did. **Fix the population before you touch
a threshold.** `../../../knowledge/ideal-ranges.md` carries the derivation.

## A weight is evidence, not opinion

Six of the eleven bands moved when checked against 26 good pages and 10
known-bad traps, at 1280 and 3440. `repetition` was written at 0.3–0.75 from a
guess about "enough hierarchy" — the site's own pages measure 0.09–0.42, median
0.23, roughly half the guessed centre. `pad-share`'s IQR (0.033–0.047,
unchanged across widths) is the tightest quantity measured and was given the
second-highest weight in the book, 7, to match. `depth` is bimodal and
root-relative — chrome-heavy pages read 13–15, simple ones 8, nothing between —
so it carries the lowest weight, 3. **The lesson: a diffuse quantity, one that
means something different depending on page type, earns less influence over the
total than a tight one, on purpose** — a wide weight on a diffuse signal is
noise wearing a number.

## `credit()` tapers, it never steps

Full credit inside `ideal`, falling linearly to zero at the far edge of `ok` —
the same argument `rules.js` makes for severity being a curve: a step cannot
tell 69 characters a line from 90 any more than a binary test can tell 87 from
300. A search that hill-climbs needs the gradient a taper gives it; a step is
flat everywhere except the one edge.

## Improvements

1. **The weights are hand-set, never fit.** Six bands were retuned against
   measured data; none of the eleven weights themselves came from anything more
   rigorous than "the tight ones should count for more." A held-out search that
   optimizes weight-to-outcome does not exist yet. *(medium, useful.)*
2. **`lanes`' ideal floor (0.75) is still a guess**, pulled down from the
   measured 0.85 because `library/bad/` traps scored *higher* on it than good
   pages when read against a whole `.app`. The scoping half is **done** —
   `read()` reads the content region now — so the floor can be re-measured
   against a signal that is no longer part chrome. *(small, useful.)*
3. **Three bands never reach either edge**: `pad-share`, `lanes` and `depth`
   record zero hard zeros and zero out-of-range rows across 169 urls at both
   widths. The outer half of each `ok` range has never been exercised, which
   makes it untested rather than validated. *(medium, useful.)*
