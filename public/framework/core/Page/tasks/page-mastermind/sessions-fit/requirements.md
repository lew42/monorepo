Budget: $6

# AI sessions pages: the 400 px tab bar and the 1920 sessions table fit

Load the `minion` skill first, then the `layout` skill. This task's log is `session.jsonl` in this folder; findings go there as `log` lines (`node .claude/hooks/append.mjs <file> <json-array-file>`), never a findings file.

**Why:** a shot report of the sessions pages found 14 of 14 pages failing at some width: [sessions-shots/report.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-shots/report.md). Two of its causes have no owner, and they are yours:

- **C, at 400 px:** the AI tab bar (Overview … Sessions … Tests) runs to the screen edge. "Sessions" touches the edge and "Tests" cannot be reached. Routine chips and detail tables are cut off at the right. Shot: `sessions-shots/shots/root-400.png`.
- **D, at 1920:** the sessions table on `/framework/ai/sessions/` cuts names short ("Session and task sy…") while the cost column has room to spare. Shot: `sessions-shots/shots/root-1920.png`.

Cause B (columns cut off under the sidebar) was fixed on michael/dev at cdf00bb25: session and task pages no longer use columns. Cause A (404s up the ancestors) belongs to mastermind-deputy, so leave it alone. Cause E (wrong or empty content) is out of scope.

## Do, one commit each

1. **Shoot before.** Copy `sessions-shots/shoot.mjs` into this folder as `shoot.mjs`. Make it take its base URL and output folder as arguments, and shoot all 14 pages it lists at 400, 1200, 1920 and 3440 (today line 4 overrides the list with one page, so drop that override). Run it on your worktree and save the shots as `shots/before/`.
2. **C: the tab bar at 400.** Find what draws the AI section's tab bar. It is the AI page template's tabs; start from `public/framework/ai/page.js` and the tabs it builds, then `ext/tabs/tabs.css` (watch out: `ext/Doc/Doc.css:76` overrides `ext/tabs/tabs.css:58`). At 400 every tab must be reachable. Use the tabs system's own narrow-screen behaviour if it has one (a scrolling row or a wrap); do not invent a new widget. Then fix the cut-off chips and tables at 400 on the same pages, so they wrap or scroll inside their own box rather than off the screen.
3. **D: the sessions table at 1920.** Find the table on `/framework/ai/sessions/` (`public/framework/ai/AISession/AISessionsPage.js` and `AISessionRows.js`). Give the name column the spare width, so names show whole at 1920 and numbers stay narrow. Prefer a CSS change in the module's own stylesheet over inline styles.
4. **Shoot after** into `shots/after/`. Write `report.md` here: one table with the same 14 pages × 4 widths. Each row gives before and after, pass or fail, and which cause (B, C, D) still fails. Lead with two counts that must add up: rows that fail on C or D before, and rows fixed plus rows still failing after.

## Prove it

- `node --check` every touched JS file.
- Smoke, run from the main tree: `MSYS_NO_PATHCONV=1 node Server/smoke.mjs C:/Code/lew42/worktrees/sessions-fit /framework/ai/ /framework/ai/sessions/ /framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/ /framework/ext/tabs/`. Log the FAIL count before your first change and after your last. A FAIL that was there before (the ancestor 404s, cause A) is listed, not fixed.
- Log `ready: worktree/sessions-fit at <sha> <one line>` on this task, and send `mastermind-page` one line.

## How

- Your worktree is `C:/Code/lew42/worktrees/sessions-fit` on branch `worktree/sessions-fit`, made from michael/dev. Its server is http://127.0.0.1:56227/. Commit after each step.
- Never kill or restart the dev server or Servex. Never drive the owner's tabs: headless only. Never `git stash`. Edit nothing in the main tree except this folder.
- If `git status` in the worktree shows `files.jsonl` churn, leave it; commit only your own files.
- **Resolve, don't park.** Fix what you find on these pages. Log anything left open with the reason it is left.

**Deliverable:** the branch, the before and after shots, and `report.md`. If time runs out, cut the chips and tables part of step 2 first.
