# servex-port — audit the old Servex, port it into `Servex/`, add the log writer and /mcp

Minion: Opus, effort high. Session id `7e28aa8d-bd2b-4ae6-b952-784b30e48277`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then section **A** of
[`../mastermind-servex/requirements.md`](../mastermind-servex/requirements.md) — the owner's own
words for this task. Private ports: **8090** (Servex dashboard) and **8080** (its proxy); check
`netstat -ano | grep LISTENING` first and pick the next free one if either is taken.

## What exists — read before writing anything

- `C:/Code/servex/` — the old repo. `Servex/Servex.js`, `ReverseProxy.js`, `PortRegistry.js`,
  `Project.js`, `servex-mvp.md` (steps 1–7 worked; "where the build diverged" lists the known
  gaps), `servex.md` (the long vision), `CLAUDE.md`. Its `Server/` and `public/framework/` are
  old copies of this monorepo's — ignore them; use the monorepo's.
- `Server/` here — what the monorepo dev server already does, so you do not rebuild it:
  `run.js` (the plugin list), `server.js` at the root (the supervisor that boot-tests a change on
  a spare port before restarting the child — `Server/doc/watch.md`), `plugins/MCP.js` (a
  hand-rolled Streamable-HTTP MCP endpoint at `/mcp`, express, no SDK — copy this pattern),
  `plugins/Whisper.js` (starts `whisper-server` on boot; four boot cases), `hold.mjs`,
  `health-supervisor.mjs`, `worktree-up.mjs`.
- `ai/2026-09-19/servex-study/` decided "rewrite small, not Servex, not pm2" on 09-19; the
  owner's brief today overrides it: port Servex. Keep that study's reason against pm2 in mind.

## Deliverables

1. **The audit, as one log line and one screen of your page:** what the old Servex does that
   works (proxy, port registry, auto-start on first request, project scan), what the monorepo
   `Server/` already does that Servex should use rather than re-do, and the gaps `servex-mvp.md`
   names. This is the basis of every decision below; write it first.
