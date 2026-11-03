# Sections — the decisions (2026-09-05)

## What this is to the realms it was built on

**`/imagine/layouts/` 3.\* and `LayoutsCard`.** That realm owns *arrangement* — every way a
page divides its room, numbered, each entry one object in `system.js`. Its `LayoutsCard` is
one fixed three-column shape (intro | stage | readouts) whose job is to *present* an entry.

**A section is that card made a first-class, stackable thing.** Same technique — a row of
columns, chips down one side, nothing remembered — but the shape is a variable: 2, 3 or 4
columns, six distributions, five colours on each of three surfaces, a head and a foot, and a
stack above it. `LayoutsCard` presents a layout; `SectionsBand` *is* one, and pages are built
out of it.

**To paging's vocabulary.** The five colours are imported from `/imagine/paging/blocks.js`
(`SURFACES`), not copied — that file imports nothing, so it costs no stylesheet. The *paint*
is restated in `sections.css`, because loading `paging.css` would put that realm's stylesheet
on every page in this one; the same trade `LayoutsCard` made with its `press()` helper.
Paging's `room` / `arrangement` / `skin` are about **a page**; a section's words are about
**one band inside a page**, and the two lists deliberately do not merge.

**To `/framework/styles/layouts/cols/`.** The six distribution names are that sheet's names.
The mechanism is different — grid tracks rather than flex bases — because a section needs a
head and a foot that span every column, and `grid-column: 1 / -1` says that in one line. The
two agree on the parts that matter: the rail is `em` (it holds type, and type here is a
viewport clamp, so 16em is the same number of characters at 400 and at 3440), the aside cap is
`rem` (it is a place), and every track has a floor — `minmax(0, …)`.

## Sticky, measured

**The decision: the cell stretches and paints; a `.sections-hold` inside it is what sticks.**

