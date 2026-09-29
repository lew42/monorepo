# Minion brief — Servex machine monitor

Load the `minion` skill first.

**The owner's words (verbatim):** "My fans are spinning. Let's make sure we're not melting my computer. A little process inside Servex or alongside it that monitors CPU, GPU, fan speed and so on. Running on Servex, any session can use it via MCP. It could notify the mastermind, or anyone, when fans peak at 100% or whatever for more than a minute: a flag, and the mastermind gets notified."

**Context.** At 17:55 the machine had about 100 finished minions sitting idle, each holding a claude.exe of about 250 MB, and RAM hit 1.5 GB free. The monitor must be cheap itself: a monitor that burns a core is the bug it is meant to catch.

**Fence:** the worktree `C:/Code/lew42/worktrees/servex-monitor` (branch `worktree/servex-monitor`; node_modules are junctions already). Files: `Servex/Monitor.js` (new), `Servex/Servex.js`, `Servex/readme.md`, plus scratch scripts in `C:/Users/mike/AppData/Local/Temp/claude/C--Code-lew42-monorepo/32acb0a6-b886-4e7d-93da-da80c1c64a8c/scratchpad/` named `servex-monitor-*`. **Do NOT edit `Servex/agents/*` or `Servex/MCP.js`** (another task owns them). Never touch the main tree, never run `sustain.mjs`, never kill a process you did not start, never bind ports 80, 8079, 8090 or 3104. Commit on your branch when done; the message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never write the owner's name.

## Deliverables

1. **`Servex/Monitor.js`** — a class in house style (see `Process.js` / `ReverseProxy.js`: `extends Events`, `initialize()`, a top block comment saying what and why). It samples every 5 s:
   - total CPU % (from `os.cpus()` time deltas — free);
   - the top 5 processes by CPU delta over the last interval (name, pid, % of one core, MB). The `fans` skill's method is `Get-Process` CPU seconds, diffed. **Do not spawn PowerShell every 5 s.** Start ONE long-lived hidden PowerShell child (`windowsHide: true`) that loops `Get-Process` every 5 s and prints one JSON line per loop to stdout; the monitor parses it. Restart it if it dies. Measure its own CPU cost and report the number;
   - free and total RAM (`os.freemem()`);
   - counts of `claude`, `node` and `chrome`/`chrome-headless-shell` processes (from the same loop);
   - live Servex agents: total, working, and **idle agents that still hold a claude process** (`servex.agents.live`; read `Agents.js` to see what an idle live agent holds). This is the number that mattered at 17:55;
   - GPU load, temperature and fan % if `nvidia-smi` exists: one long-lived `nvidia-smi --query-gpu=utilization.gpu,temperature.gpu,fan.speed,memory.used,memory.total --format=csv,noheader,nounits -l 5` child, parsed;
   - CPU temperature and fan speed **only if Windows gives them without admin**. Try `MSAcpi_ThermalZoneTemperature` (root/wmi), `Win32_Fan`, `Win32_TemperatureProbe` once at startup, record what works, and say honestly in the sample (`cpu_temp: null, why: "..."`) when it doesn't.
   - It keeps the latest sample in memory, and writes one line **a minute** to the `system` log through `servex.log.append("system", {...})`: an average of that minute's samples plus the latest top-5.
2. **MCP tool `system_health`**, registered in `Servex.js` `tools()` beside the others: it returns the latest sample and a one-line verdict in plain words (e.g. "Calm: CPU 12%, 10.1 GB free, GPU 38 °C, 3 idle agents holding claude." / "HOT: CPU above 90% for 75 s — top: chrome-headless-shell 122%"). Also add `GET /api/system` on the dashboard router if that is a one-liner.
3. **The flag.** It goes up when CPU is above 90% for 60 s, or free RAM is under 3 GB. Make both thresholds env-overridable (`SERVEX_HOT_CPU`, `SERVEX_HOT_SECONDS`, `SERVEX_LOW_RAM_GB`) so a test can trip them. When it goes UP: ONE `send_to_agent`-equivalent message to `mastermind-servex` (`servex.agents.send(...)` in-process, `from: "servex-monitor"`; catch it if that agent isn't live and log that), and one line on card `live` (find how the `card_reply` tool writes and call the same function in-process). Then it stays quiet until the flag clears; one short "cleared" line on card `live` when it does. Log up and clear to the `system` log.
4. **The gate — the real protection.** In `Servex.js`:
   - `this.checks = []` and `admit(spec)`: it returns null (start now) or the first reason string any check gives; each check is called as `check(spec)`. The monitor pushes `spec => this.monitor.flag ? this.monitor.flag.reason : null`. (Agreed with task-mastermind-assistant-layers: their `Servex/agents/Global.js` will push an agent-cap check onto the same list — keep exactly this shape. They pass `urgent: true` for assistant-* spawns themselves. RESUMES also go through `agents.spawn({resume, …})` and must be gated too — the instance-level wrap covers them; don't special-case resume.)
   - Wrap `this.agents.spawn` at the INSTANCE level (keep a bound reference to the original): if `spec.urgent` or `admit(spec)` is null, spawn as before. Otherwise push the spec onto `this.queue` and return a stand-in object whose `card()` returns `{ id: null, state: "queued", queued: true, position, reason, note: "Not started: <reason>. Servex will start it as soon as that clears; its parent is woken as usual once it runs." }`.
   - Every 5 s (the monitor's tick), drain: while the queue is non-empty and `admit()` returns null, spawn the next spec for real, and log it to `system`.
   - Check the internal callers (`Assistant.js`, `Dispatcher.js` — read them, don't edit) that use the returned agent object beyond `.card()`. If any would break on a stand-in, make that path bypass the gate (e.g. Servex passes `urgent` for the assistant's own sessions by wrapping at the right place), and say which in your report.
5. **`Servex/readme.md`**: a short paragraph on the monitor, the tool, the flag and the queue. Plain sentences.
6. **Test on a private Servex** from the worktree: `SERVEX_HOME=<scratchpad>/servex-monitor-home SERVEX_PORT=18090 SERVEX_PROXY_PORT=18081 SERVEX_PROXY_INTERNAL=18079 SERVEX_NO_ASSISTANT=1 node Servex/index.js` (if `SERVEX_PROXY_INTERNAL` or the gate don't exist on this branch, use `SERVEX_NO_GATE=1` or whatever the branch has). Call its MCP at `http://127.0.0.1:18090/mcp` with a small script (streamable HTTP, JSON-RPC `tools/call`), or via `/api/system`:
   - `system_health` returns a real sample (show it);
   - trip the flag with low thresholds (e.g. `SERVEX_HOT_CPU=1 SERVEX_HOT_SECONDS=10`), show the flag-up line in the private `system` log and the attempted message;
   - call `spawn_agent` while it is up (model `claude-haiku-4-5-20251001`, prompt "Reply with the word ok and nothing else.", role `minion`, name `monitor-test`): it must return the queued card; then clear the flag (restart with normal thresholds isn't a clear — make the threshold readable at runtime, or have a test hook) and show that the queued agent starts. Stop that agent afterwards.
   - Report the monitor's own CPU cost (the PowerShell loop and nvidia-smi, as % of a core).
   - Kill every process you started (the private Servex tree AND any gate it launched — check `gate.pid.json` in the private home).

Report back in plain sentences: what works, what Windows would not give without admin, the monitor's own cost, the test results, which internal callers bypass the gate, and the commit hash.
