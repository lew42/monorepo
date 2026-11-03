# Tasks: one system, one queue

<!-- merged from tasks.md (original kept in archive/) -->
## Tasks — the one system (proposal, 2026-10-08)

Not built yet. A task is a [`core/Task`](/framework/core/Task/) (an `Item` with a `List` of subtasks) with a `task.jsonl` for state facts and a page for presentation, linked by reference. State is computed by replaying the log; sessions create tasks and own their cost; agents drive it with in-process tools.

- [design](2026-10-08/task-system-design/design.md) — the proposal, seven points
- [inventory](2026-10-08/task-system-design/inventory.md) — every task store we have today
- [plan](2026-10-08/task-system-design/plan.md) — next steps in order
- [../agents/mcp.md](../agents/mcp.md) — which tools are in-process vs network


---

<!-- merged from task-queue-2026-10-08.md (original kept in archive/) -->
## Where tasks live, and the JSONL channel idea — the owner's thinking, 2026-10-08

Recorded from dictation; open architecture, owned by the system-architecture mastermind (`2026-10-08/ai-system-docs`). Check what exists before building: `todo.md`, `asks.jsonl`, `cards.jsonl`, `servex-queue.json` (the Dispatcher queue), task dirs' `task.jsonl`, the Inbox, and the `append_log` / `page_note` / `inbox` tools.

### Tasks
- The task audit will turn up many asks that were never done. They need ONE organised, prioritised queue; today they are spread over the files above.
- A new task **stays inside the session that created it** until we know where it belongs. A task specific to one module then **moves (by reference, keeping the source link) into that module's folder** so future sessions working there see it. The source session keeps its record and its cost.
- Several agents creating tasks about the same module in parallel is risky; prefer separate worktrees and a single writer path (the append tool) per file.

### A JSONL message channel (visibility)
- Idea: any agent can **log a message to any path** with a tool; any agent can **listen** in that directory for new messages. It is a communication channel between agents **and** one the owner can watch in real time, instead of hidden session-to-session messaging. Tangible visibility is worth a lot.
- Questions: how an agent "listens" cheaply (a tail/Monitor on the file, no polling), how it avoids waking on every line, how messages are addressed (to an agent, to a module), and how this relates to the existing inbox and `send_to_agent`.


---

<!-- merged from one-queue-2026-10-09.md (original kept in archive/) -->
## One task queue (owner, 2026-10-09 ~18:00; mastermind's proposal)

**The owner:** when something should probably happen but not necessarily now, it goes on **the task queue**: one prioritized list of what to work on next and where tokens go. "Top priority" from the owner means: it starts right away if there is room (slots, pace), otherwise it is the very next spawn. In-flight tasks are **not** paused for it; they usually finish (pausing is where balls get dropped). The handover is "where we are now"; the queue could live inside it or beside it.

### What exists today (five overlapping lists, law 6 says one)
| List | What it is | State |
|---|---|---|
| `servex-queue.json` | ordered task dirs; Servex's `queue_check()` wakes the top unlanded item every 15 min | 22 items, newest from 2026-10-04; 3 landed, 2 have no task.jsonl, 17 "open" but a week old |
| `tasks.json` | derived every minute from every `task.jsonl` (priority/snooze/kill lines) | live, a view |
| `todo.md` | 177 lines: asked / only-you / proposed | hand-kept |
| `asks.jsonl` | every routed owner ask with owner agent and status | live, 258 lines |
| `doc/tasks/priorities.md` + `handover.md` | ranked themes and current state | hand-kept |

### Proposal
1. **`servex-queue.json` is the queue.** One line per task dir that has a brief; order = priority. Everything else is a view of it or of the task logs (`tasks.json`, the dashboard), or history (`todo.md`, priorities doc: kept, linked, not maintained).
2. **Owner says "top priority"** → the mastermind inserts it at position 0 and spawns it now if fewer than 5 agents work and pace is OK; otherwise Servex spawns it the moment a slot frees (the spawn queue already does this for `spawn_agent`).
3. **Landing removes it**: an item whose `task.jsonl` has `landed_at` drops off by script, never by hand.
4. **The handover shows the top 5** of the queue, computed, plus what is in flight.
5. **First step: triage the 19 stale items** by script + one cheap pass: done-but-not-landed (land it with a line), still wanted (keep, re-rank), superseded (mark, not deleted).

Status: proposal; not built. Next item to start when a slot frees (owner asked for prioritization).