2. **`Servex/` boots.** `node Servex/index.js` from the repo root starts one process: the
   dashboard server (a `Server` from `../Server/Server.js`, serving `Servex/public/`), the
   reverse proxy on its own port (`name.localhost:8080` → the project's port — the proxy port is
   **configurable**, default 8080 for now; port 80 belongs to the owner's server, decision
   `proxy-port` in the run ledger), the port registry (persisted **outside the repo** at
   `%LOCALAPPDATA%/lew42/servex/ports.json` — the MVP doc's own open item), and the project list.
   Own `Servex/package.json`; run `npm install` in `Servex/`. Loopback only — every listener
   binds `127.0.0.1` (the MVP doc's `0.0.0.0` gap).
3. **Supervised processes, without pm2 unless you find a concrete reason.** Servex is itself the
   always-on process; a second daemon under it is one too many, and the handover already lists
   an idle pm2 daemon as clutter. A `Process` (or whatever name fits the house style —
   `code` skill: parts as static subclasses) wraps `child_process.spawn` with `PORT` in the env,
   restart-on-crash with a backoff, `start/stop/restart/logs`, and its stdout/stderr lines going
   into the log writer. **Whisper is one of these**: the same four boot cases
   `Server/plugins/Whisper.js` handles (not installed · already running · starts · fails), its
   output as log entries. Do not remove the `Whisper.js` plugin from the dev server — a server
   started under Servex gets `NO_WHISPER=1` in its env so only Servex owns the process.
   Write the decision line either way (`options` with pm2 as the alternative).
   Prove it recovers from: the child already dead when `restart` is called; a child that exits
   immediately on boot (crash loop → backoff, never a tight loop); a port already held by a
   stranger; and anything else you can think of. Name each proof in the log with its number.
4. **The single-writer JSONL log appender — `Servex/Log.js`.** One open write stream per file,
   `append(name, entry)` stamps `at` (local time with offset, the `say.mjs` format) and writes
   one line, a queue so two appends never interleave, and `tail(name, n)`. Other processes
   append THROUGH Servex, never to the file: `POST /log/<name>` with a JSON body, `GET
   /log/<name>?n=50`. Log files live outside the repo at `%LOCALAPPDATA%/lew42/servex/logs/`;
   Servex's own events (`process`, `proxy`, `log`) go there too. Prove two concurrent posters
   (a script firing 200 appends from two processes) produce 400 parseable lines in order of
   arrival with no torn line.
5. **`/mcp` over HTTP on the dashboard port**, the same protocol shape as
   `Server/plugins/MCP.js` (copy, generalise, do not import it). Tools: `list_servers`,
   `start_server`, `restart_server`, `stop_server`, `server_logs`, `append_log`. Expose the
   registration seam as a method — `servex.mcp.tool(name, schema, handler)` or the house-style
   equivalent — because the sibling task `agent-host` will register `spawn_agent`,
   `send_to_agent`, `interrupt_agent`, `list_agents` through it. Document that seam in one
   paragraph in `Servex/readme.md`. Prove it with a real `claude -p` turn that lists this MCP's
   tools through an `--mcp-config` pointing at `http://127.0.0.1:8090/mcp` (the smoke-test
   recipe in the run ledger is the launch shape; `--strict-mcp-config` keeps the site MCP out).
6. **The monorepo dev server as a Servex project.** `Servex` scans `C:/Code` as before, but the
   monorepo must register with its real start command (`node server.js` with `PORT`), and a
   start from Servex must reach a 200 on `monorepo.localhost:8080/framework/`. Do not start it
   on 80. That is the one end-to-end proof: `node Servex/index.js` → visit the project through
   the proxy → it auto-starts → page loads.
7. **`Servex/readme.md`** (the reader's index — what it is, `node Servex/index.js`, the four
   parts, the ports, where the logs and ports files live, the MCP seam) and a `Servex/public/`
   dashboard page that shows the project list with start/stop and a live log tail — the old
   `public/page.js` from the servex repo adapted to this framework's `View`. Show, don't tell.
8. **A CLAUDE.md rule is the owner's** — write the exact line you would add ("Claude sessions
   never start dev servers; Servex does — `start_server`/`restart_server`/`server_logs` on the
   Servex MCP") as an `ask` line with `needs: {owner: "add one line to CLAUDE.md", minutes: 1}`.

## Fence

`Servex/**` is yours, **except `Servex/agents/`** — that directory belongs to the sibling task
`agent-host`, which is building the Agent SDK session host at the same time against the MCP
seam you expose (its tools module exports `[{name, schema, handler}]`; you do not import it —
integration is a later task). `Servex/package.json` already exists with `http-proxy` and
`@anthropic-ai/claude-agent-sdk` installed (`Servex/node_modules/` — the root `.gitignore`
already covers it); add a dependency there only with a `decision` line. Append-only to `.jsonl`. You may not edit `Server/`, `public/`, `server.js`, the
root `package.json`, or `C:/Code/servex`. If you need a change in `Server/` to make a proof pass,
write what and why as a `log` line and work around it inside `Servex/` — the mastermind will
route it.

## Order

Audit (1) → boot (2) → processes (3) → log (4) → mcp (5) → end-to-end (6) → readme + UI (7).
Land what is proven if you run long; say exactly which numbers are proven and which are not.
Kill every process you started, by PID, before landing; say the PIDs in the log.

## Length

Your page: one screen. Landing report: ten sentences. `Servex/` core: aim for under ~600 lines
across all files; if it is heading past 900, stop and say what is eating them.

## Owner addendum (2026-09-22 15:10, verbatim)

> I think the old Servex repo might have an old Server repo as a git submodule, which we don't
> need, just use our current Server system, create plugins if you need, and then Servex launches
> its own process with dev server. servex.localhost was it? make a report (not just a readme, a
> lot of the reporting has been linked readme's that load raw in the browser, very hard to read,
> way too long, not "iceberg content").

So: the monorepo's `Server/` and its plugin system, never the old submodule; Servex's own
dashboard is a `Server` on its own port, reached as `servex.localhost:<proxy port>`; and your
report is a page at `ai/2026-09-22/servex-port/page.js` — iceberg content: the primary things
first, named, then links into the detail — with `Servex/readme.md` staying a coder's index.
