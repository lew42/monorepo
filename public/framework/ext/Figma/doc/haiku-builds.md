# Haiku builds: what it got right and wrong (kept per section)

Method: I read the section with `get_design_context` (exact tokens), write a minimal spec (`palette/spec-N-*.md`), a Haiku 5.5 minion under 60k tokens builds it from the spec and the `colors/` demo as the pattern, I screenshot at 1920 and fix.

## 1 · The Approved Schemes ([/framework/ext/Figma/palette/](/framework/ext/Figma/palette/)), 52k tokens, about 2 minutes

**Right:** all text, colours and alpha overlays came out exactly as written; one data-driven array plus one render loop (as asked); `pal-` prefix, `@layer theme`, CSS in its own file.

**Wrong, and why:**
- It passed `{style: ...}` as an argument to `p.c(...)`/`div.c(...)`; the factory took the object as text and printed `color: rgba(...)` on the page. Fix: `.style("color", c)` chained. The spec showed no factory signature, so this is a spec gap; next specs name `.style(prop, value)`.
- The card stayed 640 px wide: `.page` is a grid whose main track is `--measure`; a wide section needs `grid-column: 1 / -1` (`width: "full"` alone did not do it). Haiku could not know; now in the colour/palette notes.
- Columns stretched to the tallest, so the Prime column's bottom looked bright. Figma aligns to start: `align-items: start`.
- Inset label colour was dropped (my spec gave it only for the first inset). Spec gap again.
- Padding "24/20 x 28" was ambiguous; it used 20 everywhere. My wording.

**Verdict:** with exact tokens in the spec Haiku builds the static look reliably; the misses are framework quirks (factory signature, grid tracks) that a spec must name. Cost is small enough to spend one spec round per section.

## 2 · Typography ([/framework/ext/Figma/palette/typography/](/framework/ext/Figma/palette/typography/)), 46k tokens, about 1.5 minutes

**Right:** every size, weight, colour and string; the three columns; link underline bars via `::after`; none of the section 1 traps again (factory signature, `width: "full"`, grid span, align start) because the spec named them. Naming the pitfalls in the spec worked.

**Wrong:** chips stretched full width (a flex item needs `align-self: flex-start`; the spec said "chip" but not "hugs its text"); the link row was centered, not left; the Prime inset's colour is identical to its column in the design, which it rendered correctly, so this is only my reading. Three small CSS fixes, no rework.

**Pattern:** HUG in Figma (a chip sized to its text) must be written out in the spec as "does not stretch"; that is the single most repeated gap. See [mapping.md](./mapping.md).

## 3 · Controls ([/framework/ext/Figma/palette/controls/](/framework/ext/Figma/palette/controls/)), 49k tokens, about 1.4 minutes

**Right:** layout of both rows, every colour and stacked gradient, chips and badges HUG (the spec named it), toggles drawn in CSS, progress fills in percentages, no section 1 or 2 traps.

**Wrong (4 small fixes):** input text missing because it wrote `input.placeholder = ...` on the class instead of `.attr("placeholder", ...)` (and "Jane Cooper" is a value, not a placeholder); the toggle class was passed as a second argument so `ctl-off` printed as text; the white form title used an `h4` so the Label style won over the 24px/600 title; dark placeholders were too faint (browser default opacity). Haiku itself flagged the input API as its unsure point.

**Pattern:** form elements need the element API spelled out (`.attr`), and `c("a b")` takes ONE class string; put that in every spec's pitfall list.

## Section 4 · Feature Cards & Lists (46k tokens, ~1 min)

**Right:** all three feature cards (eyebrow dot, title, body, divider, full-width button, Prime blend-in), the three list panels, markers, colours, `fea-` prefix, `.attr`/single-string `c()` lessons applied without reminders.
**Wrong:** the fourth dark-list row ("PRIME LABEL ON DARK") rendered twice, because the spec said "marker AND text are Label style" and Haiku emitted both; the page card kept a 120px top pad copied from earlier sections (Figma ~56px). Both fixed by hand.
**Lesson:** when a spec says a row has no marker, say "one text only"; ambiguous "marker and text" wording is read literally.

## Section 5 · Pricing & Dashboard (45k tokens, ~47 s)

**Right:** the three pricing cards (white, dark, prime, with their different dividers and check colours), full-width buttons, the whole dashboard (sidebar, active nav item, user box, KPI tiles, activity rows), `prc-` prefix, no API traps, 56px page pad from the spec.
**Wrong:** one miss. The spec listed the sidebar's nav items flat among the sidebar's 24px-gap children, and Haiku wrapped them in a group with `gap: 0`, so the nav items sat 24px too close. Fixed by hand.
**Lesson:** when a gap applies between items that look like one group, say "no wrapper; each item is a direct child of the sidebar" or give the group its own gap.

## Section 6 · Task Management (47k tokens, ~55 s)

**Right:** the whole page structure (two-column task row, three progress cards, the priority row with the clipped P1/P2 cards), the pill and avatar-stack helpers, 5-step bars, the milestone line, the `tsk-` prefix, no wrappers, 56px page pad.
**Wrong:** one miss. The sub-task dots: the spec said "filled dot" and "hollow dot", and Haiku drew them as text glyphs ("●" and "○") with inline styles, so the done dots came out tiny and the open dots came out dark. Replaced by two CSS classes (`tsk-dot-done`, `tsk-dot-open`).
**Lesson:** for any small shape (dot, bar, circle) say "an empty div sized W x H with this background and border, no text glyph".

## Section 7 · Timeline & Task Detail (49k tokens, ~59 s)

**Right:** everything. Nine 42px rows with the hour labels bold and the quarter hours soft, the three absolutely-placed event cards at their exact left/top/width/height (including the clipped last line), the now-line with its dot, and the whole detail card (pill, title, footer, divider, facts, activity box). No fixes needed; compared against the Figma screenshot at 1920.
**Why it worked:** the spec gave exact pixel offsets for the absolute items, said "empty div, never a text glyph" for shapes, and said "no wrappers". All three lessons from sections 4-6 were in the pitfall list.
**Lesson:** a spec with exact numbers for absolute positioning and an explicit "this clips, that is correct" note leaves Haiku nothing to guess.

## Section 8 · AI Collaboration (47.7k tokens, ~60 s)

**Right:** the compact footer and expanded composer side by side, the release-readiness conversation with three message bubbles, the code block with its COPY header, the status pills, the action buttons, the footer composer, the `col-` prefix, no wrappers.
**Wrong:** one miss. The spec said the message bubble has a 4px top-left corner and 10px elsewhere; Haiku applied a 4px radius to the first child (`:nth-child(1)`) instead of the bubble itself. Fixed as `border-radius: 4px 10px 10px 10px` on `.col-bubble`.
**Lesson:** write per-corner radii as the CSS shorthand itself ("border-radius: 4px 10px 10px 10px on the bubble"), never in words.
