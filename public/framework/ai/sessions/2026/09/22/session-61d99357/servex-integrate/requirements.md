# servex-integrate — the agent host plugs into Servex, and Servex gets its report page

Minion: Opus, effort high. Session id `61d99357-3657-4532-bb21-e24bffd11a7d`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then the "Shape" and
sections **A**, **B**, **G** of [`../mastermind-servex/requirements.md`](../mastermind-servex/requirements.md).
Private ports: Servex's own **8090/8080** (nothing else runs it while you do — check `netstat`
first), a private dev server on **8097** if you need one.

## What exists — two landed halves, never yet connected

- `Servex/` (task `servex-port`, landed 15:18): `node Servex/index.js` → dashboard 8090, proxy
  8080, `Process.js` supervisor, `Log.js` single-writer (`POST/GET /log/<name>`), `MCP.js` with
  the seam `servex.mcp.tool(definition, handler)`. `Servex/readme.md` is accurate; `node
  Servex/proof.mjs` runs its six proofs. Its landing report and every decision are in
  `ai/2026-09-22/servex-port/task.jsonl`.
- `Servex/agents/` (task `agent-host`): `Agents.js` (spawn/send/interrupt/list/stop over the
  Agent SDK, readable ids, typed events through a `this.log(entry)` seam that today appends
  with `fs.appendFile`), `tools.js` (exports the four MCP tool definitions), `demo.mjs` (the
  proof with measured numbers), `readme.md`. Read its `task.jsonl` for the traps it hit
  (`result.result` is not the last thing said; `query.close()` leaks the child — `stop()` must
  abort).
- `ai/2026-09-22/log-model/events.md` — the event schema the log should converge on; do not
  rewrite the agent events wholesale, but name in a `log` line where they differ.

## Deliverables

1. **One process.** `Servex.js` constructs `Agents` and registers `tools.js` through
   `servex.mcp.tool`. `Agents`' `this.log` seam points at `Log.append("agent-<id>", entry)` so
   every agent event goes through the single writer; the `fs.appendFile` fallback goes away.
   Prove with `node Servex/index.js` up and one real `claude -p` turn against
   `http://127.0.0.1:8090/mcp` (`--mcp-config`, `--strict-mcp-config`) that lists **ten** tools
   (six servers + four agents) and then calls `spawn_agent` for a Haiku agent, `send_to_agent`,
   `list_agents`, `interrupt_agent` — and that the agent's events landed in
   `%LOCALAPPDATA%/lew42/servex/logs/agent-<id>.jsonl`. Log the measured numbers (spawn →
   first delta, interrupt → silence).
2. **Streaming to the UI.** The Servex dashboard (`Servex/public/`) shows the live agents:
   one row per agent (id, role, model, state, turns, cost) and, when a row is opened, its event
   stream arriving live — deltas as they come, `tool` lines, the `result`. Live means pushed
   (the dashboard's `DevSocket` already exists; `Log.append` can emit to it), not polled. Keep
   it to the smallest thing that works: a list and a stream, in the house `View`. Screenshot it
   with an agent mid-run.
3. **The report page — `ai/2026-09-22/servex-integrate/page.js`, iceberg content** (the owner,
   15:10: "make a report, not just a readme… a lot of the reporting has been linked readme's
   that load raw in the browser, very hard to read, way too long"). Level 1: what Servex is in
   two sentences, the four parts named with one line each, the three URLs, a screenshot of the
   dashboard with an agent running, and "try it" — the one command and the one URL. Then links
   into the iceberg: `Servex/readme.md`, the servex-port log, the agent-host log, the proofs.
   This page is what the owner opens first; `Servex/readme.md` stays the coder's index. Also
   link it from `ai/2026-09-22/page.js` `children:`.
4. **Supervised, unattended.** Say in the log what happens when Servex itself dies (today:
   nothing restarts it). Write `Servex/sustain.mjs` or the equivalent one-liner — a Windows
   Scheduled Task, a `Start-Process -WindowStyle Hidden` wrapper that relaunches on exit, or
   pm2 as the outer keeper only — pick the simplest that survives a logout-free reboot of the
   process, prove it (kill Servex by PID, it is back within 5 s, ports answer), and write the
   decision with the alternative. Leave Servex RUNNING at landing, started that way, and log
   the PID and how to stop it — this is the always-on process from now on.

## Fence

`Servex/**` (both halves are landed; you own the seams), your task dir, `ai/2026-09-22/page.js`
`children:`. Append-only to `.jsonl`. Not `Server/`, not `public/framework/` beyond your task
dir. Never touch the owner's :80 or the mastermind's :8123; Servex must not start the monorepo
on 80 either (its project entry uses the registry port).

## Length

`Servex.js` should grow by tens of lines, not hundreds. The page: one screen. Landing
report: ten sentences with the numbers and the PID.
