# Token accounting: one source of truth, exact cache costs, live

## The ask (owner, 2026-10-04, dictated)
> Take a look at the token accounting logic and make sure we're not making an accounting mistake. Make sure it updates in real time to wherever the source of truth is and everything else reads one source of truth so that we don't have any data conflicts. We need to make sure that we're keeping track of these tokens very precisely in terms of their cache costs ... I want to see a breakdown on a session or an agent or however we're grouping these and maybe even on a per prompt type level.

## Known writers and readers of cost (check each; there may be more)
- Servex agent logs `%LOCALAPPDATA%/lew42/servex/logs/agent-<id>.jsonl`: `cost` (cumulative, from the SDK result) and `usage` (input, cache_read, cache_creation, output).
- `registry.json` / `list_agents` `cost` (often reads 0 for finished agents).
- `Server/task-cost.mjs` copies a task's cost into its `task.jsonl` (`cost_usd`).
- `Server/spend-tree.mjs`, the day-spend script (`ai: day-spend.mjs + module-spend.js`), the Sessions tab, Echo's per-prompt `cost` lines on session pages, OpenRouter `usage.cost` (just fixed: openrouter-cost-blind).
- VS Code tabs: their transcripts under `~/.claude/projects/` (not Servex-run).

## Do
1. **Map it:** every place a cost or token count is written and read; one table.
2. **Pick the one source** (expected: per-call `usage` + price, appended once per API call) and make the others compute from it or link to it. No copied totals that can drift.
3. **Check the math on 3 real agents:** recompute from raw `usage` × that model's prices (input, cache write, cache read, output) and compare with the recorded `cost`. Report any gap.
4. **Breakdown view:** per agent: input / cache write / cache read / output tokens and $ for each, plus % of $ from cache reads; group by role and by trigger (prompt type). Extend the Sessions tab (law 6), don't build a new page.
5. Worktree → check_page → merge.mjs.

Budget: $4 (a guide; finish it right)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
