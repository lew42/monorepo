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
