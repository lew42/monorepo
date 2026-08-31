# What the column-page labs found

Labs built on `columns()` during 2026-08-29/30, each ending in a verdict you can open.
This page is the short version: **one claim per finding, with the page that measured
it.** The mechanism itself is [`columns.md`](/framework/core/Page/doc/columns/).

## The findings

**`full` replaces, `fill` joins — and that is the whole permutation space.**
A screen here is not a shell, it is a width word. `full` collapses every ancestor column
into the crumb strip, so the screen you open hides the one you were on; `fill` keeps them
and the columns left divide the row evenly. Eight experiments, and nothing else was needed.
→ [Screens](/imagine/screens/) · [the table of eight](/imagine/screens/readme/)

**Stepping the tone UP reads as hierarchy; a flip reads as *you are here*.**
Each column a shade lighter than the one before reads as a stack lifting toward you.
Stepping *down* reads as a well you are falling into. Alternating reads as zebra stripes —
depth 3 matches depth 1, so the eye sees a pattern instead of a direction. Inverting one
column says "this one is different", which is emphasis, not depth: save it for a column
that genuinely is.
→ [Tone](/imagine/vary/tone/) · [Backgrounds](/framework/core/Page/overview/columns/examples/looks/)

**Never `--well` for a column.** It is a translucent shadow, not a palette colour, so
stacking it darkens by depth and bands the whole row — which is what happened to
`/framework/ux/*`. Transparent bodies over one `--wash` floor, every seam a `--line` hairline.

**A scrollbar may own the whole edge; it may not sit inside a page's own padding.**
A full-viewport scrollbar reads as an ordinary page scrolling. The same content in a scroll
region boxed inside the column's inset reads as cramped — two frames for one scroll region,
and the content never even reaches the column's real width.
→ [Scroll](/imagine/vary/scroll/)

**Inner chrome is a RULE; outer chrome is a FILL.**
Chrome *inside* a content area gets the same paper, a hairline, and one type step down — it
navigates within the area. Chrome that moves you between screens is the outer chrome wearing
a disguise, and giving it a fill says so.
→ [Shells](/imagine/shells/) · [the ten findings](/imagine/shells/readme/)

**Previews are navigation, not decoration.**
A card sits on the wash with a shadow rather than on a white card — a white render inside a
white card reads as a hole. A wall of them keeps the column's inset; `bleed` spends that
inset, and only where the wall *is* the page. And an index that draws a wall must not also
draw a rail — that is [`index: true`](/framework/core/Page/doc/columns/).
→ [Cards, side by side](/imagine/gallery/cards/) · [previews.md](/framework/core/Page/doc/previews/)

**Of the five content kinds, only a nav LIST does not scale.**
A statement and a stage scale with a wider region, a wall adds columns, notes cap at their
measure and centre — a list takes a share and gets a chevron chasm. That one property
decides every screen cut: lists get a fixed track, everything else may take a share. It
also decides persistent-vs-swap navigation: kinds that CAP tolerate a persistent rail
(it comes out of the gutter); kinds that SCALE want the swap (a 16em rail cost a statement
14% of its size); a thin strip redrawn per slide reads as persistent at a fraction of the
width.
→ [Decks](/imagine/decks/) · [the content-kind map](/imagine/decks/doc/regions.md)

**`hug` wants a constant content width — a nav rail is not one.**
Tried on a realm rail and reverted: it hugged to 128px on one realm and 183px on another,
because one row there reads *"needs the brass lamp"*. A rail whose width depends on which
sibling you opened moves the column beside it by 55px on every click. `hug` is for a legend,
a keypad, a set of chips.
→ [`/imagine/readme/`](/imagine/readme/) · [the six width words](/framework/core/Page/doc/columns/)

## What came back into core

Two seams, each from three occurrences rather than one idea:

- **`index: true`** — a column whose `content()` already shows its children leaves core's row
  list out. Three pages had suppressed it by hand, one of them in CSS.
- **A host-built `default` column is handed its `app`.** Nothing routes to it, so `child()` —
  the usual place — never runs, and `this.app.router` in its content threw.

Everything else the labs wanted, the words already there covered.
