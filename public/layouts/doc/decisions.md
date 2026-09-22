# Decisions — what was settled here, and why

Opened 2026-09-08. The ask was the owner's: *"we need a layout identification system … this is
to be the encyclopedia, the global reference standard, the namespace for layouts."*

## Settled

**An id names the division of the room; everything else is a tag.** This is the rule the whole
standard hangs on, and it is what makes the tags worth clicking. The alternative — letting paint
and technique into the id — gives you `3-cards-flex-gap-left`, which describes exactly one page
and nothing else. [The rules in full](/layouts/doc/naming/).

**`cards` is a tag, not an id.** The owner's own test was *"'3-cards' what does this mean? can we
define the word in a way that it's most useful to describe many layouts?"* The most useful
definition available is: cards is **paint** — a visible background and padding on each column, a
gap usual but not required. Defined that way it describes several layouts instead of one, and
[/layouts/tag/cards/](/layouts/tag/cards/) shows all of them at once. `3-cards`, `2-cards`,
`4-cards` and `n-cards` are all kept as aliases and all are working urls.
⚠ **The count is never typed.** It said "five layouts" here, on the readme and on the page
itself until 2026-09-08, when deleting `4-equal` made all three wrong at once while the page
underneath them counted 4. Every count on this tier is rendered from `layouts.json`.

**`n` is a column count.** The owner's rule is "the first number is number of columns", and the
most modern arrangements — a card wall, a multicol list — deliberately do not have one: they name
a column *width* and let the room decide. Rather than pick a fake number, the count is `n`, and
`n` is the last branch of the tree. Two entries live there today, `n-wall` and `n-newspaper`.

**One layout keeps a number: [`4-1`](/layouts/4-1/).** A fixed grid whose tiles span different
numbers of tracks — what the industry calls a bento grid. `bento` is a fashion word, not a
description of how the room divides, so it is an alias. `mosaic` is the leading candidate and is
recorded as a candidate word rather than adopted. The namespace reserves a number for exactly
this case, and this entry is what proves the escape hatch works.

**No new CSS class for any layout name.** A name here is a name for a *picture*, and a picture
has a dozen ways to be built; a class would have to pick one and lie to everyone who built it the
other way. Each entry shows the framework word that already produces it — `.cols.half`,
`.cols.main-aside`, `.grid.three`, `.wall`, `.measure` — first, before its hand-written recipes.
(A class also could not be written: a CSS class may not begin with a digit unescaped.)

**Two columns has exactly two divisions.** Equal, or not equal. Everything else people call a
different two-column layout — golden, main + aside, fixed + fluid, 2fr / 1fr, list + detail,
nav + main — is `2-sidebar` with a proportion or a technique tag on it. That is the single
biggest simplification the standard makes, and it is the one most likely to be argued with.

**The drawing is the layout, not a picture of it.** A wire is drawn with real flex and real grid
at a real viewport size and then shrunk, so a row that stacks at 400 stacks in the drawing at 400
for the same reason the real page does. [The spec](/layouts/doc/wire/).

**`4-equal` is deleted, 2026-09-08.** Its own `when` sentence already said the honest thing:
"if the count could just as well be three or five, use n-wall instead and let the room decide" —
a fixed four-across row earns its place only when the count really must be four, and nobody had
found a real page like that. `4-equal` is now an alias of [`n-wall`](/layouts/n-wall/), so
`/layouts/4-equal/` still resolves and no tag written against the old id breaks.

## Settled by the corpus, 2026-09-08

Forty-seven real sites were captured, drawn and counted next door. Four things they settled that
no amount of reasoning here could:

