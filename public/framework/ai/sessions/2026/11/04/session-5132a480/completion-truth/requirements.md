# Completion you can trust

Expected cost: about $10. Sonnet. Report the actual. Earlier work on this cost $129.73 (`process-system`) and did not stick, so read it before building, and extend it. Don't build a second system.

The owner's words (2026-11-04): "You should be able to query the last session, VS Code session, any past mastermind session. You should be able to query how many tasks it created, how many tasks it finished, mathematically with a computation for its completion score." And on Process: define the steps, node starts step 1, completing a step starts the next, completing the last step completes the process, "and so then whatever session that process belonged to, or whatever task that process belonged to, can be completed properly."

## What's already measured (2026-11-04), so don't re-derive it

- **Session `e00f55c9`:** 312 owner Prompt lines, 599 direct tasks created, 299 complete, 72 stopped. It reports completion 64.8%, while 299/527 is 56.7% and 299/599 is 49.9%. Nothing says which is meant.
- **345 of its 633 child sessions are unlinked**, and only 3 of 170 sessions in 7 days filed any task (`task-system-check/report.md`).
- **`tasks.add` with `from`/`id` on `spawn_agent` did not move the task:** session 5132a480 shows both the idle original (`f9mdcsj2`) and the task folder entry. `minion-task-system-check` also reported done and left its entry `running`, with `completed_at` set.
- **Process:** `core/Task/Process.js` and `Servex/ProcessRunner.js` exist. `core/Task/doc/process.md` says the runner stalled between steps twice on 11-02, so agents follow steps by hand. In the logs, only `core-plugin` got past `plan`; `marked-lines` and `voice-chat` stalled.

## Deliver, in this order

1. **One score, one command.** Extend `Server/session-query.mjs`. For any session id or `--recent N` (tabs and spawned masterminds alike), print prompts, tasks created, finished, stopped, open, unlinked children, cost and one completion score, with the formula written next to it. The session page and the item tool's `completion` must show the same number. Fix the mismatch above, and say which formula you chose and why. Add a test that recomputes the score independently.
2. **Node counts every owner prompt.** Asking agents to file tasks got 2%. `.claude/hooks/prompt-relay.mjs` already logs each prompt, and `Prompt extends Task` exists. Make an unresolved owner prompt count against the score without an agent doing anything. An agent then resolves it: files it as tasks, or marks it as needing no action. Apply it to new prompts only; don't rewrite old records.
3. **Fix the two bugs above:** `from`/`id` moving a task, and an agent's task left `running` after it lands. Link children so future sessions don't add to the unlinked count.
4. **Process, proven live.** Name why the runner stalled. Then run a real 3-step process with real Haiku step agents, and show: node starts each step, completing a step starts the next, completing the last completes the process, and the parent task's completion changes. Repeat with a Servex restart mid-run. Commit this as a rerunnable test. If it can't be made reliable within this budget, say so plainly and write what's left.

## Boundaries

- `mastermind-process-cleanup` owns `Lifecycle.js` and the task close function that stops what a task started. Message it to agree how a completed process or task calls that function. Don't edit its files.
- Don't restart Servex while another agent is mid-merge; check `list_agents` first.

## Finish

- What a future agent needs goes in `core/Task/readme.md`, `core/Session/readme.md` and `core/Task/doc/process.md`, replacing what's stale. `report.md` here is one screen: each deliverable, its proof, and the command to rerun it.
- Run your new command on this session and on `e00f55c9`, and put the output in the report.
- Zero footprint: return worktrees, close your agents and servers, and list what you closed.
