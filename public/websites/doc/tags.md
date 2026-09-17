# The tags — the whole vocabulary, one line each

A tag is a word on a record that becomes a page: `/websites/tag/<slug>/` lists every site
carrying it. Tags are how you walk sideways through the corpus — you came for one site and
you leave having seen the five others that solve the same problem.

**Forty-seven sites use fifty-two words.** They are all here, grouped by what kind of thing
they say. The layout ids are defined at [`/layouts/`](/layouts/) and are only linked from
here — the encyclopedia is the one place a layout word gets its meaning.

## The rule for writing one

> **Write a tag when a reader would CLICK it to see other sites doing the same thing.**

That is the whole test, and three things fail it:

- **A number.** `max-width 1232`, `hamburger at 896` — a number can only ever match the one
  site that has it, so clicking it is a link to a page you are already on. The number itself
  is not lost: it stays in `responsive.breakpoints` and in the record's own paragraph, where
  it is read rather than clicked.
- **Something that happened during the capture.** `bot wall`, `cookie modal` — true of that
  afternoon, not of the site. These belong in `notes`, in a sentence, and every one of them
  is there.
- **A second spelling of a word already here.** `3-cards` when the standard defines
  `3-equal`, `centred at 1920` beside `max-width`, `left nav` beside `left`.

A tag ONE site carries is still worth writing if it is a real property — it is the word the
second site will match. The front page's filter row hides those (and the two or three so
common they filter nothing); [every tag](/websites/tag/) shows all of them.

## Layout ids — what shape the room is in

The id is `N-name`: N is how many columns the widest screen shows, the name says how the
room is divided. **[`/layouts/`](/layouts/) defines every one of these**; the count is how
many sites in this corpus carry it as a tag.

| id | sites | |
|---|---|---|
| [`1-flow`](/layouts/1-flow/) | 45 | one column, rows following each other |
| [`2-equal`](/layouts/2-equal/) | 15 | two columns sharing the room evenly |
| [`2-sidebar`](/layouts/2-sidebar/) | 15 | a narrow column beside a wide one |
| [`n-wall`](/layouts/n-wall/) | 12 | a column *width*, and the room counts the tracks |
| [`1-bands`](/layouts/1-bands/) | 11 | full-width sections, each painting its own background |
| [`1-centered`](/layouts/1-centered/) | 11 | one column with a ceiling, margins either side |
| [`3-equal`](/layouts/3-equal/) | 9 | three columns sharing evenly |
| [`3-holy-grail`](/layouts/3-holy-grail/) | 7 | narrow, wide, narrow |
| [`4-1`](/layouts/4-1/) | 4 | a mosaic: a fixed grid whose tiles are different sizes |

A record's `layout` key names one of these **per width** and its `sections` name them for
parts of the page; both are separate from this list. `3-cards`, `4-equal`, `card wall`,
`bento` and `mosaic` used to appear here and no longer do — the standard folded them into
`3-equal`, `n-wall` and `4-1`, because cards and mosaic are *paint*, not a division.

## Technique — what CSS made it

The screenshot cannot tell you this and the scan can. Written as the plain phrase, never as
an id: `2 column grid` (10) · `2 column flex` (5) · `3 column grid` (5) · `3 column flex` (4)
· `4 column grid` (3) · `float` (3) · `4 column flex` (1) · `6 column grid` (1) · `table` (1).

Two layouts that look identical can be built either way — that is exactly why the id is
CSS-agnostic and the technique is its own tag.

## Traits — how the arrangement is dressed

| tag | sites | what it says |
|---|---|---|
| `max-width` | 31 | the content stops growing at some width and CENTRES; the leftover becomes margin either side. The exact px is in that record's `notes` |
| `full-bleed` | 17 | at least one band paints edge to edge, ignoring the measure |
| `cards` | 11 | columns with their own background and padding |
| `dark` | 11 | a dark page, not a dark mode toggle |
| `left` · `right` | 10 · 10 | which side the supporting column sits on |
| `rail` | 9 | the side column is a fixed measurement, the same width on a phone and an ultrawide |
| `measure` | 12 | a ceiling on line length — about 40em, so a sentence stays readable |
| `mega footer` | 5 | a footer of several link columns, not one line |
| `toc` | 4 | a table of contents for the page you are on, as its own column |
| `fixed content width` | 2 | capped but NOT centred — the leftover piles up on one side |
| `fluid` | 2 | no cap at all: the text is as wide as the window |
| `gradient` · `minimal` · `no gap` · `overlapping cards` · `fluid type` · `logo marquee` | 1 each | one site so far; the word is here for the second |

## Behaviour — what it does when you move the window, or scroll

`hamburger` (25) — the nav collapses behind a menu button below some width; the width is in
`responsive.breakpoints`. `sticky header` (7) · `carousel` (7) · `drawer` (4) — a side column
slides in over the page rather than restacking · `sticky sidebar` (3) · `fixed sidebar` (1) —
it never scrolls at all · `scroll-pinned hero` (1) · `bottom toolbar` (1) · `layout switcher`
(1) — the SITE offers the reader four named layouts for its own front page (Ars Technica; the
only one in the corpus).

## Kind — what sort of site it is

Every record carries its `category` as a tag too, so the wall can be filtered by it:
`marketing` (13) · `blog` (8) · `documentation` (8) · `news` (5) · `shop` (5) · `app` (4) ·
`system` (4, a design system's own site).

**One spelling per category.** `docs` and `reference` were folded into `documentation`;
`gallery-find` was where the scout *found* the site, never anything about the site, and its
six were re-read from their own records.

## More

- [`schema.md`](./schema.md) — where `tags` sits in a record, and who writes it
- [`/layouts/`](/layouts/) — the standard: every layout id, defined and drawn
- [every tag](/websites/tag/) — all fifty-two, live from the manifest
- [what emerged](/websites/patterns/) — the counts, computed from the same file
