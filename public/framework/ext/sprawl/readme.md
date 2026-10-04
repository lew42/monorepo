# Sprawl — a wall of big sections that balances its own columns

Give it an array of already-built blocks, most important first. It draws them into a CSS
grid (`repeat(auto-fit, minmax(min(100%, 60rem), 1fr))` — one column under ~60rem, about
three at 3440) and decides which column each block goes in so the columns come out close
in height, instead of the first N blocks landing in column one and the rest trailing off
below.

## Use

```js
import sprawl from "/framework/ext/sprawl/sprawl.js";

sprawl([section_one, section_two, section_three]).ac("wide");   // or .ac("bleed")
```

Each item needs only an `.el` (a `View`, or anything shaped like one). Live demo, with
twelve sections of very different lengths: [/framework/ext/sprawl/](/framework/ext/sprawl/).

Built for, and first used by, the new [`/framework/`](/framework/) home page — see
[`/framework/design/layout/`](/framework/design/layout/) for the one-line pointer to this
pattern among the other named layouts.

## Watch out

- **Claim `wide` or `bleed` on the result.** `sprawl()` only builds the grid; like any
  multi-column content, it still needs to opt out of the page's default reading-width
  track, or it renders in one narrow column at every width (`layout` skill, Q1/Q2).
- **It places once, then waits for a real column-count change** — never on every resize
  pixel, never for an unrelated reflow elsewhere on the page. That's the whole point: a
  section a reader is looking at should never jump to a different column while they read.
- Full reasoning, including the two rejected CSS-only approaches (equal-height rows,
  `columns:`) and why: [`doc/algorithm.md`](doc/algorithm.md).

## More

- [`doc/algorithm.md`](doc/algorithm.md) — the balancing algorithm, the two CSS-only
  approaches tried and rejected first, exactly when it re-runs, and the hidden-tab and
  below-breakpoint cases.
