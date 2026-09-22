# Decisions — what these three layouts settled, and what they measured it against

Built 2026-09-17, in one task: [`ai/2026-09-17/practice-layouts/`](/framework/ai/2026-09-17/practice-layouts/),
which holds every number on this page in its log.

## The brief, in one line

The owner, the same day: *"we need a better system to get a small number of robust layouts…
Practice with big layouts that span 3440. That are also responsive."* And the diagnosis that
came with it: *"the layouts are too complex and they're not polished enough. There's a lot of
just random blank spaces. There's just a lot of things that don't line up properly."*

So: three, not ten. Whole pages, not fragments. Real content, not lorem. And polish measured
rather than asserted.

## Settled

**Three layouts, two ids.** The Workbench and the Reader are both
[`3-holy-grail`](/layouts/3-holy-grail/); the Catalog is [`1-bands`](/layouts/1-bands/). Sharing
an id is not a thing to hide — an id names how the room is divided and nothing else, so a
workbench and an article page really are one layout wearing different content. The practice
index says so on its own front page.

**None of them is a new approved layout.** Each is an instance of one of
[the approved five](/layouts/doc/studies/approved/): Workbench and Reader are shape 2 (Docs
three-region), Catalog is shape 1 (the page grid), and all three put shape 4 (Tile wall)
inside. The set stays closed.

**The room was measured before anything was written.** No sidebar takes width on this site at
any of the four widths (the `.sidebar` is a drawer, 0px), so `.pages` is the whole viewport and
the page grid's `wide` track measures **3260px at 3440** (x:90), 1751 at 1920, 1178 at 1280
(x:51) and 329 at 400. 3260 / 3440 = **0.948**, so `wide` alone clears the "use ≥ 0.9 of the
screen" bar without any framed box having to bleed.

**Wall floors are `rem`, never `em`.** `html` declares no font-size on this site, so `1rem` is a
flat 16px at every width, while `1em` rides the body clamp (14 → 18px). A wrap floor written in
`em` wraps at a different real width on every screen.

**Responsive is a container query.** Each layout root declares
`container-type: inline-size; container-name: practice`, and every breakpoint asks `practice`
rather than the viewport — so the layouts stay right if one is ever dropped into a column, a
panel or a frame. On the Catalog every band is its own container, because a band is edge to
edge and therefore measures the viewport anyway.

**A nav item's height is a `min-height`, not padding.** That is framework.css's own control
grammar, and it is what lets the rail have a comfortable hit target while obeying the owner's
box rule — no background, so no padding, so the first letter of every link sits on exactly the
axis the brand above it and the title beside it sit on.

**A selected state is never a box that only exists when it is on.** Every tile carries a
transparent 1px border at rest and the selected one colours it; the wall does not move.

## Measured

**The count and the column width are chosen together.** This is the whole answer to "random
blank space" inside a wall.

| wall | items | 400 | 1280 | 1920 | 3440 | holes |
|---|---|---|---|---|---|---|
| Workbench tiles (`--column: 15rem`) | 24 | 1 | 3 | 4 | 8 | none — 24 divides all four |
| Catalog cards (`--column: 31rem`) | 12 | 1 | 2 | 3 | 6 | none — 12 divides all four |
| Catalog footer (fixed count) | 6 | 1 | 3 | 6 | 6 | none |
| the fold's nine answers (fixed count) | 9 | 1 | 3 | 3 | 3 | none |

`--column: 16rem` was the first try for the tiles and it fell to 3 tracks at 1920 by about
20px, making them 348px wide for nothing. 15rem gets 4. A count with few divisors cannot be
made to work at all: `framework/`'s thirteen modules were the first candidate for the wall, and
13 is prime.

**When the count is fixed and small, write the count.** Under `auto-fill` the nine answers
landed on 2 columns at 1280 and 4 at 1920 — a short last row at both, for no reason. They are
`repeat(3, …)` or one column now.

**`--gutter-x` re-resolves against the element's own font-size.** It is `clamp(2em, 4%, 5em)`,
an inherited token, and the Catalog's footer band carried `font-size: 0.9em` — so its gutter
came out **81px against every other band's 90px** at 3440. Nine pixels, invisible one band at a
time and obvious down the left edge of the page. The band keeps the page's font size now; its
contents are what shrink.

**`--subtle` is not contrasty enough on a painted box.** The lew42 skin's `#6a6a6a` measures
4.83:1 on the page's own floor — over AA — but only **4.0:1** on the `--fill-a04` this module
paints its tiles, cards, notes and hero with. This module declares one token instead,
`--std-practice-quiet: color-mix(in srgb, var(--ink) 85%, var(--surface))`, measured live at
**5.97:1** on the page floor, **5.46:1** on `--fill-a04`, **4.97:1** on `--fill-a08`, and 9.8:1
on the dark floor in dark mode.

**Every colour pair on the three pages, read back off the composited pixels:**

| pair | ratio |
|---|---|
| quiet ink on the page floor | 5.99:1 |
| quiet ink on `--fill-a04` (tiles, cards, notes) | 5.02–5.49:1 |
| `--ink` on `--fill-a04` (panel body, tile names) | 7.88–8.62:1 |
| `--ink` on `--prim` (the brand mark, the hero button) | **7.75:1** |
| `--prim-ink` on the page floor (the current contents link) | 4.64:1 |
| `--prim` as a word on white | 2.25:1 — **never used as text** anywhere here |

**The instrument found its own defect first.** The contrast probe read Chromium's
`color(srgb 0.36 0.36 0.36)` — the form a `color-mix()` result comes back in, channels 0–1 —
as an `rgb()` triple, and every ratio on the page came back roughly double. Fixed before any
verdict was taken from it.

## Left, with the reason

- **The three layouts are not in [`/layouts/browse/`](/layouts/browse/) yet.** A critic was
  editing that module during this task and two agents in one file is the rule nobody breaks
  here. The three `items.json` rows and the 400 / 1920 / 3440 shots are ready, named the way
  browse names its own, in `shots/`; the mastermind adds them once the critic lands.
- **Nobody has approved these.** They are practice instances, and whether any of them earns a
  place beside [the approved five](/layouts/doc/studies/approved/) is the owner's call by
  name, never an agent's.
- **Dark mode is computed, not photographed.** The quiet token's dark-mode ratios above are
  arithmetic on the theme's declared values; the shots are all light mode.
- **The rail is proven for eight links.** It wraps to a strip under 44rem of layout and is not
  designed to hold twenty; a rail that needs to scroll is a different component, and a
  scrollbar is a decision, not a side effect.

## Revised by the critic's pass, 2026-09-17

Four decisions on this page were measured again at six widths and changed. Nothing above is
deleted — it is the record of what was believed at the time, and the numbers that overturned it
are on [the critic's page](/layouts/practice/doc/critique/).

- **The two walls no longer name a `--column`.** They name their COUNT, one container query
  each. An `auto-fill` column width cannot be told which counts are allowed, and both walls
  landed on counts that do not divide their item count over hundreds of pixels of real widths.
- **The Reader's margin is one column, not one, two or four**, and the whole layout centres
  above the width its three tracks need. Spending the leftover on margin WIDTH produced 905px
  and 1,483px of dead ground; spending it on page gutters does not.
- **The rail becomes a column at 48rem, not 44rem**, and the Workbench's panel floor is 17rem,
  not 20rem. Both numbers exist so the tile wall never loses a column when a region appears.
- **The Workbench's panel sits inside a side track.** `position: sticky` on the grid item itself
  could never fire under `align-items: start`.
