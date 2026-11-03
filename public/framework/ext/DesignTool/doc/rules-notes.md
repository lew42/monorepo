# Rules Design Notes

## System Overview

Every rule reads plain numbers from probe.js and yields issues. No DOM here — which is what lets the same rules run on a live page, an iframe, or a JSON capture taken an hour ago.

A threshold is a RATIO wherever one exists: padding against font-size, not against 8px; characters per line, not ems. One number then holds at every viewport and every font scale. Calibration: knowledge/thresholds.md.

Severity is a curve, not a line. Every rule states three thresholds and the magnitude picks one. A binary test reported 87 characters a line and 300 characters a line identically — and those are not the same bug.

## content_width Function

The width the ROOT actually gave its children — its client box less its own inline padding. `m.viewport.w` is the window, which is a different number the moment anything pads the shell (the dev rail does, by 272px). Falls back to the window when there is no root to ask.

## Unreachable Content Rule

The one where content is clipped away with no scrollbar anywhere: the reader cannot get to it by any means. Its own rule rather than `clipped`'s top band because a severity tier cannot say this — `/web/nav/drill/` hides 4099px of a 900px region and scored 82/B as one 12-point `high`. score.js weights it by RULE.

## Cramped Spacing Rule

The owner's original example, measured rather than inferred: how close does the nearest text actually get to a box that draws an edge? Reading the box's own padding would miss the common shape — no padding on the card, a margin on the paragraph inside — and flag a card that is in fact fine.

## Gutter Region Measurement

The one the tool missed on its own audit page, where the h1 sat 0px from the region's edge. `cramped` could not see it: a page draws no frame, so there was nothing it considered an edge. A REGION's edge is an edge too.

### Scroll Container Measurement Critical Notes

Scroll containers only. Not the shell — a full-bleed `.app` spans the viewport, so its edge IS the window and the nav sitting against it is the design. And not the analysis ROOT. A caller measuring a bare container gets its own boundary reported as a missing gutter, which is how a live panel pointed at one demo box accused it of touching its own edge. A region is a thing that scrolls; the page's own is `.pages`, which is still checked and is what caught the audit page's flush h1.

**AGAINST THE ROOT'S CONTENT WIDTH, NEVER THE WINDOW** — measured against the window, THE TOOL MANUFACTURED ITS OWN TOP FINDING. `framework.css` gives `.app` a `padding-inline-end` the width of the dev rail, so with the rail open `.pages` measures 1648 of a 1920 window, clears "not the shell" by 270px, and a `high · gutter` appears on the page region: 18 of 24 page×width pairs with the rail as the only variable, the TOP finding on 12, ringing 79% of the viewport. Opening the tool must not change what the tool reports. See: `ai/sessions/2026/08/17/tier-calibration/`.

## Measure Rule (Line Length)

Code is exempt, and so is anything INSIDE it. Checking the tag alone let every highlighted `span.hljs-*` through — a syntax-coloured string reported as a 129-character line, and the proposed fix was `max-width` on a token. A code line is authored, not wrapped: short lines are the author's, and long ones are what the horizontal scrollbar is for.

One line counts. Requiring two missed the worst case there is: at 3440 an unbounded paragraph fits on a SINGLE 300-character line.

### Laddering Detection

Two words a line over five lines. A card description, a table cell and a stat tile all run 18–24 legitimately — and a cell is the one of the three the rule cannot see is narrow on purpose, so it authored 173 of 203 high findings site-wide.

## Illegible Text Rule

A 10px label is a label; a 10px paragraph is a problem. Judging by size alone reported 362 findings across 120 pages — every badge, chip and eyebrow on the site. The low tier now needs real text behind it.

## Zero-Size Rule

Asks the text BOUNDS, not the node's own text: the common shape is a collapsed wrapper whose paragraph is a block child, so the wrapper itself never counts as a text block and the rule saw nothing.

And `boxed()`, or a `display: contents` wrapper — which HAS no box, by design — reads as one collapsed to nothing. `div.tabs.block` alone was 360 of the site's 371 findings here.

## Hit-Size Rule

Two exemptions, both from WCAG 2.5.8 itself: a link INSIDE a sentence is sized by the line, not by anyone's choice; and a control whose `::after` is stretched over its card has a hit area its own rect knows nothing about. Without them this rule fired 4274 times across 116 pages.

One control, reported once. `input.layout-range` is 60×17 wherever it appears, and the panel puts eight on a page — 437 findings site-wide for a single CSS line. Identical selector at an identical size is one declaration, so the rule counts them and reports the count.

## Hit-Size at Scale

At its own scale: a control inside a miniature is a picture of a control, and the design under it may be fine.

## Rhythm Rule

A gap far larger than its neighbours is the "72px under a card icon" bug: `.flow`'s heading margin resolving against a heading's own font-size inside a UI cluster that wanted a flat `gap`.

## Empty Page Rule

Not geometry — the absence of it. A page with nothing on it trips no rule, so seven dead urls scored 90–94/A against a site median of 66.

The thinnest threshold in the module: dead urls hold 63–64 characters and the sparsest live page holds 141. knowledge/thresholds.md carries the spread.

## Helper Functions

### distinct() 
One finding per distinct `key`, carrying how many boxes share it. A repeated component is one declaration however many times the page draws it.

### nearest()
The closest approach on any of four edges, with the font size of the text that reached it — so a 45px heading and a 13px caption are each judged against themselves.

### gone()
More hidden than shown, and enough of it to matter.
