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

## The six parts

**Agents** — `agents/`, the Agent SDK session host: every live Claude session in
one `Map`, spawned, messaged, interrupted and stopped through MCP tools. Each
agent is handed this same `/mcp` url, so **an agent can hire agents of its own.**
[`agents/readme.md`](./agents/readme.md) is its own screen.

**Dashboard** — `Servex.Dashboard`, a `Server` from `../Server/Server.js`, the same
class every project here runs. It serves `Servex/public/`, with the monorepo's
`public/` behind it so the page can import the real `View`. Projects and log
names are polled; **agents are pushed**, over `Stream.js` — server-sent events, so
a token shows up in the page as the agent thinks it. `GET /api/stream` is that
wire; `Servex.Agents`' `watch()` is what feeds it. `POST /api/agents/<id>/message {text}`
says something to one running agent (queued behind its current turn) — the AI 2 Live card's
inline chat uses it; an unknown id is a 404, a stopped one a 409.

**`POST /api/tidy`** (`agents/tidy.js`) cleans one chunk of dictated text with a single
no-tools Sonnet call. **`POST /api/hitl`** (`agents/hitl.js`) is the human-in-the-loop chat's
own two small model calls, `marks` (per-sentence purpose + a green-check/yellow-question flag)
and `rename` (five title alternatives) — named ops only, and a `system` or `model` in the body
is refused rather than run.

**Reverse proxy** — `ReverseProxy.js`. Reads the `Host` header, strips
`.localhost`, forwards to that project's port, HTTP and WebSocket alike. When
the port refuses, it *starts the project* and serves a page that polls itself
until it is up. A page load waits up to 15 s for the project to answer first, so
a quick restart shows the page late rather than the "Starting…" page.

**The gate** — `gate.mjs`. A tiny separate process holds port 80 and passes every
connection on to the proxy (on 8079); while Servex restarts or crashes, visitors
wait instead of getting Chrome's error page. It outlives Servex on purpose;
Servex keeps it alive: it checks port 80 every 5 s and relaunches the gate if
nothing answers. `sustain.mjs --stop` stops it, and `SERVEX_NO_GATE=1` turns it off.

