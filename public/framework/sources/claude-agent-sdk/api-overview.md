---
url: "https://platform.claude.com/docs/en/api/overview"
title: "API overview"
kind: docs
authority: high
fetched_at: 2026-09-28T19:18:47.478Z
---

# Claude API overview

The Claude API is a RESTful API at `https://api.anthropic.com` that provides programmatic access to Claude models and Claude Managed Agents.

## Available APIs

### Core APIs

- **Messages API** - Send messages to Claude for conversational interactions (`POST /v1/messages`)
- **Token Counting API** - Count tokens in a message before sending (`POST /v1/messages/count_tokens`)
- **Models API** - List available Claude models and their details (`GET /v1/models`)
- **Files API** - Upload and manage files for use across multiple API calls
- **Message Batches API** - Process large volumes of requests asynchronously with 50% cost reduction

### Managed Agents APIs (Beta)

- **Agents API** - Define reusable, versioned agent configurations (`POST /v1/agents`)
- **Sessions API** - Run stateful agent sessions in managed cloud sandboxes (`POST /v1/sessions`)
- **Environments API** - Configure sandbox templates for agent sessions (`POST /v1/environments`)
- **Skills API** - Create and manage custom agent skills

## Authentication

Include these headers in requests:

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <api-key>` |
| `anthropic-version` | `2023-06-01` |
| `anthropic-beta` | `managed-agents-2026-04-01` (for Managed Agents) |
| `content-type` | `application/json` |

Get your API key from [Claude Console](https://platform.claude.com/settings/keys).

## Client SDKs

Official SDKs available for:
- Python: `pip install anthropic`
- TypeScript: `npm install @anthropic-ai/sdk`
- Go: `go get github.com/anthropics/anthropic-sdk-go`
- Java: Gradle/Maven support
- C#: `dotnet add package Anthropic`
- Ruby: `bundle add anthropic`
- PHP: `composer require anthropic-ai/sdk`

SDKs provide:
- Automatic header management
- Type-safe request/response handling
- Built-in retry logic
- Streaming support
- Error handling

## Request size limits

| Endpoint | Limit |
|----------|-------|
| Messages, Token Counting | 32 MB |
| Message Batches | 256 MB |
| Files | 500 MB |
| Sessions, Agents, Environments | 32 MB |

## Rate limits

The API enforces rate limits based on your usage tier:
- Spend limits (monthly maximum cost)
- Rate limits (requests per minute, tokens per minute)

View your limits at [Rate limits](https://platform.claude.com/settings/limits) in the Console.

## Available models

- Claude Opus 5.5: `claude-opus-5-5`
- Claude Opus 5: `claude-opus-5`
- Claude Sonnet 5: `claude-sonnet-5`
- And others for legacy support

See [Models](https://platform.claude.com/docs/en/models/overview) for the complete list.
