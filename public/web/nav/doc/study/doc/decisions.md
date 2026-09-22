# decisions — /web/nav/doc/study/

## Open — a line for `css-scopes.txt` that this task could not write

`public/framework/styles/css-scopes.txt` is outside this task's write fence, so the
reservation is recorded here instead. The next agent who can write that file adds one line
to the `# imagine` block:

```
dn-          /web/nav/doc/study (the stability lab: the pair, one demo row, the readout)
```

Checked first, as `new-css-class` asks: `grep -rhoE "\.dn-[a-z0-9-]*" public --include=*.css
--include=*.js` returned nothing at all on 2026-09-17, so the namespace was free. The view
classes were checked the same way — `classify()` mints a CSS class from every constructor
name, so `DnDemo` wears `.dn-demo` and `DnStudy` wears `.dn-study`, both inside the same
prefix. (`DnLab` was renamed to `DnStudy` for exactly that reason: it would have worn
`.dn-lab`, the class the inner grid already uses, and the page would have had two nested
grids.)

## Open — the owner's call: which way the stable rule is tuned

The rule shipped here freezes each column at its own **ceiling**, which is the literal
reading of the sentence this study was given: *the row scrolls sideways — the Finder way —
instead of squeezing what is open*. It keeps the reading width and pays with a scroll: at a
1056px row, opening a third column scrolls by 448px and most of the middle column goes under
the pinned rail.

Two tunings trade that the other way. Both are one number's difference, both are equally
stable, and the choice is a taste call about what a column browser is for:

| tuning | columns that fit a 1280 row | reading width at 1280 | where it already lives |
|---|---|---|---|
| **ceiling** (shipped here) | rail + 1, then it scrolls | 40em | this page |
| **floor** | rail + 3, no scroll | 16em | `.paging-nav-fixed`, `/imagine/paging/navigation/navigation.css` |
| **a third of the row** (`34cqi`) | rail + 2, no scroll; rail + 3 at 3440 | ~22em | nowhere yet |

The third is the only one that both stays still and keeps a 3440 screen full, and it is what
I would pick — but it costs a number (`34cqi`, "about a third of the row") that the other two
do not, and adding a number to core's vocabulary is the owner's decision, not a minion's.
The full argument, with the six width words under each, is in
[`ai/2026-09-17/nav-stability/proposal.md`](/framework/ai/2026-09-17/nav-stability/).

## Settled — the demo is built from core's classes, not from miniature boxes

The 2026-09-05 pass at `/imagine/paging/navigation/` made its rows out of small coloured
divs. That shows the *idea* but it cannot show the *bug*, because the bug is in a rule the
miniature never loads. Here both rows are real `.page.columns` hosts with real
`.page-column-body` children, so the left row is not a drawing of today's behaviour — it is
today's behaviour. The cost is three traps that only bite a hand-built host, all three
written down in `readme.md`.

## Settled — the catalogue moved down a level

`/web/nav/doc/study/` was a 142-line catalogue of every navigation mechanism, three
screens of it. The presentation rule is that level 1 is one screen, mostly above the fold,
shown rather than told. The catalogue is unchanged and is now `mechanisms/`, one click down,
reachable as a rail row from the study. Nothing was deleted.

## Settled — the stable row does not scroll to the end (2026-09-17, polish pass)

The press used to call `row.scrollTo({ left: row.scrollWidth })`, and the picture that came
back argued against the page. At 1280 that drove **450px of the middle column's 640** under
the pinned rail — 539 of 640 at 1000, 471 at 3440 — so its head went blank and its prose was
cut mid-letter against the rail's edge. A reader looking at the two rows saw the row labelled
**THE STABLE ROW** as the broken-looking one.

It does not scroll now. The row already holds the rail, the column that was open, and a
**190px peek of the new one** at 1280, and that picture is the proof: nothing moved, and
something new has arrived at the right-hand edge. The reader can scroll across to it; the
rail's shadow (strengthened at the same time — `0.55em` of blur instead of `0.6em` eaten by
`-0.35em` of spread) says the column continues underneath.

**The phone regime is the exception and has to be.** Under 32em of row core pages one column
at a time and every column is the whole row, so the end is the only place the new column can
be seen — and there is no pinned rail down there either, because the same container query
gates both. `paged()` asks core's own question in core's own unit.

## Refuted — widening the demo to 90rem (tried and reverted the same hour)

The lab's track used to grow to `1fr` while the demo inside stopped at 66rem, leaving 182px
of empty track at 1280 and 801px at 1920. Raising both to 90rem fixed that and made the slide
gentle — and cost the demo its subject: at a 1,440px row the **today** side moved a nav link
**26px** and a width **36px**, where the real site produces 129px and 225px at 1280. A demo
that has to understate the defect to look tidy is not a demo.

The bound is now 66rem in **one** place — the track — and the demo simply fills it. Past
66rem the lab holds its width and stops, the way a measure does; at 3440 two rows sit side by
side at 1056 each with nothing empty inside either.

## Settled — the lab is three rows now, and the third one is core

The pair became a trio on 2026-09-17: **today**, **the stable row** (the proposal in this
directory), and **even columns** — the mode that actually shipped into
`core/Page`. The third row has no rule in `navigation.css` and must not get one. It wears
core's own `.page-columns-even` and is sized by core's own `Page.even_columns()`, a static
so that this row and a live page share one piece of arithmetic rather than two copies that
have to be kept in step. The page's readout and an independent headless measurement of the
same click agree exactly at 400, 1280, 1920 and 3440.

**One number is ours, and it is a tuning, not the mode:** `--page-column-recommended: 20em`
on `.dn-even .page.columns`. The mode fits `floor(row / recommended)` columns; a real page
recommends `clamp(40em, 42cqi, 46em)`, which is 640px at this box's pinned 1rem — and this
box is 66rem (1056px), so the default would fit exactly **one** column and the row would
have nothing to demonstrate. 20em fits three, and three is what the reader needs to see. The
Finder at page width runs the default and reads N = 1 / 2 / 3 at 1280 / 1920 / 3440
([the table](/framework/core/Page/doc/columns/)).

⚠ **It is declared on the HOST.** Core declares this token nowhere — it reads it back off
`max-width` — so it simply inherits into the row. A declaration on a column body would be
the one thing that could out-rank an author's, which is why neither core nor this file puts
one there.

**The even row deliberately does not scroll on the press.** Its third column lands in a slot
that was already on screen, and that is the demonstration; `reveal()` still scrolls only in
the `< 32em` phone regime, where every column is the whole row.

## Settled — every sentence in the readout is derived from the number beside it

`says()` used to branch on which row it was. At 400 that put *"Both open columns paid for the
new one. They got narrower…"* directly beside its own measured **0px** and **0px**, because
under 32em core already pages one column at a time. Every branch now reads `this.change`, and
the unpressed state shows no numbers at all rather than a pair of bare `--`s.

## Settled — the readout's min-width belongs to the pair, not to the number

`min-width: 3.2em` on `.dn-px` opened a 63px hole between **129px** and *nav moved* while the
gap *between* the two pairs was 15px, so the eye grouped a number with the wrong label. The
reserve moved to `.dn-num` (10em), which still stops the row jiggling when a number gains a
digit.

## Known and accepted — the reading columns inside each demo scroll

Each `.page-column-body` is `overflow-y: auto` (core's own rule) inside an 18em host, so the
Install column scrolls: 245px of box, 516px of prose. That is what a real columns page does
and it is the reason the prose in the demo is long — a short paragraph would not rewrap, and
rewrapping is the defect. Two of them per row, both wanted.
