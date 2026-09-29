---
url: "https://openrouter.ai/docs/quickstart"
title: "OpenRouter Quickstart Guide"
kind: docs
authority: high
fetched_at: 2026-09-28T19:21:33.986Z
---

# OpenRouter Quickstart Guide

## Overview
OpenRouter provides access to hundreds of AI models through a single API endpoint, automatically handling fallbacks and selecting cost-effective options for each request.

## Three Integration Approaches

1. **API**: Direct HTTP requests for full control across any language
2. **Client SDKs**: Type-safe model calls with minimal setup
3. **Agent SDK**: Higher-level primitives for building AI agents with tool use

## API Setup

To use the OpenRouter API, send POST requests to `/api/v1/chat/completions`. You'll need your API key and can optionally include site attribution headers.

**Required header:**
- `Authorization: Bearer <OPENROUTER_API_KEY>`

**Optional headers** (for leaderboard rankings):
- `HTTP-Referer`: Your site URL
- `X-OpenRouter-Title`: Your application name

## Basic Usage Example

A minimal API request targets a model with user messages:

```
POST https://openrouter.ai/api/v1/chat/completions
- Model parameter: "~openai/gpt-sol-latest" (latest alias)
- Messages array with role and content fields
```

The endpoint supports both standard and streaming responses, and you can browse the complete model catalog at openrouter.ai/models or programmatically via the `/api/v1/models` endpoint.

## Client SDK Installation

For TypeScript/JavaScript, install via npm:
```bash
npm install @openrouter/sdk
```

Python users can install:
```bash
pip install openrouter
```

## Agent SDK for Advanced Use

The Agent SDK handles multi-turn conversations, tool execution, and state management automatically through the `callModel` function, simplifying agent development workflows.
