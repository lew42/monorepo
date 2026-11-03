# Spec 6 · Task Management (Figma node 115:2746, Page 7, The Palette)

Build `palette/tasks/page.js` + `palette/tasks/tasks.css`. Copy the pattern of `../pricing/page.js` and `pricing.css` (section 5, working): Page class, `View.stylesheet(import.meta, "tasks.css")`, CSS in `@layer theme` (restate `@layer base, theme, site, util;` on top), classes prefixed `tsk-`.

**Framework facts (earlier sections broke on these):**
- `p.c("cls", "text")`, `div.c("cls", () => {...})`. `c()` takes ONE class string; a second argument is the text/children. Inline style: chain `.style("color", v)`; never `{style:...}`. Attributes: `.attr(name, value)`.
- Page `width: "full"`; the outer card needs CSS `grid-column: 1 / -1; max-width: none; box-sizing: border-box`.
- Rows of columns: `align-items: start`; flexible columns `flex: 1 1 0; min-width: 0`.
- Use `p` for every text (never h4). Data-driven: arrays + loops. Explicit colour on every text element.
- ONE TEXT ONLY: write exactly the texts listed, nothing duplicated.
- NO WRAPPERS: where a spec says "children of X", put them directly in X with X's gap. Do not add a group div.

**Tokens:** prime `#72c4ff`; PRIME25 = `linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff`. Dark `#675f56`. WHITE10 = `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`. Label = 14px/700 uppercase, letter-spacing .07em, line-height 1.4. Body = 16px/500 lh 1.8. Title = 24px/600 lh 1.4. Ink = `rgba(0,0,0,.8)`, soft = `rgba(0,0,0,.55)`, line = `rgba(0,0,0,.1)`.

**Reusable pieces (build as small helper functions in page.js):**
- **Pill:** padding 4px 8px, radius 999, Label text, HUG (`align-self: flex-start`, `width: fit-content`). Variants: PRIME25 bg + white text; dark `#675f56` bg + white text; WHITE10 bg + soft text.
- **Avatar:** 26x26 circle, border 2px solid `#fff`, Label text white, centred. Bg PRIME25 or `#675f56`. A stack = flex row where every avatar except the last has `margin-right: -6px`.
- **Task card:** bg `#fff`, border 1px line, radius 10, overflow hidden, padding 16 (unless noted), flex column.
- **Footer row:** flex, space-between, align center, full width: a body text (soft) on the left, an avatar stack on the right.

**Section card:** white, radius 16, padding 56px 48px, flex column, gap 32. Header centred, gap 8: "TASK MANAGEMENT" 900 48px ink; "Task cards, progress patterns, and priority treatments across approved bases." 16px/500 lh 1.8 ink.

**Row 1** (flex, gap 16, align start, full width): two columns, each flex column gap 8.
- **Left column**, fixed width 380px: Label "SIMPLE · DESCRIPTION ONLY" (ink), then a task card (gap 12, full width): a PRIME25 pill "TODAY"; body ink "Update release notes with the final accessibility fixes."; footer: "tasks/release-notes#a18f", avatars "AK" (PRIME25), "AI" (PRIME25).
- **Right column**, flex 1: Label "COMPLEX · SUB-TASKS" (ink), then a task card (gap 12): 
  1. Header row (flex, space-between, align center): left group (flex, gap 8, align center) = dark pill "FEATURE" + title "Ship command palette" (24/600 ink); right = Label "2 / 4" (soft).
  2. Body soft: "Unify navigation, search, and common actions behind one keyboard-first surface."
  3. Sub-task list: flex column, gap 7, full width. Each row = flex, gap 8, align center: a 14x14 dot + body text (flex 1). Rows: "Map keyboard shortcuts" and "Build command search" = filled dot (PRIME25, radius 7), text soft. "Add recent actions" and "Run accessibility pass" = hollow dot (white bg, 1px line border, radius 7), text ink.
  4. Footer: "feature/command-menu#c04b" (soft); avatars "MC" (dark), "AI" (PRIME25), "JD" (PRIME25).

**Row 2** (flex, gap 16, align start, full width): three equal cards (flex 1 1 0; min-width 0), bg `#fff`, border 1px line, radius 10, padding 14, flex column, gap 10, overflow hidden.
1. **Five-step rollout:** header row (flex, space-between, Label style): "Five-step rollout" (ink) and "STEP 3" (soft). Then a row of 5 bars (flex, gap 5, full width), each flex 1, height 7, radius 4: first three PRIME25, last two `#000`. Then body soft "Review in progress".
2. **Migration:** header row (Label, ink, space-between): "Migration" and "68%". Then a track (full width, height 7, radius 4, overflow hidden, bg WHITE10) holding a fill (width 68%, height 7, radius 4, PRIME25). Then body soft "17 of 25 modules".
3. **Milestones:** Label "Milestones" (ink). Then a row (flex, align center, full width) of: three segments (each flex 1, flex, align center) = a 16x16 circle (PRIME25, radius 8, centred white "✓", font-size 10px, line-height 1, overflow hidden) + a 2px-high line (flex 1, PRIME25); then a final 16x16 hollow circle (white bg, 2px border line, radius 8). Then body soft "QA is the final gate".

**Row 3:** a `p` "Priority by scale" (24/600 ink), as a direct child of the section card.

**Row 4** (flex, gap 12, align start, full width):
- **P0 card**, flex 1, height 220px, bg `#fff`, border 2px `#72c4ff`, radius 10, padding 22, overflow hidden, flex column, `justify-content: space-between`. Children in order (no wrappers): dark pill "P0 · BLOCKER" with text colour `#72c4ff`; title (24/600 ink, full width) "Resolve release-blocking focus trap"; body soft "Blocks the release candidate. Receives strongest visual weight."; footer "fix/focus-trap#b912" (soft) with avatars "MC" (dark), "AI" (PRIME25).
- **Right column**, fixed width 300px, flex column, gap 10: 
  - **P1 card:** full width, height 132px, bg `#fff`, border 1px `#72c4ff`, radius 10, padding 14, overflow hidden, flex column, `justify-content: space-between`. Children: PRIME25 pill "P1 · HIGH" (white text); title "Ship command palette" (24/600 ink; it wraps to two lines and the card clips the last line, that is correct); body soft "feature/cmd#c04b".
  - **P2 card:** full width, height 92px, border 1px line, same structure, padding 14: WHITE10 pill "P2" (soft text); body ink "Update changelog"; body soft "docs/changelog#ec21".

Page: `new Page({meta: import.meta, title: "Task Management", icon: "task_alt", width: "full", description: "Task cards, progress patterns and priority treatments.", content(){...}})`. Touch only `palette/tasks/`. No commit. Report in 5 lines: what you built, what you were unsure of.
