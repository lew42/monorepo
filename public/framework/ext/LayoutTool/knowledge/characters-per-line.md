# Characters per line

**`--measure: 52em` is not 75 characters on this site.** It is between 83 and
103, depending on the copy — which straddles the 85 mark `measure` reports at,
and is why the rule fires on some prose pages and not others.

## What was measured

The site's type is Montserrat, at a root size that scales with the viewport
(15.04px at 1280, 16px at 1920, 18px at 3440). Characters per line is
`line width ÷ the font's average advance`, and both scale together — so **the
number does not move with the window at all**. A 52em column reads the same at
1280 and at 3440.

| where | copy | at 52em |
|---|---|---|
| `library/reading-column` | technical prose, lowercase-heavy, no inline code | **103 a line** |
| `core/Page` body text | prose with inline `code`, capitals, links | **~83 a line** |

The spread is the *text*, not the box: a wider average advance (capitals,
monospace inline spans, punctuation) buys fewer characters in the same width.

## The number to reach for

Solving `85 characters × the measured advance` gives the ceiling that is safe
for **any** copy in this face:

```
≈ 42em     the widest a reading column can be and stay under 85 for all copy
≈ 38em     ~75 characters — what the bounded reading grid already uses
  52em     the house track: 83 for dense copy, 103 for plain copy
```

`38em` is not a coincidence: it is the ceiling
`knowledge/thresholds.md` arrived at independently when the corpus's "Good
widescreen" case had to stop failing at one column.

## What this does and does not license

- It does **not** say the site's `measure` findings are false positives. 103
  characters is 103 characters, and two vision models called the same pages
  over-wide before this tool existed (`false-positives.md`, the counter-rule).
- It does say the **token** is the finding, not the pages. One declaration in
  `core/Page/Page.css` accounts for the mass, and no page can be blamed for
  taking the default.
- Changing `--measure` is a site-wide type decision and is a human's call. This
  file records the measurement so the decision can be made on a number.

⚠ **Measure the copy you actually ship.** A column sized against lorem ipsum
and filled with prose full of inline code is a different column. The tool reads
line boxes at render time for exactly this reason.

Live: [Reading column](/framework/ext/LayoutTool/library/reading-column/) ·
[Reading grid](/framework/ext/LayoutTool/library/reading-grid/) ·
[Prose with no ceiling](/framework/ext/LayoutTool/library/bad/prose-with-no-ceiling/).
