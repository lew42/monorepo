---
url: "https://openrouter.ai/docs/api_reference/overview"
title: "OpenRouter API Reference - Complete Documentation"
kind: docs
authority: high
fetched_at: 2026-09-28T19:21:21.716Z
---

# OpenRouter API Documentation Overview

## Core Purpose
OpenRouter provides a unified API interface that normalizes requests and responses across multiple LLM providers and models, allowing developers to use a single schema similar to OpenAI's Chat API.

## Key API Components

**Request Endpoint**: POST to `/api/v1/chat/completions`

**Essential Parameters**:
- `messages` or `prompt` (one required)
- `model` (optional; uses user default if omitted)
- `stream`, `max_tokens`, `temperature` (common controls)
- `tools` for function calling capabilities
- `response_format` for structured JSON outputs

**Advanced Features Supported**:
- Tool calling with automatic transformation across providers
- Structured outputs via JSON schema enforcement
- Plugins extending functionality (web search, PDF parsing, response healing)
- Assistant prefill for guiding model responses
- Provider and model routing with fallback options

## Response Format

Responses follow OpenAI's Chat API structure with normalized `finish_reason` values: `tool_calls`, `stop`, `length`, `content_filter`, or `error`.

**Response includes**:
- Generation ID for async stat queries
- Detailed token usage breakdown
- Cost information in credits
- Support for streaming via Server-Sent Events

## Additional Resources

- OpenAPI specification available in YAML/JSON formats at https://openrouter.ai/openapi.json
- Complete parameters documented separately
- Supported models listed with capability indicators
- Generation stats queryable post-request via `/api/v1/generation` endpoint
