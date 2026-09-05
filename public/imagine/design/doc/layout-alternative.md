# The 3-column card, tried and reverted (2026-09-05)

The owner's second-pass brief asked every realm to actually build an alternative layout
on its landing page, not just consider one. Here's the one that was built, what it
measured, and why it didn't ship.

## What was tried

The front door's tile wall (twelve small cards, `previews()` with `--column: 20em`) was
replaced with the owner's "3-column card" — one row per study, full width: a small
title + intro on the left, a real screenshot in the middle, a one-line finding on the
right. The shape itself was borrowed, not invented — the same `flex-wrap` +
`rem`-floor-plus-stack-term trick `/imagine/layouts/layouts.css`'s `.layouts-card` and
`/imagine/research/research-front.css`'s `.rfront-card` already used tonight for the
identical three columns.

## What it measured

| | tile wall (before) | 3-col card (tried) |
|---|---|---|
| height at 1280 | 860px | 4324px |
| height at 3440 | 852px | 5280px |
| width used at 3440 | ~100% (both — the column is `full`; see readme) | ~100% |
| invariants | pass | pass |

Both layouts pass the three invariants and both already use the full column width — that
part of the front door was fixed yesterday and isn't in question tonight. The number that
decided it is height: twelve rows of a title + a real screenshot + a finding, even
capped and centred so the image never exceeds its own resolution, is a 5–6× taller page
than twelve small cards in a wall. For a page whose entire job is "show a stranger their
twelve choices and let them pick one," a five-screen scroll is a real cost the tile wall
doesn't pay — a reader can see all twelve options in one glance today; with the card row
they'd have scrolled past two or three before reaching the rest.

## What shipped instead

The tile wall stayed, but every card that has a screenshot now shows one (see
`visuals.md`) — the same "picture over paragraph" idea the 3-column card was reaching
for, without the height cost. The 3-column card is a genuinely good shape — it is what
`/imagine/research/`'s front page now uses for its four topic cards, where four rows of
scroll is a fair trade for the richer per-card content. Twelve is a different number
than four; that's the actual reason, not a rule against the shape itself.

## First cut had a bug worth naming

The first build measured 19,657px tall at 3440 — not the 5,280px above. `.design-stage`
(the centre column) had a floor (`max(46%, …)`) but no ceiling, so at 3440 a screenshot's
native ~800px height scaled up past 1,500px per card. Every track needs a floor AND a
ceiling (the `layout` skill says this outright); the fix was a `max-width` on the stage
and on the card itself, capped and centred rather than stretched — "widening a column is
never the fix," including sideways. Left as a line here because it is exactly the
mistake the skill already warns about, caught by measuring rather than by eyeballing a
1280 screenshot that looked fine.
