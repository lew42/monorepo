---
url: "https://code.claude.com/docs/en/agent-sdk/quickstart"
title: "Quickstart - Claude Agent SDK"
kind: docs
authority: high
fetched_at: 2026-09-28T19:21:13.598Z
---

# Quickstart

> Get started with the Python or TypeScript Agent SDK to build AI agents that work autonomously

Use the Agent SDK to build an AI agent that reads your code, finds bugs, and fixes them, all without manual intervention.

## Prerequisites

- **Node.js 18+** or **Python 3.10+**
- An **Anthropic account**

## Setup

### 1. Create a project folder

```bash
mkdir my-agent
cd my-agent
```

### 2. Install the SDK

**TypeScript**:
```bash
npm init -y
npm pkg set type=module
npm install @anthropic-ai/claude-agent-sdk
npm install --save-dev tsx
```

**Python (uv)**:
```bash
uv init
uv add claude-agent-sdk
```

### 3. Set your API key

Get an API key from the [Claude Console](https://platform.claude.com/), then set it:

```bash
export ANTHROPIC_API_KEY=your-api-key
```

## Core API - the `query()` Function

The main entry point that creates the agentic loop:

```typescript
for await (const message of query({
  prompt: "Review utils.py for bugs that would cause crashes. Fix any issues you find.",
  options: {
    allowedTools: ["Read", "Edit", "Glob"],
    permissionMode: "acceptEdits"
  }
})) {
  if (message.type === "assistant" && message.message?.content) {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text);
      else if ("name" in block) console.log(`Tool: ${block.name}`);
    }
  } else if (message.type === "result") {
    console.log(`Done: ${message.subtype}`);
  }
}
```

**Three main parts**:
1. **`query`**: Returns an async iterator streaming messages as Claude works
2. **`prompt`**: What you want Claude to do
3. **`options`**: Configuration including `allowedTools`, `permissionMode`, `systemPrompt`, `mcpServers`

The async loop keeps running as Claude thinks, calls tools, observes results, and decides next steps. Each iteration yields a message: reasoning, tool call, tool result, or final outcome.

## Key Concepts

**Tools** control what your agent can do:
- `Read`, `Glob`, `Grep` → Read-only analysis
- `Read`, `Edit`, `Glob` → Analyze and modify code  
- `Read`, `Edit`, `Bash`, `Glob`, `Grep` → Full automation
- `WebSearch` → Search the web

**Permission modes** control human oversight:
- `default`: Asks for approval on sensitive operations
- `plan`: Shows plans for human review
- `acceptEdits`: Auto-approves file changes
- `bypassPermissions`: Full automation
