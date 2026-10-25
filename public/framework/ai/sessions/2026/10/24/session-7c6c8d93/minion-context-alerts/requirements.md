Budget: $8

# Context alerts to the parent (agent-base item 12)

A child agent's context fills silently; its parent only learns when it is already huge or done. Add ONE new behavior: when a child's context first crosses **50%** and then **75%** of the model window, a line lands in the **child's session log**, which the parent already follows (60 s gather), so the parent decides: wind it down, compact it, or hand the next phase to a fresh agent.

## What already exists (do not rebuild)
- `Agent.nudge()` / `nudge_send()` (Agents.js ~1605, ~1666): tells an IDLE agent to compact once past its role's `compact_after.tokens` (mastermind 150k, else 200k), again every 5% of the window. It talks to the agent itself, not the parent.
- `sleep_compact()`, `oversized()` (400k ceiling), `compact_self`, `reminder_due()` (role reminder at compaction and every 100k).
- `wake_parent(child, kind)` (~961): result/error only. `follow_child(parent, dir, child)` (~288) tails the child's session log (`SessionRecord.log_file`) for the parent.
- Window constant `WINDOW_TOKENS = 1000000` (Agents.js ~2318, `SERVEX_WINDOW_TOKENS` overrides). The context is updated in the result handler (~2204) from `last_usage`.
- Masterminds already compact at 150k (15% of the window), so "compact sooner" is already true for them; minions never compact (`compact_after: null`) and finish short. Do not change those thresholds.

## Build
1. After the context update in the result handler (and anywhere else `this.context` is set from live usage, e.g. `live_context()` if cheap), call `context_alert()`: for each of 50 and 75, if `context >= pct% of window` and that level has not been alerted since the last compaction, append ONE line to the agent's own session log (the file `follow_child` tails; find the existing append helper for it, via `SessionRecord`, do not invent a second log) such as `context 52% (520,000 of 1,000,000 tokens): <id>. Wind down: finish, compact (send it the compact nudge) or give the next phase to a fresh agent.` Also `this.emit({type:"context_alert", pct, context})`.
2. Reset the "already alerted" levels when a compaction completes (context falls). Only for agents that have a parent (no parent: no line). Not for one-shot forks.
3. Verify the parent actually receives it: with the existing follow machinery in a test (look at the follow tests), assert a line appended to the child's log reaches the parent's `follow` queue. If the follow only forwards certain line types, use the one it forwards.
4. Doc: add the 50%/75% rule to `public/framework/ai/doc/context.md` (where the nudge and sleep rules live), 3-5 lines, stating the thresholds, where the line goes, and that the parent decides.
5. Tests next to the existing agent tests; run them. Commit after each step.

## Rules
- Work only in your worktree. A sibling minion (`minion-mastermind-path`) also edits Agents.js (spawn/role_prompt/renewal code, different regions): keep your edit small and contained, rebase on `michael/dev` before reporting.
- Land with `node Server/review.mjs <taskdir> <worktree>` and answer every finding. Do not merge; report ready-to-merge in plain sentences: what exists, what you added.
