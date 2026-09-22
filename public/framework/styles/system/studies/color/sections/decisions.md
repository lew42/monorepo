## The record — 2026-09-17, where two grounds meet

### What was measured, and how

Nothing on this page is typed from a hex somebody had in mind. Each section is painted with
a real colour, the browser lays it out, and then `sections.js` reads three things back off
the rendered pixels with `styles/stacks/stacks.js`: the colour the browser actually
composited under the text, the WCAG contrast of the body ink on it, and **ΔL\*** — the
difference in CIE lightness between the two grounds in a cell, which is the honest "can you
see the edge" number. The six grounds are the lighten/darken study's own five greys
(imported from `../study.js`, so the two pages can never disagree about what "mid gray" is)
plus the accent, painted with `--prim` so the hue slider drives it.

Two of the ratios were recomputed by hand against the WCAG 2 formula and matched what the
page printed: the theme's `--ink` (`#3f3f3f`) on white is **(1.0 + 0.05) / (0.0497 + 0.05) =
10.53**, and the page shows 10.5:1; the light half of `--ink` (`#e6e6e6`) on black is
**(0.7913 + 0.05) / (0 + 0.05) = 16.83**, and the page shows 16.8:1. The ΔL\* numbers were
checked the same way — white against light gray is 100 − 89.9 = 10.1, which the caption
rounds to 10.

### The one number this page judges by, and why it is not a guess

"Which pairings read as one page and which read as two" needs a bar, and a bar pulled out of
the air is worth nothing. Two were used, and **both are read off this site rather than
chosen**:

- **The theme's own card step.** `--wash` is the page floor, `--surface` is a card raised off
  it, and the distance between them — measured live by two zero-size probe boxes on this
  page — is **4.5 ΔL\***. That is the smallest step this design deliberately makes. Anything
  quieter than it is quieter than the site's own quietest deliberate move.
- **Does the ink change across the seam?** Not a taste at all: one side is reading
  dark-on-light and the other light-on-dark, and `color-scheme` on the section is what makes
  that happen. When the ink flips, the reader's eye has to re-adapt, and that is the
  difference between a step and a break.

**What they found.** None of the thirty stacked pairings hides its seam — the quietest, mid
gray against the accent at 7.3 ΔL\*, is still over one and a half times the theme's own card
step. Sixteen of the thirty flip the ink; those read as two pages stitched together rather
than two sections of one page. Nested, the same distance answers a different question — the
box rule says a thing needs padding only when it needs a box — and **one cell on the page
floats: the theme's own card on the theme's own floor**, at exactly that 4.5 ΔL\*. It is not
one of the thirty; it is there as the control, because the six grounds are all too far apart
to show the failure case on their own. The real site gets away with it because that card is
lifted by `--card-shadow`, not by its fill.

### The alternative, and why it was not built

The obvious shape for "every permutation" is a 6 × 6 matrix with the grounds as row and
column headers. It was rejected on size: a cell has to hold a heading, a paragraph, a
three-item list and a readout line, and six columns of that is a ~50px cell at a 400px
viewport. The wall (`.grid.auto`, `--column: 19rem`) gives one cell at 400, three at 1280
and eight or nine at 3440, and the ordering — grouped by the upper ground, in the ladder's
own order — recovers most of what a matrix would have shown. The page is long because 61
specimens are long; level 1 is the sliders, the sentence they rewrite, and the first row of
the wall.

### Open

- The accent's lightness is pinned at 69% by the parent study's slider set, so no drag can
  bring the accent inside 4.5 ΔL\* of a grey. A lightness slider would let the page
  demonstrate a floating seam instead of only naming one, and it belongs on the parent
  study's `lab()`, which is out of this page's fence.
