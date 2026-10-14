# Nested tasks: parallel and series, with a picture that shows the flow

**Owner's words:** [owner-words.md](/framework/ai/sessions/2026/09/29/cards/lifecycle-nothing-left-running-nested-ta/owner-words.md) (09-29, about 5:35 PM). Every sentence is traced in [../lifecycle/refine/coverage.md](../lifecycle/refine/coverage.md). This task covers items 5–10 of [../lifecycle/refine/brief.md](../lifecycle/refine/brief.md). The sibling task `lifecycle` covers the rest.

## What the owner asked
- A task can have **subtasks, to any depth**. Completion % **aggregates from the subtasks**.
- **Parallel and series, mixed.** For example, phase 1 is N tasks in parallel, and phase 2 (itself parallel) starts once they're all done. In other words, dependencies.
- **Each spawned mastermind session is automatically a task**, and its minions are its subtasks. (The owner offered this as a suggestion. Build it; it's the natural source of the tree.)
- **The visual** must make clear whether a set of tasks runs in parallel or in series, how it all flows, what's in flight, what it's waiting on, and the %. The owner: "I'm not sure exactly how those should look". So try two or three designs as live demos, pick one, and show the alternatives one click down.

## Build on what exists
- The data is task.jsonl. spawn_agent's `task: {dir}` already opens a child's log, and `parent` links agents. Add `parent_task` and `after: [task ids]` (the series edges) to line 1, and derive the tree. Don't invent a second store.
- The view goes in `ext/AITask` (the task.jsonl viewer), with the item/tree work from task-mastermind-item-ui (landed 09-29): [Item](/framework/ui/item/) icon rows, [DefaultView](/framework/ux/Content/Object/), `core/Page/object.js`.
- `%` for a leaf is its step/steps (the task.jsonl `step` field). For a parent, it's the weighted mean of its children, and landed = 100.
- Coordinate with `lifecycle`: it logs agent and task start/end. Read that log if it has landed; don't duplicate it.
- **Minions write into their parent's log:** page-system found a page_work minion's steps written into its own task.jsonl (17:36), so its ledger showed "step 2 of 7", which wasn't its plan. Each minion gets its own task dir as a subtask; a parent never shares its log.

## Deliverables
1. The data rule (parent_task, after) written by spawn_agent, and by the sub-mastermind skill for hand-spawned minions.
2. A live tree of today's real tasks (09-29 has several masterminds with minions), showing parallel vs series, in flight, waiting on, and %.
3. A demo page with a made-up two-phase plan (phase 1: three parallel, phase 2: two parallel after them), routed, at 1280 and 1920.
4. One doc page on the model, linked from ext/AITask's readme.

## Fence
The files are `public/framework/ext/AITask/**`, the task-opening code in Servex (the spawn_agent `task` option) for the two new fields only, and `.claude/skills/sub-mastermind/SKILL.md` for one line.
Stay out of Servex/Heartbeat.js and the lifecycle reaper.
Use a worktree and `Server/merge.mjs`. Load the `page` skill before the view.

## Done means
The owner opens the AITask view and sees today's tasks as a tree, and can tell at a glance which ran in parallel, which waited, what's in flight, and the %.

