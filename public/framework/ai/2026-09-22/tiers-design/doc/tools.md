# In-process tools — agents call node functions directly

**The rule (the owner, 2026-09-23 00:40):** anything an agent would otherwise do with a shell
— stamp a log line, check a state, start a process, read a registry, run a script — is a tool
whose handler is a plain node function running *inside Servex*, the process that spawned the
agent. The model fills a small typed schema; node does the work; node stamps the clock; node
writes the log; node shows the result on the board. The LLM triggers, node follows through.

## How it works

The Agent SDK lets a host define tools in memory: `tool(name, description, schema, handler)`
and `createSdkMcpServer({ name, tools })`, passed as `mcpServers` when a session is spawned.
To the model it looks like an MCP server; there is no server — the call lands on the handler,
in the same process, with every live object (the log, the registry, the agents, the servers)
one variable away. `Servex/agents/Assistant.js`'s `append_prompt_event` is the first one.

The HTTP `/mcp` on 8090 exists for sessions that live *outside* Servex (a sidebar, a terminal).
An agent Servex spawns should never reach itself over HTTP.

## Why (what a shell cannot give)

- **The clock, the id, the shape are node's** — a `log` tool takes `{msg}` and writes a
  correct line; a typo in a JSON line, a typed timestamp, a heredoc that double-encodes an em
  dash cannot happen.
- **Every call is an event** — logged, streamed to the board, attributable to the agent, so
  the owner sees what ran and how it went without reading a transcript.
- **Live state** — "is the mic on", "who is working", "what did whisper return" are lookups
  on objects that already exist, not scripts that re-parse files.
- **Control** — a process started by a tool is a supervised child (restart, logs, kill by
  path); a `node_eval({code})` tool gives an agent a persistent, sandboxed context to sketch
  a class and test it in memory — no file, no reload, no window.
- **One user interface** — tool calls, replies and results are the same event stream the
  dashboard renders, so the view of "what the agents did" is customisable in one place.

## What moves to tools first

`log`, `card`, `decision`, `open_task`, `land` (the logging skills' contracts) · `now`
(the clock) · `state` (the registry + usage windows) · `run` (a supervised child process in
place of bash) · `node_eval` (the object layer's first tool: `list_objects`, `describe`, `call`
follow — [`../../object-layer/`](/framework/ai/2026-09-22/object-layer/)). Skills stay the
plain-English contract; each is backed by one tool.

## The alternative, and when it wins

A bash/PowerShell tool is universal and needs no host. It wins for one-off exploration on a
machine where Servex is not running. For everything that recurs, the tool wins: it is
checked, logged, and visible.
