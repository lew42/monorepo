# Servex processes: every start gets an end

Budget: $15. Load the `minion` skill first, then the `code` skill. Parent: mastermind-resources. The owner's words: voice-app relayed them 2026-11-06 21:56, and they are summed up here. The contract for the lines is in [indexing-past-work.md](/framework/ai/indexing-past-work.md), sections 5 and 6.

- Your worktree is made: `C:Codelew42worktreesesources-leaks` (branch `worktree/resources-leaks`). Commit there after each working step.
- Do NOT merge, restart Servex, kill or restart the dev server, or stash (diff instead).
- **Never kill a process that is not provably ours.** A Chrome is ours only with `ms-playwright`, `chrome-for-testing` or one of our `--user-data-dir`s on its command line. The owner's Chrome, VS Code and Figma are never touched.
- Reading the live machine is fine: `Get-Process`, the logs in `%LOCALAPPDATA%/lew42/servex/logs/`.

**What exists (live since 21:50 tonight):** `Servex/SpawnLog.js`. `Crumbs.js` calls it after every async `child_process` call Servex makes. It writes `{"pid":N, agent, session, cmd, why, at}` and `{"pid_exit":N, code, signal, at}` to the agent's `session.jsonl`, or to the `spawns` log when there is no agent. Read it, `Servex/doc/processes.md` ("Who started this pid") and `Servex/Processes.js` (it samples EVERY process with its ppid every 10 s through `Get-CimInstance Win32_Process`).

**Your files** (fence): `Servex/SpawnLog.js` + its test, `Servex/Processes.js` + `processes.test.mjs`, a new `Servex/Lineage.js` + test (or a better name; say it), a new `Servex/leaks.mjs`, `Servex/Lifecycle.js`, `Servex/Pool.js`, `Server/Browser.mjs` and `Servex/Relief.js` only for fixes the leak report proves, `Servex/doc/processes.md`, and `public/framework/ai/indexing-past-work.md` (sections 5 and 6).

## 1. The owner's field names

The start line is `{"pid":N, "cmd", "why", "agent", "session", "started": <stamp>}`, and the end line is `{"pid_exit":N, "ended": <stamp>, "code", "signal"}`. Rename `at` to `started`/`ended` in SpawnLog, update its test, and update the contract block in indexing-past-work.md §6.

## 2. Every process, not only the ones Servex starts itself

Today a process that an agent's claude.exe starts gets no line: the Bash tool's shell, grep, node, a Playwright browser, a worktree dev server. Use the 10 s sample that `Processes.js` already takes:

- Each tick, a process that is new since the last tick and descends from one of ours gets a start line. Ours means an agent's `claude_pid` (Processes `agents()` maps them), Servex's own pid, or a process SpawnLog already logged. Walk the ppid chain to the nearest agent and write the line to that agent's session log (reuse `SpawnLog.put`/`dir_for`). `why` is `"child of claude.exe"` or `"child of <logged pid's why>"`, and the line also carries `"seen": "sample"`.
- When a sampled process is gone, write its end line with `code: null` and `"seen": "sample"`.
- Skip pids SpawnLog already logged, so each pid gets one start line. A child that lives under 10 s is missed; say so in the doc. It cannot leak, so this is fine.
- Measure and report how many lines a minute this writes on the live machine (read-only: run the rule on two real samples taken 10 s apart). If one agent floods its log (a watch loop, say), cap it per agent per minute and say the number.
- Watch the cost. The tick already has the data, so this is a Map diff and never a second PowerShell call.

## 3. A start with no end is a leak: the report, then the fixes

`node Servex/leaks.mjs` lists every start line with no matching end line, from the session logs (`git grep --untracked`) and the `spawns` log. It puts each one in one of three groups:

- **gone, end missed:** the pid is not running. That is a logging bug; fix it.
- **alive, owner done:** its agent is stopped or dormant, or its task has landed. That is a real leak.
- **alive, owner working:** fine.

Write the report to `leaks/report.md` in this task folder. For EACH real leak, find why cleanup missed it (an error in a close path, or an edge case such as a detached grandchild or a server whose worktree was removed) and fix the cause in its own close path (Lifecycle, closeout, Pool, Browser). Never fix it by killing it from the report. If the logs are too young to show a real leak tonight, use the existing `processes`/`lifecycle` logs and `Lifecycle.js --dry` to find the leaks of the last two days, and fix those. Write the cause and the fix of each as a `log` line in your task.

## 4. Chrome: a test that pins the rule

Find every path that ends a process: Lifecycle closers, `Processes.reap`, Relief, Pool, Browser. Add a test that feeds each one a fake process list with the owner's own `chrome.exe` (plain `C:\Program Files\Google\Chrome\...` with a normal profile), `Code.exe` and `Figma.exe`. It proves that none of them is ever chosen, and that a Playwright chrome is.

## Docs, same commits

Update `Servex/doc/processes.md`, "Who started this pid": sampled children, the 10 s limit, the leak report and how to run it. Update indexing-past-work.md §5 for the pid row: the `started`/`ended` fields, and how to list leaks.

Done, each ticked with its proof in your landing outcome:

- [ ] `started`/`ended` field names (section 1)
- [ ] sampled children get start and end lines, with lines a minute measured (section 2)
- [ ] `leaks.mjs` and `leaks/report.md`, with each real leak's cause fixed (section 3)
- [ ] the Chrome-pin test (section 4)
- [ ] docs (above)
- [ ] the new tests, `processes.test.mjs`, `SpawnLog.test.mjs`, `Gate-loud.test.mjs`, `closeout.test.mjs` and `Crumbs.test.mjs` all pass, and `node --check` is clean on every touched file

Report in six lines: branch, lines a minute, how many leaks of each kind, each cause fixed, and the test output.
