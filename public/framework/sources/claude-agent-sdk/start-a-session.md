---
url: "https://platform.claude.com/docs/en/managed-agents/sessions"
title: "Start a session"
kind: docs
authority: high
fetched_at: 2026-09-28T19:18:47.477Z
---

# Start a session

A session is an agent instance within an environment. Each session references an agent and an environment (both created separately), and maintains conversation history across multiple interactions.

## Creating a session (Python example)

```python
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
)
```

To pin to a specific agent version:

```python
pinned_session = client.beta.sessions.create(
    agent={"type": "agent", "id": agent.id, "version": 1},
    environment_id=environment.id,
)
```

## Seed the session with initial events

Create a session and start its work in one call using `initial_events`:

```python
seeded_session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    initial_events=[
        {
            "type": "user.message",
            "content": [{"type": "text", "text": "List the files in the working directory."}],
        },
    ],
)
```

## Override agent configuration for a session

Change parts of the agent's configuration for a single session without versioning the agent:

```python
override_session = client.beta.sessions.create(
    agent={
        "type": "agent_with_overrides",
        "id": agent.id,
        "model": {"id": "claude-sonnet-5"},
        "system": None,  # clear the system prompt for this session
    },
    environment_id=environment.id,
)
```

You can override: `model`, `system`, `tools`, `mcp_servers`, or `skills`.

## Set a session budget

Cap what a session can spend:

```python
budgeted_session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    budget={
        "type": "limit",
        "max_list_cost": {"amount": "2500", "currency": "USD"}  # $25.00
    }
)
```

The session stops issuing new requests once the cost reaches the cap, emitting `budget_reached` as the stop reason.

## MCP authentication through vaults

If your agent uses MCP tools requiring authentication, pass `vault_ids`:

```python
vault_session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    vault_ids=[vault.id],
)
```

## Starting the session

Send a user event to begin work:

```python
client.beta.sessions.events.send(
    session.id,
    events=[
        {
            "type": "user.message",
            "content": [{"type": "text", "text": "List the files in the working directory."}],
        },
    ],
)
```

## Stream session responses

```python
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[{"type": "user.message", "content": [{"type": "text", "text": "Your task here"}]}],
    )
    for event in stream:
        if event.type == "agent.message":
            for block in event.content:
                if block.type == "text":
                    print(block.text, end="")
        elif event.type == "session.status_idle":
            print("\nAgent finished.")
            break
```

## Event types

- **user.message** - Send text messages to the agent
- **user.tool_result** - Provide tool execution results
- **user.interrupt** - Stop the agent mid-execution
- **agent.message** - Agent's text response
- **agent.tool_use** - Agent requesting a tool
- **session.status_idle** - Session has completed work
