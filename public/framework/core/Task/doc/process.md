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
{"measure":{"phase":"investigate","agent":"helper-x","usd":0.41}}     ← node, from the agent's own cost
{"plan":{"start":{}},"by":"ProcessRunner"}
```

**Creating one is one call** (never two steps): `item({path: <your session>, delta: {tasks: {add: {title, process: "build", brief}}}})`. The item tool sees `process`, makes the folder, writes line 1 and the phase lines from the definition (the add's own `phases` overrides change a phase's session), and tells ProcessRunner, which starts phase 1.

## Draft in the session, then move home

A process starts as a draft in the session that made it. When it names a `module` (`tasks.add: {title, process, module}`), it moves to `<module>/tasks/<id>/` once the plan is approved. The phase marked `home_after` (build: approve-plan) completing makes `next()` answer `{move}`, and ProcessRunner calls `move_home` in `Servex/agents/page_tools.js`. The move does five things:

1. It moves the folder: `git mv` when the folder is tracked, else a plain rename.
2. The process records its new `path`.
3. The session gets a new `{"task": "<new path>"}` line. That line replaces the old reference, because a later reference with the same id wins (`Task.js`).
4. The module's `tasks/` list references the process.
5. One `kind: "task"` line goes into `ai/sessions/task-moves.jsonl`, the ledger `Server/TaskMove.mjs` keeps, so the old url redirects.

The later phases (execute, review, merge) then run in the new home. If the target folder already exists, the move is refused, a `home_refused` line records why, and the process carries on where it is. The owner's rule: [owner-2026-10-20 §6](owner-2026-10-20-projects-and-completion.md).

## A phase's session

Each phase names how its session is run, so the process carries the agent architecture, not the agent's memory:

| `session.run` | Who does the phase |
|---|---|
| `fresh` | a new Servex session (`model`, `effort`, `role`), its folder inside the process (`<process>/<phase>/`) |
| `same` | the session that ran the previous phase, sent the next phase's prompt (its context is reused: cheaper) |
| `owner` | the agent that created the process (the mastermind), sent the phase's prompt |
| `wait` | nobody: the phase waits on the owner (`merge`); the process stays running, not complete, until the phase is |

The prompt node sends is built from the phase's `do`, the brief, and the outcomes of the phases before it, and it ends with the one line that completes the phase: `item({path, delta: {"<phase>": {"complete": {"outcome": "…"}}}})`.

## The core set (`Process.DEFINITIONS`, kept small)

- **build**: investigate (fresh, Sonnet low: questions ranked, the known structure as class sketches, sources) → plan (same: tasks, class sketch, checked against the brief) → improve-plan (fresh reviewer: an independent read of the plan) → approve-plan (the creator: approve, or name changes) → execute (fresh builder, in a worktree) → review (fresh reviewer: the diff) → merge (waits on the owner).
- **investigate**: questions (rank them; name what is known as class sketches) → scout (Haiku scouts, one per top question, each under 100k, web search allowed) → synthesize (answers; where two scouts agree, say so). Run on its own or, later, as build's first phase.

A phase id never names a Task verb or field (`improve` would call `Task.improve()`); the test checks every definition. More processes come from the system architect, not from each agent. A process that does not help is changed from its data (which phase was skipped, failed or cost most), not by asking agents to try harder.

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

## Run 1 (2026-10-22): the readmes page, through build

The brief: [run-1/readmes-page/requirements.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/run-1/readmes-page/requirements.md); its log is the `task.jsonl` beside it. It ran on a private Servex started from the worktree (`Servex/proof/process-run.mjs`). One `item` call created it. Node then ran every phase with no agent remembering anything, from 18:49 to 18:56 (7.5 minutes). It ended with `task/readmes-page` built and reviewed, and the merge phase waiting on the owner.

| Phase | Session | Measured cost |
|---|---|---|
| investigate | fresh helper (Sonnet low) | $0.76 |
| plan | the same session | $0.86 |
| improve-plan | fresh reviewer (Sonnet medium) | $0.50 |
| approve-plan | the creator (the system architect, by an item call) | not measured |
| execute | fresh helper (Sonnet medium), its own worktree | $1.59 |
| review | fresh reviewer (Sonnet medium) | $0.56 |
| **total** | against a budget of $8 | **$4.27** |

What broke, and the process fix (the agents were not asked to try harder):

- **Review's cost was written twice.** Two wakes arrived for one turn end. Now after-turn work is chained per file, and a second wake joins the first.
- **Plan was pulsed before it had started.** The plan prompt was sent while investigate's turn was still running, so the end of that same turn looked like a stalled plan. Now a phase sent mid-turn skips the pulse for that turn's end.
- **Review said "ready to merge" without loading the page.** Execute had built in a worktree that Servex does not serve. Now execute takes a served worktree (`take_worktree`) and loads what it changed, and review may say ready only after the pages load with no console errors; otherwise its outcome is "not checked".
- **Still open:** the answer to the creating call carries the instructions for the parent's class, not the new process.

What worked:

- The review fixed a real bug on the branch (chain links pointed at `/public/…`).
- Execute fixed a skip rule that had never matched on Windows paths.
- The approve phase had no live creator to send to, so it waited on the creator instead of being lost.

## Plan, not built: the prompt audit's asks become session tasks

The prompt audit ([ai/doc/prompt-audit.md](/framework/ai/doc/prompt-audit.md)) already judges each owner ask against what the session did. It writes `prompt-review.jsonl` beside the session, and today nothing files those asks as tasks. Once completion is automatic, the plan is:

1. **Node files each ask.** A node step after `Server/PromptAudit.mjs` reads every ask judged not done and adds it to that session as an idle task: `item({path: <session>, delta: {tasks: {add: {title, source: <prompt link>}}}})`.
2. **A repeat adds weight.** An ask whose title matches an existing task is a `reinforce` line (the same rule as improvements), so asking again raises its weight.
3. **The session counts it.** The session's `completion` counts these tasks, so an ask that is never done keeps the session open, and the dashboard shows it.
4. **A process when needed.** A mastermind turns an ask into a process with `process: "build"` when it needs more than one step.
5. **No AI writes the bookkeeping.** The audit's model only judges; node writes every line.

## Status

- ✅ Slice 1: `Process` + `ProcessRunner`, one process end to end, completion rolling up to the session; run 1 above; moving home on approval; tests `node Servex/ProcessRunner.test.mjs` (27).
- ⬜ Next: a phase that is itself a process (investigate inside build); parallel phases (scouts); the plan's tasks becoming a process of their own; the owner's merge button (priority 3b) completing the merge phase; prompt-audit asks becoming session tasks once completion is automatic.
