# The content-kind map

The lab's deliverable: **what to put in a region of a given width.** Everything below is
measured off the live pages (headless, 400 / 1920 / 3440, the crumb strip and the strip under
the slide subtracted).

## The one property that separates the five kinds

A content kind is defined here by **how it answers a wider region**, and nothing else.

| kind | answers a wider region by | its width at 3440 in a 1719px cell |
|---|---|---|
| **statement** | growing — the type is 13% of its own block | block 900, title 117px |
| **stage** | growing — an aspect box has no natural width | the region, less its inset |
| **wall** | adding columns — one `--column` token, no breakpoint | 4 columns |
| **notes** | *not* growing wider; the type grows and the measure holds | 34em, centred |
| **list** | **not at all** — a row's width is its label | 26em, and the rest is margin |

Four of the five take a share and get better. A **list** takes a share and gets worse: past
about 28em a row is a label with a chasm before its chevron, which
[`core/Page/doc/columns.md`](/framework/core/Page/doc/columns/) measured directly when a rail
was widened to absorb a row — *three nav rows with the chevron 900px from its label*.

**So a list wants a fixed track and never a fraction.** That single rule decided the shape of
`persist/` (a 16em rail, not a 22% one) and it is why every cut in this lab is really an answer
to *where does the list go*.

## By region width

The bands are the lab's own, from reading the six cuts at three widths:

| the region is | what works | what fails |
|---|---|---|
| **under ~400px** | a spine, an eyebrow, a vertical label | everything else — 25 × 4 at 1920 is 479px and even that fails |
| **400 – 700px** | a nav list *with second lines*, a caption stack, an agenda, one wall column | display type — it fits and then competes with the middle |
| **700 – 1300px** | a statement (117px title at 900px of block), 2–3 wall columns, notes in a capped block | a bare list — the rest is margin |
| **1300 – 2200px** | a statement at 142–160px, a media stage, 4–6 wall columns | prose without a cap |
| **over 2200px** | exactly one thing: a statement at 221–240px, or a stage | two things — they stop being a composition and become two slides |

**Prose has a second axis, and it is the type.** A caption cannot get wider — its measure is its
own — so in a 1719px cell it was 15px text in a third of the cell and the slide read as empty.
`decks.css` grows the *size* instead (`clamp(0.95rem, 1.05cqw, 1.6rem)` on the region's
children), so 34em of larger type is a larger box at the same line length.
⚠ The declaration is on the **children**: a container query never matches its own container,
so `cqw` written on `.decks-region` resolves one level out, to the screen, and every region on
a 3440 slide takes the same size.

## Every cut, measured

Screen width is the viewport — a `full` column folds the site's rail into the crumb strip.

| cut | 3440 | 1920 | 400 |
|---|---|---|---|
| 50 / 50 | 1719 / 1719 | 959 / 959 | two bands |
| 61.8 / 38.2 | **2125 / 1313** = 1.618 | **1185 / 733** = 1.618 | two bands |
| 70 / 30 | 2407 / 1031 | 1343 / 575 | two bands |
| 25 / 50 / 25 | 859 / 1718 / 859 | 479 / 958 / 479 | three bands, scrolls |
| 20 / 60 / 20 | 687 / 2062 / 687 | 383 / 1150 / 383 | three bands, scrolls |
| 2 × 2 | 4 × 1719 | 4 × 959 | four bands |
| rail + stage | 288 + 3152 | 256 + 1664 | one column at a time |
| one screen | 3440 | 1920 | 400 |

And the display type each cut can hold, which is the number that actually decides a slide:

| the block it composes into | title |
|---|---|
| a whole screen at 3440 — 1863 | **240px** |
| a 60% middle at 3440 — 1092 | 142px |
| a 2 × 2 cell at 3440 — 900 | 117px |
| a whole screen at 1920 — 1012 | 132px |
| a 2 × 2 cell at 1920 — 517 | 67px |
| a 25% column at 1920 — 367 | 48px — *this is the floor of "display", and it is why quarters was cut* |

## Under 46em the cut becomes bands

Asked of the **screen**, never the window — `persist/`'s stage runs out at a different moment
from a whole screen. The regions keep their order and their content; the screen scrolls if the
sum needs it, and the strip goes sticky so navigation does not scroll away. Two of the nine
pages scroll at 400 and both are three-region cuts; nothing scrolls at 1920 or 3440.

Related: [`doc/decisions.md`](./decisions.md) · [`/imagine/screens/`](/imagine/screens/) —
the block composition and the two width words this stands on.
