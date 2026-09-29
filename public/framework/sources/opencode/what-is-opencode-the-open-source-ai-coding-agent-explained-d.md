---
url: "https://www.datacamp.com/blog/what-is-opencode"
title: "What Is OpenCode? The Open-Source AI Coding Agent Explained | DataCamp"
kind: article
authority: medium
fetched_at: 2026-09-28T19:22:28.279Z
---

# What is OpenCode? The Open-Source AI Coding Agent

## Overview

OpenCode is an MIT-licensed, open-source AI coding agent that connects an AI model to your repository, terminal, and development tools. Unlike traditional autocomplete, it can execute complete workflows independently—finding relevant files, drafting plans, editing code, running tests, and responding to errors.

Built by Anomaly (formerly SST), OpenCode uses TypeScript and Bun, and has garnered significant community attention with approximately 189,000 GitHub stars.

## How It Works

OpenCode operates on a **client-server architecture** where:

- Clients (terminal interface, desktop app, IDE extensions) communicate with a local server via HTTP
- Within a session, the agent reads files, may draft plans, edits code, and executes commands as needed
- The tool uses **Build** mode (read, write, run) and **Plan** mode (review before edits) as permission controls
- Language Server Protocol integration provides compiler diagnostics, allowing iterative error response and solution refinement

## Key Features

**Multi-Model Support**: Connects to 75+ providers including Anthropic, OpenAI, Google, DeepSeek, and local models via Ollama without vendor lock-in.

**Repository Context**: The `/init` command generates `AGENTS.md` files containing project structure and conventions that teams can commit and share.

**Task Execution**: Includes Build and Plan agents plus subagents for specialized tasks, with configurable model, permissions, and instructions.

**Local-First Options**: Supports local model inference, though cloud-hosted models send code context to providers under their data policies.

## Architecture

The separated client-server design allows multiple interfaces to share one server process. Configuration lives in `opencode.json` with OpenAPI 3.1 documentation enabling custom script integration.
