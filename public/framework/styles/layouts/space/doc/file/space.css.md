## What this file is

Layout-only CSS for the instrument's own chrome: the control bar, the
non-wrapping row of screen shots, the seed wall's cropped tiles, and the word
cards on `words/`. Every rule reads a token.

## Meets its own trap on its own page

The comment on `.space-text` flags that it carries a real `flex-basis` and never
`.flex-1` — the exact `fluid` trap `spec.js` documents in the layouts this page
renders is something the *instrument itself* had to avoid, measured at 80px wide
at a 430px viewport before the fix.

## `.space-row` is `nowrap`, and that is the whole redesign

The shots used to be a wrapping row inside a `max-height: 82vh` scroller beside
a sticky text panel. `nowrap` plus a width written per shot by `ruler.js` is
what puts five screens on one line; `overflow-x: auto` is what happens below the
scale floor, and it is the only thing on this page that scrolls.

## `.space-compose` carries two measured fixes in one declaration

`display: flex` and an explicit `height`, and each half is a bug that rendered the
compose page **blank with fourteen panels in the DOM**. A `fill` page has nothing
to fill inside a Doc tab (`.doc-page` is a wrapping flex box in a scrolling region,
so there is no definite height to take 100% of), and `--panel-height: 100%` fails
the same way one level down — a percentage height resolves against the parent's
*computed* height, which is `auto` for a `flex-1` box. A flex parent stretching a
`flex: 1 1 0` child needs no definite height anywhere, which is why that is the
shape it ended up.

## The one rule that is not a token read

`.space-words` sets `grid-template-columns` by hand rather than taking
`.grid.auto`, and the comment says why: `auto-fit` with an unbounded `1fr`
stretched a four-card family across eleven tracks at 3440 and its notes measured
~100 characters a line. A reference wall wants `auto-fill` and a track ceiling —
the same call `Page.previews()` makes, for the same reason.

## Improvements

1. **Nothing ranked.** Every rule is scoped to a class this directory alone
   emits, and each trap it names is a measured regression rather than a
   hypothetical one.
