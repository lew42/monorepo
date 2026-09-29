# How each number was counted

Read only — nothing on this list stops or changes anything. The script is
[`ai/2026-09-29/lifecycle/study/count.mjs`](/framework/ai/2026-09-29/lifecycle/study/); it writes
`counts.json`, which this page's `data.json` is a copy of.

1. **Tasks never landed.** Every `task.jsonl` found under
   `public/framework/ai/2026-09-*/` (any depth, so a nested minion's task counts too) is
   "landed" if any line has a `landed_at` field. Everything else is unlanded. 528 task logs
   found on the day of this count; 28 had no `landed_at`.

2. **Servers never stopped.** `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` for
   every live process whose command line runs `server.js` or `run.js`, with its memory (working
   set) in MB. Each one is matched to a worktree by its **listening port** (from
   `netstat -ano`), looked up against `.worktrees.json`'s own port list — the command line
   itself has no working directory in it, so port is the only reliable link. Only 7 of 35 could
   be matched to a live worktree; the rest are the main site's server, a hand-started one, or a
   worktree whose port has since changed.

3. **Worktrees orphaned.** Every directory under `C:\Code\lew42\worktrees\`, checked against
   `git branch --merged michael/dev` for its branch. "Orphaned" means the branch is already
   merged — its work is already in `michael/dev` — but the worktree folder is still sitting on
   disk. Disk size is a recursive byte count via PowerShell (`Get-ChildItem -Recurse -File`),
   shown in MB. 40 of 70 worktree directories were orphaned this way, using roughly 13 GB.

4. **Agents left idle.** `GET http://127.0.0.1:8090/agents` (the Servex registry), filtered to
   `state: "idle"`. Each one still holds a live `claude` process; the minion skill's own
   measured estimate (~300 MB per idle one-pass agent such as a reviewer, clarity pass or
   checker) is used for the MB in the chart and the worst-cases table, since the process list
   itself does not name which `claude.exe` belongs to which agent id.

**The bar chart** mixes two different kinds of MB on purpose: servers and idle agents are live
RAM (their Working Set right now); worktrees is disk space held by an orphaned copy of the repo.
They are shown on the same chart because the owner's question was "how much is left running or
sitting there", not "how much RAM" specifically — the label on each bar says which kind of MB it
is.

**The worst-ten table** pools all four kinds into one list, sorted by MB (falling back to age in
days when MB ties or is unknown, as it is for a task), and keeps the top 10.
