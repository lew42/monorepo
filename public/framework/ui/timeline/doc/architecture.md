# Timeline architecture — a function that returns markup, and CSS that owns the line

`timeline()` draws a dated list: a date column, a rail of dots with a line, and an entry column. It is a `ui/` template. It is a plain exported function built with `component()` from `../parts.js`, with no state and no class. The markup and its one `@layer theme` block live in [`timeline.js`](../timeline.js). The demo and the reader's view are in [`page.js`](../page.js).

## A function that returns markup, not a class

**Decided:** `timeline(...items)` is an exported function that returns a `div` tree. Callers pass rows as arguments.
**Why:** a timeline has no state and no behaviour to keep between calls. A class would only hold nothing.
**Instead:** a class with `.render()` (it would add a construct with nothing to hold); or copy-paste markup like `badge` (rejected because the rail CSS would then be repeated in every copy).
**Detail:** [the demo](/framework/ui/timeline/).

## Rows are `[when, what, note]` triples

**Decided:** each row is an array of three strings. `timeline()` destructures it as `([when, what, note])`.
**Why:** the call reads as a table in the page source, so a newcomer can edit a release list without learning an object shape.
**Instead:** `{when, what, note}` objects (clearer keys, but twice the characters for the same three strings).
**Detail:** [the demo](/framework/ui/timeline/).

## The line is a border on an empty box, not a `::before`

**Decided:** the connecting line is `border-inline-start` on an empty `div.ui-timeline-line.flex-1` sitting under each dot.
**Why:** the `flex-1` box takes all the row height the dot does not, so the line stretches to match the entry. It stays in the normal flow, so it needs no positioning.
**Instead:** a `::before` with `position: absolute`. That needs a relationship between two elements and cannot be set from an inline style.
**Detail:** [the demo, "The line, without a pseudo-element"](/framework/ui/timeline/).

## The run stops at the last row, by CSS, not by an index

**Decided:** the last row has no line and no bottom padding, via `:last-child` rules. Nothing in JS marks it.
**Why:** a line that trails off under the final entry reads as a loading state. The DOM already knows which row is last.
**Instead:** an index compared with `items.length` and a `last` class, which the page notes were removed.
**Detail:** [the demo, "The run has to stop"](/framework/ui/timeline/).

## Colours are derived, never named

**Decided:** the dot is `var(--eyebrow, var(--prime))`. The line is `currentColor` at 25% through `color-mix()`.
**Why:** the timeline lands on more than one background. A fixed `--subtle` colour measured 1.06:1 on an accent band. `--eyebrow` is a band's own safe accent, and `currentColor` already contrasts with whatever is behind it.
**Instead:** a fixed muted colour (fails contrast on accent bands).
**Detail:** [the demo, "The colours are derived"](/framework/ui/timeline/).

## Code check

No `⚠` mismatches. Every entry matches `timeline.js` and `page.js` as they are now. No `doc/decisions.md` exists for this module, so there is no reversal history to link.
