# Process — a task whose children are named phases, and node runs them in order

**The name's scope:** here a process is a *way of working* (a Task subclass). Not `Servex/Process.js` (one supervised child program, such as a dev server), not `Servex/Processes.js` (the OS process monitor), and not the old [ai/process](/framework/ai/process/) page (how the agents' work was going, 2026-09-19, stale).

A **process** is a standard way of doing a kind of work: *build* is investigate → plan → improve → approve → execute → review → merge. You create a task with a process named on it, and from that moment node starts phase 1, launches the session each phase names, chases a phase that stalls, and starts the next phase when one completes. The task is complete only when every phase is. A one-off fix needs no process.

The owner's words: [the 2026-10-22 dictation](/framework/ai/sessions/2026/10/20/session-e00f55c9/) (tab transcript `e00f55c9`, 23:34 UTC) and [owner-2026-10-20 §5](owner-2026-10-20-projects-and-completion.md). Brief: [process-system](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/requirements.md).

## The classes

```
Item                                     core/Item      one log; state = replay(lines)
└─ Task                                  core/Task      states, tasks: List, complete() refuses while a child is open
   ├─ Project extends Task               core/Task      a long-lived goal a module keeps; holds tasks, any of them a Process
   └─ Process extends Task               core/Task      children = phases, always in series; a phase is a plain Task
        Process.DEFINITIONS              data           { build: [...phases], investigate: [...phases] }
        process.next()                   pure           what should happen now: {start: phase} | {complete} | {wait} | null
ProcessRunner                            Servex/        node: writes the line next() asks for, launches the phase's session,
                                                        pulses a stalled phase, measures each phase's cost
```

**Process is data plus one decision, `next()`.** It never changes itself: every transition (a phase starting, a spawn, a pulse, the process completing) is a line node writes, so replaying the file always gives the same state. **ProcessRunner does the I/O**: it calls `next()`, writes the line, and launches the session. The decision is in the class (testable, readable in the browser); the doing is in node.

## On disk: one file

A process lives in its own folder inside the session that made it: `<session folder>/<slug>/task.jsonl`. The session's record gets one `{"task": "<path>"}` line, so the session's `completion` counts it.

```jsonl
{"id":"fix-x","class":"Process","process":"build","title":"Fix X","brief":"…/requirements.md","by":"<creator>","ts":"…"}
{"tasks":{"add":{"id":"investigate","title":"Investigate","session":{"run":"fresh","model":"claude-sonnet-5-5","effort":"low"},"do":"…"}}}
…one add line per phase…
{"start":{},"by":"ProcessRunner"}
{"investigate":{"start":{}},"by":"ProcessRunner"}
{"spawn":{"phase":"investigate","agent":"helper-x","session_id":"…","at":"…"}}
{"investigate":{"complete":{"outcome":"…"}},"by":"helper-x"}          ← the phase agent, through the item tool
{"measure":{"phase":"investigate","usd":0.41,"tokens":52000}}         ← node, from the agent's own totals
{"plan":{"start":{}},"by":"ProcessRunner"}
```

**Creating one is one call** (never two steps): `item({path: <your session>, delta: {tasks: {add: {title, process: "build", brief}}}})`. The item tool sees `process`, makes the folder, writes line 1 and the phase lines from the definition (the add's own `phases` overrides change a phase's session), and tells ProcessRunner, which starts phase 1.

## A phase's session

Each phase names how its session is run, so the process carries the agent architecture, not the agent's memory:

| `session.run` | Who does the phase |
|---|---|
| `fresh` | a new Servex session (`model`, `effort`, `role`, `readmes`), spawned with the process as its parent task |
| `same` | the session that ran the previous phase, sent the next phase's prompt (its context is reused: cheaper) |
| `owner` | the agent that created the process (the mastermind), sent the phase's prompt |
| `wait` | nobody: the phase waits on the owner (`merge`), and the process waits with it |

The prompt node sends is built from the phase's `do`, the brief, and the outcomes of the phases before it, and it ends with the one line that completes the phase: `item({path, delta: {"<phase>": {"complete": {"outcome": "…"}}}})`.

## The core set (`Process.DEFINITIONS`, kept small)

- **build**: investigate (fresh, Sonnet low: questions ranked, the known structure as class sketches, sources) → plan (same: tasks, class sketch, checked against the brief) → improve (fresh reviewer: an independent read of the plan) → approve (owner agent: approve, or send back) → execute (fresh builder, in a worktree) → review (fresh reviewer: the diff) → merge (waits on the owner).
- **investigate**: questions (rank them; name what is known as class sketches) → scout (Haiku scouts, one per top question, each under 100k, web search allowed) → synthesize (answers; where two scouts agree, say so). Run on its own or, later, as build's first phase.

More processes come from the system architect, not from each agent. A process that does not help is changed from its data (which phase was skipped, failed or cost most), not by asking agents to try harder.

## Never dropped (async)

| Where a ball drops | Closed by |
|---|---|
| a phase agent ends its turn without completing the phase | ProcessRunner hears the turn end (`Agents` result event) and pulses it once with the phase prompt; a second silent end puts the phase `waiting` on the process's creator |
| a spawn refused (no slot, machine hot) | a `queue` line; ProcessRunner retries on the TaskLoop tick |
| Servex restarts mid-process | state is the file; the tick re-runs `next()` on every running process and resumes from the last line |
| a phase's result only in chat | the outcome is the `complete` line's `outcome`; the next phase's prompt is built from it |

## Asking a session about itself: raw deltas in, an instance out

The item tool works both ways, and this is the rule for which happens where:

- **Writes are raw delta lines.** The agent sends the delta; node stamps `by` and `ts` and appends it. The agent never types a time or an id.
- **Reads instantiate on the server.** For Task, Session and Process files the tool replays the file into one live instance per file (`live_root` in `Servex/agents/page_tools.js`), checks the delta against that class before writing, and answers with the computed state. Pages are still replayed as plain data (the Page class needs a DOM).

So an agent asks its session for its state with `item({path: <session folder>})` (no delta): its tasks, each task's state, `completion` and `progress`, all computed from the files, with any process among them. Cost per task is the `cost` getter (`Task.cost_resolver`, wired in `Agents.js`).

## Measured, not reported

Every phase change, spawn, pulse and cost is a line node writes. `measure` lines give each phase's share of the process's cost, so a phase that eats the budget shows up in the data. Quality: run real tasks through a process; an AI judges only obvious failures; two independent agents agreeing beats one agent's stated confidence.

## Relation to what exists

- **Task.mode "series"** already starts the next child in memory; Process turns that off and has node write the line instead, so state is always from the file.
- **Task templates** ([templates.md](templates.md)) are the per-task version (one agent, approve → spawn); a phase's `session` uses the same launch path (`TaskLoop.launch` shape).
- **Steps** ([Servex/doc/steps.md](/Servex/doc/steps.md)) are steps inside one agent's session; a Process whose phases all run `same` does the same job with real state. Steps stays until it is migrated.
- **Project.STAGES** (six stage names in one field) is the same idea without children; a Project should hold a build Process instead. Not changed in this slice.

## Status

- ⬜ Slice 1: `Process` + `ProcessRunner`, one process end to end, completion rolling up to the session.
- ⬜ Next: a phase that is itself a process (investigate inside build); parallel phases (scouts); the plan's tasks becoming a process of their own; the owner's merge button (priority 3b) completing the merge phase; prompt-audit asks becoming session tasks once completion is automatic.
