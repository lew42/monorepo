---
url: "https://platform.claude.com/docs/en/managed-agents/agent-setup"
title: "Define your agent"
kind: docs
authority: high
fetched_at: 2026-09-28T19:18:47.476Z
---

# Define your agent

An agent is a reusable, versioned configuration that defines persona and capabilities. It bundles the model, system prompt, tools, MCP servers, and skills that shape how Claude behaves during a session.

Create the agent once as a reusable resource and reference it by ID each time you start a session.

## Agent configuration fields

| Field | Description |
|-------|-------------|
| `name` | Required. A human-readable name for the agent |
| `model` | Required. The Claude model that powers the agent (e.g., `claude-opus-5-5`) |
| `system` | A system prompt that defines the agent's behavior and persona |
| `tools` | The tools available to the agent (pre-built agent tools, MCP tools, custom tools) |
| `mcp_servers` | MCP servers that provide standardized third-party capabilities |
| `skills` | Skills that supply domain-specific context with progressive disclosure |
| `description` | A description of what the agent does |
| `metadata` | Arbitrary key-value pairs for your own tracking |

## Create an agent (Python example)

```python
agent = client.beta.agents.create(
    name="Coding Assistant",
    model="claude-opus-5-5",
    system="You are a helpful coding agent.",
    tools=[{"type": "agent_toolset_20260401"}],
)

print(f"Agent ID: {agent.id}, version: {agent.version}")
```

The response echoes your configuration and adds `id`, `version`, `created_at`, `updated_at` fields. The `version` starts at 1 and increments each time an update changes the agent.

## Update an agent

Updating an agent generates a new version when the configuration changes:

```python
updated_agent = client.beta.agents.update(
    agent.id,
    version=agent.version,
    system="You are a helpful coding agent. Always write tests.",
)

print(f"New version: {updated_agent.version}")
```

## Update semantics

- **`version`** is optional and prevents concurrent updates (409 conflict if mismatched)
- **Omitted fields are preserved** - only include fields you want to change
- **Scalar fields** are replaced with the new value
- **Array fields** (`tools`, `mcp_servers`, `skills`) are fully replaced
- **Metadata** is merged at the key level
- **No-op detection** - if update produces no change, existing version is returned

## Agent lifecycle

| Operation | Behavior |
|-----------|----------|
| **Update** | Generates a new agent version when configuration changes |
| **List versions** | Returns full version history |
| **Archive** | Makes the agent read-only; existing sessions continue, new sessions cannot reference it |

## Tool type: agent_toolset_20260401

This pre-built tool enables the full set of agent tools:
- Bash execution
- File operations (read, write, directory listing)
- Web search
- And more

See the tools reference for configuration options and the complete tool list.
