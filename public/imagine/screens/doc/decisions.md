# Decisions — screens

The ask (the owner, 2026-08-29): *"try making some full screen experiences, and experiment
with full screen layouts, as they pertain to navigation. for example, full screen -> split
screen -> 3 equal columns. full screen title slide -> launches a document in a column on the
right. large, clean, simple... iterate through all the permutations"*.

Cover the space with small honest tries, not polish one. Eight experiments, 24 urls.

## The constraint that shaped everything

`/imagine/` calls `columns()`, and `Page.column_host()` is
`this.chain().find(page => page.columnar)` — the **shallowest** columnar ancestor. So nothing
under `/imagine/` can open a second row, and a full-screen experience down here cannot be a
shell. It has to be the width word `full`, whose whole job is to collapse the ancestor
columns into the crumb strip.

Three ways out were considered and dropped:

- **Override `column_host()`** so an experiment is its own row. It works, but the nested host
  renders as a `.page.columns` flex item *inside* the outer row — it has no `.page-column-body`,
  so no width word applies to it and the rail and index stay on screen. It buys a second row and
  loses the full screen, which is the wrong trade.
- **Hand-roll a row** inside one `full` column. That is re-implementing `columns()` for one lab.
- **Regions + `default` children** (the panels pattern) for the horizontal split too. It works
  for the height and is what `Stack` and `Mix` use, but it costs the url per hop — and a hop
  you cannot link to is not navigation.

## `full` re-tuned, rather than a seventh word

`full` says `flex: 1 0 100%; min-width: 100%`, so a second screen opened beside it is pushed
off the row. `fill` has the arithmetic we want (`1 1 100%`, a 16em floor, no ceiling) but does
**not** collapse the ancestors — and `doc/columns.md` is explicit that it must not, because
collapsing them is the whole of what makes `full` a different word.

So screens.css gives `.screens-screen.page-column-full` `fill`'s three values. One rule,
(0,2,0) so it beats `.page-column-full` on specificity rather than on load order, and it is
the entire progressive division: one open screen takes the row, two take halves, four take
quarters. **No core change was needed and none is proposed** — this is a lab word, and the
day core's `fill` gains an ancestor-collapse option this rule deletes itself.

## Two words, not a vocabulary

Every experiment is `full` (replace) or `fill` (join) per hop. That was the finding worth
having, and it is why there is no `screens-swap` / `screens-split` / `screens-cover-mode`
config: the permutation is a word already in core, said at the hop that means it. The three
lab classes that exist all buy something a word cannot say —

- `screens-cover` — a `:has()` that hands the cover 14em once it has an open child.
- `screens-major` / `-minor` / `-least` — a **basis** is a share, so `61.8%` / `38.2%` / `20%`
  are the ratio itself, at every width, with no grow weights and no media query.
- `screens-index` / `screens-column` — the index hides core's duplicate nav rows (the cards
  are the nav); a quadrant caps its prose at 40em, which `doc/columns.md` warns about by name.

## The composition pass (2026-08-29, second sitting)

The mechanics were right and the pictures were not: a 40em document adrift in 950px of dead
white, and a cover whose title had shrunk to a 27px heading. **One box fixed both.**

**`cqw` was reading the AREA.** So a word was sized by however much screen happened to be
left over, not by the composition it belongs to — which is also why the content sat in a
corner instead of on the page. `.screens-block` is the composition: capped
(`min(100%, max(60em, 38%))`), `margin-inline: auto`, and the query container. Below ~1030px
of area the cap never bites and nothing changes — Divide's columns are untouched, which
matters, because Divide's numerals were the standard being measured against.

| dead space, ink → the area's edge | 1920 before → after | 3440 before → after |
|---|---|---|
| Title Slide, document | 56 / 967 → 257 / 257 | 56 / 2459 → 684 / 684 |
| Peek, document | 56 / 1156 → 606 / 606 | 56 / 2672 → 1322 / 1322 |
| Deck, a slide | 56 / 1229 → 480 / 805 | 56 / 2749 → 1087 / 1608 |
| Stack, worst band | 56 / 1722 → 592 / 1135 | 56 / 3242 → 1306 / 1916 |
| Divide (the standard) | 24 / 98–138 → 19 / 103–143 | 43 / 241–305 → 34 / 237–303 |

The number that mattered was never the total — it was the **imbalance**. A slide at 3440 was
56px from the left edge and 2749px from the right; it is now 1087 and 1608, which is a placed
block with ragged text in it. Title Slide's document lands at 257 / 257 exactly, because a
prose block's composition IS its measure (`42em`).

**Type, same fix.** The 9rem ceiling was doing the work of a composition and doing it badly:
every screen wider than ~1030px got the same 144px word however much room it had. With the
block as the container the ramp does it — deck 144 → 134 at 1920 and 144 → **177** at 3440;
stack's bands 72 → 103 / 116, which deleted the special band font-size rule (a band just
takes a narrower block now); the title cover 27 → **94** / 151. Divide moved 60 → 62 and
108 → 111, which is the padding, not the ramp.

**The cover takes a share, not a rail.** 14em was the first try and it is what made the title
a heading beside 1696px of document. It is `38.2%` now, and the document wears `screens-major`
— *Uneven's own word, reused*, so the two ARE the golden section: 733 / 1187 at 1920,
1314 / 2126 at 3440, 611 / 989 at 1600. `Peek` deliberately keeps its 14em rail: that is the
honest inverse, and the cost of leading with the document is that a rail cannot hold display
type. The two experiments now say something different from each other, which they did not
before.

