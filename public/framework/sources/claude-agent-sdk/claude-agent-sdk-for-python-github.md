---
url: "https://github.com/anthropics/claude-agent-sdk-python"
title: "Claude Agent SDK for Python - GitHub"
kind: source
authority: high
fetched_at: 2026-09-28T19:21:13.597Z
---

# Claude Agent SDK for Python

Official Python SDK for Claude Agent, built on Anthropic's Claude Agent SDK.

## Installation

```bash
pip install claude-agent-sdk
```

**Requirements:** Python 3.10+

The Claude Code CLI is automatically bundled with the package—no separate installation needed.

## Core APIs

### 1. query() - Simple Async Queries

The primary function for querying Claude Code:

```python
import anyio
from claude_agent_sdk import query

async def main():
    async for message in query(prompt="What is 2 + 2?"):
        print(message)

anyio.run(main)
```

With options:
```python
from claude_agent_sdk import ClaudeAgentOptions

options = ClaudeAgentOptions(
    system_prompt="You are a helpful assistant",
    max_turns=1,
    cwd="/path/to/project"
)

async for message in query(prompt="Tell me a joke", options=options):
    print(message)
```

### 2. ClaudeSDKClient - Interactive Bidirectional Conversations

Supports custom tools and hooks:

```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions

async with ClaudeSDKClient(options=options) as client:
    await client.query("Your prompt")
    async for msg in client.receive_response():
        print(msg)
```

## Custom Tools (In-Process MCP Servers)

Define tools as Python functions without separate processes:

```python
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeSDKClient

@tool("greet", "Greet a user", {"name": str})
async def greet_user(args):
    return {
        "content": [
            {"type": "text", "text": f"Hello, {args['name']}!"}
        ]
    }

server = create_sdk_mcp_server(
    name="my-tools",
    version="1.0.0",
    tools=[greet_user]
)

options = ClaudeAgentOptions(
    mcp_servers={"tools": server},
    allowed_tools=["mcp__tools__greet"]
)
```

## Hooks

Intercept and control agent behavior at specific points:

```python
from claude_agent_sdk import ClaudeAgentOptions, HookMatcher

async def check_bash_command(input_data, tool_use_id, context):
    # Custom validation logic
    if "dangerous" in input_data.get("tool_input", {}).get("command", ""):
        return {"hookSpecificOutput": {"permissionDecision": "deny"}}
    return {}

options = ClaudeAgentOptions(
    hooks={
        "PreToolUse": [
            HookMatcher(matcher="Bash", hooks=[check_bash_command]),
        ]
    }
)
```

## Tool Management

By default, Claude has access to the full Claude Code toolset (Read, Write, Edit, Bash, etc.):

```python
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Write", "Bash"],  # Auto-approve these
    permission_mode='acceptEdits'              # Auto-accept file edits
)
```
