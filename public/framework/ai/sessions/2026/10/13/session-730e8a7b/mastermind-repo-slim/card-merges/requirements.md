# Card kinds: merge 75 down to 36

**In one line:** fold the remaining box styles into the eight target kinds (card, frame, region, preview, pill, row, fold, popover), one merge at a time, each proven with before/after shots.

Budget: $15. Sonnet. Load the `sub-mastermind`, `code`, `page` and `ui-test` skills. Your log is this dir's `task.jsonl`.

**The owner's ask (todo line 111, from the 2026-09-24 card consolidation):** 75 kinds of box become 36.

- **The spec:** `/framework/ux/Content/plan/` (`public/framework/ux/Content/plan/readme.md`, `plan.json`, `doc/method.md`). `node public/framework/ux/Content/plan/count.mjs` recounts files and pages per merge.
- **The original brief:** `public/framework/ai/sessions/2026/09/24/card-consolidation/card-consolidation/merges-requirements.md` (367 words: read it whole; its Fence and Steps apply).
- **Done:** the first three merges (`ui-cards`, `ui-pills`, `link-tiles`), verified at 1920 and 390 with 0 console errors across 16 pages.
- **Next, in order (pages, files):** 6 regions (12, 28), 7 ai-pills (6, 18), 8 frames (7, 12), 9 ai-rows (7, 27), 10 ai-cards (15, 30), 11 doc-well (17, 20), 12 tab-panes (33, 37), 13 surface-pad (127, 132).
- **The plan's "Watch out" lines are law:** the three new classes live only on the plan page until a merge moves each rule into its module; page counts are what grep finds, a shared module reaches more; a box that wears `flex v gap` and moves to `.card` double-gaps unless those words go in the same edit.
- **CLAUDE.md:** every CSS rule inside a layer; "Main site is production" (worktree, `check_page`, merge); "Commit after every working step".

## Deliverable

1. **Order and budget:** take the merges in `count.mjs` order starting with the lowest number not done (4 and 5 if they exist, else 6 regions), one merge per cycle; before each, a `log` line with the merge name, its file and page counts, and the shot list; stop when the budget is at $12 and land what is proven. Spawn a Sonnet minion only for parallel shot-taking, never for a merge.
2. **Each merge:** move the target class's rules from `plan.css` into the owning module's CSS (inside its layer), replace the old kind's class on every file `count.mjs` lists, keep the look pixel-close: before/after shots at 1920 and 390 of every page the merge reaches (the plan's "Reach" when it is a shared module), compared by eye and by `node Server/padding-check.mjs`; `check_page` on each at 400 and 1200 with zero console errors and zero same-origin 404s. One commit per merge, named for the merge. Update `plan.json` so the merge reads done and rerun `count.mjs` (the plan page's two numbers move: print before and after).
3. **Stop rules:** a merge whose shots differ in anything but the box style gets reverted in that worktree and a `decision` line naming the one page and why; a shared-module merge (doc-well, tab-panes, surface-pad) is not started unless at least two smaller ones landed clean this run and the budget allows the whole thing. Never touch a page the owner has open (`pages` must be empty for the pages you shoot, else wait).
4. `merge.mjs` after each landed merge (`--no-review` naming your review if the gate cannot see this 2026-10-13 task dir); `Server/smoke.mjs` clean; a `finish` line with the merges landed, the two plan numbers before and after, and the dollars, checked with `tail -1`; `git status` clean for your paths; update the todo line 111 text in `ai/todo.md` with the new "done" list (strike it only if all 13 are done); `card_reply` on the card you create (`create_card` once, type `task`, title "Card kinds: the next merges landed"). Never restart servers; never drive the owner's tabs.

Fence: the module CSS files and the pages each merge lists (through `count.mjs`), `public/framework/ux/Content/plan/{plan.json,plan.css}`, the todo line, the card, shots in this dir (never committed), this task dir. Not the catalog's data, not the layers order in `framework.css`.
