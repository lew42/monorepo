# Blind spots

What the rules **cannot** see. Each one was found by building a layout that is
wrong, measuring it, and getting a clean score back — the opposite of the
false-positive hunt, and the more dangerous direction: a missed finding looks
exactly like a passing one.

## Vertical overflow of a visible box

A pane that grows past a bounded parent whose `overflow` is `visible` scores
**clean at every width**. Nothing overlaps by the collision rule's definition
(both boxes are in flow and the parent simply stops early), nothing escapes
sideways, and no clip exists to report. Every geometry rule here measures the
horizontal axis or a clipped ancestor.

This is the failure mode of a scroller inside a wrapping flex row — a flex line
sizes to its content, so `overflow-y: auto` on the pane has nothing to do once
the row wraps. Live, and quiet:
[Scroller in a wrapping row](/framework/ext/DesignTool/library/bad/scroller-in-a-wrapping-row/).

**The detector that does work is a `sweep()`**: the row's height changes
discontinuously at the width where it wraps, and an edge nobody chose is the
finding (`responsive.md`).

## `dead-space` needs four paragraphs

The rule spans the text blocks over 20 characters and gives up under four of
them (`rules.js`). Two consequences:

- A **table** is invisible to it. Only one column of
  [Wide table](/framework/ext/DesignTool/library/wide-table/) holds text over 20
  characters, so the rule reports "content spans 13% of a 1920px viewport" for a
  table that fills the width. A false positive produced by the same guard.
- A **sparse** layout — a hero, a toolbar, a stat strip — is invisible for the
  opposite reason: it has no text blocks at all, so it can waste any amount of
  width for free.

⚠ **`width_used` no longer shares that limitation** (2026-08-17). It measured a
SPAN over text blocks and now measures the **coverage** of the frame by
everything drawn — text blocks *and* leaves, so a wall of image tiles counts —
as the union of the intervals they occupy, clipped to the frame. Read it as
*how much of the width has something in it*. `dead-space` above is unchanged and
still reads only where the prose is. `knowledge/ideal-ranges.md` has the
mechanism; the corpus numbers are in `ai/2026-08-17/tier-calibration/`.

## `pad-scale` stops at 85% of the viewport

The rule only treats a box as a card when `320px ≤ width ≤ 85% of the viewport`
— past that it is a band, and the page gutter's job. But `gutter` measures
edge-to-text over **font size**, so a 3300px band with a 20px inset reads as
1.1× and passes. **Between the two rules there is a hole exactly the shape of a
full-bleed section with a pixel inset**, and it opens at the widths where it
matters most. Measured on
[Pixel padding](/framework/ext/DesignTool/library/bad/pixel-padding/): low at
1280 and 1920, silent at 3440.

## The measuring frame was clamped (fixed)

`frame(url, 3440)` from a 1920 window laid out at **1920** and reported it as
3440. `framework.css`'s base reset is `iframe { display: block; max-width: 100% }`,
and the hidden measuring iframe inherited it — inline `width: 3440px` sets the
width, `max-width` clamps it, and nothing throws.

The tell was two identical rows: the 1920 and 3440 runs of the same page
returning the same score, the same `width_used`, and the same leading finding.
Fixed in `DesignTool.css` with `iframe[data-layout-ignore] { max-width: none }`
in `@layer util`, **and in `frame()`'s own `cssText`**, so the fix survives a
caller that never loads the stylesheet.

⚠ **Any wide measurement taken before that fix is suspect** — the corpus's
3440 column, the audit's 3440 column, and any conclusion drawn from them. The
corpus has since been re-run at real widths: 92/92.

## A page with nothing on it (fixed)

The purest form of the problem this file is about: **emptiness passes every
rule**. Seven dead urls — `/framework/audit/modules/` and six `<module>/doc/`
paths — render "404 — nothing matches" and scored **90–94/A** against a site
median of 66, so the tool's cleanest results were the pages that did not exist.

There is no geometric error to find, which is why no geometric rule found it.
The `empty` rule measures the *absence*: characters of text under the content
region, under 128 of them. See `thresholds.md` for how thin that margin is.

⚠ It stays a blind spot in one direction. A page whose entire content is a demo
stage is skipped by `probe.IGNORE`, so it reads as empty — correctly, in that
the tool genuinely cannot see anything there, and misleadingly, in that a reader
can.

## The general shape

Three of the four are the same mistake: **a guard added to kill false positives
took real findings with it.** A guard is a claim that a class of box cannot be
wrong, and that claim is worth re-testing whenever a layout is broken on purpose
and the tool says nothing.