**Port registry** — `PortRegistry.js`. A name gets a port and keeps it forever, so
a project's cookies and localStorage survive a restart. A project outside the scan
root — a worktree, say — registers itself with `POST /api/projects {name, path,
port?}` and leaves with `DELETE /api/projects/:name`; both are loopback-only, like
every route, and reach the proxy with no restart (`Server/worktree-up.mjs` and
`worktree-down.mjs` call them and stay silent when Servex isn't running).

**Processes** — `Process.js`. One supervised child per running server: `PORT` in
its environment, restart-on-crash with a doubling backoff, `start` `stop`
`restart` `logs`, and every line it prints going into the log writer. Not pm2 —
Servex *is* the always-on process, and a second daemon under it is one too many.
Whisper is one of these (`Process.Whisper`), with the same four boot cases the
dev server's own plugin handles. It runs with Silero voice-activity detection
(`--vad`), so silence and noise return empty text instead of a made-up "Thank you";
the model file is `models/ggml-silero-v5.1.2.bin` beside the Whisper model.

A project's dev server **outlives Servex**: it is started through `orphan.mjs`
(hidden, and out of reach of a tree kill), and when Servex comes back it
*adopts* the same process instead of starting a new one. So a Servex restart
never restarts your site. `sustain.mjs --stop` stops them too.

**Assistant** — `agents/Assistant.js`, one Sonnet session that is always up,
inside this process, holding no file tools at all. `ux/Dictate` posts every
sentence the owner speaks to `/log/prompts`; within a few seconds the assistant
appends a `name` for each thing it heard named, a `card` for the idea, and a
`refined` reading that cites back the exact sentences it read — the [Prompts
view](/framework/ai/v/3/?view=prompts) is where all three show up live, beside
the owner's own words. It never edits a file and never builds; that posture is
written out in full in `agents/assistant.md`, its whole system prompt.

**Cards** — `cards/`, one folder per card, and the `create_card` tool that makes
them. [`cards/readme.md`](./cards/readme.md) defines every line.

**Task loop and heartbeat**: `TaskLoop.js` chases an open task whose log has gone quiet. `Heartbeat.js` sends a task mastermind that has been silent for 5 minutes a neutral status check, revives a dead one from its session (with a ration), and posts on the card only when that fails. A landed task's worktree server is taken down by `Server/worktree-sweep.mjs`. See [`doc/task-loop.md`](./doc/task-loop.md). `SERVEX_NO_TASKLOOP=1` and `SERVEX_NO_HEARTBEAT=1` turn them off.

**Dormant agents and the working cap**: an agent idle for 3 minutes goes dormant (its claude process exits; a message resumes it by session), at most 5 agents work at once, and an agent past 200k tokens or 500 MB is compacted. See [`doc/dormant.md`](./doc/dormant.md). Waking a dormant agent used to be able to lose the very message that woke it (a phantom "working" row with no process behind it) — the seven fixes that close every way that was found to happen, and the reconcile that catches what nothing moment-to-moment does, are at [`doc/never-lose-a-wake.md`](./doc/never-lose-a-wake.md).

**Budgets**: at 100% of a task's budget its mastermind and parent are told once and new spawns under it are refused; at 150% its minions stop. See [`doc/budget.md`](./doc/budget.md).

**A worktree page never speaks as the owner.** A post whose Origin is a worktree (its port or `<name>.localhost`, from `.worktrees.json`) is `via: "worktree:<name>"`: a `/log/<name>` line is stamped with it and wakes neither the assistant nor the dispatcher; a card post (`/card/*`, `/log/cards/*`) or a Live-card message from there is answered as a stub, written nowhere (`Servex.via()`).

**Worktree pool** — `Pool.js` keeps one quick-fix worktree warm: any agent calls `take_worktree` and gets its path and URL at once, then `return_worktree` hands it back ([`doc/pool.md`](./doc/pool.md); `GET /api/worktrees`; `SERVEX_NO_POOL=1` turns it off). **`Pool.take_sync()`** (session-gate, 2026-10-01) is the synchronous twin `Agents.spawn()` calls on itself: a fresh `minion` spawned with no worktree `cwd` is moved into a ready slot before its first turn, or the spawn is refused outright if none is ready — never a silent fallback to the main tree with no smoke test and no review.

**Inbox** — `agents/inbox.js`: coordination, never chat. `drop(path, text)` sends a note to the mastermind coordinating that page's module (its `claim_topic`), or else leaves it in the page's inbox, shown in the page's AI tab; `clear(path, id)` clears it. One line each, appended to the page's `page.jsonl`. Known rule: a folder that isn't a page (no page.js, no page.jsonl) never gets one; its notes go to the nearest page above it, or the loader would turn it into a jsonl page. See [`doc/inbox.md`](./doc/inbox.md).

**Follow** — `Follow.js`: an agent can't watch a file itself, so `follow({path})` has Servex watch it and message you every change, one message per burst, through the same queue `send_to_agent` uses. `unfollow` and `list_follows` too. See [`doc/follow.md`](./doc/follow.md).

## The Servex mastermind is always on

There is always exactly one `mastermind-servex` (or `mastermind-servex-N`) running: it watches for system problems and owns Servex's own fixes. Global.js starts it at boot, and `admit()` lets it past every gate: memory, the working cap and the agent ceiling (the owner, 2026-10-02: "we can't afford to have it go down… just force it"). To replace it, write a checkpoint, stop the old one, and spawn the next `-N`.

## Big text moves by hook or by path, never through a tool call

Every character an agent puts in a tool call is OUTPUT it pays to generate. So a long prompt, a file or a brief is never re-typed into `spawn_agent`, `send_to_agent` or a log write: a hook captures it where it already exists (the `UserPromptSubmit` hook logs every owner prompt as it arrives; the Stop hook can log the reply), and agents pass a PATH or an id instead (`task: {dir, brief}`). (the owner, 2026-10-02)

## Is the machine melting? — the monitor and the spawn queue

`Monitor.js` checks the machine every 5 seconds: total CPU, free RAM, the five
processes using the most CPU, how many claude, node and chrome processes exist,
the GPU (through `nvidia-smi`), and how many live agents are **idle but still
holding a claude process** — the thing that ate the RAM on 2026-09-24. Any session
asks with the MCP tool **`system_health`** (or `GET /api/system`) and gets one
plain line first, like "Calm: CPU 22%, 15.4 GB free, GPU 37 °C, 0 idle agents
holding claude." Once a minute it writes an averaged line to the `system` log.
It is cheap on purpose: one hidden PowerShell loop and one `nvidia-smi` for its
whole life, never a new process per sample.

**The flag** goes up when CPU stays above 90% for 60 seconds, or free RAM drops
under 3 GB (`SERVEX_HOT_CPU`, `SERVEX_HOT_SECONDS`, `SERVEX_LOW_RAM_GB`, or the
tool's own three arguments while it runs). Going up sends one message to
`mastermind-servex` and one line to the Live card; clearing says one line more.
**While it is up, new agents wait in a queue** instead of starting: `spawn_agent`
answers with a card that says `state: "queued"` and why, and Servex starts them
by itself, oldest first, once the flag clears. Tasks the Dispatcher picks up
wait in its own list the same way. The owner's assistants and their helpers are
never queued (the comment above `admission()` in `Servex.js` says why). CPU temperature and fan speed need admin
on this machine, so the sample says `null` and gives the reason.

**Whose RAM is it?** `Processes.js` sorts every process into ours (by task, the front
desk, Servex, Claude Code sessions, dev servers) or everything else, every 10 seconds,
records each agent's claude.exe PID at spawn, and reaps orphaned waiters (tail, grep,
sleep …) of ours. `Worktrees.js` removes worktrees whose work is merged, keeping the
branch. `GET /api/processes`; see [`doc/processes.md`](./doc/processes.md).

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

## The log is single-writer — write to it through Servex

`Log.js` opens each file exactly once and keeps a queue per file. **No other
process opens those files.** It posts a line instead:

```
POST http://127.0.0.1:8090/log/<name>     { "msg": "anything", … }   → Servex stamps `at`
GET  http://127.0.0.1:8090/log/<name>?n=50                           → the last 50 entries
```

Two processes firing 200 appends each land 400 parseable lines, in order, with
nothing torn — `node Servex/proof/proof.mjs`, proof 6. Every agent event goes
through the same writer, one file per agent (`agent-<id>.jsonl`).

**The appender checks names, so no agent can bypass the owner's naming rules.**
A `name`, `rename`, `approve` or `dispute` line is checked against a small live
index of every id's visible name, `seen` (any card has shown it) and `locked`
(the owner has approved it) — `node Servex/proof/proof-naming.mjs`, eight
scenes, and its own answer agreeing with `log-model/fold.js` at every one.
Renaming a name the owner has already seen becomes a `dispute` instead
(`{ok:true, became: "dispute"}`, HTTP 200) unless `by` is `"owner"`; a `name`,
`rename` or `dispute` aimed at a locked name is
refused outright, naming the lock (`{ok:false, why}`, HTTP 409); only `by:
"owner"` may `approve`. Everything else — including the very first `name` for
an id — is written unchanged.

**A browser tab can write here too.** These two routes — and only these two —
answer CORS, because `ux/Dictate` posts every dictated sentence from the site's
origin to this one and a browser guards that with a preflight. `Allow-Origin: *`
is safe here because the router has already refused every non-loopback caller, so
`*` can only mean "any page on this machine".

## Adding tools to the MCP — the seam

Anything can put a tool on Servex's `/mcp` door; nothing has to be listed in
`Servex.js` in advance. Call `servex.mcp.tool(definition, handler)`, where the
definition is `{ name, description, inputSchema }` and the handler takes the
call's arguments and returns a string (or a promise of one). A definition may
carry its own `handler` instead, which is the shape a module exporting a whole
list of tools wants — `for (const tool of tools) servex.mcp.tool(tool);`.
Registering the same name twice replaces it, so a module can be reloaded.

All twelve tools go on through that one seam in `Servex.tools()`, with no
shortcut — if it works for them it works for yours. Six are the servers'
(`list_servers`, `start_server`, `restart_server`, `stop_server`, `server_logs`,
`append_log`) and five are the agents' (`spawn_agent`, `send_to_agent`,
`interrupt_agent`, `list_agents`, `stop_agent`), the second five handed in by
`agents/tools.js` as one array, and one is the monitor's (`system_health`).
`agents/tools.js` now also hands in the jobs, ops and module-expert tools
(`ask_expert`, `list_experts`, `load_module`, `readme_modules`), so the count above is a floor.

