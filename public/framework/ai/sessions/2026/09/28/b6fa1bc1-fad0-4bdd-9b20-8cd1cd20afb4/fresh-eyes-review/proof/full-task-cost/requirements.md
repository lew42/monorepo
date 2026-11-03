# task-cost — the dollar cost of every task, rolled up

Task mastermind: `task-mastermind-ai2-dashboard` (reused for this second task). Group: `ai-log`.

## The owner's words (verbatim)

> "For every task we want to see cost. The dollar amount is probably better than tokens, because
> different models have different token costs. If subtasks exist, the parent task sums all of its
> subtasks, so we get an actual cost per project and a general handle on what things cost. Then
> we can compare outcomes."

## Deliverables

1. **The data.** One small node tool that sums an agent plus all its descendants (Servex
   registry `parent` links; cost from `result` lines in `%LOCALAPPDATA%\lew42\servex\logs\agent-<id>.jsonl`)
   and writes it into the task's `task.jsonl` as an `assign` with `cost_usd`. A decision line on
   "append at landing vs compute in the view". Tabs and CLI sessions have no Servex cost: they
   show **"not tracked"**, never $0.
2. **Show it:** the dollar figure on every task card, the day's total on the day page, and the
   sum per group/project.
3. **Prove it** on today's tasks: live-card, md-pages and loose-ends show real totals that include
   their minions.

## What is already true (checked 2026-09-24)

- A task's `task.jsonl` line 1 `assign.session_id` equals its agent's `session_id` in
  `%LOCALAPPDATA%\lew42\servex\registry.json`; `assign.tab` equals the agent `id`.
- Registry rows carry `parent` (the agent that spawned it).
- A `result` line's `cost` is the session's RUNNING total (it only grows within one process) —
  e.g. minion-ai2-layout: 2.29 then 2.93. So an agent's cost is its last result's `cost`; if a
  later value is SMALLER, the process restarted and the earlier run must be banked and added.

## Fences

- Servex/ (Agents.js etc.) belongs to `task-mastermind-concurrency` — ask, never edit.
- Build in worktree `task-cost`; merge carefully (before/after guard on the pages the view touches).
