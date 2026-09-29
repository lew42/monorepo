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
