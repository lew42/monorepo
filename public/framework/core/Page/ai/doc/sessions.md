# Sessions and the SDK

**What a session id is.** Every agent is one Claude session, held open by the
`@anthropic-ai/claude-agent-sdk` package's `query()` call — the same SDK a plain `claude`
terminal session uses. Its id is a uuid, minted the moment the agent is spawned (never
waited for), so even a host that dies mid-first-turn can still find it again.

**Where it is recorded**, in two places:
- **`task.jsonl` line 1** — every task-shaped agent (a task mastermind, a minion opened
  with `task: {dir}`) writes its own session id into its task's own log before its first
  turn runs, as `{"assign": {"session_id": "…", "agent": "…", …}}`.
- **The registry** (`%LOCALAPPDATA%/lew42/servex/registry.json`) — every agent Servex has
  ever spawned, keyed by id, so it survives a Servex restart even though the in-memory
  list does not. Read it live at [the agents list](/framework/core/Page/ai/agents/), or
  the `GET /agents` route, or the `list_agents` MCP tool.

**How to go back and talk to one.** Two ways, both reach the exact same conversation:
- From a terminal, in the session's own working directory: `claude --resume <session id>`.
- From inside Servex: `spawn_agent({ resume: "<session id>" })` reopens it as a live
  agent again — add `fork: true` to branch a NEW session from that point instead of
  continuing the original one.

**Is there an object-oriented structure?** Yes, one host per Servex process,
`Servex/agents/Agents.js`:
- **`Agents`** — the host. Holds every live session in one `Map` (`this.live`), keyed by
  agent id. One instance per process (`export const agents = new Agents()`); its methods
  are how anything else in Servex spawns, messages, stops or revives an agent.
- **`Agents.Agent`** — one held-open session. Wraps the SDK's `query()` call; every SDK
  message it receives becomes one typed, logged event (`transcript`, `tool`, `result`,
  …). `Agents.Registry` is the on-disk half — one row per agent, kept in sync as the
  agent runs.

See [the agents list](/framework/core/Page/ai/agents/) for that `Map` and that `Agent`
shape, rendered live from what is actually running right now.

## OPEN — a fresh session, or a fork of one already loaded?

Not decided yet, on purpose. A per-path agent (this page's own card assistant or manager)
could either mint a brand-new session every time, or — the way a checkpoint "module
expert" already works — keep one session loaded once and answer each question as a
**fork** of it (`Agents.fork()`, above), which reuses the prompt cache and answers
faster. `task-mastermind-module-experts` is measuring exactly this trade-off right now:
[`ai/2026-09-29/module-experts/`](/framework/ai/2026-09-29/module-experts/). This page
does not pick a side — read that task's own log for where it lands.
