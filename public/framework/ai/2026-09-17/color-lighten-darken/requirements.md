# color-lighten-darken — lighten/darken tokens, the accent's contrast, and the box-and-padding rule

**Three laws.** Less is more (ASAP: fastest working version, then improve; show, don't tell). Clear beats brief by far (a newcomer says what the page is for in ten seconds; full plain sentences, basics first). Prioritize.
**Length budget:** the study page's level 1 is one screen: the takeaway in one sentence, then the grid. The skill section is under 25 lines. Your landing report is one screen of plain sentences with links.
**The reader is the overwhelmed newcomer.** Shown, not told. Detail nests one click down.

## The owner's words (2026-09-17)

> I've been playing around with the lighten and darken colors. So basically lighten would be like a white with a certain alpha percentage and darken would be like black with a certain alpha percentage. And then I've been using those on different shades of white, light gray, dark gray, etc. And then you have to pay careful attention to the accent color. Usually I'm using a primary color, just one hue, usually it's kind of bright and vivid. But depending on how saturated that color is, the contrast ratios can get out of whack pretty quick. You can experiment with that. The layout problems that we're having, I think part of it is about color schemes because getting the right colors, the right background colors are so important.

> the layout skill should have careful analysis of contrast ratios, boxes, you know, what does this thing have need a box? It doesn't need a background color that's different from its parent. If it does, it needs padding. If it doesn't, it probably doesn't need padding. A lot of times we don't have a background change, but we add padding and then this thing just looks like it's floating in midair without aligning with the margins.

> before we create anything, we need to do a much better job analyzing all of the components [...] We need to talk about layout, navigation, structure, visual hierarchy. What goes where? We need iceberg UX. [...] We need to focus on color, focus, interaction, and purpose and outcome.

The full prompt: `../mastermind-layout-browser/requirements.md`.

## Deliverables (each ticked against the sentences above at harvest)

1. **The tokens.** `--lighten-1/2/3` (white at three alphas) and `--darken-1/2/3` (black at three alphas) in the theme layer where the site's color tokens live (find the file: `public/framework/styles/`, `framework.css`'s theme section; name the file in your log). Additive only: nothing existing changes value. If the owner already has lighten/darken values somewhere (grep `lighten|darken|rgba(255|rgba(0` in `public/framework/styles/` and `public/imagine/design/`), reuse theirs and say so.
2. **The study at `/imagine/design/color/`** (exists: `page.js`, `color-study.css`, `shots/` — read it first and EXTEND it; keep what is there unless it contradicts this). Level 1, one screen: one takeaway sentence, then a grid of grounds (white, light gray, mid gray, dark gray, black) × the six steps, each cell painted for real and labelled with its computed hex and the contrast ratio of the site's ink on it (WCAG 2 relative luminance, computed live in JS from `getComputedStyle`), pass marks at 4.5 (text) and 3 (large/UI). Then the accent row: one vivid hue at five saturations (the site's `--accent` and four variants) as text on each ground and as a ground under white and ink text, each with its ratio and pass/fail. **Interactive:** a hue slider and a saturation slider change the accent everywhere on the page live. The takeaway sentence is computed, not typed: which saturations can carry text on which grounds.
3. **The layout skill gains one section, "Boxes, padding and contrast"** — appended to `.claude/skills/layout/SKILL.md` after "Rhythm — one system per box", in the owner's rule, plainly: *Does this thing need a box, a background different from its parent? If yes, it needs padding. If no, it probably needs none — padding with no background change floats the thing in midair, off the margins its siblings align to.* Then: every text/ground pair you introduce gets its ratio said out loud (4.5 for text, 3 for UI), and the accent's saturation decides whether it can carry text at all — link the study. Then the pre-build analysis, as a checklist the owner dictated: layout · navigation · structure · visual hierarchy (what goes where) · iceberg UX (minimal, the depth one click down) · color · focus · interaction · purpose and outcome — answered in a line each before the first factory call; "we are creating a system for making more things, not one thing." Edit nothing else in the skill.
4. Linked: the color page is already a child of `/imagine/design/`; confirm it renders from the parent. The skill links the study.

## Rules

- Load `code`, `layout`, `css` (framework.css's layers: theme tokens live in `theme`); `new-task` before the first edit (your dir exists: `ai/2026-09-17/color-lighten-darken/`; write its `task.jsonl` launch line); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/imagine/design/color/**`, the ONE theme token file you name, one new section in `.claude/skills/layout/SKILL.md`, your task dir. Nothing else.
- **Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`.** The owner's server (port 80) is NOT running; start your own: `PORT=8093 node server.js` from the repo root, in the background; kill it when you land. `ui-test` has the headless recipe; shots at 400 / 1280 / 3440 into your task dir as jpeg. A hidden tab does not lay out.
- Under the `/imagine/` columns host there is no page grid: `wide` is meaningless, only `bleed` reaches the edge, and column prose has a measure (layout skill Q1). The grid is a wall: `.grid.auto` with a real `--column`.
- Only `p()`/`h1`–`h6` read backticks; one backtick inside `css(\`…\`)` kills every page. Every CSS rule inside a layer.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock; never Out-File for jsonl.
- Landing: `outcome` = a headline, the link to the study, one screenshot at 1280, the computed takeaway sentence, the skill section's first line, what was left and why. One screen.
