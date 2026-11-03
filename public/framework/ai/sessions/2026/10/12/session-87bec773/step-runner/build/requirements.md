Budget: $15

# Build the Step runner (minion brief)

Read [../plan.md](../plan.md) first: it is the design. You build items 1–6 exactly as written there. Parent: @mastermind-step-runner (it reviews your diff and merges; you do not merge).

## Your own steps (dogfood: log them, bump `step` as each starts)
Append this as your first line with `node .claude/hooks/append.mjs <your task.jsonl> <file.json>`:
`{"assign":{"steps":["Worktree + read plan (5 min)","Server/Steps.mjs + its test (25 min)","step-prompt.mjs hook + settings.json (15 min)","TaskLoop: new-store walk + nudge + test (20 min)","Smoke, commit, report (10 min)"],"step":1}}`

## Where
- Your worktree already exists: `C:/Code/lew42/worktrees/step-runner` (branch `worktree/step-runner`, its dev server at http://localhost:51523/). Work ONLY there. Commit each working step there (end every commit message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`). Never stash/reset/checkout in the main tree.
- Write your task.jsonl log in the MAIN tree path you were given (that is the live log).

## What to build
1. **`Server/Steps.mjs`, `export default class Steps`** (one class, static methods, like `Server/TaskDirs.mjs`):
   - `Steps.parse(steps)` → `[{n, do, min}]`; `n` is 1-based; `min` from a trailing `(N min)` / `(N m)` / `~Nm`, else `null`. Objects `{do|title, min}` are also accepted.
   - `Steps.read(file)` → `{state, steps, step, started_at, nudged:Set<n>, landed, closed}`. `state` = all `assign` lines merged. `started_at` = the `ts`/time of the most recent line whose `assign.step` equals the current step (lines have no ts: use the nearest earlier/later line's `at` if any, else the file's line-1 `requested_at`, else mtime — keep it simple and document the choice in one comment). `nudged` from `{"log":{"nudge":n}}` lines.
   - `Steps.overdue(info, now=Date.now())` → `{n, do, min, since_ms}` when the current step has a `min`, the task is not landed/closed, the step is not in `nudged`, and `now - started_at >= 2*min*60000`; else `null`.
   - `Steps.prompt(info, n)` → one-paragraph text: "Step n of M: <do> (~min). <template note if any>. When it starts the next one, log {"assign":{"step":n+1,"now":"…"}}."
   - `Steps.TEMPLATES` = `{ base: [...], ui: [...] }` and `Steps.template(kind)` → base close-out (`"Smoke test (5 min)"`, `"Commit and merge (5 min)"`, `"Land with finish-task (5 min)"`) plus, for `kind: "ui"`, before those: `"Shoot the page at its widths (5 min)"`, `"Read the shots and judge (5 min)"`, `"Fix and re-shoot (15 min)"`, `"Compare before/after (5 min)"`, each with a short note pointing at `public/framework/ai/sessions/2026/10/12/session-87bec773/screenshot-system/requirements.md` and the `mcp__site__shot` tool.
   - `Steps.report(days=7)` over `TaskDirs.list(days)` → `{tasks, with_steps, with_estimates, landed, all_reported, followed_fully, rate}` where **followed fully** = has ≥1 step with an estimate AND reached `step >= steps.length` (or every step n had an assign line) AND landed with an outcome; `rate` = followed_fully / with_estimates (and also print the rate over all tasks with steps). 
   - CLI: `node Server/Steps.mjs --report [days]` (prints a short table + JSON), `--show <task dir>` (steps with ✅/⬜ and the current one), `--plan <task dir> [--kind ui] "step (N min)" ...` (appends ONE `{"assign":{"steps":[...given + template],"step":1,"kind":...}}` line via the same validated append path as `.claude/hooks/append.mjs` — spawn it, don't reimplement).
   - A test: `Server/Steps.test.mjs` (plain node asserts, temp dir fixtures): parse, overdue at 2×, nudged-once, report counts.
2. **`.claude/hooks/step-prompt.mjs`** — PostToolUse on Bash. Reads stdin JSON; if `tool_input.command` contains `append.mjs` and a `task.jsonl` path, read that file with `Steps.read`; if the current `step` differs from the last one this hook announced for that file (a stamp file in `os.tmpdir()`), print `{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext": Steps.prompt(info, step)}}`. Never throws, always exits 0, silent when nothing to say, fast (<100 ms). Add it to `.claude/settings.json` PostToolUse `Bash` matcher hooks next to ledger.mjs (edit the JSON carefully; validate it parses).
3. **`Servex/TaskLoop.js`**:
   - `find_task_files()` returns the `task.jsonl` of `TaskDirs.list(2)` (import `../Server/TaskDirs.mjs`; resolve against `this.root` — if TaskDirs resolves REPO from its own location that is fine since the worktree has its own copy) PLUS the old walk, de-duplicated.
   - `slug(file)` must work for both shapes (sessions store: the path after the `session-xxxx`/day folder).
   - In `tick()`, for each open opted-in task (before the quiet-chase logic, independent of it): `const due = Steps.overdue(Steps.read(file))`; if due and the owning agent is live (not gone), `this.servex.agents.send(id, text, {from:"servex-step-runner"})` with text: `You were on step ${n} (${do}, ${min} min) since ${time}. Is it done? If you are further along, log {"assign":{"step":<the step you are on>}}; if not, say what is holding it.` Then append `{"log":{"at":stamp(),"msg":"step-runner nudge: step n","nudge":n}}` via `write_line`, and `this.servex.log?.append("steps", {type:"nudge", task: slug, step:n, agent:id})`. Count nudges in `status_now.nudged`.
   - A test with a fake `servex` (see how other Servex tests stub it, e.g. `Servex/pool-hold.test.mjs`): an overdue task gets exactly one nudge across two ticks.
4. Run `node Server/smoke.mjs C:/Code/lew42/worktrees/step-runner` if it exists for the worktree, plus your tests. Commit.

## Report
Last line of your task.jsonl: `{"assign":{"step":5,"landed_at":"NOW","outcome":"…branch, commits, test results…"}}`. Then reply in two sentences. Keep context small: read only TaskLoop.js, TaskDirs.mjs (list/head), append.mjs, ledger.mjs's top 60 lines, and settings.json.
