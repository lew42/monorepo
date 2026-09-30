# Minion E — answer the fresh review's findings

Load the `minion` skill, then `code` and `page`. Parent: task-mastermind-review. Task: `public/framework/ai/2026-09-30/review/requirements.md`. The review to answer: `public/framework/ai/2026-09-30/review/review/report.md` (read its top 10 lines; shots in `../shots/127-0-0-1-64869-*`).

**Work ONLY in the worktree `C:/Code/lew42/worktrees/review`** (server http://localhost:64869/). Commit by exact path (never `git add .` / `commit -a`: ~230 unrelated dirty files.jsonl). Every spawn sets `windowsHide: true`.

## Fixes
1. **The card shows the report (finding 1).** In `Server/review.mjs`, after the `{"review":…}` line is written, post one message to the task's card through the same loopback MCP helper (`mcp("card_reply", {card, from: "review.mjs", text})`). The card id: the `Card:` line of requirements.md (e.g. `2026/09/30/one-review-skill-system-questions-screen`), else task.jsonl's first `assign.card`. Text, plain: `Review: <verdict>, <N> findings (<k> fix). Report: /framework/ai/<task path>/review/report.md · Shots: /framework/ai/<task path>/<sheet>` (site urls under `/framework/ai/`). A failed post is logged to stdout, never thrown. Skip when there's no card.
2. **The wall reads in review order (finding 2).** In `public/framework/ai/review/page.js`, swap `.masonry` for the row-major `grid auto` (framework.css: `repeat(auto-fit, minmax(var(--column),1fr))`) keeping `--column: 26em`, and `align-items: start` via an existing utility if there is one (grep framework.css), so across each row the systems read in order.
3. **Tiles band (finding 3):** put the concept tiles in the same `wide` track as the wall, so at 1920/3440 they sit on one or two rows, not three.
4. **"What's in flight" (finding 4):** move it above the wall (after the tiles), so it isn't 5–12 screens down.
5. **Readme count (finding 6):** fix `public/framework/ai/review/readme.md` so it names the systems the page actually shows (Requirements live in the review skill, not a questions file); remove the unused `Requirements` entry from `SYSTEM_ICON` only if it is really unused.
6. **Gate wording (finding 7):** in `Server/merge.mjs`'s refusal text, say "no review report (review/report.md)" and drop "with shots at 400/1200/1920/3440" — don't add a png check.

Check: `node --check` both .mjs files; `node C:/Code/lew42/monorepo/Server/layout-check.mjs http://localhost:64869/framework/ai/review/ --bands --out C:/Code/lew42/monorepo/public/framework/ai/2026-09-30/review/fixes/shots` and look at the sheet (tiles ≤2 rows at 1920, wall in order, zero errors). Commit, reply one line per fix, stop.
