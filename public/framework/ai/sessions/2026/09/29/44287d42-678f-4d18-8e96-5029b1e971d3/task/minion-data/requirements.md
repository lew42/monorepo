# Minion A — nested tasks: the data rule and the tree

Load the `minion` skill first, then `code`. The owner's words: [owner-words.md](/framework/ai/2026/09/29/lifecycle-nothing-left-running-nested-ta/owner-words.md). The parent brief: [../requirements.md](../requirements.md) (read it all). Log in YOUR OWN task.jsonl, this folder — never in the parent's.

**Work in the worktree `C:/Code/lew42/worktrees/qf-5`** (branch `worktree/qf-5`, its server at http://127.0.0.1:52847/). Commit there by exact path. Don't merge; your parent does.

## The owner, in short
Tasks nest to any depth; % aggregates from subtasks; parallel and series mixed (phase 1 in parallel, phase 2 after all of it); each spawned mastermind is a task and its minions are subtasks.

## Deliverables
1. **Line 1 carries two new fields.** `Servex/agents/Agents.js` `open_task()` writes `parent_task` (the parent agent's task dir, repo-relative, forward slashes: take it from `spec.task.parent_task` if given, else the live parent's `task.dir`) and `after` (`spec.task.after`, an array of sibling task dir names or paths this one waits for). Only these two fields; touch nothing else in Servex. Document them in the `task` option's description in `Servex/agents/tools.js`.
2. **`public/framework/ext/AITask/tree.js`** — pure functions, no DOM: given task manifests (line-1 facts plus `requested_at`, `landed_at`, `step`, `steps`, and each dir's `inbox.jsonl` rows), build the tree. Each node: `{dir, title, agent, children, after, state: "waiting"|"running"|"landed", pct, phases}`.
   - parent from `parent_task`; for older logs without it, derive it: a child dir whose line-1 `agent` or `tab` equals the `from` of a row in another dir's `inbox.jsonl` is that dir's child. Inbox senders with NO dir of their own become leaf nodes (state from the last row's `kind`: `done` → landed).
   - `%`: a leaf is `(step-1)/steps.length`, landed = 100, no steps = 0 running / 100 landed. A parent is the mean of its children weighted by each child's `steps.length` (1 when absent); a landed parent is 100.
   - `phases`: group a node's children into series phases. With `after`, a topological layering. Without it, infer: a child that started after every child of the previous phase landed starts a new phase; overlap = same phase (parallel).
   - `waiting` = has an `after` not yet landed.
   - Export also `tree_for_day(date)` that fetches `/framework/ai/<date>/` task dirs (reuse however `dashboard.js` / `stats.js` already list a day's dirs — don't write a second lister) and returns the roots.
3. **Tests you can run:** `node public/framework/ext/AITask/tree.test.mjs` asserting the made-up plan (phase 1: 3 parallel, phase 2: 2 parallel after them) and, read-only from the MAIN tree `C:/Code/lew42/monorepo/public/framework/ai/2026-09-29/`, today's real tree printed as an indented outline with % and state. Paste that outline into your outcome.
4. **Skill line:** add ONE line to `.claude/skills/sub-mastermind/SKILL.md` (in the worktree): every minion is spawned with `task: {dir: "<your taskdir>/<minion-slug>", parent_task: "<your taskdir>", after: [...]}` so it gets its own log, and a parent never shares its log.

## Fence
`Servex/agents/Agents.js` (open_task + the call site only), `Servex/agents/tools.js` (the description string), `public/framework/ext/AITask/tree.js`, `tree.test.mjs`, the one skill line. Nothing else. No UI — minion B builds it on your module.

## Rules
Every Node spawn sets `windowsHide: true`. Stop every server you start. `Servex/` changes go live only after a Servex restart; don't restart it — your parent does.

## Done
Commit, then end with ≤120 words: the files, the test output line, and the real-tree outline.

