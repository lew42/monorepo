# Servex

**The one process on this machine that stays up.** It starts and watches the dev
servers (and whisper-server), it holds every live Claude agent, it owns every log
file, and it answers MCP — so a Claude session never has to start a dev server
itself, any session can steer an agent it did not start, and two writers on the
same log can never tear a line.

```
node Servex/sustain.mjs
```

## Architecture

```js
class Servex {                       // the always-on process, :8090 (proxy on :80)
  agents: Agents                     // spawn, message, stop, dormant, the working cap of 5
  sessions: Sessions                 // voice: one fast + one smart assistant, global
  dispatcher: Dispatcher             // routes a prompt to the right agent
  task_loop: TaskLoop                // node-led: re-prompts and escalates a task's steps
                                     // its step nudge: doc/steps.md (the Step runner)
  heartbeat: Heartbeat               // status check → triage → escalate
  lifecycle: Lifecycle               // reaps finished or stuck agents
  pool: Pool, worktrees: Worktrees   // the quick-fix pool; per-task worktrees
  cards: Cards, inbox: Inbox, asks: Asks   // AI board cards; page inboxes; the asks ledger
  log: Log, stream: Stream           // single-writer logs; live streams to the browser
  usage: Usage, procmon: Processes   // usage meters; the process monitor
  mcp: MCP, proxy: ReverseProxy, ports: PortRegistry   // HTTP tools; *.localhost routing
}

Agents.Agent = class Agent {         // one Claude Agent SDK session
  id, role, model, provider          // provider: anthropic | openrouter (ext/openrouter)
  state                              // working | idle | dormant | stopped
  session_id, parent, cost, context
  send(text), stop(), revive()
}
// Agent tools are in-process node functions (agents/tools.js); the VS Code session uses the MCP servers.
```

That is the whole command, from the repo root, and it is the one to use: it
starts Servex and **starts it again whenever it dies** — measured 3.1 seconds
from a hard kill to the dashboard answering again. `--status` says whether it is
up and on which pids, `--stop` stops it for good. (`node Servex/index.js` runs
Servex alone, with nothing watching it — for a debug session, not for the day.)

Either way it prints three URLs:

| | |
|---|---|
| `http://127.0.0.1:8090/` | the dashboard — every project, every agent talking live, a log tail |
| `http://<name>.localhost/` | any project, through the proxy on port 80 — `servex.localhost` is this dashboard, `monorepo.localhost` is this repo's site, plain `localhost` is the dashboard too. **Visiting a stopped project starts it.** |
| `http://127.0.0.1:8090/mcp` | the MCP door every Claude session connects to |

Everything binds `127.0.0.1` and every route refuses a non-loopback caller
twice over. These tools start processes; nothing here is for a network.

- **Class plan for the two cores** — `Agents.js` and `directory.js` as classes, a plan awaiting the owner: [agents/doc/class-plan.md](agents/doc/class-plan.md)
- **The quick-fix pool** — `node Servex/pool-status.mjs` shows every slot, its holder and why reclaim frees or keeps it: [doc/pool.md](doc/pool.md#when-a-slot-is-freed-2026-10-17).
- **Tasks** — every spawn gets its task folder opened (`open_task`); which tool makes a task for whom, and a cloud voice agent's session dir: [ai/doc/tasks.md](/framework/ai/doc/tasks.md#3-who-makes-a-task-the-tooling)
- **The Step runner** — a task's steps carry estimates; node prompts each next step and nudges once at 2x: [doc/steps.md](doc/steps.md).
- **Landing check** — a landing line is flagged when the branch's files are not on michael/dev, by content: [doc/landing.md](doc/landing.md).
- **The six parts** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#the-six-parts), verbatim.
- **The Servex mastermind is always on** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#the-servex-mastermind-is-always-on), verbatim.
- **The voice pair: one standing pair, recycled** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#the-voice-pair-one-standing-pair-recycled-the-owner-2026-10-02), verbatim.
- **Limits we hit: RAM first** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#limits-we-hit-ram-first-2026-10-02), verbatim.
- **Dev servers: Servex starts them, a lease keeps them** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#dev-servers-servex-starts-them-a-lease-keeps-them-the-owner-2026-10-02), verbatim.
- **Big text moves by hook or by path, never through a tool call** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#big-text-moves-by-hook-or-by-path-never-through-a-tool-call), verbatim.
- **Is the machine melting? — the monitor and the spawn queue** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#is-the-machine-melting--the-monitor-and-the-spawn-queue), verbatim.
## Where things live

Outside the repo, one folder per machine — `%LOCALAPPDATA%/lew42/servex/`:

- `ports.json` — name → port
- `logs/<name>.jsonl` — one file per supervised thing, plus `servex.jsonl` for
  Servex's own events
- `procs/<name>.json` — the pid of each dev server Servex started, so the next
  Servex can adopt it; its output goes to `logs/<name>.out` and `.err`, and
  from there into `logs/<name>.jsonl` as before
- `logs/reports/` — Node's crash report, if Servex ever dies natively again
  (the 0xC0000409 exits left no trace before); `logs/gate.log` is the gate's
- `logs/windows.jsonl` — every real popup window `Server/window-watch.mjs` ever catches (owning
  process conhost/cmd/powershell/node/bash/claude, title, pid, parent chain); it runs forever,
  started by hand for now (`node Server/window-watch.mjs`, launched hidden via `orphan.mjs`) —
  wiring it into Servex's own supervision, so it starts and gets adopted automatically like a dev
  server, waits for the next batched Servex restart

`SERVEX_HOME` moves both. Nothing Servex writes ever lands in git.

- **The log is single-writer — write to it through Servex** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#the-log-is-single-writer--write-to-it-through-servex), verbatim.
- **Adding tools to the MCP — the seam** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#adding-tools-to-the-mcp--the-seam), verbatim.
- **Watch out** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#watch-out), verbatim.
- **Surviving a reboot** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#surviving-a-reboot), verbatim.
## More

- The audit, every decision and every measurement:
  [`/framework/ai/sessions/2026/09/22/session-7e28aa8d/servex-port/`](/framework/ai/sessions/2026/09/22/session-7e28aa8d/servex-port/)
  (the port) and
  [`/framework/ai/sessions/2026/09/22/session-61d99357/servex-integrate/`](/framework/ai/sessions/2026/09/22/session-61d99357/servex-integrate/)
  (the agents, the live dashboard and the keeper — start here, it is a page, not a readme)
- The repo this was ported from: `C:/Code/servex` — read, never edited. Its
  `servex-mvp.md` lists the gaps; the ones that are closed are closed here.
- Decisions and the SDK: [`doc/architecture.md`](./doc/architecture.md) · [`doc/sdk.md`](./doc/sdk.md) (how an agent is started and kept alive)
- Skills each role gets, injected by node, with measured rates: [`doc/skills.md`](./doc/skills.md)

- **Scripts census** (every Servex file with verdict and references): [../Server/doc/scripts.md](../Server/doc/scripts.md)
- **Module inbox** (drop an ask's essence on a module; a fresh mastermind reads it later; `module_inbox`, `node Server/ModuleReview.mjs --plan`): [`doc/module-inbox.md`](./doc/module-inbox.md)
- **Remote MCP** (the tunnel the Claude voice app calls: the whole tool registry plus `ask_mastermind`): [`ext/remote/readme.md`](./ext/remote/readme.md)
