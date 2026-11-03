# The agent base: why `ai/agents.md`, and how it reaches an agent

**Decided (the owner, 2026-10-24):** [ai/agents.md](../agents.md) holds the short, vendor-neutral instructions every agent reads. CLAUDE.md stays Claude-specific and gained one line pointing to it. The ai readme stays the AI-system index; the framework readme stays "start here". Brief: [agent-base/requirements.md](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-base/requirements.md).

## System prompt, message, compaction

- **System prompt:** text the model is given before the conversation, outside it. A Servex SDK agent gets its role readme and skills there: `role_prompt()` in `Servex/agents/Agents.js` passes `systemPrompt: {preset: "claude_code", append: role_system(role)}`, built by `role_system()` in `Servex/agents/roles.js`. A voice or directory agent's own `system` replaces it.
- **Message:** everything in the conversation, the first message included. Servex puts only the task in it (`roles.js` prefixes "Now: ...").
- **Compaction** (`/compact`, [compaction.md](compaction.md)): the conversation, first message too, is replaced by a summary. The system prompt is re-rendered from the same options, so it survives. CLAUDE.md is loaded as context by Claude Code and also kept ([compaction.md](compaction.md), "What survives a compaction"). Why the role moved into the system prompt: [context-drift.md](context-drift.md).

## How agents.md reaches each kind

| Agent | Today | With agents.md |
|---|---|---|
| Servex SDK agent | role readme in the system prompt; CLAUDE.md read as a project file | unchanged; CLAUDE.md points to agents.md |
| VS Code tab, CLI | only CLAUDE.md auto-loads | CLAUDE.md's one-line pointer sends it to agents.md |
| Another vendor's agent | none | reads agents.md (the common convention) |

Not done yet: putting agents.md itself into the Servex system prompt (one more part in `role_system()`). Cheap to add if agents drift from it; until then the pointer in CLAUDE.md carries it.

## What CLAUDE.md keeps

The laws, safety and cost rules in full (agents.md points at them rather than copying), and everything Claude-specific. Nothing was moved out; agents.md is the index in front of it.
