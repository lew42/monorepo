# practice-critic — judge the three practice layouts the way the owner will, fix what fails, re-measure

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more. Clear beats brief by far. Prioritize.
**Length budget:** findings are numbered `log` lines, one sentence each with the measurement; the landing report is one screen: found / fixed / left, with numbers.
**The reader is the overwhelmed newcomer.**

## The owner's sentences these pages must satisfy (2026-09-17)

> the layouts are too complex and they're not polished enough. There's a lot of just random blank spaces. There's just a lot of things that don't line up properly.

> a small number of robust layouts. We need different size layouts. We need small mobile layouts. [...] Practice with big layouts that span 3440. That are also responsive. We need more of them. We need better ones.

> what does this thing need a box? [...] If it does, it needs padding. If it doesn't, it probably doesn't need padding. [...] we add padding and then this thing just looks like it's floating in midair without aligning with the margins.

> If the navigation reflows and jumps a hundred or 300 pixels down the page, you don't even know that's the same thing.

## What to do

1. **Read** `public/layouts/practice/` (the index and the three layout pages, their CSS, their "why" folds) and the builder's log `ai/2026-09-17/practice-layouts/task.jsonl` with its eight-check table.
2. **Measure, headless, at 400 / 1000 / 1280 / 1440 / 1920 / 3440** (the two odd widths are where 400/1280/1920/3440 sweeps have missed things) on your private server (`PORT=8100 node server.js`, background, killed by PID at landing), each of the three layouts:
   - **blank space:** the widest painted span over the viewport at 3440 (≥ 0.9), and every rectangle of empty ground taller than `--flow × 3` between two content boxes in the same region — name each with its px and say whether it is wanted;
   - **alignment:** the distinct left edges of each region's direct children (one value per region), and the distinct top edges across regions in the same row (one value);
   - **boxes:** every element with a background different from its parent's — has padding? every element with padding — has a background or a border? list the exceptions;
   - **nav:** open something on the page (a fold, a tab, a card) and re-measure the nav's `x`, `y`, `width` — 0px change;
   - **the three invariants:** nothing at x:0, no prose past the measure, no constant where a spacing token exists;
   - **the fold:** the first nav element and the layout's own h1 above the fold at every width; a hero band's height in `vh` not `vw`;
   - **scrollbars:** every `overflow: auto|scroll` box and every `scrollHeight > clientHeight` inside the layout, wanted or not;
   - **the builder's table:** re-derive its eight checks yourself for one layout at one width — two numbers that must agree.
3. **Judge**, one line each, as the owner would in ten seconds per page: does it look FINISHED — nothing floating, nothing cramped, nothing grey for no reason — or like a wireframe with real text in it? Is the small form a designed layout or a stack? Would the owner press Approve?
4. **Fix every finding you can inside the fence**, cause not symptom, easy to change, caveat beside it; re-measure by number and log which pass now. Two failures on one item → leave it with the reason.
5. Findings needing a decision outside the fence → proposals in your log with file:line.
6. **Last, after every fix is in: put the three layouts in the browser.** Re-shoot each at 400 / 1920 / 3440 into `public/layouts/practice/shots/` (`practice-<name>-<width>.jpg`), copy those nine into `public/layouts/browse/shots/` under the same names, and append three entries to `public/layouts/browse/items.json` in the shape the file already uses (read one existing headless-shot entry first — the critic recorded every shot's real pixel size there; match it; no `shot` key so all three widths show): ids `practice-workbench`, `practice-reader`, `practice-catalog`, tier `global`, the `say` lines from `ai/2026-09-17/practice-layouts/task.jsonl`. Then load `/layouts/browse/` headless and count: 102 items in the file, 102 cards on the wall, the Global chip reading 48.

## Rules

- Load `code`, `layout` (all of it), `css`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/practice-critic/`); `finish-task` at the end; `skill-improvement` for any skill that misled you.
- **Fence:** `public/layouts/practice/**`, your task dir, and for deliverable 6 only: `public/layouts/browse/items.json` (append three entries) and `public/layouts/browse/shots/practice-*.jpg` (new files). Nothing else — not `/layouts/page.js`, not `browse/page.js` or `browse.css`, not core, not framework.css. The builder has landed; nobody else edits these pages.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. `ui-test` has the headless recipe; `fullPage` captures the viewport only here — give the viewport the height. Before/after shots of anything you fixed into your task dir as jpeg.
- Landing: `outcome` = a headline (found N, fixed N, left N), the list by number, one before/after pair, the three links, and one line per layout: "would the owner press Approve — yes / not yet, because …". One screen.
