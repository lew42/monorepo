# Layouts — the record

Built 2026-09-05 from the owner's brief. Every verdict here, with what was measured.

## Why numbered

> "let's create a layout system, where layout 1.\* are 1 column layouts. layout 2.\* are
> 2-column, 3.\* 3-column, etc." — the owner, 2026-09-05

The number is **how many columns the layout has at its widest**, and the word after the dot is
**how the room is divided**. Two reasons that ordering is the right one:

1. **Column count is the first thing a person actually decides.** "How many columns?" comes
   before "what ratio?" every time, and the vocabularies that already exist here are organised
   the other way round — `styles/layouts/` groups by *purpose* (docs, dashboard, chat) and
   `styles/layouts/cols/` by *ratio*. Neither answers "show me everything that is three
   columns".
2. **It gives every layout a name you can say and a url that matches it.** `2.golden` is
   `/imagine/layouts/2/golden/`. Nothing has to be looked up.

`4.*` is "four **or more**" on purpose. Past three tracks the honest question stops being a
count — `4.wall` is in there precisely because it does not have one, and putting it under a
number is what makes the point land.

## Why chips instead of pages

The brief asked for permutations of **distribution, padding, background colour and navigation
type**. The cross product is 18 × 3 × 5 × 6 = **1,620 combinations**. As pages that is absurd;
as chips it is four controls on a card you are already reading.

So: **one page per distribution, and everything else is a chip.** Colour is permuted *with*
layout exactly as the owner asked — every entry can be seen on all five surfaces without a
second page — and the reader compares in place rather than by navigating.

