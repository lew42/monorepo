# The Step runner

**What it is:** the system that makes an agent follow its task's approved steps, one by one, driven by node instead of memory. It owns the `steps` / `step` fields of a `task.jsonl` and nothing else; landing a task stays with [`finish-task`](../../.claude/skills/finish-task/SKILL.md), chasing a quiet task stays with the [TaskLoop](task-loop.md).

## How it works

1. **Steps carry estimates.** Each step is a string ending in its time: `"Review the diff, smoke, merge (15 min)"`. Old readers (the task checklist) still show it as plain text.
2. **Templates add the system steps.** `node Server/Steps.mjs --plan <task dir> [--kind ui] "step (N min)" ...` writes your steps plus the template's: `base` adds smoke, commit-merge and finish-task; `ui` also adds the [screenshot system](../../public/framework/ai/sessions/2026/10/12/session-87bec773/screenshot-system/requirements.md) steps (shoot, read, judge, fix, compare).
3. **The next step is prompted.** When an agent appends a new `step` with `append.mjs`, the `step-prompt.mjs` hook (PostToolUse) puts that step's text into the agent's context, for free.
4. **One nudge at 2×.** The [TaskLoop](task-loop.md) sends the owning agent one message when a step runs past twice its estimate ("You were on step 3 … is it done?"), logs it in the task as `{"log":{…,"nudge":3}}` and in the Servex `steps` log. Once per step, ever.
5. **The followed rate.** `node Server/Steps.mjs --report 7` counts tasks with steps, with estimates, and *followed fully* (estimated steps, every step reached, landed with an outcome).

## Its requirements and log

- Brief and plan: [`step-runner/requirements.md`](../../public/framework/ai/sessions/2026/10/12/session-87bec773/step-runner/requirements.md), [`plan.md`](../../public/framework/ai/sessions/2026/10/12/session-87bec773/step-runner/plan.md)
- Log: the Servex `steps` log (nudges), plus each task's own `task.jsonl`.
- Code: `Server/Steps.mjs` (`class Steps`: `parse`, `read`, `overdue`, `prompt`, `template`, `report`), `.claude/hooks/step-prompt.mjs`, `Servex/TaskLoop.js` (`nudge_step`).
- Proofs: `node Server/Steps.test.mjs`, `node Servex/TaskLoop-steps.test.mjs`, `node Servex/proof/step-runner-proof.mjs` (a private Servex on 8390).

## Watch out

- A step's start time is the `at` on its `assign` line; write `"at":"NOW"` with every step bump, or the nudge counts from the task's start.
- Only a task that opted in to the heartbeat (`heartbeat.opted_in`, as for the chase) is nudged; a task with steps but no opt-in is prompted by the hook only.
- Before this, the TaskLoop never walked the sessions store (`ai/sessions/…`), so no task there was chased; it now walks both shapes.
