---
url: "https://github.com/opencode-ai/opencode"
title: "GitHub - opencode-ai/opencode: A powerful AI coding agent"
kind: source
authority: high
fetched_at: 2026-09-28T19:22:11.110Z
---

# OpenCode: A Powerful AI Coding Agent. Built for the Terminal.

OpenCode is a terminal-based AI coding assistant written in Go that provides intelligent coding assistance directly in the terminal.

## What It Does

OpenCode connects an AI model to your repository, terminal, and development tools. You can ask it to fix a bug, and it will:
- Find relevant files
- Draft a plan
- Edit the code
- Run tests
- Respond to errors

## Key Capabilities

**Interactive Terminal UI**
- Built with Bubble Tea framework
- TUI interface launches automatically when running `opencode` with no arguments

**Multi-Provider Support**
- OpenAI, Anthropic Claude, Google Gemini, AWS Bedrock, Groq, Azure OpenAI, OpenRouter
- Provider-agnostic architecture via AI SDK
- Works with OpenAI-compatible endpoints

**Session Management**
- SQLite database for persistent storage
- Auto-compacting conversations when approaching token limits

**Tool Integration**
- File operations (view, write, edit, patch files)
- Shell command execution
- Code searching via grep and glob patterns
- Language Server Protocol (LSP) integration
- Model Context Protocol (MCP) for external tools

## Installation

- Bash script installation
- Homebrew (macOS/Linux)
- Go package manager
- AUR (Arch Linux)

## Basic Usage

Launch with: `opencode`

Run single prompts non-interactively: `opencode -p "your question"`

**Key Shortcuts**
- Ctrl+K: Command dialog
- Ctrl+O: Model selection
- Ctrl+N: New session
- i: Focus editor

## License

MIT License
