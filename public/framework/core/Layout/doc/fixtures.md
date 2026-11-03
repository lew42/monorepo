# Fixtures, and what "approved" means

**A layout owns no content.** The fixtures are what goes in its slots instead, and they *are*
the separation between layout and content: pour them in and a shape that only looks right with
particular content fails one of them visibly.

## The eight runs

Three axes, both ends of each, plus the two worst corners.

| axis | one end | the other |
|---|---|---|
| text | `"OK"` — two characters in every slot | 900 words in every slot, no paragraph breaks |
| image | none at all | one 4000 × 3000 per image slot |
| tone | light | dark (`color-scheme: dark`, the one line that flips every token) |

Plus *longest + huge + dark* and *shortest + none + light*. **Eight runs, seven widths, so 56
renders per layout** — which is why running them is a button on the page and not something that
happens on load.

⚠ **The huge image is a data URI, not a file.** A 4000 × 3000 SVG costs ninety bytes and has the
same intrinsic size a photograph would, so it exercises exactly the thing being tested —
framework.css's `img { max-width: 100% }` against a track that may be 200px wide — with no
network and no asset to keep in step.

⚠ **Every prose slot is bounded at the measure, and that is a decision made in the port.**
`.page.standard` bounds prose for every layout on the live site, so a layout lifted out of a page
has to say it itself or it is being judged without the thing that was holding it. A box says
`measure: false` to opt out, and then the measure rule can fire on it.

## What the checker reads, in order

| finding | what it means |
|---|---|
| `overflow` | something's `scrollWidth` beat its `clientWidth` while its own `overflow-x` is `visible` — content escaping a box that never said it could scroll |
| `growth` | a fixed-height box spilled and its `overflow-y` is `visible`; **or** the layout declares an `overflow` no box in it computes to |
| `edge` | text sitting on the host's own edge. The host carries the page's gutters, so this fires only when the layout escapes them |
| `measure` | a paragraph wider than 46em |
| `contrast` | text and the fill under it resolve to the same value |
| `ragged` | wrapping layouts only — a last row with fewer items than the row above |

**A layout is approved when the first five find nothing at any of the seven widths.** `ragged` is
a **finding, not a failure**: for a `grid auto-fill` wall a short last row is correct behaviour,
and the reader is shown the count it happens at rather than a verdict.

## Wrapping layouts get awkward counts

A layout that declares `wraps: true` is also run at **1 · 2 · 3 · 5 · 7 items** at every width.
Rows are grouped by *overlapping vertical ranges*, never by matching `top` — under `align-items:
center` two children of different heights on the same line have different tops, which once read a
one-line topbar as three lines.

Prefer `grid auto-fill` for walls: the columns stay aligned and the last row left-aligns.
`flex wrap` is for a row of controls, **where raggedness is the point** — which is why
`toolbar-cluster` is the one entry in the catalogue that reports ragged rows at 400px and is
approved anyway.

## What the first run found

The checker's first pass over all thirty found **four drafts**, and every one was a real defect
in the port rather than a false positive:

- **`dashboard-row`** — its figures slot was `flex: 0 0 auto` with no `min-width: 0`, so a long
  value ran 30,287px off the right edge. Now `0 1 auto` with `min-width: 0`.
- **`rows`, `shell`, `rows-in-columns`** — all three declared a fixed height and did not clip, so
  a long header spilled the box by up to 3,690px. The bars now bound themselves
  (`max-height: 3.5em`) and each root clips, which is what a bounded box means.

It found two more on the second pass, and both were the checker's own harness rather than a
layout: the measure cap had been put on the prose **box** instead of on the paragraph (which left a
260px hole between a shell's body and its aside), and a CSS rule written for a token slot landed on
the structural boxes that share the same kind and stopped their grid rows stretching. Both are
written down beside the code that bit.

The re-run is green: **thirty approved, one ragged finding.** That is the loop working, not the
checker finding nothing — and the negative control (an unbounded prose track, a `flex: 0 0 auto`
that cannot shrink, a bounded box that declares a scroll it does not have, black on black) is what
proves each rule can still fail.

## Two honest limits

**A div is not a viewport.** The measuring host is a fixed-width box, so a `@media` query inside a
layout answers the real window and not the width being proven. None of the thirty uses one — they
are clamps and intrinsic tracks — and the recorded `approved:` dates come from a headless run that
sets the **real viewport** to each of the seven widths.

**The strip is `zoom`.** The seven panes beside the drag viewport are `ext/demo/pane.js`: a box
laid out at a fixed width and painted down to fit. They show how a layout responds; they never
prove it. Approval is measured, never read off the strip.
