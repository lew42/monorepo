# `sustain.mjs --restart` must run outside Servex's process tree

**Why:** at 1:44 PM on 09-28 and 1:27 PM on 09-29, an agent ran `node Servex/sustain.mjs --restart` from its own shell. The chain was Servex → claude → bash → node sustain → taskkill. `taskkill /pid <servex> /t /f` killed the caller's own chain (every agent) before it reached Servex, so Servex kept running the old code and no agent was revived. Evidence: `%LOCALAPPDATA%\lew42\servex\logs\sustain.log` has "killing Servex 32996" and no "back as pid" line. The same command, started from outside the tree with `Win32_Process.Create` (restart-outside-132916.log), worked.

## Do
1. In `sustain.mjs`, `--restart` on win32 re-launches itself (`--restart-detached`, the same flags) through `Win32_Process.Create` (PowerShell `Invoke-CimMethod`, ShowWindow 0, spawned with `windowsHide:true`), so its parent is WmiPrvSE, never Servex. Then it exits and prints the log path. The detached copy does today's work.
2. The `restart_servex` tool (`Servex/agents/ops.js`) goes through the same path.
3. `kill()`: check that taskkill succeeded, and that `alive(servex)` is false after 5 seconds. Otherwise log it loudly and try a plain `taskkill /pid /f` on the root.
4. Prove it on a private Servex: start the restart from a process INSIDE that Servex's tree, and show the pid changing.
No window may ever appear.

Land: merge.mjs, a one-line note in `Servex/doc/` on restarts, and finish-task. Model: Sonnet, medium. Fence: Servex/sustain.mjs, Servex/agents/ops.js, Servex/doc/*restart*.

