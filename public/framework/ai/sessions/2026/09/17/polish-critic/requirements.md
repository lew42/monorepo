# polish-critic — the three landed pages nobody has pressed yet: the color study, the Ask demo, the navigation lab

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more. Clear beats brief by far. Prioritize.
**Length budget:** findings are numbered `log` lines, one sentence each with the measurement; the landing report is one screen: found / fixed / left per page, with numbers.
**The reader is the overwhelmed newcomer.** Level 1 shown, not told, one screen; detail one click down; nothing floating, nothing grey for no reason, every control with a visible consequence.

## The owner's sentences (2026-09-17)

> the layouts are too complex and they're not polished enough. There's a lot of just random blank spaces. There's just a lot of things that don't line up properly.

> what does this thing need a box? [...] If it does, it needs padding. If it doesn't, it probably needs no padding. [...] this thing just looks like it's floating in midair without aligning with the margins.

> Iceberg UX. Minimal, effective, with the depth and detail at your fingertips, but nested away so it looks clean and simple.

And the standing rule (2026-09-05): don't tell the reader what you are about to show; show it. A demonstration page that needs its blockquote explained has failed.

## The three pages, and what each must satisfy

1. **`/imagine/design/color/`** (built today: `public/imagine/design/color/page.js`, `color-study.css`, `decisions.md`) — the owner's ask: *lighten = white at an alpha, darken = black at an alpha, over shades of white and gray; watch the accent's saturation, the contrast ratios go out of whack.* Press: both sliders (do the ratios and the takeaway sentence change? does anything else on the page move?), the palette link one click down, the record fold. Judge: is the takeaway readable in ten seconds? Does the intro tell before it shows? Is the wall of grounds one grid rhythm at 400 / 1280 / 3440 (cells the same size, labels not clipping, the 400 form one column)? Every painted cell's ink ratio said and true — spot-check two by computing them yourself.
2. **`/framework/ext/Ask/`** (today: `public/framework/ext/Ask/page.js`, `pick.js`, `chat.js`, `ask.css`) — the owner's ask: *select any element on the page and ask about it; the answer knows the readme and the decisions.* Press: "Pick an element" (crosshair, outline on hover, click picks, Escape cancels), the printed context (page url, element, markup, readme and decisions found), the floating ? (opens the panel; the chip shows the picked element; the chip's × clears it), the panel closes. Spend no real Claude turns (nothing is sent until Send; do not press Send). Judge: does the demo show the whole loop without a paragraph? Does the floating ? cover anything at 400 (a fixed control owes the shell the strip it stands on)? Is the panel's layout right at 400 / 1280 / 3440?
3. **`/imagine/design/navigation/`** (today: `public/imagine/design/navigation/page.js` + its css, `doc/`, `shots/`) — the owner's ask: *when a column opens, the navigation must not jump.* Press: the one button, both directions (open / close the third column); the two readouts under each row change and agree with your own headless measurement of the same click (two numbers that must agree); the Mechanisms and Numbers folds. Judge: in the stable row the middle column's text is clipped behind the rail after the row slides (the mastermind saw it in the 1920 shot — say whether a reader reads that as "broken" or as "the row scrolled", and if the former, make the slide visible: a scrollbar, a shadow, or a peek of the hidden column); intro length; the rule sentence at the bottom is the takeaway — should it be at the top?

## What to do

- Measure at 400 / 1000 / 1280 / 1920 / 3440 on your private server (`PORT=8102 node server.js`, background, killed by PID at landing); the three invariants (nothing at x:0, no prose past the measure, no constant where a spacing token exists); the box rule (a background different from the parent's ↔ padding); left edges per region on one axis; every `overflow: auto` box wanted; the fold; console errors zero.
- Fix every finding you can inside the fence, cause not symptom, easy to change, caveat beside it in that page's decisions doc; re-press by number. Two failures on one item → leave it with the reason.
- Findings needing a decision outside the fence → proposals in your log with file:line.

## Rules

- Load `code`, `layout`, `css`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/polish-critic/`); `finish-task` at the end; `skill-improvement` for any skill that misled you — you MAY append to `.claude/skills/*/improvements.md` (one line each); nothing else under `.claude/`.
- **Fence:** `public/imagine/design/color/**`, `public/framework/ext/Ask/**`, `public/imagine/design/navigation/**`, your task dir. Nothing else — not `/imagine/design/page.js`, not the dev bar, not core, not framework.css. Under `/imagine/` there is no page grid (a columns host): `wide` is meaningless, only `bleed` reaches the edge, column prose has a measure.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. `ui-test` has the headless recipe; before/after shots of anything you fixed into your task dir as jpeg. A hidden tab does not lay out.
- Landing: `outcome` = a headline (found N, fixed N, left N per page), the list by number, one before/after pair per page you changed, the three links. One screen.