**One tone step, on the page's state.** A screen you came *through* steps `--surface` →
`--wash`; the screen you are on is the only white one. The hook is `.active-ancestor` on the
**page** — not `.in-path`, which is `mark_links()`'s and lands on *anchors*: on Divide it
marked three of four areas including the one you are standing on. Both were shot; the flat
version is prettier as a poster and says nothing, and the step is what finally separates the
cover from the document — they shared one sheet of paper with a hairline between them, which
is the gap this pass existed to close.

**One device per seam.** A hairline divides peers; a tone step divides here from behind-you.
Stacking both at a role boundary would be two devices saying one thing, so the active screen
paints 1px of its own paper over the column seam to its left. Divide keeps three hairlines
between its three washed columns and has none at the fourth — the rule, drawn.

Two things this pass had to fix as consequences, both measured, both in `screens.css`:
`:where()` on the tone selector (written plainly it is (0,4,0) and silently beat the hover, so
a washed area stopped responding to the pointer), and paper for the quad's quadrants (a column
body is `--wash` by default, which is exactly the tone a screen behind you steps down to — the
menu and the quadrant became the same grey and the seam vanished).

## Measured (headless, 400 / 1920 / 3440, 24 urls, zero console errors)

| | 400 | 1920 | 3440 |
|---|---|---|---|
| Divide, four columns | 4 × 400, row swipes | 4 × 480 | 4 × 860 |
| Title Slide + document | 400 + 400 (swipe) | 733 + 1187 | 1314 + 2126 |
| Uneven, φ | swipe | 1187 / 733 = 1.619 | 2126 / 1314 = 1.618 |
| Uneven, three | swipe | 989 / 611 / 320 | 1772 / 1095 / 573 |
| Quad menu when sharing | swipe | 531 — stacks | 951 — stays a 2×2 |

Under 32em of row, core's own container query pages one column at a time; every hop at 400 is
a swipe, and that is the arrangement working, not a defect.

## Fixed 2026-09-04 — a hop that was already open could not be closed

The ask (the owner): *"clicking Two keeps Three active, i feel like it should just link to
itself /two/, and then three disappears?"*

**Why it was fixed forward in the first place.** `sheet(to, build)` writes one url at build
time and `Page.render()` caches the view — a page is built once, never rebuilt when a child
opens beside it. Every hop's own box only ever said "open the next one" because closing was
never this box's job: `doc/columns.md`'s own line, "no `to` makes a dead area … the crumb
strip is how you come back up," treats collapsing as the crumb strip's job, not the area's.
That reads fine until the box you're looking at is showing you the thing it claims to open —
click it and Router finds nothing changed (`activate()`'s `shared_depth` is already the whole
chain), so it does nothing. Measured: Two's own href never changed after Three opened beside
it, so a second click on Two re-requested `/two/three/` while already there.

**The fix stays inside `sheet()`, checked live at click time**, since there is no re-render to
hook: if `to` is a prefix of `location.pathname` (it is already open), the click goes one
segment up from `to` instead — the box's own url, exactly where its crumb link already goes.
Verified (headless, 1280): Divide, `/two/three/` → click Two → `/two/` and Three's box is gone
(`getBoundingClientRect().width` 0) → click Two again → `/two/three/` and Three is back.

**Every other screen re-shot, before and after, identical where the target wasn't already
open** — Quad, Stack (its hops fully replace, so the closed box was never reachable to begin
with), Read/Peek (its own strip already solved this with `display: none`, untouched by this
change), Deck (dead areas, `to` is `null`). Uneven and Mix compose the same chain shape as
Divide and gained the same close-on-click for free, also verified: `/golden/thirds/` → click
Golden's own box → `/golden/` → click again → `/golden/thirds/`; `/two/detail/` → click Two's
own box → `/two/` → click again → `/two/detail/`. Title's cover, similarly, now closes the
document on a second click rather than sitting there as a dead one. Zero console errors on
every url.

## Cut

- **A vertical `writing-mode` spine** for the compressed cover. It reads well and it is one
  rule, but the rotation is decoration, not information — and now that the cover keeps 38.2%
  it has room to say it upright. `Peek`'s strip is the one place a rotation earns its keep.
- **A band with its own url.** It needs regions plus a `default` child per band, and the
  Router lights one chain — so the url would name the column, not the band. `Mix` shows the
  honest version: a band opens a *column*.
- **Re-weighting `Uneven` at hop three** so it lands on exactly 3:2:1. It needs a second
  `:has()` per ratio and it makes the shares state-dependent; letting them compose (about
  3.1 : 1.9 : 1) is the smaller, truer thing.
- **A fifth and sixth hop on Divide.** At 1920 a quarter is already 480px; past four the row
  scrolls, which is a different experience than dividing one, and `Divide`'s last screen says so.

Cut in the composition pass:

- **A `container-type: size` area**, so a band could size its type by its own height. It is
  the one measurement this lab keeps wanting and cannot have: a box with it stops being sized
  by its contents (`styles/doc` measured 0px while holding 963px). A narrower *block* says the
  same thing without asking for a height.
- **Aligning the block to the crumb strip at every width.** The strip sits at a fixed ~1em
  from the edge (13/14/14/16 at 400/1280/1920/3440); a screen's padding is a percentage,
  because a 3440 poster with a 14px gutter is not a poster. The padding went `5%` → `4%`,
  which lands the 400 phone at 16 against the strip's 13 and leaves the wide end alone.
- **A shadow at the seam.** Rule 4 is one device, and the tone step already is one.
- **Toning `Peek`'s cover up to a share** to match `Title Slide`. The two experiments are
  supposed to disagree; making both golden would have deleted the finding.
