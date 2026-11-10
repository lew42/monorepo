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
  dropped:   Dropped              // Dropped.js — run by TaskLoop each tick: open tasks nobody is working, red-flagged sessions, completed asks with no proof (doc/task-loop.md, core/Task/doc/completion.md)
  OpenItems                       // OpenItems.js (static, no instance) — after any closing line is appended (page_tools write_line, TaskLoop write_line) a record closed under 100% gets one waiting-on-owner task listing what stayed open; the rule is Task#closeout_line (core/Task/doc/completion.md). PROPOSED, OFF BY DEFAULT: it files only with SERVEX_OPEN_ITEMS=on (otherwise after_write returns what it would file and writes nothing); see what it would file with `node Servex/OpenItems.mjs --dry-run [--days 7]` (OpenItems.mjs, the dry run)
  process_runner: ProcessRunner   // ProcessRunner.js — runs a work process's phases in order (public/framework/core/Task/doc/process.md)
  respawn: Respawn                // agents/Respawn.js — the standing system architect gets a fresh session once a day, never mid-task (agents/doc/lifecycle.md)
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
| `agents/` | `Agents.js` (`spawn` → `open_task` → SDK `query()`), `tools.js` (the in-process tools incl. `spawn_agent`), `roles.js` (role → its readme in [`roles/`](agents/roles/readme.md), skills and posture), `Dispatcher.js`, `ChatWriter.js` (V1 `{chat}` lines to `session.messages`; tests `ChatWriter.move.test.mjs`, `ChatWriter.order.test.mjs`), `Sessions.js` (a voice session's fast and smart seats; the fast seat is the voice assistant by default, `session-assistant.txt` = `voice`/`fast`/`off`; both have `parent: "sessions"` so their turn-ends reach `Sessions.hire()`, and `nest_agents` in `page_tools.js` files the fast seat's cost under the smart seat of the same `parent_session`, test `seat-cost.test.mjs`), `ChatWriter.js` (mirrors each `{chat}` line `Sessions.write()` makes into the session's real chat list, `session.messages` and `session.sentences`, and, through the item tool, a `{place}` improve as that sentence's cleaned text, in place, and a new-topic `{place}` as one List `move` line; tests `chat-messages.test.mjs`, `ChatWriter.move.test.mjs`: [core/Session/Chat](/framework/core/Session/Chat/readme.md)), `WakePolicy.js` (when a voice session's smart seat is woken; test `WakePolicy.test.mjs`: [wake-policy](/framework/ux/Dictate/doc/wake-policy.md)), `page_tools.js` (item, page_set/page_add/page_call/page_read/page_log/page_note; `item` takes `get`/`set`/`call` beside `delta`/`read`, and also answers **queries** with no write, e.g. `item({path, delta:{"summary":{}}})` or `item({path, get:"summary"})`: [doc/item-tool.md](doc/item-tool.md)), `inbox.js`, `claims.js`, `directory.js` |
| `asks/`, `cards/` | the asks ledger (`Asks.js`), cards (`Cards.js`, writes `ai/cards.jsonl`) |
| `ext/` | `remote/` (voice-app door), `openrouter/` (non-Anthropic models), `refine/`, `local/`, `recite/` (recite-server, text to speech: [ext/recite/readme.md](ext/recite/readme.md)) |
| `ErrorLine.js` | a tool call that throws writes `{"error","where":"file:line","tool","agent"}` into the calling agent's session log (test `ErrorLine.test.mjs`; [doc/tool-process.md](doc/tool-process.md)) |
| `Relief.js` | at 70% memory commit, closes what is finished and puts idle agents to sleep; suggests closing the owner's own apps only in a note, only when they are away from the PC: [doc/processes.md](doc/processes.md#early-relief-at-70) · the page file is insurance, not the fix: [doc/processes.md](doc/processes.md#the-page-file-insurance-not-the-fix) |
| `Lineage.js`, `leaks.mjs` | start and end lines for processes an agent's claude.exe starts (sampled every 10 s), the report of every start with no end, and (`--close-gone`, run a minute after each boot) the end lines a crash never wrote: [doc/processes.md](doc/processes.md#leaks-a-start-with-no-end) |
| `pid-coverage.mjs` (+ `.test.mjs`) | end% and agent+session% per process kind (claude.exe, node, git, powershell/bash, chrome, other), reusing `leaks.mjs`'s own reading and pairing: [doc/processes.md](doc/processes.md#coverage-and-the-two-gaps-that-log-nothing) |
| `doc/` | the detail; `proof/` and `*.test.mjs` are checks |

## On disk

Inside the repo Servex writes only the AI records ([ai/](/framework/ai/)). Its own state is outside git, one folder per machine, `%LOCALAPPDATA%/lew42/servex/` (move it with `SERVEX_HOME`): `ports.json` (name → port) · `logs/<name>.jsonl` (one per supervised thing; `servex.jsonl` is Servex's own; `agent-<id>.jsonl` is one agent's) · `procs/<name>.json` (pid of each dev server, so the next Servex adopts it) · `logs/<name>.out/.err` · `logs/reports/` (crash reports) · `logs/windows.jsonl` (popup windows, `Server/window-watch.mjs`).

## Crash and revive

A planned restart and a crash both bring every working or idle agent back: `Servex.shutdown()` writes the snapshot before it stops anyone, and a boot with no snapshot rebuilds the list from the registry and tells each agent "Servex crashed at <time>; resume". The two crash kinds (a JavaScript error, a native fast-fail), the cause found for the 00:31 one, and what to watch for the other: [doc/restart.md](doc/restart.md#when-servex-crashes-what-comes-back-why-and-what-to-watch-2026-11-02). A boot reopens its agents one every `SERVEX_REVIVE_GAP_S` seconds (default 3, 0 = all at once; mid-turn first), not all in the same two seconds. Browser tests are fenced off the live Servex ([Server/ServexFence.mjs](../Server/ServexFence.mjs)).

## Overlaps

The local `servex` MCP and the remote door share one tool registry; the remote adds `ask_mastermind`, `call` and `cloud_voice_log` ([MCP](/framework/ai/doc/agents/mcp.md)); every tool, grouped, with a compacted set: [doc/tools-map.md](doc/tools-map.md); what each role loads: [agent-context](/framework/ai/doc/agent-context.md). A task folder is opened by `open_task` here; counted by `Server/AIIndex.mjs` ([ai/tasks](/framework/ai/tasks/)).

## Probable direction: agents run in the project's dev server (the owner, 2026-11-06; not built)

Today Servex runs every SDK agent, and the dev server serves the site. Each one loads its own copy of the same items, so the same item lives in memory twice. The direction:

- **Agents run in the project's dev server.** That one process holds one item cache. The browser (over the socket), the agents (as local tools) and MCP all share the same live instances, with no twin copies.
- **Servex becomes a manager:** it starts and stops servers, and watches health and usage.
- **Each project gets its own MCP:** the item tool plus a few scoped essentials. `spawn_agent` moves into each project.
- **One save path.** Today the browser saves through Servex's `POST /api/item`. When that fails, it falls back to a raw append over the dev socket that skips validation ([core/Item/Store.js](../public/framework/core/Item/Store.js), the `warned_no_servex` line). The owner dislikes having two paths. With agents in the dev server, its socket becomes the one validated entry point.

**Tradeoffs and open questions**
- **Gain:** one cache means no stale copies and no twin writers. A change an agent makes is the instance the page already shows.
- **Cost:** 20 projects means 20 MCPs. Which client connects to which one? Who routes a cross-project ask?
- **Risk:** a crashed dev server takes its agents down with it. Today Servex revives agents on its own ([Crash and revive](#crash-and-revive)); that job would move, or stay in the manager.
- **Scoping:** a project MCP carries no open shell. Permissions are checked server side on every request, not trusted from the client.
- **Alternative:** keep agents in Servex and make Servex the only item cache, with the dev server reading through it. That keeps one supervisor, but every page read crosses two processes.

## Map

Every file, one line each: [map.md](./map.md).

**How it connects**
- `spawn_agent` (`agents/tools.js`'s `own(agents)`, folded into `agents/tools.js:72`) → `Agents.spawn()` (`agents/Agents.js:145`) → the real `claude.exe` child (`agents/Agents.js:1463`, inside `SpawnLog.within(...)`) → `SpawnLog.js` logs who started it and why
- An MCP request at `/mcp` → `Servex/MCP.js` → one of `tools.js`'s groups, e.g. `page_tools()` (`agents/page_tools.js:1780`, called from `agents/tools.js:72`, `agents/Agents.js:45`, `agents/Global.js:528`) → the `item`/`page_set`/`page_add` tools
- remote: `/mcp/remote` (`Servex.js:358`, `this.remote = new RemoteMCP(...)`) → `ext/remote/RemoteMCP.js` → `voice_session()` (`RemoteMCP.js:209`, called from `:184` and `:261`)
- `Agents.door()` (`agents/Agents.js:1497`) → every spawned agent's own `/mcp?as=<id>` door, so a tool call always knows its caller

**Design:** [doc/architecture.md](doc/architecture.md) (first), [doc/sdk.md](doc/sdk.md), [doc/lifecycle.md](doc/lifecycle.md), [doc/dormant.md](doc/dormant.md), [doc/processes.md](doc/processes.md), [doc/pool.md](doc/pool.md), [doc/worktree-preview.md](doc/worktree-preview.md), [doc/steps.md](doc/steps.md), [doc/task-loop.md](doc/task-loop.md) (+ its picture, [doc/task-loop.svg](doc/task-loop.svg)), [doc/landing.md](doc/landing.md), [doc/skills.md](doc/skills.md), [doc/module-inbox.md](doc/module-inbox.md), [doc/restart.md](doc/restart.md), [doc/budget.md](doc/budget.md) (pace bands), [doc/follow.md](doc/follow.md) (`Follow.js`), [doc/echo.md](doc/echo.md), [doc/fixer.md](doc/fixer.md), [doc/item-tool.md](doc/item-tool.md), [doc/tools-map.md](doc/tools-map.md), [doc/tool-process.md](doc/tool-process.md), [doc/readme-chain.md](doc/readme-chain.md), [doc/never-lose-a-wake.md](doc/never-lose-a-wake.md), [doc/skills-and-roles.md](doc/skills-and-roles.md) (+ the data and the tool that builds it, [doc/skills-and-roles.json](doc/skills-and-roles.json), [doc/skills-and-roles.mjs](doc/skills-and-roles.mjs)), [doc/pool-stuck-2026-10-09.md](doc/pool-stuck-2026-10-09.md) (history), [doc/owner-2026-10-16-tools.md](doc/owner-2026-10-16-tools.md) (dictated notes).

## Search terms

The words that find this module's past work (counts: `sessions N files · M commits`, from `git grep -c -i '<term>' -- public/framework/ai/sessions | wc -l` and `git log --oneline -S '<term>' | wc -l`; raw output in [terms.txt](/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/readme-maps-servex/terms.txt)):

- `spawn_agent` (sessions 479 files · 390 commits)
- `take_worktree` (sessions 301 files · 188 commits)
- `Heartbeat` (sessions 1696 files · 171 commits) — too common alone; pair it with a verb
- `Dropped` (sessions 1352 files · 140 commits) — too common alone; pair it with "task"
- `TaskLoop` (sessions 356 files · 364 commits)
- `Pool.js` (sessions 181 files · 146 commits) — the quick-fix worktree pool
- `worktree pool` (sessions 117 files · 91 commits)
- `quick_fix` (sessions 65 files · 70 commits)
- `LogSweeper` (sessions 80 files · 86 commits)
- `Monitor.js` (sessions 46 files · 38 commits)
- `ReverseProxy` (sessions 36 files · 29 commits)
- `Games.js` (sessions 28 files · 28 commits) — the window/process closer
- `pid-coverage` (sessions 10 files · 11 commits)
- `OpenItems` (sessions 9 files · 11 commits) — proposed, off by default
- `Lineage.js` (sessions 9 files · 11 commits)

## More

[doc/architecture.md](doc/architecture.md) · [doc/sdk.md](doc/sdk.md) (how an agent is started) · [doc/lifecycle.md](doc/lifecycle.md) · [doc/dormant.md](doc/dormant.md) · [doc/processes.md](doc/processes.md) (closing a task leaves nothing running; who started a pid; early relief at 70% memory; the page file) · [doc/pool.md](doc/pool.md) · [doc/worktree-preview.md](doc/worktree-preview.md) (a worktree waiting for review, on your phone) · [doc/steps.md](doc/steps.md) · [doc/task-loop.md](doc/task-loop.md) · [doc/landing.md](doc/landing.md) · [doc/skills.md](doc/skills.md) · [doc/module-inbox.md](doc/module-inbox.md) · [doc/restart.md](doc/restart.md) (surviving a reboot) · [ext/remote/readme.md](ext/remote/readme.md) · [../Server/doc/scripts.md](../Server/doc/scripts.md) · the old readme with its dated notes: [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md) and [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md).
