# Servex

**The one process on this machine that stays up.** It starts and watches the dev
servers (and whisper-server), it holds every live Claude agent, it owns every log
file, and it answers MCP — so a Claude session never has to start a dev server
itself, any session can steer an agent it did not start, and two writers on the
same log can never tear a line.

```
node Servex/sustain.mjs
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
wire; `Servex.Agents`' `watch()` is what feeds it.

**Reverse proxy** — `ReverseProxy.js`. Reads the `Host` header, strips
`.localhost`, forwards to that project's port, HTTP and WebSocket alike. When
the port refuses, it *starts the project* and serves a page that polls itself
until it is up.

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
dev server's own plugin handles.

**Assistant** — `agents/Assistant.js`, one Sonnet session that is always up,
inside this process, holding no file tools at all. `ux/Dictate` posts every
sentence the owner speaks to `/log/prompts`; within a few seconds the assistant
appends a `name` for each thing it heard named, a `card` for the idea, and a
`refined` reading that cites back the exact sentences it read — the [Prompts
view](/framework/ai/v/3/?view=prompts) is where all three show up live, beside
the owner's own words. It never edits a file and never builds; that posture is
written out in full in `agents/assistant.md`, its whole system prompt.

## Where things live

Outside the repo, one folder per machine — `%LOCALAPPDATA%/lew42/servex/`:

- `ports.json` — name → port
- `logs/<name>.jsonl` — one file per supervised thing, plus `servex.jsonl` for
  Servex's own events

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

All eleven tools go on through that one seam in `Servex.tools()`, with no
shortcut — if it works for them it works for yours. Six are the servers'
(`list_servers`, `start_server`, `restart_server`, `stop_server`, `server_logs`,
`append_log`) and five are the agents' (`spawn_agent`, `send_to_agent`,
`interrupt_agent`, `list_agents`, `stop_agent`), the second five handed in by
`agents/tools.js` as one array.

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
- **Nothing supervises the keeper.** That is the honest floor of any restart
  chain, and why `sustain.mjs` does one thing. Surviving a machine reboot wants a
  Scheduled Task that runs it at logon — see below.

## Surviving a reboot

`sustain.mjs` restarts Servex when it dies, but nothing restarts `sustain.mjs`
itself after the machine reboots. A Scheduled Task named `Servex` does that: at
logon it runs `sustain.mjs`, hidden, from the repo root. It is registered on the
owner's machine (2026-09-24). To set it up again, paste this into PowerShell:

```powershell
$a = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NoProfile -WindowStyle Hidden -Command "cd ''C:\Code\lew42\monorepo''; node Servex/sustain.mjs"'
$t = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
Register-ScheduledTask -TaskName 'Servex' -Action $a -Trigger $t -Force
```

Check it with `Get-ScheduledTask Servex` (state `Ready`). If Servex is already
running when the task fires, the second `sustain.mjs` refuses and exits — no clash.

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
