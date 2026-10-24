# The session page shows a true picture: what was wrong, what changed

The owner asked for a snapshot of session-e00f55c9 (vscode-mastermind, 2026-10-23). `item()` on the session gave 143 tasks, 14 complete (9.8%). Five gaps were named. Branch `worktree/session-snapshot`.

## The numbers, before and after (session-e00f55c9, replayed with each version of the code)

| | Before | After |
|---|---|---|
| Completion | 14 of 143 (9.8%) | 29 of 75 (38.7%), 73 stopped tasks left out |
| Session state | running, still carrying "abandoned … closed by StaleClose" | running, no stop reason |
| `completed_at` | 12 tasks read the same millisecond: the moment the log was read | each task's own line time |
| Child agents | 3 "linked sessions" (only the agents that wrote through the item tool) | 59 agent sessions, $619.08 in all (found by where their task lives) |
| Cost and duration | none | per task (`cost`, `ran_ms`), and for the session (`cost`, `first_at`, `last_at`, `span_ms`) |

## The five gaps

- **(a) No cost or duration.** Item state rows now carry `cost` (Task.cost, from the agents' logs), `ran_ms` and `completed_at`. The session adds its total cost and its span. `Agents.task_cost` used to walk 3,000+ registry rows per task; it now uses a map rebuilt at most once a minute (`task_dirs()`).
- **(b) Spawned agents missing.** The session's children are computed, not recorded: every registry agent whose task folder is inside the session folder (`Agents.agents_under`, wired as `Session.agents_resolver`). For future spawns, the new hook `.claude/hooks/spawn-session.mjs` adds the tab's own `session_id` to every Servex `spawn_agent` call that names no parent. That is the field Servex already uses to link a tab's spawn to the tab; tabs kept forgetting it (architect-2 and -3 had no parent).
- **(c) About 70 stopped tasks counted.** A stopped task was dropped on purpose (splitter noise, check-in prompts, superseded). `Task.progress_of` now leaves stopped tasks out of both `done` and `total`, and reports a `stopped` count. The session page folds them under "N stopped, not counted".
- **(d) "Abandoned" while running.** StaleClose wrote `{"stop":{why}}` and the session came back with `{"start":{}}`, but Session stored both as plain keys. Now `stop` sets the session's state and reason, and `start` clears them.
- **(e) Tasks completed minutes after hand-off.** mastermind-deputy wrote the completions at 00:46Z (session.jsonl line 250). Each names merged commits as evidence (c63aef26d, 62071719f), and those merges had landed, so the completions are honest. The "minutes after" impression came from the replay bug in (a): every completion read the time of the read.

## Are the prompts covered by tasks? (`coverage.mjs`, beside this file)

- **88 prompts**, and **33 have at least one linked task** (72 tasks in all).
- **69 of the 88 arrived in one backfill at 02:00** (PromptRecords importing the tab's earlier history). Only 17 of those got tasks, because the task filer (PromptTasks) runs on live prompts only.
- **The 19 live prompts after the backfill: 16 have tasks.** The other 3 are questions ("explain what you said", "where does that file live"), and a question needs an answer, not a task.
- **26 of the 72 task titles run past 120 characters.** They are copied sentences, not reduced outcomes. The live splitter's parts step produced 1,738 "asks" from 88 prompts, and that is where the 73 noise tasks came from (they are now stopped).

### The simplest fixes, in order

1. **Mark a prompt "no ask" instead of leaving it uncovered.** A question or a chat line gets a one-line verdict on the prompt (`{"covered":{"prompt","by","none":"question"}}`), so "uncovered" means only a real gap. Coverage is then computed: a prompt is covered when it has a task or a "none" verdict.
2. **Titles are outcomes.** PromptTasks writes a title of at most about 80 characters, verb first ("Write X to file Y"); the owner's sentence goes in `description`. A one-line cap in PromptTasks plus one sentence in its model prompt.
3. **Run the filer once over the 52 backfilled prompts with no task**, as one Haiku batch under 100k tokens. Or mark them "none: history". Most of them were answered or superseded in the conversation days ago.

Prompt completion stays separate from task completion: a prompt points to the tasks that claim to complete it, and whether they did is a judgment (the reviewer's, or the clarity agent's).

## Plan or just do (written into `Servex/agents/roles/mastermind.md`, "Deciding")

A quick fix or a note is just done. For a medium job, the mastermind judges whether a plan pays. A big project or an architecture decision is always planned first. A small ask is one task; a project is a task with subtasks; a process is a repeatable sequence of steps.

## Proof

- `node public/framework/core/Session/Session.test.mjs` (8, including the snapshot check)
- `node public/framework/core/Task/Task.test.mjs` (60, including stopped and the line clock)
- the child-agent probe: 59 agents and $619.08, in 156 ms
