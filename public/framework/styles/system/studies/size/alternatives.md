# What was tried and refuted

Three candidates were injected over the same 20 pages, at the same four widths, by the same
script. Only the shape of the `:root` block changed between runs.

## 1. One ramp, fixed multipliers — refuted

The owner's hypothesis in its purest form: one width ramp, and padding, gap and rhythm are
fixed fractions of it.

```css
--step: clamp(var(--size), 2.6cqi - 1.1 * var(--size), var(--size) * 4);
--pad:  var(--step);
--gap:  calc(var(--step) * 0.66);
--flow: calc(var(--step) * 0.78);
```

The multipliers are tuned to land on today's 3440 numbers, and they do — median gap 20.7px
against 20.8px, rhythm 49.3px against 48.6px. Everywhere else it collapses:

| median over 20 pages | 400 | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| rhythm today | 25.2px | 28.8px | 38.4px | 48.6px |
| rhythm, one ramp | 10.1px | 13.5px | 25.2px | 49.3px |
| gap today | 6.7px | 7.9px | 12.2px | 22.1px |
| gap, one ramp | 4.6px | 6.0px | 10.6px | 20.7px |

**Why it cannot work.** The three quantities do not grow at the same rate, on purpose.
Between 400 and 3440 padding grows 5.0×, gap 3.3× and rhythm 1.9× — padding runs from a 1em
floor to a 4em cap, rhythm from 2em to 3em. One ramp with constant multipliers has exactly one
growth rate, so tuning it to 3440 halves the paragraph rhythm at 1280 and at 400. Their ratio
is 1 : 1 : 2 at 400 and 1 : 0.66 : 0.78 at 3440; there is no pair of constants that is both.

The rhythm cap is the reason it is not a bug to fix: a paragraph gap past about two lines stops
reading as breathing and starts reading as a section break, so rhythm has to stop growing while
padding keeps going.

## 2. `--size` written as an em — refuted

The literal form in the ask was `.size-small { --size: .75em }`. An em is a length, and CSS
cannot multiply a percentage or a `cqi` term by a length, so an em-valued `--size` can only move
a clamp's floor and its cap — never the fluid middle between them. The middle is where 1280
lives. Measured on 5 pages, the level word applied to the page root:

| level | gap @1280 | rhythm @1280 | gap @3440 | rhythm @3440 |
|---|---|---|---|---|
| regular | 9.0px | 28.2px | 25.3px | 46.2px |
| `--size: 0.75` (unitless) | 6.8px | 21.6px | 19.0px | 36.5px |
| `--size: 0.75em` (a length) | 8.8px | **28.2px** | 19.0px | 36.5px |

The em form changes the rhythm at 1280 by **0%** and the gap by 2%, then works perfectly at
3440. A level word that does nothing on a laptop and everything on a monitor is worse than no
level word. Unitless is the working form of the same idea, and `.size-small { --size: 0.75 }`
is one character shorter.

## 3. Does it compound?

If `--size` set a font size instead of multiplying a ramp, nesting would square it, and a
paragraph three boxes deep would be unreadable. The same worry applies to writing type in
container units. Both were measured at 3440, three containers deep, in boxes of 960 / 550 /
308px:

| | depth 1 | depth 2 | depth 3 |
|---|---|---|---|
| reading text, the candidate | 18px | 18px | 18px |
| reading text, if type took `cqi` | 18px | 17.5px | **12px** |
| padding, the candidate | 21.8px | 18px | 18px |

The candidate holds: type comes from the root clamp only, so it is identical at every depth,
while padding follows each box's own width and falls to its floor as the boxes get narrower.
The `cqi` arm is the mistake this rules out — 12px of body text inside a rail, with nothing
thrown and no overflow to notice.

**The one exception.** Display type — a hero headline, a big number, the `Aa` on the study
page — is decoration, not reading, and may take `cqi`. It is allowed to shrink with its box
because nobody reads a paragraph of it.

## What CSS cannot fix, and the layout rules must

If type ramps with the viewport only, then a one-column prose layout dropped into a 300px column
at 3440 renders at 18px — about sixteen characters a line, unreadable as prose no matter what
the spacing does. That is correct behaviour and not a token's problem: the fix is that the layout
either stacks or refuses, which is exactly the case LayoutRules exist for. Shrinking the type to
fit would be the 12px-in-a-rail mistake wearing a different hat.

## The fourth system: the columns host

`core/Page/Page.css` gives the columns host its own pads, written in `cqi` against the row. They
were measured against the candidate's `--pad` in the same box, on the same page, at the same
moment:

| | 1280 | 3440 |
|---|---|---|
| `--page-column-pad-x` | 15.4px | 32.4px |
| the candidate's `--pad` | 15.0px | 32.8px |

Within 2.6% and 1.2%. The columns host is not a fourth system — it is the same shape written
twice. It keeps its two scoped tokens because a column gutter is deliberately tighter than a page
inset, but they should be written from `--pad` rather than from their own clamp, and the vertical
one is not a constant fraction of the horizontal one (0.68 at 1280, 0.50 at 3440), so it stays its
own line.

## Method

`scratchpad/size-standard/size-probe.mjs`, headless Chromium at `deviceScaleFactor: 1`, one
private server on port 8099. Each candidate is injected with `page.addStyleTag`, which lands
outside every `@layer`, so it outranks framework.css without editing it. Per page: every visible
element inside the active page root contributes its non-zero padding, its non-zero gap if it is a
flex or grid box, and its non-zero top margin if it has a previous sibling; the page's number is
the median of each, and the table's number is the median of the twenty.