The obvious shape is `position: sticky; align-self: start` on the column itself. It works, and
it costs the frame: `align-self: start` shrinks the grid cell to its content, so a 260px
sidebar in a 2,100px section paints 260px of colour and 1,840px of nothing — and the frame is
the whole point of the realm. Putting the sticky box *inside* the cell keeps both: the cell
stretches (grid's default) and paints; the box stays.

It also answers "confined to their section" for free. A sticky box's containing block is its
parent, so the hold cannot leave the cell, and the cell ends where the section ends. Nothing
watches the scroll; there is no JavaScript in it at all.

**Measured at 1920** (`ui-test`, the hub, section 8, whose middle is 1.4 screens tall; the
scrolling box is the column, whose top edge is at y = 43):

| scroll position | the section's top | the left column's hold |
| --- | --- | --- |
| section entering | +3 | 51 — not stuck yet, sitting where it starts |
| 700px in | −657 | **43** — stuck to the top of the scrolling box |
| 1,500px in | −1457 | **43** — unchanged |
| the next section | −2445 (bottom at −281) | −790 — it left with its own section |

At that last position the **next** section's hold reads 43: the handover happened by itself.
The same numbers hold at 1280 (40 / 40) and 3440 (48 / 48). At 400 the section stacks, sticky
stands down, and the hold scrolls with the page — which is correct.

**The inner scroll.** A sidebar taller than the screen is capped at one screen, its body
scrolls, and a `.sections-pin` footer stays because flex put it last and told it not to
shrink. Measured: the hold is 1,037px (exactly the measured screen), the body is 1,344px of
content in a 989px box, and the pin's rect is byte-identical at inner scroll 0, 300 and 355.

**`--sections-screen` is measured, not `100dvh`.** Under a columns host the box that scrolls
is the *column*, not the window, and it is shorter — a `100dvh` cap would put the pinned
footer below the fold. The band walks up to its nearest scrolling ancestor and writes that
height; `100dvh` remains the stylesheet's fallback, which is right on a page with no column
around it.

A **screen** section (`.sections-screen`, `/imagine/sections/full/`) needs a different number:
the room left after the chrome its scroller has above and below it. A column has a head bar
and a prose inset, and `clientHeight` counts both — sized from it, the full-screen page
overflowed its column by 90px. The correction is geometric (the band's own top, and whatever
sits after it), so re-measuring on every resize lands on the same number instead of
oscillating. After it: the column's `scrollHeight` equals its `clientHeight` — the page does
not scroll, only the middle does.

## The four-column answer

Four equal tracks give the eye nowhere to land, and in a 1,100px row each one is 270px wide.
Two moves, and they are both in the shipped default:

1. **One weighted column, three supports** — `fixed-fluid`: the middle is the only fluid
   track and every other column is fixed at the rail width. The frame is exactly symmetric and
   the eye has one place to go.
2. **Four columns become two at 70rem, not four slivers.** The stack floor is 52rem for
   every count; four columns get an extra step above it, so the pairs survive one width
   longer than the row does.

## The stack floor, and why there is only one

52rem, the same floor `.cols-thirds` carries, in `rem` because `rem` is 16px at every viewport
while `em` here is a viewport clamp. A per-column-count floor (34 / 52 / 70) would need the
sticky, seam, menu and inner-scroll rules written three times, gated by `.sections-n2` /
`n3` / `n4`, for a difference nobody would notice: a two-column section at 700px is fine
either way. One floor, one block of rules, and four columns get the one extra step that
actually earns itself.

⚠ **A container query block is still ordinary CSS.** `.sections-hold { position: static }`
inside the query loses to `.sections-stuck .sections-hold` outside it, and the sidebar stayed
sticky at 400 with nothing thrown. The stacking rules use the same selectors the words use.

## The `bleed` workaround, and the proposal

`framework.css` (util layer) declares `:first-child { margin-top: 0 }` and
`:last-child { margin-bottom: 0 }`, deliberately, to collapse a container's outer gap.
`Page.css` (theme layer) declares that a bled block in a column spends the column's inset back:
`margin-block-start: calc(var(--page-column-pad-y) * -1)`.

A util rule beats a theme rule at any specificity. So for a bled block that is its column's
only child — which every stack of sections is — the **block half of `bleed` is silently dead**:
measured, `margin-inline` came out at −30.72px and `margin-top` at 0px, leaving a 15px strip of
column floor above and below a full-screen section. The rule matched; it simply lost.

This realm restates Page.css's own two declarations in `@layer util`, scoped to
`.sections-stack.bleed`. **The upstream fix is a proposal, not done here** (`core/` and
`framework.css` are outside this task's fence): either move Page.css's two lines into `util`
beside the rule they lose to, or narrow `framework.css` to `:first-child:not(.bleed)`. Every
other realm that bleeds a single block inside a column has the same 15px strip today.

## Other decisions

- **`overflow: clip`, never `hidden`, on a card section.** Both clip the rounded corners; only
  `hidden` makes the box a scroll container, and a sticky sidebar inside a scroll container
  that never scrolls can never move. Verified: sticky still works inside a card frame.
- **No gutter inside a section.** The frame *is* the absence of a gutter — head, sides and
  foot butting the middle with hairline seams is what makes the middle read as framed. A
  section that wants separated columns uses different colours, not a gap. One idea, one word.
- **The track list is computed in JavaScript.** Six distributions x three column counts is 18
  stylesheet rules for what is four lines of arithmetic, and a chip changes it live. It is
  written as `--sections-cols` (inline) and read as
  `var(--sections-tracks, var(--sections-cols, …))`, so the stacking queries can override it —
  an inline `grid-template-columns` would out-rank any stylesheet.
- **Nothing is remembered.** A refresh puts every section back to what its page declared. A
  changed section shows a small mark and a reset chip beside it (the 2026-09-05 rule 4).
- **Two nav behaviours, two names** (the 2026-09-05 stable/dynamic ruling). `switch` keeps
  every panel in the DOM in one grid cell with the unread ones `visibility: hidden` — hidden
  but still measured — so the middle is always its tallest panel's height and a click moves
  nothing. Measured: the side, middle, aside and head offsets and the 476px band height are
  identical across three panels. `launch` opens a fourth column and everything shifts left; it
  says so on the page.

## Proposals (in the task log, not done here)

1. **A "Sections" entry on the layouts hub** — `/imagine/layouts/` numbers arrangements; a
   section is the stackable thing those arrangements go inside. One line in `system.js`'s
   catalogue or one card on the hub, pointing at `/imagine/sections/`.
2. **A "Next door" link on the paging rail** — this realm speaks paging's colour vocabulary
   and answers the layout half of the question the paging realm answers for pages.
3. **The `bleed` layer fix**, above.

## Deliberately not doing yet

- **A `space` chip on the hub's spacing section.** The three levels are shown side by side
  instead, which needs no control; the live chip exists on `/imagine/sections/stack/`, where a
  reader has thirteen sections to try it against.
- **Sections inside `paging`'s stage.** A section is a page-level band; wiring it in as a
  paging `content` kind is the mastermind's call, not this task's fence.
- **A per-column-count stack floor.** See above — one floor, on purpose.
