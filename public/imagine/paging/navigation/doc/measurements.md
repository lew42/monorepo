# The measurements — how every number was taken

Every number on [Navigation](/imagine/paging/navigation/) came from driving the real page
in a headless browser, at **1280x900** and **3440x1400**, and reading one element's
`getBoundingClientRect()` immediately before and immediately after the click.

Two numbers per gesture:

- **moved** — how far the thing you were reading slid **sideways**, in pixels.
- **jumped** — how far it slid **up or down**, in pixels.

## What is watched, and why it changes per mechanism

"The thing you were reading" is not the same box for a column and for a tab, so the runner
takes the watched element per case:

- **A column mechanism** watches the **body of the column you clicked in**. Its viewport
  `left` is exactly where the text you were reading is, and it captures both causes of
  sideways movement at once — the width redistribution *and* the row scrolling itself to
  reveal the new column.
- **Anything that changes height** watches the **first thing below the part that changed**.
  Watching the changing box itself reports 0 and hides the whole problem: a tab panel does
  not move, it becomes a different size, and everything under it is what moves.
- **A takeover** has no watched element after the click, because the element is not on the
  screen. That is reported as *off screen*, not as a number.

⚠ **Two traps the first run walked into.**

1. **Playwright auto-scrolls to whatever you click.** A gesture whose target is below the
   fold therefore scrolls the page first, and that scroll reads as a jump. Every case
   scrolls its target into view *before* the "before" reading is taken.
2. **Scroll anchoring absorbs part of a height change.** When a box shrinks inside a
   scrolled container, the browser may hold the content *below* it still and move the box
   instead — so a viewport reading depends on where you happened to be scrolled. The two
   live demos on the page measure **offsets inside their own box** for exactly this reason.

## Every mechanism

| mechanism | watched | moved 1280 / 3440 | jumped 1280 / 3440 |
|---|---|---|---|
| A sidebar rail (`/framework/`) | the rail | 0 / 0 | 0 / 0 |
| The crumb strip, out of a takeover | the crumb strip | 0 / 0 | 0 / 0 |
| A tab **strip** (`ext/tabs`) | the strip | 0 / 0 | 0 / 0 |
| A stage with a reserved height | the heading under it | 0 / 0 | 0 / 0 |
| A drawer opening (`ext/drawer`) | a paragraph | 18 / 0 | 0 / 0 |
| An accordion opening (`ui/accordion`) | the row below it | 0 / 0 | **81 / 68** |
| A panel expanding in place | the last row of the list | 0 / 0 | **113 / 135** |
| A toolbar word — the surface (`card`) | the paragraph under the stage | 0 / 0 | **158 / 133** |
| A column opening beside you | the column you clicked in | **126 / 62** | 0 / 0 |
| A swap into a box that fits its content | the box | 0 / 0 | **259 / 89** |
| A tab **switch** | the panel under the strip | 0 / 0 | **1720 / 1933** |
| A toolbar word — content size (`xl`) | the paragraph under the stage | 0 / 0 | **920 / 716** |
| A link that opens TWO columns at once | the column you clicked in | **194 / 0** | 0 / 0 |
| A page taking the whole screen (`full`) | the column you clicked in | *off screen* | *off screen* |

**The two worst cases, in full.**

- **Two columns at once, 1280.** Before the click the row is `[211, 963]` — the `/imagine/paging/`
  column is at its 64em ceiling because nothing else is asking for room. After, it is
  `[211, 421, 421, 421]`: the column drops **542px of width** and its left edge moves
  **194px**. At 3440 the same click leaves the left edge at 432px and only narrows the
  column from 1152 to 1003, because there was room to spare — the same gesture is far worse
  on the smaller screen.
- **A tab switch.** The `ext/tabs` panel is 4247px tall on `Overview` and 2527px on `API` at
  1280 (5010 → 3077 at 3440). Nothing slides; the document simply becomes a different
  height, so the scrollbar jumps and anything below the panel is somewhere else.

## The four stable demos

Same runner, same two numbers, on the four demos this page ships. Each is measured twice —
once on the version that behaves like the site does today, once on the version with the rule
added — so the pair is the argument.

| demo | gesture | today | with the rule |
|---|---|---|---|
| [Fixed columns](/imagine/paging/navigation/columns/) | open a fourth column | moved **134 / 161** | moved **0 / 0** |
| [Reserved stage](/imagine/paging/navigation/stage/) | swap Overview → Pricing | jumped **252 / 301** | jumped **0 / 0** |
| [Reserved tabs](/imagine/paging/navigation/tabs/) | press the Pricing tab | jumped **252 / 302** | jumped **0 / 0** |
| [Full screen](/imagine/paging/navigation/screen/) | three sub pages in a row | — | rail **0 / 0**, centre **0 / 0** |

Every cell in the right-hand column is 0 at both widths, and the left-hand column is not — the
pair is what makes each one an argument rather than a claim. The full screen is measured across
three navigations in a row (Overview → Activity → Settings → Overview), and both its boxes read
the identical rectangle every time.

The two live boxes at the top of [Navigation](/imagine/paging/navigation/) measure themselves
in the browser as you press them, so the numbers are not a claim you have to take on trust.

## The runner

A small Playwright script, one browser for the whole suite, one fresh context per case per
width. Each case is `{ name, url, scroll, click, anchor, also }`; the output is a json row
per case carrying the before and after rectangles, the visible column widths, the row's
scroll position, and the console errors since the goto. It lives in the session scratchpad
(`navstab-measure.mjs`) with the case files beside it, and the raw rows are in the task dir:
[`/framework/ai/2026-09-05/nav-stability/`](/framework/ai/2026-09-05/nav-stability/).

**Zero console errors on every case, at both widths.**
