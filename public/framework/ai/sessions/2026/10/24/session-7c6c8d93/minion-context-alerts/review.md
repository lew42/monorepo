verdict: fix
1. [fix] The diff brings in work from another task: `Server/PromptGroup.test.mjs` (and, on branch qf-8, commits 34efefc58, 6edea540d, 1e1df1970 "prompt-grouping") sit on top of this task's one commit 56e6182ae. If you merge qf-8 as it stands, prompt-grouping lands too. Land only 56e6182ae (cherry-pick it onto a clean branch), or say in the task log that the two land together.
2. [fix] The branch was not rebased on `michael/dev`, though the brief asked for it: its merge-base is e4a8cb9b7, and dev is now at a79ff6227. A sibling minion (`minion-mastermind-path`) also edits Agents.js, so rebase and re-run the test before you call it ready.
3. [fix] Docs that list what wakes a parent are now stale. `Servex/Follow.js:64` (the comment just above the changed `POINTER` regex) still lists only `show:/ready:/wrote:`. `public/framework/ai/doc/task-buckets.md:49-59` (the table of what a session log holds and what reaches the parent) and `Servex/doc/follow.md:176` don't mention the new `alert:` pointer line either.
4. [fix] There is no record of how the task ended. `session.jsonl`'s last line is the minion's mid-task "fixing worktree test boot, then doc + review": no landing line, no outcome, no ready-to-merge report. A fresh agent can't tell from the folder whether `review.mjs` ran or what is left.
5. [note] The alerts only fire for minions. `oversized()` (Agents.js:1599) force-compacts every role that has a `compact_after` at 400k, which is below 50% of the 1M window, so a task-mastermind child never reaches the first alert. That follows the brief, which keeps the thresholds, but one sentence about it belongs in `ai/doc/context.md`.
6. [note] The brief asked to test the parent's real `follow` queue; the test calls `Follow.worth_waking` instead (`Servex/agents/context-alert.test.mjs:17`). That is the filter the queue applies (Follow.js:281, 314), so it is close enough. `child-follow.test.mjs` already exists and could carry the end-to-end check.
7. [note] Some code is repeated. `context_alert()` (Agents.js:2298) builds the session-log path again, though `agent_log(agent)` (Agents.js:30) already computes exactly that. The window expression also appears for a third time (lines 1623, 1645, 2290); it could live in one `window()` method.
8. [note] `context_alerted` lives only in memory, so a child resumed after a Servex restart, still above 50%, alerts its parent once more. That's harmless. The brief's "commit after each step" ended up as one commit, which is fine for a change this small.

## Requirements
- 1 "call `context_alert()` after the context update… append ONE line to the agent's own session log… emit context_alert" — yes — Agents.js:2219 calls it after the result handler's context update. The line goes through `SessionRecord.log_file` (the file `follow_child` tails), and the emit is in place. `live_context()` is not hooked; the brief made that optional.
- 2 "Reset… when a compaction completes. Only for agents that have a parent. Not for one-shot forks." — yes — both levels re-arm when the context drops below 50%. The guard at Agents.js:2289 skips agents with no parent, agents that are their own parent, one-shot forks and agents with no task folder. The test covers all of it.
- 3 "Verify the parent actually receives it… use the line type it forwards" — partly — `alert:` was added to `Follow.POINTER`, and the test asserts that `worth_waking` forwards both lines. It does not test the follow queue itself (note 6).
- 4 "Doc: add the 50%/75% rule to context.md, 3-5 lines" — yes — `ai/doc/context.md` has a new section, "Context alerts to the parent", giving the thresholds, where the line goes, and that the parent decides.
- 5 "Tests next to the existing agent tests; run them. Commit after each step." — yes — `Servex/agents/context-alert.test.mjs` passes ("context-alert: ok", re-run in qf-8). There is one commit, not one per step.
- Rules: "rebase on michael/dev before reporting", "report ready-to-merge" — no — see fixes 1, 2 and 4.
- Class page — n/a — no new class.

## Words
- The alert line reads plainly: it gives the share, the token counts, the id and the three choices. The context.md paragraph is clear and short. — yes
