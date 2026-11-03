# Agent context: a map of what each agent is given and loads, and a plan to make it visible

Budget: $8. Sonnet, medium effort. Parent: `vscode-mastermind`: log with the `log` tool. **Study and plan only: no code changes.** The owner's direction is in [ai/doc/readme-system.md](/framework/ai/doc/readme-system.md), section "The owner's direction (2026-10-22)": read it first. The branch `task/readme-roles` (role readmes, slim CLAUDE.md; not merged yet) is part of the picture: read it with `git show task/readme-roles:<path>`.

## Map (by script where you can, one doc each, linked from `ai/doc/readme-system.md`)

1. **Roles → what they load** (`ai/doc/agent-context.md`): for every role in `Servex/agents/roles.js` and every way an agent starts (Servex spawn, VS Code tab, `claude -p`, voice): its model, its skill(s) or role readme, CLAUDE.md or not (`setting_sources`), the readme chain, its tools (allowed list), and how each piece is injected (file and function). One table. Where loading is fragile when files move, say so.
2. **Tools** (`Servex/doc/tools-map.md`): every MCP tool Servex and the site serve (about 90), one line each, grouped, and the past work on compacting them (`node Server/PastWork.mjs tools`; the one-`item`-tool RPC idea). Propose the compacted set.
3. **The item system** (`core/Item/doc/map.md`): every class, store, tool and writer that makes or saves items (Item, List, Store, Dated, the `item` tool, TaskDirs, LogLine, page tools).
4. **What is logged today** to `session.jsonl` on spawn, skill load, readme read, tool use; what is not.

## Plan (`plan.md` here, one screen)

- One generic `log` tool (kind + data) and node-side logging of spawns, role/skill loads and readme reads.
- The spawner names extra readmes at spawn (`spawn_agent` field), injected after the chain.
- A readme page: type a path, see the chain and linked readmes in layers, with tokens; and the session page's "context" view (system prompt, CLAUDE.md, readmes, share of context).
- Measured chain sizes per folder (is the 12,000-token cap right?).
- `improvements.md` per folder, read by masterminds at startup.
- Answer: can a Claude Code hook inject text before a tool runs (PreToolUse) or after (PostToolUse)? Check the docs or test in a scratch dir.

Each item: the smallest first slice, its cost, where it lives. Land with `finish-task`.
