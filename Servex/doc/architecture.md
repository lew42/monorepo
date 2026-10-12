# Servex architecture: the decisions, and where they came from

Servex is one always-on node process. It owns port 80, every log file (it is the single writer), the dev servers, and every agent. This page records why it is shaped that way. How to use it: [readme.md](../readme.md). How agents are started: [sdk.md](sdk.md).

## Decisions

- **One process, one writer.** Agents never open a log themselves; they call tools and Servex appends the line, so two writers cannot tear a line. See `Servex/Log.js`.
- **Agents are SDK sessions Servex holds open.** Each is a `query()` loop fed by a queue, so it can be messaged, slept and woken. See [sdk.md](sdk.md), [dormant.md](dormant.md).
- **Worktrees, never the main tree.** Quick fixes take a warm worktree from the pool; finished ones are merged and removed. See [pool.md](pool.md).
- **Spend is enforced in code, not asked of the agent.** The `Budget:` line in a brief is read by `Budget.js`; usage pace comes from `usage.json`. See [budget.md](budget.md).
- **Open work is kept moving by code.** `Heartbeat` and `TaskLoop` ping silent owners and revive dead ones. See [task-loop.md](task-loop.md).
- **Roles are a default, not a fence.** A capable minion may do a mastermind's job (CLAUDE.md, "No hard fences"). The policy file is `Servex/agents/policy.js`.

## The prompts behind them

Linked, not copied (CLAUDE.md, "Link, don't regenerate"): the owner's asks and their owners are in `public/framework/ai/asks.jsonl`; the brief for this documentation pass is `public/framework/ai/sessions/2026/10/08/ai-system-docs-fa3e829d/ai-system-docs/requirements.md`.

## See also

[AI architecture](/framework/ai/doc/architecture.md) for the data side: tasks, cards, sessions.
