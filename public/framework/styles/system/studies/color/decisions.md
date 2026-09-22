## The decisions — 2026-09-17, lighten/darken

### The six names are aliases, not new colours

The ask was for `--lighten-1/2/3` and `--darken-1/2/3`. The site already had exactly those
values under other names: `public/framework/framework.css`'s `:root` carries **`--shade-aNN`**
(black at an alpha — a darken) and **`--paper-aNN`** (white at an alpha — a lighten), four rungs
that double: `04 · 08 · 16 · 32`. So the six new tokens are declared as aliases —
`--lighten-1` *is* `--paper-a08`, `--darken-3` *is* `--shade-a32`, and so on. **Nothing existing
changed value, and no new colour was mixed.** A call site that says `--darken-2` and one that
says `--shade-a16` paint the identical pixel.

Three rungs, not the ladder's four. `a04` is a floor's worth — it is too quiet to read as a
*step*, which is what a lighten or a darken is for — and it stays available under its own name.

**When to reach for which.** `--fill-aNN` is the word you want most of the time: it flips with
the colour scheme, because elevation is lighter on both sides. Lighten and darken are for when
you are painting onto a ground of your own — a light grey card, a dark band, a photo — and you
already know which direction you mean; there the mode-aware word would go the wrong way half
the time.

### The accent token is `--prim`, not `--accent`

There is no `--accent` on this site. The accent is `--prim`, `#FF8F60`, which is
`hsl(18 100% 69%)` — so the two sliders start at hue 18 and saturation 100, and the lab writes
its own `--prim` and `--prim-ink` **on the lab element only**, so nothing leaks into the
sidebar or the rest of the app.

### What the study measured

Read live off the rendered pixels, not typed — `getComputedStyle` gives what the browser
resolved, `styles/stacks/stacks.js` composites the translucent step over the opaque ground,
WCAG 2 gives the ratio.

- **On white, lighten does nothing** (white over white is white). **On black, darken does
  nothing.** The tiles show this rather than claiming it.
- The site's `--ink` on white through darken 1·2·3: `#ebebeb` 8.8:1, `#d6d6d6` 7.3:1, `#adadad`
  4.7:1 — all three still carry body text. On black through lighten 1·2·3: `#141414` 1.7:1,
  `#292929` 1.4:1, `#525252` 1.3:1 — none of them do, because the ink is the light-mode ink.
  That is the lesson: **a ground you change is a ground whose ink you must re-choose.**
- **Saturation's effect on contrast is hue-dependent.** At the site's orange (hue 18) draining
  saturation from 100% to 0% moves the ratio on white by 0.0 — 2.2:1 either way. At hue 240 the
  same drain takes white from 4.5:1 (passes) to 2.6:1 (fails). The takeaway sentence at the top
  of the page computes which of those two cases you are looking at and rewrites as you drag.

### Rejected and noted

- **A lightness slider** was not added. Lightness is pinned at the accent's own 69% so that one
  thing changes at a time; adding it would make the five rungs stop being comparable.
- **`--column: 14em` for the wall was wrong.** This site's type scales with the viewport, so
  `14em` resolved to 182px at a 400 viewport and the wall put two 182px tiles side by side —
  narrower than the numbers inside them. A wrap floor is a real length: `14rem`. With that,
  400 gets one tile and 1280 and 3440 both get all five grounds in a single row.
- **The 2026-09-01 palette crawl was not cut.** It was the whole of this page until now; it
  moved intact to [`/framework/styles/system/studies/color/palette/`](/framework/styles/system/studies/color/palette/) so that
  level 1 is one screen. Its screenshots stayed in `shots/`.

## The polish pass — 2026-09-17

### The live sentence moved to sit under the sliders that write it

It used to open the page. That put it **923px above the two sliders** at 1280, 1,139px at
3440 and **2,073px at 400** — so dragging a slider rewrote a sentence the reader could not
see, and at 400 the rewrap shifted every box below it, the whole wall of grounds included,
by 42px. A control whose consequence is off screen is a control with no consequence.

It now sits directly under the two sliders, inside the lab. The page reads: the definition,
the wall (shown), what the cells say; then **The accent** — sliders, the sentence they write,
the five rungs.

**Residual, accepted:** at 400 the sentence is six lines for some hues and five for others,
and the five accent tiles under it still move one line (21px) when it changes. `min-height`
reserves five lines, which is exactly the tallest it gets at 1280 and above; reserving seven
would leave two lines of white on every wider screen. One line of movement, directly under
the finger, beats two lines of permanent white.

### The sentence is now true at every slider position

The old "draining the saturation changes nothing at this hue" branch compared the top rung
against the bottom one — and the rungs are *the slider's* saturation × 1, 0.75 … 0. With the
slider at 0 every rung is 0%, so they always agreed, and the page told a reader sitting at
**hue 240 — a blue** — to *"drag the hue slider round to a blue or a violet"*.

The claim is about the **hue**, so it is now computed at 100% and at 0% whatever the slider
says (`carries()`, `decides()`), and the closing suggestion names the nearest hue that
actually behaves differently (`nearest_deciding()`) instead of a hardcoded one. The half of
the sentence about what is on screen still comes off the rendered pixels, so it can never
disagree with the tiles under it.

### Five smaller things the press found

- **The record fold had no measure at all** — 3,342px paragraphs at 3440. Core caps a
  column's prose with `.page-column-prose > :is(p, h1…)`, direct children only, and
  `md.details` nests its markdown two levels down inside `.md-details-body`. Capped here on
  `.color-record`; the general fix is core's or `ext/markdown`'s.
- **A slider is a control, so it gets a control's size.** At the wall's full width each
  track ran 619px at 1280 and 1,670px at 3440 with its own value stranded at the far end.
  The row is capped at the measure now, and the basis is 14em so the two wrap at 400 rather
  than sharing a 376px line and leaving 60px of track for 360 degrees of hue.
- **`--measure` is `40em`, and an `em` is the element's own font size.** The takeaway is set
  at 1.15em, so its measure was 1.15× everyone else's and it ended 100px right of the slider
  row directly above it. The scale is named once (`--takeaway-scale`) and divided back out,
  and the two boxes now end on the same axis at all five widths (388 / 542 / 562 / 607 / 697).
- Captions took `margin-block-start`, not `padding` — a caption paints no background, and
  padding without one is the floating-in-midair case this page exists to name.
- The three-line sentence-long link to `palette/` became a short link plus plain text; a
  whole paragraph that happens to be underlined is not a link a reader can scan.

### Verified by hand, not by the page

Six of the page's own ratios were recomputed independently — composite first, then WCAG 2 —
against the lew42 theme's real ink (`#3f3f3f`, **not** framework.css's base `#1a1a1a`; that
mistake is what made the checker disagree on its first run). All six matched to the decimal:
white + darken 1 `#ebebeb` 8.8:1, mid gray + lighten 1 `#a2a2a2` 4.1:1, black + lighten 3
`#525252` 1.3:1, light gray + darken 3 `#9a9a9a` 3.7:1, and the accent as a ground at 4.7:1
for ink and 2.2:1 for white.
