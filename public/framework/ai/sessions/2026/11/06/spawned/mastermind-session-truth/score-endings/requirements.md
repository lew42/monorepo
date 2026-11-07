# Honest score + no silent endings (core/Task)

Budget: $15

Read `../brief-common.md` first.

## The ask (deliverables 3 and 4 of the parent task)

1. **Honest score.** A SESSION with no score parts (no tasks, no counted prompts) and no steps/agent number reads **no score / needs review**, never 1 or 0. Today `Task.completion_score()` (`public/framework/core/Task/Task.js:324`) falls to "1 if complete else 0"; measured today, 149 of 185 costly sessions have no tasks, so the score means nothing.
   - Decision (change only with a reason in a log line): `completion_score()` returns `null` for a session (`is_session`) with nothing to score.
     - A plain leaf task keeps 1/0.
     - A parent's mean leaves `null` parts out; all parts null makes the parent null.
     - `tally()` gains `unscored` (child sessions with no score) so they stay visible.
     - Rejected: count it as 0. That punishes a missing record like undone work; the owner asked for "needs review", not "zero".
   - Every caller that does arithmetic or formatting on `completion` / `completion_score()` must handle `null` (git grep `completion` under public/, Server/, Servex/; `Server/session-query.mjs:79` is one). The session page and the dashboard show "needs review" where a number would be. No page may throw on null: shoot `/framework/ai/` and one no-task session page headless before and after (`mcp__site__shot` or `Server/Browser.mjs`, against your worktree's URL), at 400 and 1200.
2. **No silent endings.** When a session or a task is closed (stopped, or complete) while its score is under 1 (or null), its open items become ONE task waiting on the owner (`{"wait":{"on":"owner","what":"…"}}`, so `list_waiting` shows it), filed on that same record by code, listing the open items (ids and titles). Find every chokepoint where a task or session ends (`Task.stop` / `complete`, Servex `close_task`, `Servex/CloseLoop.js`, StaleClose, a session ending in Servex) and put the rule in ONE place they all go through, preferably the Task class itself. Never file a second one for the same close (idempotent on replay). Test: close a session with one open task and one done task, and exactly one waiting task appears and the function behind `list_waiting` lists it; close one at 100%, and none appears.
