# Minion B — nested tasks: the picture

Load the `minion` skill first, then `page`, `layout`, `css`, `new-page`. The owner's words: [owner-words.md](/framework/ai/sessions/2026/09/29/cards/lifecycle-nothing-left-running-nested-ta/owner-words.md). The parent brief: [../requirements.md](../requirements.md). Minion A's module: `public/framework/ext/AITask/tree.js` (+ `tree.test.mjs`) and its outcome in [../minion-data/task.jsonl](../minion-data/task.jsonl). Log in YOUR OWN task.jsonl, this folder.

**Work in the worktree `C:/Code/lew42/worktrees/qf-5`** (its server: http://127.0.0.1:52847/). Commit there by exact path. Don't merge.

## The owner's sentence (the acceptance test)
"the visual design could indicate clearly whether it's parallel or series and how it all flows and what's in flight and what we're waiting on and the percentage completion" — and "I'm not sure exactly how those should look". So: try designs, pick one, keep the others one click down.

## Deliverables
1. **Three designs, each a live demo on the same made-up plan** (a root task; phase 1: three parallel subtasks, one landed, one running at 60%, one running at 20%; phase 2: two parallel subtasks waiting on phase 1; one phase-1 task has two minions of its own). For example — pick your own if better:
   - **Lanes**: phases as columns left→right with an arrow between; parallel tasks stacked in a column; a progress bar per card.
   - **Outline**: an indented tree (use `ui/item` icon rows / `ux/Tree` from task-mastermind-item-ui) with a "parallel" or "then" badge on each group and % on each row.
   - **Flow**: a node graph (inline SVG or CSS grid) with edges for `after`.
   State reads the same in all three: landed (check), running (pulsing dot + %), waiting (hollow clock + "waits for …"). Every view uses real tokens and the `ai` / `aitask-` class prefix (run `new-css-class`).
2. **Pick one** after looking at all three at 1280 and 1920; say why in a `decision` line in your log (alternatives named). The winner is the default.
3. **Pages, routed** (nothing crawls: each is named in its parent's `children:`):
   - `/framework/ext/AITask/tree/` — **today's real tasks** as the winner design, via `tree_for_day()`; `?date=YYYY-MM-DD` picks another day. Top: one line saying what it is + counts (running · waiting · landed).
   - `/framework/ext/AITask/tree/demo/` — the made-up two-phase plan in the winner design.
   - `/framework/ext/AITask/tree/lanes/`, `…/outline/`, `…/flow/` (or your names) — each design, reachable one click down from the tree page.
   - Link the tree page from the AITask Doc overview and from the day dashboard's header if there's an obvious spot (`dashboard.js`); a link only.
   - Keep v1 reachable: the designs are classes, variants extend a base (the owner's "never destroy a viable version").
4. **One doc page** `public/framework/ext/AITask/doc/nested.md` on the model (line-1 `parent_task` and `after`; derivation from inbox for older logs; % rule; phases; waiting), linked from `ext/AITask/readme.md` with one Watch-out line and one More link.
5. **Proof:** screenshots of the tree page and the demo at 1280 and 1920 (headless Playwright against the worktree server; never drive the owner's tabs), saved in this folder and logged as `shot` lines. Zero console errors on every page you made (`node Server/smoke.mjs C:/Code/lew42/worktrees/qf-5` or load them).

## Fence
`public/framework/ext/AITask/**` except `tree.js` (minion A's — ask your parent for a change to it; a small bug fix there is fine if you log it). Nothing outside.

## Rules
No DOM after an `await` (capture the box, fill it in a callback). Every CSS rule in a layer. Every Node spawn sets `windowsHide: true`. Stop every server and browser you start.

## Done
Commit, then end with ≤120 words: the page URLs, which design won and why, the screenshot paths.