**`1-bands` is the layout to learn first.** It is the second most common whole-page arrangement
(11 of 47, behind `2-sidebar`'s 13) and the only one other than a plain flow that a phone leaves
alone: 8 of those 11 are still bands at 400px, where every other multi-column layout has fallen
to one. Its entry and the `1` branch now say so, with the numbers in the sentence. Filing it as
"one division word among nine" undersold the thing the web actually builds.
⚠ Every number here is a reading of `site/index.json` **dated 2026-09-08**, not a constant — the
corpus is still being edited beside us, and it moved once while this was being written (10 → 11).
The live count is recounted at render on [/websites/patterns/](/websites/patterns/); cite the date
whenever you write a number down here.

**`n-wall` is not a page.** Across 47 sites it names a section 17 times and a whole page zero
times. Its `when` now opens on the word REGION: this is what you put *inside* a page, not a
shape for one. The `n` branch says the same.

**`carousel` is a word, and it is a `behaviour`.** Seven sites have a row that refuses to wrap
and scrolls sideways instead. That is not a new division — it is the other answer to "the room
ran out", beside `stack`. Recording it as a behaviour keeps the id namespace untouched and gives
the wire drawers something true to write down. [The word](/layouts/tag/carousel/).

**`sticky` needed defining, and `fixed` is its harder cousin.** A capture minion invented
`fixed sidebar` because `sticky sidebar` was not the same thing. One word, defined once, covers
headers and sidebars alike and names the difference in its own sentence.

The other eight inventions were ruled corpus tags or not layouts at all, one line each, in
[`doc/naming.md`](/layouts/doc/naming/). The four drawing gaps that were not naming gaps are in
[`doc/wire.md`](/layouts/doc/wire/).

**`N-equal` is a family.** The standard named fixed counts 1–4 and then jumped to `n`, so a real
five-column footer had nowhere to go and got filed as `n-wall`, which says the room decides the
count — the opposite of what that footer does. `equal` works at any number; the id was always
legal and only the sentence was missing. `/layouts/5-equal/` now answers with the family instead
of a 404, and the `equal` word carries the rule.

**One field was added to the wire spec: `stack`.** How many columns a row falls to below its
floor, default 1. Real footers keep two on a phone (notion.com's does) and the drawing said one.
Proved bit-identical on all twelve existing wires — the drawn markup is 24,525 bytes before and
after, byte for byte — because with no `stack` written the expression is unchanged.

**The tree wall was declaring tracks nobody stood in.** `auto-fill` at `15em` made six columns at
1920 and ten at 3440, so the `2` branch (two layouts) drew two 284px wireframes in a 3260px row.
`auto-fit` with a `22em` ceiling collapses the empty tracks and lets the survivors grow: 274px →
352px per drawing at 1920. A wireframe under about 18em is unreadable, which is what the page is
for.

## Measured

- **`zoom: calc(100cqw / (var(--w) * 1px))`** on the drawing, inside a frame carrying
  `container-type: inline-size` and `aspect-ratio: var(--w) / var(--h)`. Verified headless before
  anything was built on it: a 16em rail drawn at 1920 into a 300px frame measures **exactly
  40.0px**, and the same rail drawn at 400 into a 120px frame measures **76.8px** — both exact.
  The container query unit is read by a *descendant*; a container query on the drawing itself
  could not work, since a container query cannot restyle its own container.
- **The three widths side by side need no measuring.** Each frame's `flex-grow` is its own aspect
  ratio with a zero basis, so the widths come out proportional to the aspects — which is the same
  thing as all three landing on one height. It survives a hidden tab, where nothing lays out.
- **`font-size: 16px` is pinned on the drawing.** The site's body size is a viewport clamp
  (14px → 18px), so without the pin a `16em` sidebar would be 288px wide inside a drawing
  labelled 1920, and the picture would lie on an ultrawide screen.

## The lab, mapped

`/imagine/layouts/` used to number eighteen arrangements (`2.golden` and the rest). Every one of
them mapped onto this standard, and **eighteen arrangements are eight layouts** — the other ten
were the same division wearing a different proportion, technique, or composition. The mapping
below is why the lab itself was deleted outright on 2026-09-18
(`ai/2026-09-18/imagine-move-3/`), rather than moved here as a seventh entry under
[`/layouts/labs/`](/layouts/labs/): there was nothing left in it this table doesn't already say.
The old address is a one-line stub pointing at `/layouts/`.

| `/imagine/layouts/` (gone) | this standard | what the difference was |
|---|---|---|
| `1.stack` | [`1-flow`](/layouts/1-flow/) | — |
| `1.measure` | [`1-centered`](/layouts/1-centered/) | — |
| `1.rows` | [`1-rows`](/layouts/1-rows/) | — |
| `1.sections` | [`1-bands`](/layouts/1-bands/) | + `scroll snap` |
| `2.equal` | [`2-equal`](/layouts/2-equal/) | — |
| `2.golden` | [`2-sidebar`](/layouts/2-sidebar/) | + `golden` — a proportion |
| `2.main-aside` | `2-sidebar` | + `fluid`, a capped aside |
| `2.fixed-fluid` | `2-sidebar` | + `fixed width` |
| `2.fr` | `2-sidebar` | + `2 column grid` — 2fr / 1fr is narrow beside wide |
| `3.thirds` | [`3-equal`](/layouts/3-equal/) | — |
| `3.rail-main-aside` | [`3-holy-grail`](/layouts/3-holy-grail/) | — |
| `3.card` | `3-holy-grail` | intro · stage · readouts is narrow, wide, narrow |
| `3.rows-in-columns` | `3-holy-grail` | + a column split into rows — a composition |
| `3.scroll` | `3-holy-grail` | + `split`, `inner scroll` |
| `4.quarters` | [`n-wall`](/layouts/n-wall/) | `4-equal` was deleted 2026-09-08 and aliased here |
| `4.quad` (2 × 2) | [`2-equal`](/layouts/2-equal/) | each column then split into rows — `1-rows` inside `2-equal` |
| `4.wall` | [`n-wall`](/layouts/n-wall/) | — |
| `4.shell` | [`1-rows`](/layouts/1-rows/) | holding a `3-holy-grail` — a composition of two |

The lab's own readme conceded this in its first line before it was deleted: it was a place to
*play* with arrangements, and this was always the place to *name* them.

## Why these pages claim `wide`, and where the ceiling on a drawing comes from

Two decisions, both made on 2026-09-08 after looking at every page here at 3440x1440 — the
first time anything on this tier had been judged on an ultrawide screen.

**A layout's page and a tag's page put their BODY in `wide`, not in the reading track.**
Everything under the drawings — the tag chips, the two folds, the list of real websites —
is a *row of small things*, and in the 40em reading track all of it stood in a column hard
left with 2,700px of empty screen beside it; twelve site chips on `/layouts/tag/cards/`
wrapped to three lines inside an 800px box. `.std-body` (layouts.css) claims `wide` and then
hands the SENTENCES their measure back — `.std-body > :is(.md, p)` is capped at `--measure`,
so prose still reads at 40em and only the rows spread. The page got 85px shorter and the
chip list became one line.

**The three-widths row is capped by a fold budget in `vh`, not by a constant in `rem`.**
`.std-shot`'s `max-width: calc(var(--a) * …)` sets every frame's height through its own
aspect ratio. Its real job is the stacked phone drawing: at 400 a 400x844 frame drawn full
width is 726px tall, and a reader would scroll a whole screen of wireframe before the first
sentence. It was written as a flat `22rem`, which is a fold budget spelled as a constant —
at 3440x1440 the three frames then measured 1,720px of a 3,260px row and left half the
screen white. It is now `clamp(18rem, 40vh, 44rem)`: 354px at 400x844 (the phone drawing is
unchanged), 432px at 1080 where the row fills 1,766px exactly, and 576px at 1440 where it
fills 2,638px and the definition still starts above the fold.

**What was deliberately NOT changed: the thumbnail wall.** `.std-thumbs` is
`repeat(auto-fit, minmax(min(15em, 100%), 22em))`, so a four-entry branch draws about
1,500px of a 3,260px row at 3440 and the rest is empty. That ceiling was measured and chosen
hours earlier to stop a two-entry branch drawing two billboards, and a wall of thumbnails is
for *scanning many at once* — a bigger thumbnail is a worse scan, not a better one. Dead
space beside a wall of small pictures is not the same defect as a reading column alone on an
ultrawide. Left as it is, on purpose.

## Open

- **Two columns has exactly two divisions** — see above. If somebody can name a third that is not
  a proportion, a technique or a behaviour, it belongs here.
- **`4-1` wants a name.** `mosaic` is a candidate, not a decision. The corpus found two of them
  (ikea, nike) and nike's does **not** follow the fallback this entry claims — it stays a
  two-across mosaic at 400 rather than stacking. One counter-example is not enough to rewrite
  `responds`; a third would be.
- **`carousel` has no drawn layout of its own.** It is a behaviour tag on `n-wall`, which is
  honest — the division really is a wall that scrolls instead of wrapping — but a reader on
  [/layouts/tag/carousel/](/layouts/tag/carousel/) sees one drawing and seven real sites. If a
  wire ever needs to draw the non-wrapping row itself, that is a `wire.md` field, not an id.
- **`n-wall` and `n-newspaper` share a picture at narrow widths.** Both fall to one column, and
  at 400 the two drawings differ only in the height of their pieces. Honest, but a reader has to
  read the words to tell them apart on a phone.
