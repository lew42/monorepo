# Spec 8 · AI Collaboration (Figma node 115:2950, Page 7, The Palette)

Build `palette/collab/page.js` + `palette/collab/collab.css`. Copy the pattern of `../timeline/page.js` and `timeline.css` (section 7, working): Page class, `View.stylesheet(import.meta, "collab.css")`, CSS in `@layer theme` (restate `@layer base, theme, site, util;` on top), classes prefixed `col-`.

**Framework facts (earlier sections broke on these):**
- `p.c("cls", "text")`, `div.c("cls", () => {...})`. `c()` takes ONE class string; a second argument is the text/children. Inline style: chain `.style(prop, val)`; never `{style:...}`.
- Page `width: "full"`; the outer card needs CSS `grid-column: 1 / -1; max-width: none; box-sizing: border-box`.
- Rows of columns: `align-items: start`; flexible columns `flex: 1 1 0; min-width: 0`.
- Use `p` for every text (never h4). Data-driven: arrays + loops. Explicit colour on every text element.
- ONE TEXT ONLY: exactly the texts listed. NO WRAPPERS: children go directly in their parent.
- SHAPES are empty `div`s with a size, background and radius. Buttons here are plain `div`s containing one `p` (not `<button>`).
- Buttons that "HUG" get `align-self: flex-start` (or sit in a flex row that does not stretch them); never full width unless the spec says.

**Tokens:** prime `#72c4ff`; PRIME25 = `linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), #72c4ff`. WHITE10 = `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), #fff`. Label = 14px/700 uppercase, letter-spacing .07em, line-height 1.4 (a Label text is always uppercase, even "Ask AI", "Cancel", "Copy": write the text as given and let `text-transform: uppercase` do it). Body = 16px/500 lh 1.8. Ink = `rgba(0,0,0,.8)`, soft = `rgba(0,0,0,.55)`, line = `rgba(0,0,0,.1)`.

**Reusable pieces (helper functions in page.js):**
- **Pill:** padding 4px 8px, radius 999, Label, HUG. PRIME25 bg + white text.
- **Soft button:** padding as stated, radius as stated, bg WHITE10, Label ink, HUG.
- **Prime button:** same shape, bg PRIME25, Label white.
- **Composer:** bg `#fff`, border 1px `#72c4ff`, radius 8, padding 12, flex column, gap 10, full width. Contents: body ink "Ask about this task, request a revision, or dictate feedback…"; then a row (flex, space-between, align center, full width): a soft "DICTATE" button (padding 6px 8px, radius 4) on the left and a 30x30 send button (radius 4, bg PRIME25, flex centred) holding a white Label "↑" on the right.

**Section card:** white, radius 16, padding 56px 48px, flex column, gap 32. Header centred, gap 8: "AI COLLABORATION" 900 48px ink; "Compact footer, expanded composer, and full review conversation." 16px/500 lh 1.8 ink.

**Row 1** (flex, gap 16, align start, full width). Each column is a flex column, gap 8, starting with a Label (ink).
- **Left column**, fixed width 320px: Label "COMPACT FOOTER", then a card (bg `#fff`, border 1px line, radius 8, overflow hidden, flex column, full width) made of two parts:
  1. Top part (padding 14, flex column, gap 10): a Pill "IN REVIEW"; body ink "Review retry policy for background jobs"; body soft "infra/retries#61af".
  2. Bottom bar (border-top 1px line, padding 8px 10px, flex, space-between, align center, full width): a soft "Ask AI" button (padding 6px 9px, radius 5) and a Label soft "⋯".
- **Right column**, flex 1 (min-width 0): Label "EXPANDED COMPOSER", then one Composer.

**Row 2: the conversation panel** (a direct child of the section card): bg `#fff`, border 1px line, radius 10, overflow hidden, flex column, full width. Three parts:
1. **Header:** padding 12px 14px, border-bottom 1px line, flex, align center, gap 8: Label "✦" `#72c4ff` and Label "Release readiness" ink.
2. **Messages area:** padding 16, flex column, gap 14. Three message rows. A row = flex, gap 10, align start, full width: a 30x30 round avatar (radius 15, flex centred, no shrink) + a bubble (flex 1, min-width 0, padding 14, flex column, gap 10, overflow hidden, corner radii: top-left 4px, the other three 10px). A bubble's first line is a header row (flex, space-between, full width): Label ink name on the left, body soft time on the right.
   - **Message 1 (AI):** avatar bg WHITE10 with Label ink "✦". Bubble bg WHITE10, no border. Header "AI" / "10:42". Body ink "Before I begin: should retries stop after three attempts, or inherit the workspace maximum?" Then an actions row (flex, gap 8, justify-content flex-end, full width): soft button "Cancel" (padding 8px 12px, radius 4) and prime button "Begin" (padding 8px 12px, radius 4).
   - **Message 2 (You):** avatar bg PRIME25 with Label white "YOU". Bubble bg `#fff`, border 1px `#72c4ff`. Header "You" / "10:44". Body ink "Cap this path at three attempts, preserve cancellation, and keep the workspace default everywhere else." Then a code block (full width, radius 6, overflow hidden, bg WHITE10, flex column): a top bar (padding 7px 10px, flex, space-between, Label ink, bg `#fff`) with "TYPESCRIPT" and "Copy"; then a code area (padding 12, flex column, gap 16) with two body-ink lines: "const retries = Math.min(config.retries ?? 3, 5)" and "return withBackoff(runTask, { retries, signal })".
   - **Message 3 (AI):** avatar as Message 1. Bubble as Message 1. Header "AI" / "10:42". A row (flex, space-between, align center, full width): body ink "Ready for review" + Pill "TESTS PASS". Then body soft "Cancellation now exits before the timer is registered. The original retry task remains unchanged outside this worktree." Then an actions row (justify flex-end, gap 8): soft button "Improve" (padding 8px 12px, radius 4) and prime button "Approve" (padding 8px 12px, radius 4).
3. **Footer:** full width, padding 12, bg WHITE10, containing one Composer (same text as above).

Page: `new Page({meta: import.meta, title: "AI Collaboration", icon: "forum", width: "full", description: "Compact footer, expanded composer and a full review conversation.", content(){...}})`. Touch only `palette/collab/`. No commit. Report in 5 lines: what you built, what you were unsure of.
