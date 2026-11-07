# Servex: a queued spawn is loud, and every spawned process has a "pid" line

Budget: $12. Load the `minion` skill first, then the `code` skill. Parent: mastermind-resources. Plan: [../plan.md](../plan.md). The owner's words are line 1 of [../session.jsonl](../session.jsonl) (items 1 and 3).

Work in your own worktree: `node Server/worktree-up.mjs resources-queue-pids`. Commit there after each working step. Do NOT merge, do NOT restart Servex, never kill or restart the dev server, never stash (diff instead). When done, reply to your parent with the branch name, the commits, and the test output.

**Your files** (fence): `Servex/Servex.js` (only `admission()`, `hold()`, `drain()` and helpers you add beside them), `Servex/Crumbs.js`, `Servex/agents/tools.js` and `Servex/agents/Agents.js` (only to set the context described below and at `spawn_claude`), new files `Servex/SpawnLog.js` + `Servex/SpawnLog.test.mjs` + a queue test, `public/framework/ai/sessions/readme.md` ("How to find things"), `Servex/doc/processes.md` (one short section). Another builder is editing `Servex/Pool.js`, `Servex/Lifecycle.js`, `Servex/Monitor.js`, `Servex/agents/Fixer.js` and a new `Servex/Relief.js`: do not touch those.

## 1. A queued spawn is loud

Today `Servex.hold()` (`Servex/Servex.js`, the spawn gate) writes `{type:"gate", state:"queued"}` only to the `system` log, and `drain()` writes `state:"started"` there. Add, beside those:

- When a spawn is queued, append ONE line to the **parent's session log**: `{"queued": {"agent": <id>, "reason": <reason>, "commit_pct": <number, 1 decimal, or null>}}`. `commit_pct` is the machine's commit charge (`Global.commit_pct()` in `Servex/agents/Global.js` reads `servex.procmon.commit_mb / commit_limit_mb`; reach it the cheapest way).
- When it starts (in `drain()`), append `{"started": {"agent": <id>, "waited_s": <seconds since queued>}}` to the same log.
- The parent's session log = the parent agent's task dir (`agents.live.get(parent)?.task_dir`, else its registry row `task_dir`, else `agents.task_dir_of?.(id)`), its `session.jsonl` if it exists, else `task.jsonl` (`SessionRecord.start_file(dir)` already picks; see how `open_task` in `Agents.js` ~line 1135 writes). Write with the one-line appender the codebase uses for task logs (`LogLine.raw(file, obj)`, stamping `by: "servex"` and `ts`). No parent or no dir: skip (the system log line stays).
- Keep the spawn result's `queued` card exactly as it is. A restored queue entry (after a restart) writes no second `queued` line.
- Test: a `*.test.mjs` with a fake Servex/agents (no real spawn) proving both lines land in a temp parent dir, once each.

## 2. Every spawned process gets a `"pid":` line

The owner wants `grep '"pid":12345' -r public/framework/ai/sessions` to say who made process 12345.

- `Servex/Crumbs.js` already wraps every `child_process` function inside Servex (read it; keep its `promisify.custom` fix and run `node Servex/Crumbs.test.mjs`). Hook there, or in a new `Servex/SpawnLog.js` that Crumbs calls: after `spawn`/`execFile`/`exec`/`fork` returns a ChildProcess with a `pid`, write a start line, and on its `exit` an exit line.
- Start line: `{"pid": <n>, "agent": <id or null>, "session": <uuid or null>, "cmd": <command + args, cut to 300 chars>, "why": <the tool name or caller label>, "at": <stamp>}`. Exit line: `{"pid": <n>, "exit": {"code": <code>, "signal": <signal>}, "at": <stamp>}`. `"pid"` is the FIRST key, so the text is exactly `"pid":12345`.
- **Attribution:** an AsyncLocalStorage store (`{agent, session, task_dir, why}`) entered where an in-process agent tool runs (find the one place tools in `Servex/agents/tools.js` are dispatched or wrapped and enter it there with the calling agent and the tool name as `why`), and around `Agents.spawn_claude` (the agent's own claude.exe: agent = that agent, `why: "claude.exe"`; it goes in that agent's own session log AND, if it has a parent, the parent's).
- **Where lines go:** with an agent, its session log (same file rule as part 1). With no agent (Servex's own git, PowerShell, netstat calls), a separate Servex log `spawns` (`%LOCALAPPDATA%/lew42/servex/logs/spawns.jsonl`, through Servex's single-writer log), never `servex.jsonl` (too noisy). Measure how many no-agent lines a minute you would write and say the number; if a repeated poll floods it, say so and skip that caller by name.
- Sync spawns (`execFileSync`, `spawnSync`) have no live pid to report: skip or log `{"pid": null, …}`; say which.
- Writing must never throw into the caller and must not slow it (append, catch everything).
- State the limit in the doc: the Bash tool's children of a claude.exe are not spawned by Servex, so they get no line (a PostToolUse hook could add them later: one `⬜` line in `Servex/doc/processes.md`).
- Docs, same commits: `public/framework/ai/sessions/readme.md`, "How to find things": one short paragraph with the exact search (`grep -r '"pid":12345' public/framework/ai/sessions` and the `spawns` log path). `Servex/doc/processes.md`: a short "Who started this pid" section.
- Test: `Servex/SpawnLog.test.mjs` runs a real `spawn("node", ["-e","1"])` inside an AsyncLocalStorage context pointing at a temp task dir and asserts both lines with the right pid; and one with no context goes to the `spawns` log (use a temp `SERVEX_HOME`).

Done = both tests pass, `node --check` on every file you touched, `node Servex/Crumbs.test.mjs` passes, commits on your branch. Report in five lines.
