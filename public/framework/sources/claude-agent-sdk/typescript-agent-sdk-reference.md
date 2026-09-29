---
url: "https://code.claude.com/docs/en/agent-sdk/typescript"
title: "TypeScript Agent SDK Reference"
kind: docs
authority: high
fetched_at: 2026-09-28T19:21:13.598Z
---

# TypeScript Agent SDK Reference

## Installation

```bash
npm install @anthropic-ai/claude-agent-sdk
```

## Core Functions

### `query()` - Main Interaction Function

Creates an async generator that streams messages from Claude Code:

```typescript
function query({
  prompt,
  options
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;
```

Streams back assistant messages, tool calls, results, and final completion.

### `startup()` - Pre-warm Subprocess

Starts the CLI subprocess before a prompt is ready:

```typescript
const warm = await startup({ 
  options: { maxTurns: 3 } 
});

for await (const message of warm.query("What files are here?")) {
  console.log(message);
}
```

### `prewarm()` - Spare Process

Starts a process as a spare before knowing which session it will serve:

```typescript
const spare = await prewarm({ 
  options: { maxTurns: 3 } 
});

const claimedQuery = spare.claim({
  prompt: "What files are here?",
  options: { cwd: "/path/to/project" }
});
```

### `tool()` - Create MCP Tools

Defines type-safe MCP tool definitions:

```typescript
const searchTool = tool(
  "search",
  "Search the web",
  { query: z.string() },
  async ({ query }) => {
    return { content: [{ type: "text", text: `Results for: ${query}` }] };
  },
  { annotations: { readOnlyHint: true } }
);
```

### `createSdkMcpServer()` - MCP Server

Creates an MCP server running in your application:

```typescript
createSdkMcpServer({
  name: "my-server",
  tools: [searchTool],
  timeout: 30000
});
```

## Session Management

- **`listSessions()`** - Discover past sessions with metadata
- **`getSessionMessages()`** - Read transcript from a session
- **`getSessionInfo()`** - Get metadata for a single session
- **`renameSession()`** - Add a custom title to a session
- **`tagSession()`** - Tag a session for organization

## Key Options

| Option | Type | Description |
|--------|------|-------------|
| `cwd` | `string` | Working directory |
| `model` | `string` | Claude model alias or name |
| `maxTurns` | `number` | Max agentic turns |
| `permissionMode` | `'default' \| 'plan' \| 'bypassPermissions'` | Permission handling |
| `mcpServers` | `Record<string, McpServerConfig>` | MCP server configs |
| `hooks` | `HookCallbackMatcher[]` | Hook callbacks |
| `maxBudgetUsd` | `number` | Cost limit |
| `debug` | `boolean` | Enable debug mode |
