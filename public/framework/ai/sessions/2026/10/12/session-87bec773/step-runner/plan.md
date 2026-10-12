# Step runner: plan

**The Step runner** is the system that makes an approved task plan run to the end: the plan is a list of steps with time estimates, node tells the agent each next step, and node nudges once when a step runs past twice its estimate.

## What exists (past work, 2026-10-12)
- **`steps` / `step` in `task.jsonl`.** `spawn_agent` already writes `steps: [], step: 1` on line 1 (`Servex/agents/Agents.js`), and the `minion`/`sub-mastermind` skills say "your plan is `steps`, bump `step`". The board shows them as a checklist (`ext/AITask/AITask.js`).
- **The Stop hook** (`.claude/hooks/ledger.mjs`) blocks a stop while `step < steps.length` and nothing landed (once per 30 min).
- **Servex `TaskLoop`** (`Servex/TaskLoop.js`) chases a task that has been quiet for 10 min, twice, then asks the owner.
- **Skill inlining** (`Servex/doc/skills.md`): Servex puts the skill text into the first message, which took skill loading from 98% to 100%. Same idea here: node carries the procedure, so nobody has to remember it.

## What is missing (measured, last 7 days: `node Server/Steps.mjs --report`)
- **TaskLoop chases nothing in the new task store.** It walks only `ai/YYYY-MM-DD/`; since 2026-10-12 tasks live in `ai/sessions/YYYY/MM/DD/...` (`Server/TaskDirs.mjs`). Bug, fixed here.
- **Almost no task has steps:** 116 tasks, 15 with any steps (13%), 0 with an estimate. Of the 14 that landed with steps, 11 reached their last step (79%).
- **No step is ever told to the agent.** Nobody prompts the next step; nothing knows how long a step should take.
- **No task-type instructions.** A UI task gets no screenshot steps.

## The smallest change
1. **A step is a string with its estimate:** `"Build the parser (20 min)"`. Every current reader keeps working (strings stay strings); `Steps.parse()` reads the `(N min)`.
2. **`Server/Steps.mjs`, `class Steps`:** read a task's steps and where it stands (which step, since when, already nudged?), the templates by task `kind`, and the followed-rate report. CLI: `--report [days]`, `--show <dir>`, `--plan <dir> [--kind ui] "step (N min)" …`.
3. **The next step is told by a hook, at no extra turn:** `.claude/hooks/step-prompt.mjs` (PostToolUse, Bash): when an `append.mjs` to a `task.jsonl` moves `step`, it returns step N's text (plus its template instructions) as `additionalContext`.
4. **The nudge, in TaskLoop:** an open task whose current step is older than 2× its estimate gets one message: "You were on step 3 (…, 10 min), started 14:02. Is it done? If so, log `{"assign":{"step":4}}`." Once per step, logged as `{"log":{"nudge":3}}`. TaskLoop also walks the new store (`TaskDirs.list(2)`).
5. **Templates by `kind`:** `kind: "ui"` adds the screenshot steps (shoot, read, judge, fix, re-shoot, compare: [screenshot-system](../screenshot-system/requirements.md)); every task gets the base close-out (smoke, commit, merge, `finish-task`).
6. **Measure:** `Steps.report()` — followed fully = has estimated steps, every step reported, landed with an outcome. Each nudge also goes to the Servex `steps` log.

**Alternative not taken:** a `steps` section in `plan.md` parsed by node. Rejected: `task.jsonl` already carries `steps`, and the board already reads it there.

## After (2026-10-12, `node Server/Steps.mjs --report`)

- Before, 7 days: 114 tasks, 16 with steps, 1 with estimates, **0 followed fully**.
- After, two real tasks: [refine-parse-fix](../../session-44dca579/refine-parse-fix/task.jsonl) was planned with `Steps.mjs --plan`, prompted step by step by the hook, and landed: **followed fully**. This task bumped steps 3-6 one by one, but steps 1-3 were set at once before the system existed: **not followed fully** under the strict rule. Rate of estimated tasks: 0% → 50%.
- The live 2× nudge is proven by `Servex/TaskLoop-steps.test.mjs` (one nudge across two ticks) and the private boot; no live task ran past 2× during the proof window.
