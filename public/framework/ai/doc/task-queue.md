# The task queue: a session's tasks plus a priority, worked by its mastermind

**The decision (2026-10-23):** there is no new queue system. A mastermind's queue is its tasks, each with a `priority`. The mastermind starts the high ones, moves the low ones to the back burner, and runs back-burner work only when usage is well under pace. Starting a task means spawning an agent, so starting goes through Servex's own agent queue (at most 5 working agents; extra spawns wait at the spawn gate). That queue is code, not AI. This is one system. Sources: the owner's prompts of 2026-10-23 in session-e00f55c9's `prompts.jsonl`, relayed by vscode-mastermind. The record: `process-system` task `ai-system-plans-get-prioritized-and-hand`.

## What already exists, and is used as is

| Piece | Where | What it does |
|---|---|---|
| `priority` line | `reprioritise_task` tool, `Task.replay` | `{"priority":{score, why, by}}` on a task. A later line wins. |
| Back burner | `snooze_task` tool | `{"snooze":{until}}`: the task is skipped until then. |
| Launch | `Servex/TaskLoop.js` `launch()` | Every 5 minutes, an approved or running task with an agent config and no agent gets one spawned, and a `spawn` line is written. |
| The 5-agent cap | the spawn gate in `Servex/agents/Agents.js` | A spawn beyond the working cap waits, then starts when a slot frees. |
| Handoff by task | `spawn_agent` `task: {from, id}` (`page_tools.js` `move_item`) | The subtask moves into the new agent's folder with its id and history. |
| The ranking view | `core/Task/TaskQueue.js` on branch `worktree/qf-4` (mastermind-deputy's B, not merged) | Ranks tasks and draws `/framework/ai/queue/`. It becomes the one ranking code. |

## The rules

1. **A task is made with a priority.** The task filer (PromptTasks) and every agent that adds a task set `priority` when they make it. The owner's explicit asks rank above everything an agent proposed.
2. **Most important and cheapest first.** Rank = importance divided by expected cost. Importance comes from `priority.score` (the one shape; `Task.rank` already sorts by it), plus a bump for an explicit owner ask. Cost is the task's own estimate, else the median cost of its module's past tasks.
3. **A note is just done.** "Write X down" is done at once: add the note, check the task off. It never waits in the queue.
4. **A plan the owner asked for, ranked high, starts without a go-ahead.** The mastermind decides how: do it itself with its tools, spawn a builder, or give it to a builder that already exists. The owner's one decision is the merge.
5. **Some tasks never get done, and that is fine.** Prioritizing means weighing benefit against cost and the tokens left. A task left at the bottom is a decision, not a failure.
6. **When the mode changes, everything is re-ranked at once.** A token crunch is a mode. A node pass (`TaskQueue.rerank(mode)`, to build) writes the new priority lines in one go. In a crunch only the top scores run; well under pace, the back burner runs too. `node Server/usage-now.mjs` decides the mode; no model is asked.
7. **Plan before launch, when it pays.** A quick fix or a note is just done. A medium job is the mastermind's call. A big project or an architecture decision (APIs, data structures, where files go, streaming) gets a plan first. A queued plan shows on the queue page, so the owner can shape it before it runs. (The same rule is in `Servex/agents/roles/mastermind.md`, "Deciding".)

## Handoff is a task at a path, not a message

Work passes between sessions as a task: "a task is assigned to you at `<dir>` (id `<id>`)". The receiver reads the task, and the task's own log holds the history, the evidence and the completion. `send_to_agent` only carries that pointer, or a quick nudge. Text in a message is not a record (`roles/mastermind.md`, "Log, don't chat").

## Reading raw files versus instances

Both, each for its own job:

- **Raw JSONL** for a reader that only scans: a script, a census, a count. It is fast and needs no classes. It must never compute state, because state comes from replaying the verbs.
- **An instance** (`Task.replay`, `Session.replay`, the `item` tool) for anything that computes state (done, completion, cost, waiting) or acts on a task. The class is the one place the rules live (`Task.progress_of`, the `CAN` map).
- **Writes** always go through `append.mjs` or the `item` tool, never by hand.

## Not lost when a fresh session starts (decided with mastermind-page)

The AI system mastermind renews itself as a fresh session under the same id (`roles/ai-system-mastermind.md`), so its queue must outlive any one session.

**The queue lives in the role's own task folder, and its path is named once, in the role readme.** It is the same shape a module mastermind already uses: mastermind-page's queue is `core/Page/tasks/page-mastermind/task.jsonl`. Two sessions have worked it, and it survived compactions and a new session id with nothing copied. A child in its own file, referenced as `{"task":url,"as":id}`, is resolved by one `Task.from_ref` for both `Task.replay_line` and `Session.replay_line`. The item tool and the browser follow it too, so no new reader is needed.

- **A session references only the tasks it takes up, never the whole queue.** `Session.progress` counts every child, so referencing the whole queue would report the queue's completion as each day's session's own. To take up a task, give it a folder with the `{"folder":id}` verb; the item tool writes the reference into the caller's log. Who worked on a task is already in its `sessions` field.
- **Priority has one shape: `{"priority":{"score":N,"why","by"}}`.** `Task.rank` sorts by score × children × recency. A string such as `"priority":"high"` is ignored by the sort; write the score.
- **"The open tasks by priority" needs a read-only item query.** Today every delta the item tool gets is written as a line. That is mastermind-page's subtask `query-without-writing` (`core/Page/tasks/page-mastermind/`); this plan depends on it.

Alternatives not taken: linking the previous session and reading its tasks (a chain that grows every day, and an open task's home stays in an ended session); a separate `tasks.jsonl` that is copied or moved (two copies of one task, or the old session's record erased).

## The plan, smallest steps first

1. **Finish and merge B (`worktree/qf-4`)**, with three fixes: costs read from real task costs (`Task.cost`) so the top ten no longer tie at $6.05; re-asks counted from `repeat_of` and prompt links, not the broken `RefineQueue --repeats` match; a `TaskQueue.test.mjs`.
2. **TaskLoop starts the top of each queue.** On its tick: for each mastermind's queue, the top-ranked task that is approved (or an owner ask ranked high) and has no agent gets spawned, if the spawn gate has a free slot and usage is on pace. This is `launch()` with an order.
3. **`TaskQueue.rerank(mode)`**, run when `usage-now.mjs` changes mode.
4. **The role's queue folder** for the AI system mastermind, named in its role readme, with sessions referencing only the tasks they take up. The ranked read waits on mastermind-page's `query-without-writing`.

Each step is a worktree, a test and a review, then merge.
