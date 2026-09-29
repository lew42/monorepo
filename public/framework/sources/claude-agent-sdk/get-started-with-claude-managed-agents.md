---
url: "https://platform.claude.com/docs/en/managed-agents/quickstart"
title: "Get started with Claude Managed Agents"
kind: docs
authority: high
fetched_at: 2026-09-28T19:18:47.475Z
---

# Get started with Claude Managed Agents

This guide walks you through creating an agent, setting up an environment, starting a session, and streaming agent responses.

## Core concepts

| Concept | Description |
|---------|-------------|
| **Agent** | The model, system prompt, tools, MCP servers, and skills |
| **Environment** | Configuration for where sessions run: an Anthropic-managed cloud sandbox, or a self-hosted sandbox on your own infrastructure |
| **Session** | A running agent instance within an environment, performing a specific task and generating outputs |
| **Events** | Messages exchanged between your application and the agent (user turns, tool results, status updates) |

## Quick Workflow

1. **Create an agent** - Define the model, system prompt, and available tools
2. **Create an environment** - Set up the sandbox where your agent runs
3. **Start a session** - Create a running agent instance
4. **Send a message and stream** - Send events and process streaming responses

## Install the CLI and SDK

**CLI installation:**
```bash
brew install anthropics/tap/ant  # macOS
# or download binary for Linux/WSL
```

**SDK installation (Python example):**
```bash
pip install anthropic
```

**Set API key:**
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

## Minimal Python Example

```python
from anthropic import Anthropic

client = Anthropic()

# Create agent
agent = client.beta.agents.create(
    name="Coding Assistant",
    model="claude-opus-5-5",
    system="You are a helpful coding assistant.",
    tools=[{"type": "agent_toolset_20260401"}],
)

# Create environment
environment = client.beta.environments.create(
    name="quickstart-env",
    config={"type": "cloud", "networking": {"type": "unrestricted"}},
)

# Create session
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
)

# Stream responses
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[{"type": "user.message", "content": [{"type": "text", "text": "Create a Python script that generates Fibonacci numbers"}]}],
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

## What's happening

When you send a user event, Claude Managed Agents:

1. **Provisions a sandbox** - Your environment configuration determines how it's built
2. **Runs the agent loop** - Claude determines which tools to use
3. **Runs tools** - File writes, bash commands, and other tool calls run in the sandbox
4. **Streams events** - You receive real-time updates as the agent works
5. **Goes idle** - The agent emits a `session.status_idle` event when complete

## Supported SDKs

- Python, TypeScript, Java, Go, C#, Ruby, PHP
- Official SDKs simplify API integration with automatic header management, type safety, retry logic, streaming support
