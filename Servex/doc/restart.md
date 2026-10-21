# `--restart` runs outside Servex's own process tree

**The bug (09-28, 09-29):** an agent ran `--restart` from inside Servex's own tree (`Servex →
claude → bash → node sustain`). `--restart`'s `taskkill /t /f` is a *tree* kill, so it killed the
caller before the caller finished restarting anything — Servex kept running the old code.
`spawn(..., {detached:true})` does not fix this: Windows records a child's parent once, at
creation, and `taskkill /t` still finds it by that recorded lineage even after the real parent
is gone.

**The fix:** on win32, `--restart` relaunches itself as `--restart-detached` through WMI
(`Invoke-CimMethod Win32_Process.Create`), which parents the new process to `WmiPrvSE.exe`, never
to the caller. The in-tree hop only launches that copy and exits; the detached copy does the
actual kill/wait/confirm. `ops.js`'s `restart_servex` needs no change — it already just runs
`sustain.mjs --restart`.

**The trap for the next test of this:** `Win32_Process.Create` hands the new process WmiPrvSE's
own environment, not the caller's, so `SERVEX_HOME` (and a test's `SERVEX_API_PORT`) would
otherwise vanish — the relaunch pins both explicitly on the command line
(`cmd.exe /c set "SERVEX_HOME=..."&& ...`). Found the hard way: an early version of this fix's own
private-Servex proof leaked past its sandbox and restarted the real Servex, before the pinning
was added.

`kill()` also no longer trusts `taskkill`'s exit code alone: it polls for up to 5s afterward and,
if the pid is still alive, logs loudly and retries with a plain (non-tree) kill.

Proved on a private stand-in Servex (own `SERVEX_HOME`, stub entry script, own API port): a
caller nested inside that fake Servex's own tree asked for a restart, and its pid changed even
though the caller died along with the rest of that tree. No window ever appeared.

**The revive sweep skips an agent with nothing to resume** (2026-10-18): at boot `Agents.revive()` leaves alone, and does not tell "Servex restarted mid-turn", any agent that started after this boot, or has no completed turn and no session file (`Agents.revive_skip`, test `agents/revive-skip.test.mjs`, proof `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/restart-sweep/proof-fixed.txt`). Such an agent is marked gone and logged once (`revive-skip` in `servex.jsonl`); a second restart seconds after a spawn used to resume a session that did not exist yet and kill the agent at $0, so respawn it.

**A "second boot" seconds after a restart is the keeper, not a second Servex** (2026-10-18): on the 17:32 restart the new Servex (pid 32996) died with exit 3221226505 (0xC0000409, a native fast-fail; 53 such exits sit in `sustain.log`) at 17:33:56, and `sustain.mjs` restarted it as pid 35816 a second later; that boot's `revive()` then swept an agent spawned seconds earlier. `revive()` now runs once per process (`Agents.revived`), and `index.js` calls `Servex.only_one()` first, so a second Servex on the same port prints one line and exits before it touches the shared registry. The crash itself has no report and is not fixed here.

**A native crash now leaves evidence** (2026-10-19): exit 3221226505 is a Windows fast-fail that skips every JS handler and writes no node report (the report flags were already on and never fired in 53 crashes; stderr was already kept in `sustain.log` and is empty before each one). So `sustain.mjs` loads `Crumbs.js` (a breadcrumb line before each child process and file watcher, a heartbeat every 5 s, in `logs/crumbs.log`) and on any signal or `0xC...` exit writes `logs/crashes.jsonl` (crumbs, stderr, the last 5 `servex.jsonl` lines), prints `CRASH` lines beside the `exited` line, and after the 3rd in an hour prints `CRASH-LOOP` and posts a `risk` owner note once Servex answers. The 53 and their numbers: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/servex-crash/crashes.json`. The cause itself is still unknown; the next crash's last crumb is the first clue. The 135 `exit 1` boots on 2026-10-01 were a missing `express` in the main tree (4 more a missing agent SDK), already guarded by `ensure-deps.mjs`.

## Why so many restarts, and the fix not built (2026-10-20)

Servex loads its code once at start, so every change under `Servex/` (a new tool, the remote door, an agent class) is live only after a restart; there is no scheduled restart. Each restart ends every agent session (they go dormant and resume on the next message) and drops a cloud call mid-flight, so restarts are held until no agent is working and landings are batched behind one. Next improvement: reload a changed tool module in place (the registry re-imports it on change) so agents keep running; not built.
