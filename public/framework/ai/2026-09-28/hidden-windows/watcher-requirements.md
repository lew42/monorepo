# Hidden windows — build the catcher (minion brief)

Load the `minion` skill first. Task directory (read it all — the reproductions already tried,
what worked, what didn't): `public/framework/ai/2026-09-28/hidden-windows/`.

## Why

Three faithful reproductions of the named popup chains (the real Stop-hook → on-landing.mjs →
clarity.mjs chain, fired live; a health-supervisor.mjs → health.mjs → Playwright mimic; a
Bash-tool → Playwright chain) all showed **zero** visible windows under an `EnumWindows` probe.
mastermind-servex's direction: stop guessing blind — build a small, cheap, always-on catcher so
the *next* real popup names its own process tree, instead of anyone hand-testing more chains.

## Build `Server/window-watch.mjs`

A hidden, long-running loop:

- Every 1 second, run the same kind of `EnumWindows` + `IsWindowVisible` probe used throughout
  this task (see the task log for the exact PowerShell shape — `GetWindowThreadProcessId`,
  `GetWindowText`; you'll need to call PowerShell from Node with `execFileSync`/`spawnSync` since
  Node has no native Win32 window enumeration — `windowsHide: true` on that call, it's a leaf,
  nothing spawns further from it).
- Keep a set of window handles already seen. When a **NEW** visible top-level window appears
  whose owning process's image name (case-insensitive, no `.exe`) is one of: `conhost`, `cmd`,
  `powershell`, `node`, `bash`, `claude` — capture:
  - the time (ISO, local offset — this repo's `now()` shape, see any `Server/*.mjs` for the
    exact format used everywhere else)
  - the window title
  - the pid
  - the full parent chain, up to 6 levels: `Get-CimInstance Win32_Process -Filter
    "ProcessId=<pid>"` gives `ParentProcessId` and `CommandLine`; walk `ParentProcessId` up to 6
    times, each hop's own `CommandLine` (and image name), stopping early if a parent pid no
    longer exists or hits pid 0/4.
  - Append ONE line (a single JSON object, not the `{assign}`/`{log}` task-log shape — this is
    its own log, not a task log) to
    `C:/Users/mike/AppData/Local/lew42/servex/logs/windows.jsonl` — create the directory if
    missing. This path is OUTSIDE the repo (Servex's own home,
    `%LOCALAPPDATA%/lew42/servex/`, per `Servex/readme.md`'s "Where things live" section — read
    it for the exact convention other logs there use) so it survives independent of any repo
    checkout and matches where every other Servex log already lives.
- No model, no network call, nothing but the probe and the append. Cheap: this is meant to run
  forever.
- Never crash: wrap the whole loop body in try/catch, log a line to its own console on an
  unexpected error and keep going (same "never throws" posture as this repo's other guards).

## Start it hidden, and PROVE it's hidden

Same method used throughout this task: launch it via a hidden, detached mechanism (match the
shape `Servex/orphan.mjs` documents and uses — read that file first, it's the proven pattern in
this codebase for "must outlive whoever started it, must never show a window"), then run an
EnumWindows probe of your own (a fresh PowerShell snapshot before/after, watched for ~5-10s)
and confirm 0 new visible windows from starting it. Log the proof as one `log` line in this
task's task.jsonl (`node .claude/hooks/append.mjs`).

Leave it running when you're done (don't kill it) — that's the whole point, it needs to be
watching when the next real popup happens.

## One line in `Servex/readme.md`

Add ONE short line (not a section) noting `Server/window-watch.mjs` exists, what it catches,
where its log lives, and that wiring it into Servex's own supervision (so it starts
automatically and gets adopted across restarts, the way a dev server does) waits for the next
batched Servex restart — for now it's started by hand, the way you just started it.

## Report

`send_to_agent` to `task-mastermind-hidden-windows` (reply_to: "message
task-mastermind-hidden-windows") when done or blocked. Keep it to a few lines: what you built,
the hidden-launch proof result, and the pid so it can be found again.
