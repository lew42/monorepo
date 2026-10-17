# The Dictate page fills a wide screen

Budget: $4. Sonnet. Load the `minion`, `code`, `layout` and `page` skills. The finding (`../sheet-controls/task.jsonl`, 10:37, layout-check): `/framework/ux/Dictate/` is 65% empty at 2560 and 72% at 3440, narrow share 0.94 at 3440; padding-check clean. The same problem on `/tasks/` was fixed on 10-17 by `../tasks-wide/` (CSS columns on the page's groups at 1920 and up, `.wide` on the page box, `core/Task/TasksPage.js`: read that diff, `git show a3175183c eaf2da41f`, and do the same kind of thing, not a second system). Read `ux/Dictate/readme.md`, `ux/Dictate/page.js` (what the page shows: the widget demo, the proof pages, the docs index), CLAUDE.md "Presentation" (level 1 one screen; spacing doubles at 3440), and `styles/layouts` for the `cols` words the site already has. Your log is this dir's `task.jsonl`.

## Deliverable

1. **Decide the wide layout** (a `decision` line with the alternative): the demo widget and its explanation side by side at 1920 and up, the rest of the page's sections flowing into two or three columns; or a Browse view. Pick the one that keeps the page's look at 400 and 1200 identical and needs the least new code.
2. **Build it** in `ux/Dictate/page.js` and its CSS (one rule set in the page's layer; reuse a `cols` word if one fits). `check_page` at 400, 1200, 1920, 3440; `node Server/padding-check.mjs` at the same widths: no text at an edge, empty share under 0.6 at 3440; `layout-check` sheets in this dir, never committed.
3. One line in `ux/Dictate/readme.md` saying how the page lays out wide. Worktree, `node --check`, `Server/smoke.mjs` clean, `merge.mjs` (`--no-review` naming your review if the gate cannot see this 2026-10-13 task dir), a `finish` line with the empty share before and after checked with `tail -1`, `git status` clean for your paths; close the todo line about it in `ai/todo.md` with the link. Never drive the owner's tabs; never restart servers.

Fence: `ux/Dictate/page.js` and its CSS, one readme line, one todo line, this task dir. Not the widget, the engine or the sheet.