## Watch out

- **Port 80 is Servex's** (2026-09-23). The monorepo's dev server is a project
  behind it on its own port — `node server.js` by hand would fight the proxy
  for 80; start it by visiting `monorepo.localhost`, or give it `PORT`.
  `SERVEX_PROXY_PORT` moves the proxy if 80 is ever taken.
- **`node --check` proves a file parses, not that Servex boots.** Start it and
  fetch a page before you walk away.
- **`node Servex/proof/proof.mjs`** after any change to `Process.js` or
  `Log.js`. Six checks, fifteen seconds, and it needs Servex already running
  on 8090. **`node Servex/proof/proof-naming.mjs`** after any change to the
  naming rules in `Log.append()` — eight scenes, runs standalone, Servex up or
  down.
- **Never launch the keeper with `cmd /c start`.** `start` opens a window, and a
  mangled argument makes it open an ERROR window — on the owner's desktop, several
  times, on 2026-09-22. The one that works and opens nothing:
  `powershell -NoProfile -Command "Start-Process -FilePath node -ArgumentList 'Servex/sustain.mjs' -WorkingDirectory 'C:/Code/lew42/monorepo' -WindowStyle Hidden -PassThru"`,
  which hands back the real pid.
- **`powershell.exe -WindowStyle Hidden` still flashes a console once, at logon.**
  PowerShell hides its own window a moment *after* Windows has already created and
  shown it — proven with an `EnumWindows` probe on 2026-09-28, by triggering the
  registered logon task and watching a real visible window appear. The fix is
  `Servex/hidden-launch.vbs`, run through `wscript.exe` — see below.
