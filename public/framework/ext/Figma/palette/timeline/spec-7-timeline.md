# Spec 7 · Timeline & Task Detail (Figma node 115:2859, Page 7, The Palette)

Build `palette/timeline/page.js` + `palette/timeline/timeline.css`. Copy the pattern of `../tasks/page.js` and `tasks.css` (section 6, working): Page class, `View.stylesheet(import.meta, "timeline.css")`, CSS in `@layer theme` (restate `@layer base, theme, site, util;` on top), classes prefixed `tln-`.

**Framework facts (earlier sections broke on these):**
- `p.c("cls", "text")`, `div.c("cls", () => {...})`. `c()` takes ONE class string; a second argument is the text/children. Inline style: chain `.style("left", "91px")`; never `{style:...}`.
- Page `width: "full"`; the outer card needs CSS `grid-column: 1 / -1; max-width: none; box-sizing: border-box`.
- Rows of columns: `align-items: start`; flexible columns `flex: 1 1 0; min-width: 0`.
- Use `p` for every text (never h4). Data-driven: arrays + loops. Explicit colour on every text element.
- ONE TEXT ONLY: exactly the texts listed. NO WRAPPERS: children go directly in their parent.
- SHAPES (dots, bars, lines, circles) are empty `div`s with a size, background and radius. Never a text glyph.

**Tokens:** prime `#72c4ff`; PRIME25 = `linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff`. WHITE10 = `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`. Label = 14px/700 uppercase, letter-spacing .07em, line-height 1.4. Body = 16px/500 lh 1.8. Title = 24px/600 lh 1.4. Ink = `rgba(0,0,0,.8)`, soft = `rgba(0,0,0,.55)`, line = `rgba(0,0,0,.1)`.
**Reuse from section 6** (copy, don't import): Pill (padding 4px 8px, radius 999, Label, HUG); Avatar (26x26 circle, border 2px solid `#fff`, Label white, centred, bg PRIME25); avatar stack (all but last `margin-right: -6px`).

**Section card:** white, radius 16, padding 56px 48px, flex column, gap 32. Header centred, gap 8: "TIMELINE & TASK DETAIL" 900 48px ink; "15-minute scheduling and structured task detail views." 16px/500 lh 1.8 ink.

**One row** (flex, gap 16, align start, full width), two equal columns (flex 1 1 0; min-width 0), each a flex column, gap 16.

**LEFT column**
1. Header row (flex, space-between, align center, full width): a tag (padding 6px 10px, radius 4, bg WHITE10, HUG) with Label "TIMELINE PREVIEW" ink; and Label "Tuesday · 24 Sep" ink (it renders uppercase).
2. **Timeline box:** `position: relative`, full width, height 382px, bg `#fff`, border 1px line, radius 10, overflow hidden, flex column. It holds 9 rows, then 4 absolutely positioned items (direct children of the box).
   - **Rows**: each row = flex, gap 12, align start, full width, height 42px. Contents: the time label (Label style, width 64px, height 42px, no shrink) + a 1px-high line (`#000`, flex 1). Times in order: 09:00, 09:15, 09:30, 09:45, 10:00, 10:15, 10:30, 10:45, 11:00. Label colour: ink for the on-the-hour ones (09:00, 10:00, 11:00), soft for the others.
   - **Event cards** (`position: absolute`, bg `#fff`, border `1px solid #72c4ff` with `border-left-width: 4px`, radius 8, padding 9px 11px, overflow hidden, flex column, gap 5, box-sizing border-box). Each: a header row (flex, space-between, align center, full width) with a time range in Label style `#72c4ff` and an avatar (26px, PRIME25); then body ink title; then body soft ref. Give each card its exact left/top/width/height with `.style(...)`:
     - left 91, top 27, width 230, height 86: "09:10–09:40", avatar "MC", "Triage launch blockers", "ops/launch#91d2".
     - left 341, top 69, width 244, height 112: "09:30–10:15", avatar "AI", "Review command palette", "feature/cmd#c04b".
     - left 169, top 223, width 252, height 92: "10:20–10:50", avatar "AK", "Publish release notes", "tasks/notes#a18f".
     (Cards deliberately overlap the rows and clip their last line: that is correct.)
   - **Now line** (`position: absolute`, left 73, top 201, width 716, flex row, gap 6, align center): an 8x8 dot (PRIME25, radius 4, no shrink) + a 2px-high line (PRIME25, flex 1).
3. Body soft, full width: "Fifteen-minute increments reveal sequencing, overlap, and handoff windows at a glance."

**RIGHT column**
1. Label "TASK DETAIL · IN REVIEW" ink.
2. **Detail card**: bg `#fff`, border 1px line, radius 10, padding 18, flex column, gap 14, overflow hidden, full width. In order:
   1. Pill "IN REVIEW" (PRIME25 bg, white text).
   2. Title (24/600 ink, full width): "Update release notes with the final accessibility fixes."
   3. Footer row (flex, space-between, align center): body soft "tasks/release-notes#a18f" + avatar stack "AK", "AI" (both PRIME25).
   4. Divider: 1px high, full width, `#000`.
   5. Facts block (flex column, gap 10, full width). Three rows, each flex, gap 8, align center: a Label (soft) + body (ink): "DUE" / "Today · 16:00"; "PRIORITY" / "High"; "LABEL" / "Documentation".
   6. Activity box (full width, padding 12, radius 6, bg WHITE10, flex column, gap 5): Label soft "Latest activity" (renders uppercase), then body ink "AI linked the keyboard-navigation fix and requested a final copy review."

Page: `new Page({meta: import.meta, title: "Timeline & Task Detail", icon: "schedule", width: "full", description: "A 15-minute timeline and a structured task detail card.", content(){...}})`. Touch only `palette/timeline/`. No commit. Report in 5 lines: what you built, what you were unsure of.
