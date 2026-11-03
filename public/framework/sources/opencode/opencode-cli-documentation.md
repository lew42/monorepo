---
url: "https://opencode.ai/docs/cli/"
title: "OpenCode CLI Documentation"
kind: docs
authority: high
fetched_at: 2026-09-28T19:22:11.110Z
---

# OpenCode CLI Commands

## Overview

OpenCode CLI is a command-line interface for interacting with OpenCode. It starts the TUI (Terminal User Interface) when run without arguments but also accepts commands for programmatic interaction and automation.

## Main Commands

- **agent** - Create and manage custom agents with specific permissions and tool access
- **attach** - Connect to running backend servers
- **auth** - Handle credentials and provider logins
- **github** - Manage GitHub agent for repository automation
- **mcp** - Configure Model Context Protocol servers
- **models** - List available models from providers
- **run** - Execute prompts in non-interactive mode for scripting
- **serve** - Start a headless API server
- **session** - Manage OpenCode sessions (list, create, delete, export/import)
- **stats** - View token usage and costs
- **web** - Launch with web interface
- **acp** - Start Agent Client Protocol server
- **plugin** - Install plugins
- **pr** - Fetch and checkout GitHub PRs
- **db** - Database tools for managing local storage
- **debug** - Troubleshooting utilities
- **uninstall/upgrade** - Manage installation

## Global Flags

- `--help` - Display help information
- `--version` - Show version number
- `--log-level` - Set logging verbosity

## Usage Modes

**Interactive TUI**: Launch `opencode` to enter the terminal UI

**Non-Interactive**: Use `opencode run` with flags for scripting and automation

**Custom Agents**: Create agents with `opencode agent` command, configurable with:
- Custom system prompts
- Specific tool permissions
- Read-only or full access modes
