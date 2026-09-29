# Hidden windows — enforce + the proven fix for the actual popup (minion brief)

Load the `minion` skill first. Task directory (read it all, raw words, before touching
anything): `public/framework/ai/2026-09-28/hidden-windows/`. This is a SEPARATE piece of work
from the sibling minion doing the mechanical windowsHide sweep (`sweep-requirements.md`) — don't
touch the files that brief owns; you own different files.

## What was found (already proven — you don't need to re-derive this)

The owner's popup was reproduced. It is **not** a Node `spawn()` bug — every Node
`detached:true, windowsHide:true, stdio:"ignore"` spawn tested (including from a genuinely
console-less parent, built with .NET `ProcessStartInfo{ UseShellExecute:false, CreateNoWindow:
true }`) produced **zero visible windows** under a polling `EnumWindows`/`IsWindowVisible` probe.

The real source: the Windows Scheduled Task named `Servex` (registered at logon, "Interactive
only" logon mode) runs:

```
powershell.exe -NoProfile -WindowStyle Hidden -Command "cd 'C:\Code\lew42\monorepo'; node Servex/sustain.mjs"
```

Triggering it (`schtasks /Run /TN "Servex"`) while polling `EnumWindows` produced **one real
visible window**: a `powershell.exe` console. This is a well-documented Windows gotcha:
`-WindowStyle Hidden` is PowerShell hiding its OWN window a moment *after* Windows has already
created and shown it — unlike `CREATE_NO_WINDOW` (Node's `windowsHide:true`), which tells
`CreateProcess` never to make a console in the first place. Task Scheduler's "Interactive only"
logon mode has no equivalent of `CREATE_NO_WINDOW` for its own launch, so the flash happens once,
at boot (or whenever the task is triggered) — that matches the owner seeing occasional single
popups, not a continuous stream.

**The proven fix** (also already tested — 0 visible windows): wrap the launch in a `.vbs` script
run through `wscript.exe`, using `WScript.Shell.Run(cmd, 0, False)`. `wscript.exe` is a
GUI-subsystem executable — it never allocates a console of its own — and `Run` with
`windowStyle=0` starts the target via `ShellExecute`+`SW_HIDE`, which suppresses the console from
the first frame. This is the standard fix for exactly this Task-Scheduler-flash problem.

## What you do

1. **Add the wrapper to the repo**, `Servex/hidden-launch.vbs`:
   ```vbs
   ' Proven no-flash launcher for the Servex logon task (public/framework/ai/2026-09-28/hidden-windows/).
   ' wscript.exe is a GUI-subsystem exe (no console of its own); WScript.Shell.Run with
   ' windowStyle=0 starts the target via ShellExecute/SW_HIDE, which suppresses a console app's
   ' window from creation, unlike "powershell -WindowStyle Hidden" (which flashes: PowerShell
   ' hides its own window a moment AFTER Windows has already shown it).
   Set WshShell = CreateObject("WScript.Shell")
   WshShell.Run "powershell.exe -NoProfile -WindowStyle Hidden -Command ""cd 'C:\Code\lew42\monorepo'; node Servex/sustain.mjs""", 0, False
   ```
2. **Update `Servex/readme.md`**'s "Surviving a reboot" section: change the registered action
   from `powershell.exe -NoProfile -WindowStyle Hidden -Command "..."` to
   `wscript.exe //B "C:\Code\lew42\monorepo\Servex\hidden-launch.vbs"`, and add one short note
   (a sentence or two, not a wall) that the direct `-WindowStyle Hidden` form flashes a visible
   console for a moment at logon — proven with an `EnumWindows` probe on 2026-09-28 — while the
   `.vbs` wrapper does not. Keep the existing "Watch out" bullet about `cmd /c start`; add a
   sibling bullet for this one, same shape, short.
3. **Do NOT touch the live registered Scheduled Task.** Changing it needs re-entering the
   owner's login credentials (schtasks / Register-ScheduledTask asked for a password when this
   was tried, and got refused rather than guessed at). That is the owner's own one-time action —
   leave the readme's new instructions as the thing they paste. Do not attempt
   `Register-ScheduledTask`, `schtasks /Change` or `schtasks /Create` against the real `Servex`
   task at all.
4. **Extend `.claude/hooks/syntax-guard.mjs`'s `hidden_guard`.** Right now it does a rough
   FILE-WIDE count: total spawn-like calls vs total `windowsHide` occurrences anywhere in the
   file. That can pass a file where one specific call lacks the flag as long as some OTHER call
   in the file has it written twice. Make it a PER-CALL check instead: for each
   `spawn`/`spawnSync`/`exec`/`execFile`/`execFileSync`/`fork` call, find its own balanced
   argument list (bracket-matching, not a same-line regex — most calls spread the options object
   across lines) and require `windowsHide: true` inside THAT call's own argument list. Also: a
   call with `detached: true` and no `windowsHide: true` in the same argument list is the
   specific shape that creates a new, visible console — call that out by name in the block
   message (worse than the generic "add windowsHide" text, since detached+no-hide is a
   confirmed-bad shape, not just a maybe).
   `Server/window-lint.mjs` already has this exact per-call, bracket-matching logic (written this
   session, for the repo-wide sweep) — read it first and reuse its approach/helpers rather than
   writing a second, different one; `hidden_guard` just needs to run the same check against ONE
   file instead of walking the whole tree.
   Keep the guard's contract: never throws, prints at most one JSON `{decision:"block", reason}`
   line, same shape as the existing one.
5. Prove it: after your edit, `node --check .claude/hooks/syntax-guard.mjs`, then hand-test it —
   write a tiny scratch `.mjs` file (in the session scratchpad, NOT the repo) with a `spawn(...,
   {detached:true})` call missing `windowsHide`, and run
   `node -e "import('file:///<abs path to syntax-guard.mjs>').then(m=>m.default('<abs path to your scratch file>'))"`
   — confirm it prints a `block` decision naming the `detached:true` shape specifically. Then fix
   the scratch file (add `windowsHide:true`) and confirm it prints nothing. Log both results as
   one `log` line in this task's `task.jsonl`.

## Report

`send_to_agent` to `task-mastermind-hidden-windows` (reply_to: "message
task-mastermind-hidden-windows") when done or blocked — one line, what changed, what you proved.
