Ten fragile patterns, as data. Same shape as `patterns.js` plus a `rule` field
naming what the entry exists to trip, and a `see` line that must always end in a
library entry — **a don't with no alternative is a complaint, not doctrine.**

## Plausible, not minimal

Every specimen is a shape someone would actually write: a three-track card
wall, a nav pinned beside an article, a feed of full-width rows, a table with a
`min-width`. That is the difference from `tests/cases.js`, whose cases are the
smallest thing that trips one rule. A minimal case proves the rule; a plausible
one teaches the reader to recognise their own file.

## Each entry is scoped to the width where it breaks

The measured spread is the content, not a side effect:

| entry | broken at | clean at |
|---|---|---|
| Unbreakable child | 400 (D 64) | 1280, 1920 |
| Table with no scroller | 400 (C 70) | 1280 and up |
| Rail that never wraps | 400 | 1280, 1920, 3440 |
| Prose with no ceiling | **1280 only** | 400, 1920 |
| Stacked forever | 1280, 1920, 3440 | 400 — stacking is right on a phone |
| Fixed-track wall | 400 **and** 3440 | 1280 |

"Prose with no ceiling" is the one that argues for the 1280 column existing at
all: clean at 400 and at 1920, 128 characters a line in between.

## Two entries deliberately fire nothing

- **Scroller in a wrapping row** — vertical overflow of a visible box, which no
  rule measures.
- **Pixel padding** at 3440 — past 85% of the viewport `pad-scale` stops
  treating a box as a card and hands it to `gutter`, which measures against the
  font size and lets a 20px inset through.

Both are recorded in [Blind spots](/framework/ext/DesignTool/knowledge/blind-spots/); neither
was contrived to make a point, both were found by measuring an entry that was
supposed to fail.

## Improvements

1. **`stacked-forever` and `prose-with-no-ceiling` both fail through
   `measure`**, from different causes. A reader scanning the Trips column sees
   one rule twice and may read them as one lesson. Naming the cause rather than
   the rule in that column would separate them. *(simple, useful.)*
2. **No entry demonstrates `collision` or `zero-size`.** Both are real rules
   with real site failures behind them (negative margins, a flex child at
   height 0) and neither has a don't. *(medium, useful.)*
