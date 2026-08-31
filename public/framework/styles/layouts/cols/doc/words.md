# The one rule, and the four decisions in it

Six words, one declaration. `cols.css` is 40 lines of rule and 90 of why.

```css
.cols-row > * {
	--cols-w: 1;
	flex: var(--cols-w) 1 max(
		calc((100% - var(--cols-fixed) - var(--cols-n) * var(--gap, 1em) - 1px)
			* var(--cols-w) / var(--cols-sum)),
		var(--cols-stack));
	min-width: 0;
}
```

*The row, less the fixed tracks and one gap each, times this track's share of the weights.*
A word is then two numbers on the container (`--cols-n`, `--cols-sum`) and one on each
child (`--cols-w`).

## 1. A percentage basis, not a zero one

`/imagine/decks/` measured this and it is the reason this lab exists at all: `flex: 61.8 1 0`
does **not** give 61.8%. A zero basis is a zero *border* box, so a padded region cannot go
below its own padding — at 1920 two regions floored at 56px each and the grow factors then
divided only what was left: 1159 / 759, a ratio of **1.527** where the page claimed 1.618. A
percentage basis includes the padding, so 61.8% is 61.8% of the row whatever the inset is.
Measured here: **1.618 at 1280, 1920 and 3440.**

## 2. Grow is the weight, not 1

The bases deliberately leave slack — `n` gaps subtracted, `n-1` used — so a sub-pixel
rounding error can never wrap the last track early. Growing by 1 would then split that slack
*evenly* and pull the ratio off by a few tenths of a percent. Growing by the weight keeps
every track exactly proportional: basis ∝ w, grow ∝ w, so nothing can drift.

This is also the whole difference from `.flex.auto`, where grow is 1 and the ratio is
whatever the leftover made it.

## 3. The floor is `rem`; the rail is `em`

Both on purpose, and they are the two halves of the same finding.

- **`rem` for a floor.** This site never sets a root font size, so `rem` is 16px at every
  viewport. `em` is `body`'s clamp — 14px at 400, 18px at 3440 — and a threshold written in
  it moves 28% while the container stands still ([indictment](/framework/styles/layouts/cols/doc/indictment/) §2).
- **`em` for a rail.** A rail holds type, and type here *is* that clamp, so `--cols-rail: 16em`
  is the same number of characters at 400 as at 3440 (224px → 288px). A floor is a place; a
  rail is a measure.

## 4. No container query

A container query never matches its own container, so a `@container` stack rule would have
to live on a wrapper element and every row would cost two divs. Instead each basis is

```
max(share, calc((var(--cols-floor) - 100%) * 999))
```

Below the floor the second term is larger than the row, so the track wraps onto its own line
and shrinks back to full width; above it the term is negative and `max()` takes the share.
That is `.flex.three`'s own idiom (`(--column * 3 - 100%) * 999`) with a floor you name — no
new concept, no wrapper, and it works at any nesting depth.

The same term appears on `max-width`, which is what lifts a cap in the stack. Without it a
500px row stacks a 416px aside under a 500px main and the left edges disagree.

⚠ **A container query condition cannot read a custom property**, so `--cols-floor` could not
have been the query's threshold even with a wrapper. Each word would have needed its own
literal `@container` block.

## What a share does not bound

**A share bounds the track, not the measure.** `cols-half` at 3440 is two 1489px columns, and
prose in one of them is still 1489px of prose. `.measure` inside the track is the fix; a
narrower share is not (the layout skill's second bounds rule — widening or narrowing a column
is never the fix for the wrong measure).

## Verified

Every word, at 400 / 1280 / 1920 / 3440, intended ratio against measured, on
[the lab page](/framework/styles/layouts/cols/) and [the matrix](/framework/styles/layouts/cols/matrix/):

| word | 400 | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| `cols-half` | stacked | 1.000 | 1.000 | 1.000 |
| `cols-golden` | stacked | 1.618 | 1.618 | 1.618 |
| `cols-two-one` | stacked | 2.000 | 2.000 | 2.000 |
| `cols-thirds` | stacked | 1.000 | 1.000 | 1.000 |
| `cols-main-aside` | stacked | 2.125 | capped 416px | capped 416px |
| `cols-rail-main-aside` | stacked | 2.333 | capped 352px | capped 352px |

Every capped row is *fully spent* — the main track absorbs what the ceiling gave back, so a
cap never leaves a hole. That check runs live in the readout under each row.
