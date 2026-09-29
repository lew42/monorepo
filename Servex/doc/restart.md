# `--restart` runs outside Servex's own process tree

**The bug (09-28, 09-29):** an agent ran `node Servex/sustain.mjs --restart` from its own shell.
The chain was `Servex → claude → bash → node sustain`. `--restart`'s `taskkill /pid <servex> /t
/f` is a *tree* kill, and that agent's whole chain sat inside the tree rooted at Servex — so it
killed the caller before the caller finished restarting anything. Servex kept running the old
code; nothing came back. `spawn(..., {detached:true})` does **not** fix this on Windows: a child's
parent pid is recorded once, at creation, and never updated, so `taskkill /t` still finds it by
walking that recorded lineage even after the real parent is long gone.

**The fix:** on win32, `--restart` re-launches itself as `--restart-detached` through WMI
(`Invoke-CimMethod -ClassName Win32_Process -MethodName Create`, `ShowWindow=0`) instead of
running the kill itself. A process WMI creates is a child of `WmiPrvSE.exe`, the WMI provider
host — never of the caller, no matter how deep that caller sits inside Servex's tree. The
in-tree hop does nothing but launch that copy and exit; the detached copy (parented to
`WmiPrvSE`, immune to any `taskkill /t` on Servex) does the actual check-parse / kill / wait /
confirm work `restart()` always did. `Servex/agents/ops.js`'s `restart_servex` tool needs no
change — it already just runs `sustain.mjs --restart`, so it gets the same hop for free.

**One thing that will bite the next test of this:** `Win32_Process.Create` hands the new process
`WmiPrvSE`'s own environment, not the caller's — so it does **not** see `SERVEX_HOME` (or
anything else the caller had set). The relaunch pins `SERVEX_HOME` explicitly on the command line
(`cmd.exe /c set "SERVEX_HOME=..."&& node ...`) so the detached copy always resolves the exact
same `servex.pid.json` / `sustain.log` the caller did — in production (where nothing sets
`SERVEX_HOME`, so this pins it to the real `%LOCALAPPDATA%\lew42\servex` regardless of whatever
WmiPrvSE's own profile happens to be) and in a private test alike. Found the hard way: an early
version of this fix's own proof — a private, `SERVEX_HOME`-scoped fake Servex — leaked past its
sandbox and restarted the real one, because the pinning wasn't there yet.

`kill()` also no longer trusts a `taskkill` exit code by itself: it polls the pid for up to 5s
afterward, and only if it is *still* alive does it log loudly and try one more plain (non-tree)
`taskkill /pid /f` on the root.

Proved on a private stand-in Servex (`SERVEX_HOME` pointed at a scratch folder, a stub entry
script instead of `index.js`, a private API port): a caller nested inside that fake Servex's own
tree — `fake-entry → cmd → node sustain.mjs --restart` — asked for a restart, and the fake
Servex's pid changed (old pid gone, a new one serving `/api/agents`) even though the caller itself
died along with the rest of that tree. No window ever appeared.
