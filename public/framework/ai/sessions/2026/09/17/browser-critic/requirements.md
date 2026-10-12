# browser-critic — press every control on /layouts/browse/ against the owner's sentence, fix what fails, re-press

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more. Clear beats brief by far. Prioritize.
**Length budget:** your findings are numbered `log` lines, one sentence each with the measurement; your landing report is one screen: findings found / fixed / left, with the numbers.
**The reader is the overwhelmed newcomer.** Level 1 is shown, not told; detail one click down.

## The owner's sentences this page must satisfy (2026-09-17)

> the layouts are too complex and they're not polished enough. There's a lot of just random blank spaces. There's just a lot of things that don't line up properly. And part of that might require me going through layout by layout and either approving it or recommending what needs to change. So I think to do that, we need a layout browser. It's not just for layouts. The global layouts need to be different from the smaller templates, like mobile card UI, just from the actual layout of those pages in terms of what goes where, and how to browse all of those.

> I kind of think we need an approve or improve for the layout system.

> we should be able to create content where I can browse through the decisions that were made [...] iceberg UX. Minimal, effective, with the depth and detail at your fingertips, but nested away so it looks clean and simple.

And the standing rule (2026-09-13): "we want to see self-evident demos that are impossible to misunderstand. every button, every item, every part — perfectly clear what goes where, what does what, what clicks do." A control with no visible consequence reads as broken.

## What to do

1. **Read** `public/layouts/browse/` (page.js, browse.css, verdicts.js, items.json, readme.md, doc/) and the builder's log `ai/2026-09-17/layout-browser/task.jsonl`.
2. **Press everything, headless, at 400 / 1280 / 1920 / 3440** on your private server (`PORT=8097 node server.js`, background, killed by PID at landing): the tier strip chips (do they jump to the tier? does the count read right?), every card kind (a live wire, a reused shot, a headless shot) opening to level 2, the three-width pictures, the real-page link, the "why" fold (does it open? does it show the readme watch-outs and decisions when they exist, and say nothing — not an empty box — when they do not?), **Approve** and **Improve** (press each once for real on ONE item, watch the card mark and the tier count change without a reload, then truncate `public/layouts/verdicts.jsonl` back to zero bytes — the owner is the only writer), the history fold, the back-out path from level 2 to the wall. At 400: one column, nothing at x:0, the strip wraps or scrolls on purpose, level 2 readable, the buttons reachable with a thumb.
3. **Judge against the sentences**, one line each: can a stranger say in ten seconds what this page is for? Is Global visibly different from Components? Does the intro TELL what the page is about to show (the newcomer rule: one short line, then show)? Does an item read as one layout, or as a page screenshot the reader must decode? Are the pictures the right SIZE to judge a layout by (a 3440 shot shrunk into a 14rem card is a grey smear — say whether the card should show the 1920 shot, and fix it if so)? Do the three tiers' cards align to one grid rhythm (no random blank space between tiers)? Is anything a control with no visible consequence?
4. **Fix every finding you can inside the fence**, the cause not the symptom, keep it easy to change, caveat beside it; then re-press by number and log which numbers now pass. Two failures on one item → leave it with the reason.
5. Findings that need a decision outside the fence go in your log as proposals with the file:line.

## Rules

- Load `code`, `layout` (the wall recipe: `--column` in rem; framed cards ride the padded track; three invariants at four widths), `css`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/browser-critic/`); `finish-task` at the end; `skill-improvement` for any skill that misled you.
- **Fence:** `public/layouts/browse/**` and your task dir. Nothing else — not `/layouts/page.js`, not the realms pictured, not core. The builder has landed; nobody else edits the browser.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. `ui-test` has the headless recipe; shots of anything you fixed, before and after, into your task dir as jpeg.
- Two numbers that must agree: items in `items.json` and cards drawn on the wall.
- Landing: `outcome` = a headline (found N, fixed N, left N), the list by number, one before/after pair, the link. One screen.
