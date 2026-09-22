# ranked-lists — threaded, rankable lists for the dashboard, the tasks and the decisions; owner items first with their minutes; column paging over the thread

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one verb, one gesture, reuse `ux/Tree` and the importance system; no new module unless the census of what exists says so). Clear beats brief by far. Prioritize (the owner items strip first, ranking the asks second, column paging third).
**Length budget:** the "needs you" strip is one line per item; a ranked list is the list it already was, draggable; your landing report is one screen.
**The reader is the overwhelmed newcomer.** Shown, not told.

## The owner's words (2026-09-17, 22:40)

> Your report page should read: "Cloudflare API setup - 5 mins", or whatever.. if you need something from me like that, and it's quick and easy, we need to prioritize these things. How do we prioritize the ai dashboard, the task lists, the decisions within each task, etc? We need some sort of threaded rankable lists. Yes, threaded ranked lists. That's what prioritized cards or list items would be. Figure out how to get column paging to work with this.

And tonight's rule in the mastermind skill: roadblocks the mastermind cannot pass alone (credentials, a paid account, a deploy) go on the dashboard as an owner item with the minutes it will take.

## What exists — reuse

- `ext/JSONL` verbs `ask` (with `topic`, rendered grouped on the Asks tab — `ext/AITask/asks.js`), `decision` + `verdict` (the Decisions tab, `ext/AITask/decisions.js` or wherever tonight's builder put it — read `ext/AITask/doc/decisions-tab.md`), `rpc:append` as the browser's only write (`public/layouts/browse/verdicts.js` is the seam).
- `ux/Tree` (merged tonight): `new Tree({ nodes, drag: true, adapt, acts })`, one `move({ node, into, index })` event, the tree never writes; `Tree.from(page)`.
- `/imagine/importance/` — a typed graph + pairwise judgments, `Graph.js`'s one `score()`, `importance.mjs`, live over the socket. Read its readme: ranking by comparison already exists there.
- `core/Page` columns with `this.columns({ even: true })` (tonight): N equal columns, the newest N shown, a slide.
- The front `/framework/ai/` (`ext/AITask/highlights.js`), the day dashboard (`dashboard.js`), a task page's tabs (`AITask.js`).

## Deliverables (each ticked against the sentence above at harvest)

1. **Owner items, first.** An ask or a decision may carry `needs: { owner: "<what>", minutes: <n> }` (document beside the verbs). Everything that carries one renders as a **"Needs you" strip** at the top of the front page `/framework/ai/` and at the top of a task page's Asks tab: one line each — the what, the minutes, a link — sorted by minutes ascending, gone when the ask lands. The mastermind will stamp `needs` on the SQLite ask (`Cloudflare login and D1 create — 5 min`); make sure that one shows.
2. **Ranking.** A `rank` verb: `{"rank": {"list": "<asks|decisions|tasks>", "at", "order": ["<id>", …]}}`, the last line wins, written by the owner's drag through `rpc:append` into the task's own `task.jsonl` (the seam), rendered as the order of the Asks tab's cards inside their topic band and of the Decisions tab's rows. The drag is `ux/Tree`'s one gesture or the same pointer handler the browser uses — decide, and write the alternative: pairwise judgment (importance's way) instead of drag, when it would be the better choice and why not now. Buttons and drags hidden off the dev server; the order still renders from the file.
3. **Threaded.** An ask's serving tasks and a task's decisions are the thread under it: the Asks tab's level 2 already shows them; ranking applies at each level (asks within a topic; decisions within a task). Say in the doc what "threaded" means here in one sentence.
4. **Column paging over the thread.** A demo page `/imagine/importance/ranked/` (one `children:` word + one line in `/imagine/importance/page.js`) that is a columns host on `columns({ even: true })`: topics → asks → the serving tasks, each column a ranked list drawn from the run task's log (`/framework/ai/2026-09-17/mastermind-layout-browser/task.jsonl`, read only), click an item to open its thread as the next column, drag to rank (writing to that same log through the seam — the owner's log; prove the write on YOUR task's log instead, and leave the demo reading only unless the run task is what is open). Nav measurement: 0 / 0 when a column opens.
5. **Docs:** the verbs beside `ask`/`decision` in `ext/JSONL/doc/task-jsonl.md`; `ext/AITask/doc/ranking.md` (the strip, the rank line, what threaded means, the alternative); `ui`/`ux` untouched.

## Rules

- Load `code`, `layout` (under a columns host there is no page grid), `css`, `new-css-class`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/ranked-lists/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/framework/ext/JSONL/**`, `public/framework/ext/AITask/**` (except `doc/file/ai.css.md`, which a cleanup minion owns tonight), `public/imagine/importance/ranked/**` (new) + one word and one line in `public/imagine/importance/page.js`, your task dir. Nothing else — never the run task's `task.jsonl` as a WRITE target from your tests (read it; the mastermind writes it), never `ux/Tree`.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. The owner's server (port 80) is NOT running; start your own: `PORT=8112 node server.js` from the repo root, in the background; kill it by its real Windows PID when you land (`$!` is not one). `ui-test` has the headless recipe; press the drag for real on YOUR task's Asks tab (write one ask line into your own log first), watch the order come back off the socket, leave it in.
- Two numbers that must agree: items in a list and rows drawn; the `needs` items in the logs and lines in the strip.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock.
- Landing: `outcome` = a headline, the links (the front's strip, your task's Asks tab ranked, the ranked demo), one screenshot of the strip at 1280, the decision line for drag vs pairwise, what was left and why. One screen.
