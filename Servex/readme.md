# Servex — the one process that stays up: it runs the agents, supervises the dev servers, owns the logs and answers MCP

A Claude session never starts a dev server itself and never writes a shared log itself: it asks Servex. Servex holds every live Claude agent (so any session can steer one it did not start) and is the single writer of each log (so two writers never tear a line). Site-side pages: [/framework/servex/](/framework/servex/).

```
node Servex/sustain.mjs            # starts Servex and restarts it whenever it dies (--status, --stop, --restart)
node Servex/index.js               # Servex alone, nothing watching it: for debugging
```

| URL | What |
|---|---|
| `http://127.0.0.1:8090/` | the dashboard: projects, agents live, a log tail (`Servex/public/`) |
| `http://127.0.0.1:8090/mcp` | the local `servex` MCP door every Claude session connects to (`MCP.js`) |
| `http://127.0.0.1:8090/mcp/remote` | the remote door for the Claude voice app, bearer token (`ext/remote/RemoteMCP.js`) |
| `http://<name>.localhost/` | a project through the proxy on port 80; `servex.localhost` = the dashboard, `monorepo.localhost` = this site; a stopped project starts on first visit |

Everything binds `127.0.0.1` and refuses a non-loopback caller. Nothing here is for a network.

## The class (what `new Servex()` builds, in `Servex.js`)

```js
class Servex {
  agents: Agents                  // agents/Agents.js — spawn, send, stop, dormant, revive; `Agents.Agent` is one SDK session
  dashboard: Dashboard            // the :8090 HTTP router; mcp: MCP (/mcp); remote: RemoteMCP (/mcp/remote)
  dispatcher: Dispatcher          // agents/Dispatcher.js — routes a prompt to the right agent
  task_loop: TaskLoop             // TaskLoop.js — runs Server/AIIndex.mjs --watch, re-prompts stalled task steps (doc/steps.md)
  heartbeat: Heartbeat            // Heartbeat.js — status check → triage → escalate
  lifecycle: Lifecycle            // Lifecycle.js — reaps finished or stuck agents
  pool: Pool, worktrees: Worktrees, fixer: Fixer   // the quick-fix pool and per-task worktrees
  cards: Cards, inbox: Inbox, asks: Asks, follow: Follow   // Inbox cards; every page's inbox; the asks ledger; follow()
  assistant, echo, sessions, layers, global, external      // the voice pair, prompt refinement, voice sessions, page layers
  log: Log, stream: Stream        // single-writer logs; live streams to the browser
  usage: Usage, monitor: Monitor  // usage meters; the process monitor
  proxy: ReverseProxy, ports: PortRegistry
}
```

## Where the code is

| Folder or file | What |
|---|---|
| `agents/` | `Agents.js` (`spawn` → `open_task` → SDK `query()`), `tools.js` (the in-process tools incl. `spawn_agent`), `roles.js` (role → skill and posture), `Dispatcher.js`, `Sessions.js`, `page_tools.js` (page_set/page_add/page_call/page_read/page_log/page_note), `inbox.js`, `claims.js`, `directory.js` |
| `asks/`, `cards/` | the asks ledger (`Asks.js`), cards (`Cards.js`, writes `ai/cards.jsonl`) |
| `ext/` | `remote/` (voice-app door), `openrouter/` (non-Anthropic models), `refine/`, `local/` |
| `doc/` | the detail; `proof/` and `*.test.mjs` are checks |

## On disk

Inside the repo Servex writes only the AI records ([ai/](/framework/ai/)). Its own state is outside git, one folder per machine, `%LOCALAPPDATA%/lew42/servex/` (move it with `SERVEX_HOME`): `ports.json` (name → port) · `logs/<name>.jsonl` (one per supervised thing; `servex.jsonl` is Servex's own; `agent-<id>.jsonl` is one agent's) · `procs/<name>.json` (pid of each dev server, so the next Servex adopts it) · `logs/<name>.out/.err` · `logs/reports/` (crash reports) · `logs/windows.jsonl` (popup windows, `Server/window-watch.mjs`).

## Overlaps

The local `servex` MCP and the remote door share one tool registry; the remote adds `ask_mastermind`, `call` and `cloud_voice_log` ([MCP](/framework/ai/doc/agents/mcp.md)). A task folder is opened by `open_task` here; counted by `Server/AIIndex.mjs` ([ai/tasks](/framework/ai/tasks/)).

## More

[doc/architecture.md](doc/architecture.md) · [doc/sdk.md](doc/sdk.md) (how an agent is started) · [doc/lifecycle.md](doc/lifecycle.md) · [doc/dormant.md](doc/dormant.md) · [doc/pool.md](doc/pool.md) · [doc/steps.md](doc/steps.md) · [doc/task-loop.md](doc/task-loop.md) · [doc/landing.md](doc/landing.md) · [doc/skills.md](doc/skills.md) · [doc/module-inbox.md](doc/module-inbox.md) · [doc/restart.md](doc/restart.md) (surviving a reboot) · [ext/remote/readme.md](ext/remote/readme.md) · [../Server/doc/scripts.md](../Server/doc/scripts.md) · the old readme with its dated notes: [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md) and [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md).
