## What this file is

One spec rendered at five real screen sizes at once (390×844 through
3440×1440), in **one row** and at **one scale**, via `ext/demo/stage.js`'s
`simulate()`/`watch()`.

## A screen needs a height, not just a width

The file's own `⚠` comment records a measured bug: without a height, a
`fill` page has nothing to divide and its `scroll` regions never engage, so
the 390px-wide shot alone rendered 2839px tall and swamped the other four.
`SCREENS` is a list of width/height pairs for exactly that reason.

## One scale, and why it replaced five

It shipped fitting each shot to its own column, which meant five different
zooms: nothing lined up, so no two shots could be compared and the tall ones
had to be scrolled past. `fit()` now computes a single factor from the row's
own width and writes each shot's share of it —

```js
const zoom = Math.max(FLOOR, Math.min(1, (room - gap * (shots.length - 1)) / total));
```

— so a card 200px wide on the 1280 screen is 200px wide on the 3440 one. The
price is that 7,750px of screen has to fit the room: 37% at 3440, 12% at 1280.
Below `FLOOR` the row scrolls sideways instead of shrinking further.

## Still reads before it writes

The ordering trap survived the rewrite in a stronger form: `fit()` takes a
single measurement (`$row.el.clientWidth`) before touching anything, and
everything it writes is a **child** of the box it measured — so a write cannot
dirty the read above it, rather than merely happening to come after it.

## A background tab never fits

`watch()` is a `ResizeObserver`, and observer delivery rides the browser's
rendering steps — which a hidden tab does not run at all. A ruler rendered
while its tab is in the background keeps every shot at max-content (4184px
each at 3440, all five *identical*) and the scale caption stays empty,
because `fit()` never gets called. **Not a bug in this file** —
`document.visibilityState` is the check, and an agent driving this page
through the dev server's `eval` is *always* in a hidden tab; `mcp__site__shot`
or headless Playwright are the ways to get a real number. Cost half an hour
of chasing a layout bug that was a measurement bug.

## Improvements

1. **Nothing ranked.** Every `⚠` in the file documents a real, measured bug
   and its fix in the same breath.
