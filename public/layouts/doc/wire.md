# Wire — the drawing spec

A **wire** is a layout with the content taken out: boxes with a background, a hairline round
every section, bars where the words would be, a crossed rectangle where a picture would be, a
pill where a button would be. It is JSON, and `Layout.js` draws it as real flex and real grid at
a real viewport width — so the drawing does not *illustrate* the layout, it *is* the layout.

Look at one first: every card on [/layouts/](/layouts/) is a wire drawn at 1920, and every
layout's own page draws the same wire three times, at 400, 1920 and 3440.

## Writing one from a screenshot

This is the job in wave 2: open a screenshot of a real website, and write the wire that produces
the same picture with the content removed. Four steps.

1. **Down the page first.** List the full-width bands from top to bottom — header, hero,
   sections, footer. Those are the root's `kids`.
2. **Then across.** For each band that has columns, give it `"dir": "row"` and list its columns
   as `kids`.
3. **Give each piece a role.** One word from the fixed list below. The role decides the paint and
   what filler goes inside, so this is the only place a colour or a texture is chosen.
4. **Size them.** A height going down (`"h": "4em"`), a share or a measurement going across
   (`"w": 1` or `"w": "16em"`). Leave the height off the one band that should take the leftover.

Nothing else is required. A wire with only roles and heights already draws.

## A whole example

This is `2-sidebar` — a header, a row of two columns with the narrow one measured, and a footer.

```json
{
  "role": "page",
  "kids": [
    { "role": "header", "h": "4em" },
    { "role": "main", "dir": "row", "floor": "40rem", "kids": [
      { "role": "aside", "w": "16em" },
      { "role": "main",  "w": 1, "lines": 8 }
    ] },
    { "role": "footer", "h": "5em" }
  ]
}
```

Read it out loud: a page, holding a header four ems tall, a middle that takes what is left and
divides it into a row, whose first column is a measured sixteen ems and whose second takes the
rest — and the row stacks below 40rem. Then a footer.

## The roles — the whole list

Use no other word. An unknown role is drawn as `main`.

| role | what it is | what it draws inside |
|---|---|---|
| `page` | the root of every wire | its children, and the page's own padding |
| `header` | the bar across the top | a mark on the left, four links on the right |
| `nav` | a column or row of navigation | short bars |
| `hero` | the first band, the big claim | a headline block, two lines, a button |
| `main` | the content | full-width text bars |
| `aside` | a supporting column | short bars |
| `footer` | the bar across the bottom | short bars |
| `cards` | a row or wall of cards | `n` cards, or the `kids` you list |
| `card` | one card | a picture, then a heading and two lines |
| `text` | a run of text anywhere | text bars |
| `image` | a picture | a crossed rectangle |
| `button` | a button | a filled pill |

## Every field

All optional except `role`.

| field | value | what it does |
|---|---|---|
| `role` | one word from the table | what this box is |
| `dir` | `"row"` or `"col"` | how its children are laid out. Default `"col"` — they stack |
| `kids` | a list of nodes | its children. A box with `kids` is a container |
| `w` | a number, or a CSS length | its size **across a row**. A number is a share of the leftover; a length is a measured track. Default `1` |
| `h` | a CSS length | its size **down a column**. Leave it off and the box takes what is left |
| `floor` | a CSS length, or `"none"` | the width below which this row stacks. Default `"34rem"`; `"none"` never stacks |
| `stack` | a number | how many columns the row falls **to** below its floor. Default `1` |
| `center` | `true` | centre this row's children instead of stretching them — how `1-centered` is drawn |
| `tone` | `none` `a04` `a08` `a16` `surface` | repaint one box without inventing a role for it |
| `fill` | `text` `links` `topbar` `hero` `card` `cards` `none` | override the role's own filler |
| `lines` | a number | how many text bars. Default 6 |
| `n` | a number | how many cards a `cards` box draws. Default 3 |
| `column` | a CSS length | makes a `cards` box a **wall**: it names a column width and the room counts the tracks |
| `columns` | a CSS length | makes a text box a **newspaper**: the bars flow through as many columns as fit |
| `scroll` | `true` | draw the scrollbar this box would have — the one behaviour a still picture cannot show |

