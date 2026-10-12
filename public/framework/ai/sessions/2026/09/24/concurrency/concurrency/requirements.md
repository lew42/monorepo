# Agent concurrency — agents that collaborate fast and never block each other

Task mastermind: `task-mastermind-concurrency`. Worktree: `C:/Code/lew42/worktrees/concurrency` (branch `worktree/concurrency`).

## The owner's words (dictated, lightly cleaned)

"We want these agents able to talk to each other as quickly as possible. If the masterminds keep their session free from tool usage, they can respond quicker to messages. I don't know how we do more background tasks. Maybe the MCP server, as a node process, can help coordinate asynchronous things: reading a bunch of files, or even making little decisions. I don't know if we can fork sessions. Any SDK agent could potentially fork itself for most of these tasks: the fork has all the context up to that point, but to make a one-off decision (look at these three files, then decide this) it forks itself and gets the response from the fork, without doing any of the work itself. It hits the context cache, so we're not paying for everything again. And it runs that decision in a separate session that doesn't block the original one, so if another agent sends a message, or I ask a question, or another task completes, it can respond. Think about concurrency and duration and blocking, and how to speed things up. It's really about collaboration: we need a way for all the agents to collaborate efficiently. You could spawn a swarm of agents that look at things from different angles, with one or more masterminds coordinating. You could even have a recursive mastermind system, where each mastermind spawns three sub-masterminds and gives each a specific strategy or angle, and they spawn minions to build things out. But we need to coordinate the tracking of the tokens, the task dashboard, and all of the things."

## Deliverables

1. **`fork_self`** as a Servex MCP tool. An agent calls it with a question; Servex runs a FORK of that agent's own session in the background (SDK `query()` with `resume: <session_id>`, `forkSession: true`). The call returns at once; the fork's answer arrives later as a message to the calling agent, like a child's wake. Proof: an agent forks, answers another message while the fork runs, then receives the fork's answer. Measure cache_read tokens.
2. **`wait_for_agent(id)`** — returns when that agent ends its turn, so a VS Code tab (not a Servex agent) can run it in the background and get a direct "done".
3. **`spawn_agent` can resume or fork** an existing session (`resume: session_id`, `fork: true`).
4. **Stale registry cleared** — agents that died with a reboot/restart stop showing as idle.
5. **A short design page, with a picture**: how agents should collaborate. Three minions propose from different angles; one merges.

## Fences

- Code (deliverables 1–4): `Servex/agents/Agents.js`, `Servex/agents/tools.js`, `Servex/agents/registry.js`, `Servex/MCP.js`, new files under `Servex/agents/` (e.g. a proof script). In the worktree only.
- NOT ours: `Servex/Process.js`, `Servex/sustain.mjs`, proxy/keeper (task-mastermind-servex-crash); `Servex/Servex.js` message route (task-mastermind-live-card); `Servex/agents/Assistant.js`, `Servex/agents/Dispatcher.js` (task-mastermind-card-folders). If Servex.js needs a line (e.g. boot-time registry sweep), keep it to one call and log it.
- Design page: `public/framework/ai/2026-09-24/concurrency/` (page.js, doc/, proposals), plus one `children:` line in `public/framework/ai/2026-09-24/page.js`.
