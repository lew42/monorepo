---
url: "https://code.claude.com/docs/en/agent-sdk/overview"
title: "Agent SDK overview - Claude Code Docs"
kind: docs
authority: high
fetched_at: 2026-09-28T19:21:13.596Z
---

# Agent SDK overview

Build production AI agents with Claude Code as a library.

An agent is an application that completes a task by planning its own steps and calling tools that read files, run commands, or edit code. The Agent SDK gives you the same tools, agent loop, and context management that power Claude Code, programmable in Python and TypeScript.

## Compare the Agent SDK to other Claude tools

The Agent SDK, the CLI, the Client SDK, and Managed Agents differ in who runs the agent, what comes built in, and how you reach it.

**Agent SDK**: Embed Claude Code's agent in your own Python or TypeScript application, in a process you operate. You get a library that runs the Claude Code binary, with Claude Code's capabilities, such as built-in tools, permissions, sessions, and hooks.

**Claude Code CLI**: Do interactive development or run one-off tasks from a terminal. You get the terminal interface, built for daily interactive use.

**Client SDK**: Call the Claude API directly from your own code. You get direct access to the Claude API from any of the client SDK languages. You write the tool loop yourself, or let the client SDK's beta tool runner drive it.

**Managed Agents**: Have Anthropic host the agent, configured through the Claude API. You get a hosted agent harness that runs the agent loop, with sessions in an Anthropic-managed cloud sandbox or a self-hosted sandbox on your own infrastructure.

## Capabilities

These Claude Code capabilities are available in the SDK:

- **Built-in tools**: Read, write, edit files, run commands, and search the web
- **Hooks**: Run custom code at key points in the agent lifecycle
- **Subagents**: Spawn specialized agents for focused subtasks
- **MCP**: Connect external tools and data sources via the Model Context Protocol
- **Permissions**: Control which tools run automatically, which need approval
- **Sessions**: Maintain context across exchanges, resume or fork later
- **Skills, commands, and memory**: Load automatically from your project's `.claude/` and from `~/.claude/`, same as Claude Code
- **Plugins**: Package skills, agents, hooks, and MCP servers, and load them by local path

## Get started

Follow the Quickstart to install the SDK, set your API key, and build your first agent, one that finds and fixes bugs in existing code.
