Budget: $4

# Risk analysis: where asks, tasks, sessions and results fall through the cracks

Read-only investigation. Write one page: `public/framework/core/Task/doc/cracks.md`. That is the only file you write besides your task log.

## Question

Where, in today's code, do the owner's asks, tasks, sessions and results get lost? Cover these stages: creation (a prompt → tasks), handoff (parent → child session), completion claims (an agent marks done without proof), async replies (a child's "done" to a stopped parent), restarts (Servex restart, compaction), unread logs (lines written that nothing reads).

## Also answer (for the task model)

What already chases a started task today? Read `Servex/TaskLoop.js`, `Servex/Heartbeat.js` (or wherever they live; grep), `Server/StaleClose.mjs`, `Servex/agents/PromptTasks.js`. Say in 5 lines: what runs, how often, what it does to a silent running task, and whether it tells running vs waiting vs proposed apart.

## Method

Measure, don't guess: count from the real store where you can (e.g. `node Server/State.mjs`-style reads of `ai/sessions/**/session.jsonl|task.jsonl`: how many tasks in the last 7 days are `running` with no line for 24 h; how many have no `complete`; how many child folders are not referenced by their parent). A small node script in your task folder is fine.

## The page

- Title line, then a table ranked by how often it bites: | # | Crack | Seen (a count or an example path) | Check or code that closes it |
- At most 12 rows. Plain sentences, no jargon; a new coder must follow it.
- Then "What chases a task today" (the 5 lines above).
- Under 80 lines.

Final reply: the path, the top 3 rows, the counts you measured.
