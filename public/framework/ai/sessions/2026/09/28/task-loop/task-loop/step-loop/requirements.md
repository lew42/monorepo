# Minion brief: the step loop (task-loop, part 6)

Load the `minion` skill first. The whole task: `public/framework/ai/sessions/2026/09/28/task-loop/task-loop/`. The owner's words are at the end of its requirements.md: "when you have a plan of action with a certain number of steps having a programmatic loop kind of just re-prompt the minion or the mastermind ... with the next step ... Then when they're done, then they ideally would need to use like a finish step skill." Summary item 2 there: "Code, not the AI, keeps the place."

**Worktree:** `C:/Code/lew42/worktrees/task-loop`. Work only there. Read `Servex/Heartbeat.js` and `Servex/TaskLoop.js` first; build in the same style.

## Deliverables
1. **`Servex/StepLoop.js`** (new, plain node, harness-agnostic). The plan is the task's own task.jsonl: `assign.steps` (an array of strings) and `assign.step` (1-based, current). Nothing new is stored elsewhere.
2. **A `finish_step` MCP tool** `{dir, note?}`: appends `{assign:{step:k+1, now:<step k+1 text>}}` plus `{log:{step_done:k, msg:note}}` to that task.jsonl, then sends the owning agent (line-1 `agent`) "Step k+1 of N: <text>" with `agents.send(id, text, {from:"servex-step-loop"})`. After the last step it sends "All N steps done: land it (finish-task)." It returns the new step so the caller sees it at once too.
3. **At spawn:** when `spawn_agent`'s `task` carries `steps`, write them in line 1 (see `Agents.js` spawn and the line-1 writer) and add "Step 1 of N: …" to the first turn.
4. **The heartbeat's prompt names the step:** when the heartbeat prompts a silent agent whose task has steps, the text reads "status on step k of N (<text>)? finish_step, land, or say why". One line in Heartbeat.js.
5. Register it in `Servex.js` next to the TaskLoop, and a section "The step loop" in `Servex/doc/task-loop.md`: one paragraph + the three calls.

## Proof, on a PRIVATE Servex only
Boot one from the worktree root, hidden (see `heartbeat/task.jsonl` for how the last minion did it, ports 8199/8200, own LOCALAPPDATA). Spawn a Haiku agent with `task:{dir:"C:/...", steps:["say A","say B","say C"]}` and a prompt telling it to call finish_step after each step. Show its task.jsonl going 1 → 2 → 3 → "all done", and the three prompts it received. Kill the private Servex by PID; never touch port 80. No window may show.

**Fence:** `Servex/StepLoop.js`, `Servex/Servex.js` (wiring + tool), `Servex/agents/Agents.js` + `tools.js` (steps in the spawn task only), one line in `Servex/Heartbeat.js`, one section of `Servex/doc/task-loop.md`. About 150 lines. Commit by exact path in the worktree; don't merge. Land in `step-loop/task.jsonl` with `landed_at` + outcome.