## The three things that catch people out

**A row stacks by itself.** You do not write a media query and there is nowhere to put one. Every
child of a row carries a term that turns its basis into a number bigger than the row once the row
is under `floor`, so every child wraps onto its own line. Set `floor` to the width at which the
real site stacks — roughly the sum of its columns' natural widths — and the drawing at 400 will
show the stack without you drawing it twice.

**A row does not have to fall all the way to one.** Real footers often keep two columns on a
phone rather than becoming a list eight items long — notion.com's does, and drawing it as a stack
told a lie about the one thing the drawing was for. `"stack": 2` on the row is the fix: below the
floor each child's basis becomes just under half the line, so the row breaks two-up instead of
one-up. Any number works. Measured 2026-09-08: a four-column footer with `"floor": "34rem",
"stack": 2` draws four across at 1920 and two-by-two at 400.

⚠ `stack` only bites on children sized by a **share** (`"w": 1`). A child with a measured width
(`"w": "16em"`) keeps that width below the floor, because the basis is a `max()` of the two and
the measurement wins — which is right for a rail and wrong for nothing we have met yet.

**Lengths are `em`, and `em` is 16px inside a drawing.** The drawing pins its own font size, so
`16em` is 256px in every drawing at every screen size. Write the site's real measurements; they
will be right.

**A drawing taller than its frame is clipped, on purpose.** Real pages are taller than the
window, and a wire that runs past the bottom is telling the truth about that. If you did not mean
it, a height is too big somewhere.

## What a wire cannot draw, and why that is the right answer

Thirty-two real sites were redrawn from screenshots on 2026-09-08. Five things the drawers
could not express came back; one was a missing field and is now `stack`, above. **The other four
are not missing fields — they are things a content-free still picture is not for.** Write the
nearest true shape, and let the site's own **tag** carry the rest.

- **A column that leaves the screen.** gitlab.com's 240px sidebar does not stack on a phone, it
  slides off-canvas behind a button; vercel.com simply deletes its hero's second column. A wire
  can stack a column or keep it; it has no word for *gone*. Draw the stack, and tag the site
  `drawer`. A reader who sees `2-sidebar` + `drawer` knows exactly what happens.
- **A row that scrolls sideways instead of wrapping.** figma.com's showcase is 2872px of cards
  inside a 1920px window; guardian.com's teasers have arrows. That is not a shape, it is an
  overflow *answer* — and the standard now has a word for it, [`carousel`](/layouts/tag/carousel/),
  a behaviour beside `split` and `stack`. Draw the row with `"scroll": true`, which puts the
  scrollbar in the picture, and tag it `carousel`.
- **Motion.** privy.com's logo strip is an infinite marquee; mocean.com pins its hero with
  JavaScript while you scroll. A still picture of a moving thing is a still picture. Draw the
  resting state.
- **Cards that overlap.** css-tricks.com fans its "popular this month" deck with negative
  margins. That is paint applied to a row, not a division of the room, and adding an `overlap`
  field would buy one site in forty-seven a decoration. Draw the row.

The rule behind all four: **a wire says how the room is divided.** If the thing you cannot draw
is not a division, it belongs in a tag, and the honest drawing is the one that shows the division
and nothing else.

## Where it is drawn

`Layout.js` — `new Layout({ wire, id }).frame(Layout.WIDTHS[1])` gives one drawing at 1920.
`Layout.WIDTHS` is the three the standard uses: 400 × 844, 1920 × 1080, 3440 × 1440 — the same
viewports a real site is screenshotted at, so a drawing and a photograph can sit side by side.