- **Nothing supervises the keeper.** That is the honest floor of any restart
  chain, and why `sustain.mjs` does one thing. Surviving a machine reboot wants a
  Scheduled Task that runs it at logon — see below.
- **`--restart` hops outside Servex's own process tree before it kills anything** —
  an agent running it from inside that tree used to kill itself along with Servex,
  so nothing came back (09-28, 09-29): [`doc/restart.md`](./doc/restart.md).

## Surviving a reboot

`sustain.mjs` restarts Servex when it dies, but nothing restarts `sustain.mjs`
itself after the machine reboots. A Scheduled Task named `Servex` does that: at
logon it runs `sustain.mjs`, hidden, from the repo root. It is registered on the
owner's machine (2026-09-24). To set it up again, paste this into PowerShell:

```powershell
$a = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument '//B "C:\Code\lew42\monorepo\Servex\hidden-launch.vbs"'
$t = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
Register-ScheduledTask -TaskName 'Servex' -Action $a -Trigger $t -Force
```

Check it with `Get-ScheduledTask Servex` (state `Ready`). If Servex is already
running when the task fires, the second `sustain.mjs` refuses and exits — no clash.

The action runs the `.vbs` wrapper, not `powershell.exe -WindowStyle Hidden`
directly — see the "Watch out" bullet above for why (the direct form flashes a
visible console for a moment at logon; the `.vbs` wrapper does not).

The port-80 gate needs nothing registered of its own. After a reboot the
Scheduled Task starts `sustain.mjs`, the keeper starts Servex, and Servex
launches the gate at boot.

> **Note:** the older one-line `schtasks /Create … /TR "…\"…\"…"` form only works
> in cmd.exe. PowerShell reads the `\"` escapes differently, splits the command at
> the `;`, and `schtasks` fails with "Mandatory option 'sc' is missing"
> (2026-09-24). Use the three lines above.

## More

- The audit, every decision and every measurement:
  [`/framework/ai/2026-09-22/servex-port/`](/framework/ai/2026-09-22/servex-port/)
  (the port) and
  [`/framework/ai/2026-09-22/servex-integrate/`](/framework/ai/2026-09-22/servex-integrate/)
  (the agents, the live dashboard and the keeper — start here, it is a page, not a readme)
- The repo this was ported from: `C:/Code/servex` — read, never edited. Its
  `servex-mvp.md` lists the gaps; the ones that are closed are closed here.
