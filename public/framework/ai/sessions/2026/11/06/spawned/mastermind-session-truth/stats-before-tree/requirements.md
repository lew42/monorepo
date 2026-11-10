# Session page: the stats bar draws its summary lines before the task tree loads

Budget: $2. Sonnet, medium. Load the `minion` skill first, then `code`. Parent: mastermind-session-truth (t21, one refiner; the Coverage line from step 3 never shows).

## The problem (checked 2026-11-09 by mastermind-session-truth)

- The session page's stats bar (`public/framework/ai/AISession/SessionStats.js`) draws nothing until `ready` resolves (`SessionStats.js:25`).
- `ready` is the loaded `SessionWork` (`AISessionDetail.js:249` and `:365`). `SessionWork` is only made inside `fill()`, which first awaits the transcript pull (`this.follow`, `AISessionDetail.js:356`) and the day index (`folder_from_day`). On a long session that takes 20–45 s or never ends in a headless shot, so the bar, and the Coverage line in it, never draws (the step 4 worker, shot `../one-refiner-step4/shots/session-a943a876-400.png`).
- But Cost, Score, Session tasks done and Coverage need only the item tool's `summary` (`AICost.summary(base)`, with `base = AICost.session_url(id)`), not the tree. Only Model, Running for, Task folders done, the bar and the caption need `work.tree`.

## Deliverables

1. **Draw first, fill later.** The stats bar draws at once from the session id: the cost line, Score, Session tasks done and Coverage (each already reads `summary` on its own). The tree-based figures show "…" and fill in when `ready` resolves. If the tree never comes, the summary figures still stand. Keep it one class and one `draw`. Smallest change wins; for example, build a `{ id, dir }` stand-in for `work` for the summary calls.
2. **Measure:** on a long session page, the time to the first Coverage line, before and after (headless, the worktree URL). Two numbers in a `log` line.
3. **Shots** at 400 and 1200 of a session whose coverage is above 0, into `shots/` in this folder. One with coverage above 0: `/framework/ai/sessions/2026/11/09/cloud-voice-session-recall/` has 0 cited today. Use any session where `item({path, read: "coverage"})` answers `cited > 0`. Find one with a small node script over a few session folders, or note that none exists yet and shoot the line at 0.
4. **Lean test:** if `SessionStats.test.mjs` is missing, a small one for the change (under 1 s), or say why a DOM class can't be tested in node and skip it.
5. **Docs** in the same commit: the class comment at `SessionStats.js:12` says what draws when.

## How

- Make your own worktree: `node Server/worktree-up.mjs stats-before-tree`. Commit by exact path. Do not merge: report back, and the parent reviews and merges.
- Spawn nobody. Never kill or restart the dev server or Servex. Never drive the owner's tabs (headless only: `mcp__site__shot` or `Server/Browser.mjs`). Never `git stash`.
- Report in three lines: what changed (file:line), the two timings, and the shot paths.