**The chips write nothing.** Not to `localStorage`, not to the url (the night's rule 4). A card
whose chips have moved shows a **modified** mark and a **reset** chip in its own intro column,
so a reader three chips deep is never quietly looking at something other than the base example.
The cost is that a state cannot be linked to; that is the trade the rule makes, and it is the
right one for a catalogue whose whole job is to show a base example.

## What this is to the approved five, and to `styles/layouts/`

**It is the gate's catalogue, not a sixth layout.**
[The approved set](/imagine/design/layout/approved/) is five *whole-page shapes* — rail +
content, docs three-region, columns row, tile wall, solo — that a page picks by name, and a
sixth needs the owner. This realm is one level down: it names the ways an **area** is divided,
which is what those five are built out of. Every entry says which existing word it compiles to
(`.cols.half`, `.cols.main-aside`, `.cols-row.cols-golden`, `.wall`, `.basis` + `.flex-1`, a
grid inside a grid track), and there is not one arrangement here that asks for a new one.

Same for [`styles/layouts/`](/framework/styles/layouts/), which owns the real arrangements as
class strings, and [`styles/layouts/cols/`](/framework/styles/layouts/cols/), which owns the
two- and three-column distribution words. **This system organises them; it does not replace
them.** It defines no layout of its own: every arrangement is inline declarations written from
the entry's `rules` object, which is the same object the readout column prints.

## The 3-column card

> "the center column is a card itself, a demo, responsive viewport, or a section or layout …
> on the left we have a small title + intro and maybe some controls. on the right, we have some
> readouts, metrics, feedback, config" — the owner

Built once, as `LayoutsCard` with three static parts, and used for all 18 entries and all 18
full-screen pages. Measured at 3440 on `/imagine/layouts/2/golden/`: card **3342px**, intro
**356**, stage **2517**, readouts **421**; the golden tracks inside it read **1492 / 922**, a
ratio of 1.618.

**The floor is 52rem** — the same one `styles/layouts/cols/`'s three-track word carries, because
this *is* a three-track row. Under it the three columns become three bands. At 1280 inside the
columns row the number-page column is ~610px, so the card stacks there; the full-screen page
(~1050px at 1280) is where the three columns come back. That is a real cost and it is written
down rather than hidden: the alternative was a card that squeezes three tracks into 610px, which
is the failure mode the layout skill's Q2 exists to prevent.

**Related, not repeated.** Several cards on one page share the card, the chips and the sample
boxes; one line of CSS is different each time, and a rule between them makes the difference
legible as you scroll — the owner's "as you scroll from one to the next, you could see the
relation".

## Rows in columns, and scroll sections

Three entries answer the brief's fourth deliverable:

- **`3.rows-in-columns`** — three columns, the third split into two rows. Right when one column
  carries two unrelated things of different weight (a preview above its properties).
- **`4.quad`** — two columns each split into two rows, so the rows can be different heights,
  which four equal tracks can never be.
- **`3.scroll`** — three columns where only the middle one scrolls, in snapping sections, while
  the rails stay. Measured at 1280 full screen: tracks **137 / 461 / 137**, the centre's
  `scrollHeight` **323** against a `clientHeight` of **215** — it really scrolls.

A scrollport here is a **decision, not a side effect** (the owner, 2026-08-19): the entry's
whole subject is a column that scrolls while its neighbours stay, so it is given a height on
purpose and its own caption says so.

## Takeover, and the owner's crumb question

> "when we use 'takeover', especially on 3440, we have a lot of room... will the breadcrumbs
> always be there? what if you didn't want that?"

**No — a chip hides them.** Every entry has a full-screen page at its own url (`width: "full"`,
core's own word), and every full-screen page carries a bar that is part of the layout rather
than part of the chrome: **previous · where you are (7 of 18) · next · back to the number · the
crumb switch**. It is sticky to the top of the column body, so a page of any height keeps it.

Why a bar at all, given the crumb strip exists: at 3440 the crumb strip is a thin line 1200px
away from where the reader is looking, and it walks *up* the tree — it cannot take you sideways
to the next layout. Previous/next walk the flat catalogue across all four numbers, so a reader
clicks through all 18 full-screen layouts without leaving full screen. Verified headless at
3440: `2/golden/` → `2/main-aside/` → `2/fixed-fluid/` and back, url, title and count correct
at each step.

**The switch is one class on `<body>`.** `.page-columns-bar` belongs to the columns *host*
(`/imagine/`, four levels up), so a rule in `@layer util` — which out-ranks core's own
`@layer theme` at any specificity — is the whole mechanism. It is applied on `activated()` and
cleared on `deactivated()`, so the choice survives clicking next/previous and **cannot** be
carried into another realm. Verified: hide on `3/scroll/`, click back to `3/`, then navigate to
`/imagine/team/` — the strip is 40px again and `<body>` has no class.

**The way back when they are hidden** is the bar itself, and the page says so in a line under
the card that changes with the switch.

## Measured, and what it cost

| what | before | after |
| --- | --- | --- |
| a part named `LayoutsPair` | wore `.layouts-pair`; its toggle, its pair and its explanation each became a 50% track and the demo laid out sideways | renamed `LayoutsIdea`; nothing thrown either way |
| the surface chip | `card` (a hairline) measured 259px tracks, `dark` (none) 260px — a chip moving what it does not name | every surface carries a 1px border, transparent where it does not show; 259 / 259 |
| a layout beside a rail | `flex: 1 1 auto` makes a percentage basis circular — the browser falls back to content size | `flex: 1 1 0`; the width comes from the flex line, which is definite |
| the readout for a stacked row | "481px · 481px" inside a 481px layout — reads as a broken measurement | it now says *on 2 lines — under the layout's stacking floor*, which is the layout keeping its promise |
| `pre` colour | framework paints every `pre` with `--code-ink`, which lew42 sets light for its dark `--code-bg` — light grey on a light grey box | `color: var(--ink)`; the font size and weight are left to the theme, which wins at (0,2,0) anyway |

Zero console errors at **400 / 1280 / 1920 / 3440** on the hub, all four number pages and two
full-screen pages; no document overflow, no framed box or text at x:0, no layout overflowing its
own frame, at any of the four.

## Open

- **A shared card width across the columns row.** At 1280 the card stacks inside the row and is
  three columns full screen. Closing the hub column gives it back; a word that says "this column
  wants the row" without `full`'s ancestor collapse would be better, and that is a core columns
  question (`fill` vs `full`), not this realm's.
- **`5.*` and beyond.** `4.*` is "four or more" today. If a real five-track layout earns a name,
  it is a directory and one call — but the count stops being the useful axis around four, which
  is the argument for leaving it.
- **The viewport chip simulates width, not `em`.** Every arrangement here is percentage or `fr`
  arithmetic off its parent, so a 3440px box shown at 18% divides exactly as a 3440px screen
  would — with the one exception `styles/layouts/cols/` already measured: `rem` is 16px in both
  and `em` is the body's viewport clamp, which does not follow a simulated width. The caption
  says which width and at what scale, every time; the honest fix is a real 3440 window.
