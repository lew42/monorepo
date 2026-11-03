---
url: "https://opencode.ai/"
title: "OpenCode: The Open Source AI Coding Agent"
kind: docs
authority: high
fetched_at: 2026-09-28T19:22:11.108Z
---

# OpenCode: An Open Source AI Coding Agent

OpenCode is an open-source AI agent that helps you write code in your terminal, IDE, or desktop.

## How It Works

OpenCode connects an AI model to your repository, terminal, and development tools. Ask it to fix a bug, and it can find the relevant files, draft a plan, edit the code, run tests, and respond to errors.

## Key Features

- **Model Flexibility**: Supports 75+ LLM providers including Claude, GPT, Gemini, and local models
- **Multi-Environment**: Works in terminals, IDEs, and desktop applications
- **Privacy-Focused**: Code and context data aren't stored on servers
- **Collaboration**: Session sharing via links for debugging and reference
- **Tool Integration**: Supports Model Context Protocol (MCP) for external tool integration
- **Language Support**: Automatically loads the right LSPs for enhanced functionality
- **Parallel Processing**: Run multiple agents simultaneously on the same project

## Architecture

OpenCode uses an event-driven, client/server architecture with:
- Local SQLite database for session storage
- Strongly-typed event bus for system orchestration
- Structured memory to preserve context while managing costs
- Support for custom agents with restricted tool access

## Agent Types

- **Primary Agents**: Direct conversation assistants (e.g., build agent with full tool access)
- **Sub-Agents**: Specialized agents like "plan" (read-only), "general" (multi-step research), "explore" (code investigation), and "scout" (docs/dependency lookups)

## Tool System

OpenCode provides tools for:
- File manipulation (view, write, edit, patch)
- Shell command execution
- Code searching (grep, glob patterns)
- Language Server Protocol integration
- Model Context Protocol integration for external tools
