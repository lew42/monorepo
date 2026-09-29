---
url: "https://github.com/anomalyco/opencode"
title: "GitHub: anomalyco/opencode - The Active OpenCode Project"
kind: source
authority: high
fetched_at: 2026-09-28T19:23:01.664Z
---

# OpenCode - Open Source AI Coding Agent

## Project Status

OpenCode is the active open-source AI coding agent, maintained by the team behind the Serverless Stack (SST) framework at github.com/anomalyco/opencode. (The original opencode-ai/opencode was archived in September 2025.)

## What It Is

OpenCode is an open-source AI coding agent designed to automate development tasks. It provides developers with an automated tool for code creation and modification.

## Multiple Agents

- **build**: The default agent with full access for development
- **plan**: A read-only agent for analysis that asks permission before running bash commands
- **general**: A subagent for complex searches and multistep tasks

Users can switch between agents using the Tab key.

## Architecture

OpenCode employs several important design principles:
- Event-driven design enables complex orchestration without tight coupling
- Structured memory preserves context while managing costs
- Permission systems balance autonomy with user control
- Snapshot systems provide safety nets for autonomous actions

## Installation

Available through multiple package managers: npm, Homebrew, Scoop, Arch Linux, etc. Desktop applications available for macOS, Windows, and Linux.

## Community & Adoption

- 210,000+ GitHub stars
- 27,900+ forks
- 15,812+ commits
- Active Discord community
- Comprehensive documentation at opencode.ai/docs
