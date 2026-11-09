# Map: Servex/

Every file at the top level of `Servex/`, one line each. Subfolders are one row, linking their own readme when they have one. Model: [core/Item/readme.md](/framework/core/Item/readme.md)'s Map, commit `59fcd6650`.

| File | What it does |
|---|---|
| [Servex.js](./Servex.js) | the class itself: builds every piece listed in the readme's "The class" section |
| [Budget.js](./Budget.js) | `budget_of(state, dir, role)`, `judge(cost, budget, told)`: the pace bands a mastermind checks before spawning ([doc/budget.md](./doc/budget.md)) |
| [CloseLoop.js](./CloseLoop.js) | `class CloseLoop`: decides what happens when an agent's turn ends — complete the task, wake it once, or nothing ([doc/landing.md](./doc/landing.md)) |
| [Crumbs.js](./Crumbs.js) | `class Crumbs`: writes one sync line before each `child_process` call and each `fs.watch` open/close, so a native crash (exit `3221226505`) still leaves evidence on disk |
| [CrumbsWatch.js](./CrumbsWatch.js) | the `worker_threads` half of `Crumbs.js` |
| [Dropped.js](./Dropped.js) | run every `TaskLoop` tick: open tasks nobody is working, red-flagged sessions, completed asks with no proof ([doc/task-loop.md](./doc/task-loop.md)) |
| [ErrorLine.js](./ErrorLine.js) | a tool call that throws writes `{error, where, tool, agent}` into the calling agent's session log ([doc/tool-process.md](./doc/tool-process.md)) |
| [Follow.js](./Follow.js) | `class Follow`: watches a file and tells an agent what changed ([doc/follow.md](./doc/follow.md)) |
| [Games.js](./Games.js) | `class Games`: closes an idle window or process gracefully (`CloseMainWindow`), force-kills by PID only after 60 s still alive; `decide({idle_min, free_mb, running})` picks when |
| [Heartbeat.js](./Heartbeat.js) | status check → triage → escalate (the readme's "The class" row) |
| [Landed.js](./Landed.js) | `class Landed`: the one rule for "landed" — a task's log, replayed, ends `complete` or `stopped` ([doc/landing.md](./doc/landing.md)) |
| [Lifecycle.js](./Lifecycle.js) | reaps finished or stuck agents (the readme's "The class" row) |
| [Lineage.js](./Lineage.js) | start/end lines for processes an agent's `claude.exe` starts, sampled every 10 s; `leaks.mjs` reports starts with no end ([doc/processes.md](./doc/processes.md#leaks-a-start-with-no-end)) |
| [Log.js](./Log.js) | `class Log extends Events`: the single-writer log every module appends a line through, so two writers never tear a line |
| [LogSweeper.js](./LogSweeper.js) | batches committed log writes: at most `max` paths per batch, idempotent (nothing changed → no commit) |
| [MCP.js](./MCP.js) | the local `servex` MCP door at `/mcp`; hands every spawned agent its caller identity through `Agents.door()` |
| [Monitor.js](./Monitor.js) | `class Monitor extends Events`: the process monitor — hot-CPU and low-RAM thresholds (`SERVEX_HOT_CPU`, `SERVEX_LOW_RAM_GB`) |
| [OpenItems.js](./OpenItems.js) | after a closing line, a record closed under 100% gets one waiting-on-owner task listing what stayed open; on since 2026-11-09 (`SERVEX_OPEN_ITEMS=off` stops it) |
| [OpenItems.mjs](./OpenItems.mjs) | the dry-run CLI for `OpenItems.js` (`node Servex/OpenItems.mjs --dry-run [--days 7]`) |
| [Pool.js](./Pool.js) | `class Pool extends Events`: the quick-fix worktree pool, branched from `compliance/dev` even when this Servex runs from a worktree ([doc/pool.md](./doc/pool.md)) |
| [PortRegistry.js](./PortRegistry.js) | `class PortRegistry extends Events`: the `{name: port}` map the reverse proxy holds live |
| [Process.js](./Process.js) | `class Process extends Events`: one supervised process; `adopt()` claims a pid already alive and already answering its port; stopped only by pid, never by name |
| [ProcessRunner.js](./ProcessRunner.js) | runs a work process's phases in order ([core/Task/doc/process.md](/framework/core/Task/doc/process.md)) |
| [Processes.js](./Processes.js) | `class Processes extends Events` + `task_key(dir)`: the set of every supervised process |
| [Project.js](./Project.js) | `class Project extends Events`: a directory Servex found with a `package.json` — its name, its port, how to start itself |
| [Relief.js](./Relief.js) | at 70% memory commit, closes what is finished and sleeps idle agents; suggests closing the owner's own apps only in a note, only while they are away ([doc/processes.md](./doc/processes.md#early-relief-at-70)) |
| [ReverseProxy.js](./ReverseProxy.js) | `class ReverseProxy extends Events`: port 80, `<name>.localhost` routing to each project |
| [SpawnLog.js](./SpawnLog.js) | attribution for every async child process: who started it and why, via an `AsyncLocalStorage` store entered by `tools.js` |
| [Stream.js](./Stream.js) | `class Stream extends Events`: the live wire — Servex pushes, the dashboard listens, no polling |
| [TaskLoop.js](./TaskLoop.js) | runs `Server/AIIndex.mjs --watch`, re-prompts stalled task steps ([doc/steps.md](./doc/steps.md), [doc/task-loop.md](./doc/task-loop.md)) |
| [Usage.js](./Usage.js) | every 15 minutes runs `claude-usage.py --json` hidden and writes the answer to disk, so no agent has to poll it itself |
| [WorktreeWatch.js](./WorktreeWatch.js) | watches a quick-fix slot's own dev server for the `changed` frame; after `DEBOUNCE_MS` quiet, runs the near tests and `Server/layout-check.mjs` on the pages that changed |
| [Worktrees.js](./Worktrees.js) | `class Worktrees extends Events`: per-task worktrees; refuses to remove one until `Server/junction-check.mjs` passes (a `node_modules` junction into main would take main's `node_modules` with it) |
| [files.js](./files.js) | `read_file`, `write_file`, `edit_file`, `list_dir`, `glob`, `shell`: no lockdown (the remote door is already behind its bearer token) |
| [home.js](./home.js) | `place(...parts)`, `stamp(at)`: the path and timestamp helpers most files here share |
| [pages.js](./pages.js) | list, read and make pages without a shell: every write is one appended line or one targeted edit, never a rewrite ([core/Page/doc/jsonl.md](/framework/core/Page/doc/jsonl.md)) |
| [gate.mjs](./gate.mjs) | THE GATE — `node Servex/gate.mjs [listen=80] [target=8079]`: port 80 never refuses, even while Servex itself is down |
| [orphan.mjs](./orphan.mjs) | `orphan({command, args, cwd, env, out, err})`: starts a process that outlives whoever started it |
| [process-live.mjs](./process-live.mjs) | live proof that a process runs by itself across 3 Haiku steps, needs the running Servex's `TaskLoop` tick |
| [pool-status.mjs](./pool-status.mjs) | `node Servex/pool-status.mjs`: one read-only line per quick-fix slot — holder, state, branch, commits ahead, uncommitted files |
| [ensure-deps.mjs](./ensure-deps.mjs) | before the keeper starts Servex, makes sure the two packages it dies without are installed |
| [sustain.mjs](./sustain.mjs) | starts Servex and restarts it whenever it dies (`--status`, `--stop`, `--restart`; see the readme's top command block) |
| [hidden-launch.vbs](./hidden-launch.vbs) | the no-flash launcher for the Servex logon task: `WScript.Shell.Run` with `windowStyle=0` so no console window ever appears |
| [keep.json](./keep.json) | one kept pid, read back so a restart can tell its own prior process from a stranger's |
| [failures.jsonl](./failures.jsonl), [page.jsonl](./page.jsonl) | this folder's own layout-check failures, and its page-as-log data — one row |
| [package.json](./package.json), [package-lock.json](./package-lock.json) | the npm manifest (`http-proxy`, `chokidar`, `ws`, etc. — the dev-server deps the owner has approved) |
| `*.test.mjs` | `Crumbs.test.mjs`, `Dropped.test.mjs`, `ErrorLine.test.mjs`, `Follow-kind.test.mjs`, `Follow-skip.test.mjs`, `Gate-loud.test.mjs`, `Gate-stale.test.mjs`, `Heartbeat-card.test.mjs`, `Heartbeat-held.test.mjs`, `Heartbeat-landed.test.mjs`, `Landed-merged.test.mjs`, `Lineage.test.mjs`, `LogSweeper.test.mjs`, `OpenItems.test.mjs`, `Pool.test.mjs`, `ProcessRunner.test.mjs`, `Relief.test.mjs`, `SpawnLog.test.mjs`, `TaskLoop-chase.test.mjs`, `TaskLoop-close.test.mjs`, `TaskLoop-cracks.test.mjs`, `TaskLoop-handover.test.mjs`, `TaskLoop-launch.test.mjs`, `TaskLoop-state.test.mjs`, `TaskLoop-steps.test.mjs`, `WorktreeWatch.test.mjs`, `chrome-pin.test.mjs`, `closeout.test.mjs` (+ its fixture `closeout.fixture.mjs`), `leaks.test.mjs`, `pid-coverage.test.mjs`, `pool-adopt-race.test.mjs`, `pool-heal.test.mjs`, `pool-hold.test.mjs`, `pool-restore.test.mjs`, `processes.test.mjs`, `whisper-detach.test.mjs` |
| [leaks.mjs](./leaks.mjs) (+ test above) | reports every start with no end, and (`--close-gone`) writes the end lines a crash never wrote ([doc/processes.md](./doc/processes.md#leaks-a-start-with-no-end)) |
| [pid-coverage.mjs](./pid-coverage.mjs) (+ test above) | end% and agent+session% per process kind, reusing `leaks.mjs`'s own reading ([doc/processes.md](./doc/processes.md#coverage-and-the-two-gaps-that-log-nothing)) |
| [agents/](./agents/readme.md) | the agent host: spawning, messaging, roles, the MCP tools — own map at [agents/map.md](./agents/map.md) |
| [ai/](./ai/), [asks/](./asks/), [cards/](./cards/) | this folder's own `ai/log.jsonl`; the asks ledger (`Asks.js`); cards (`Cards.js`, writes `ai/cards.jsonl`) |
| [ext/](./ext/) | opt-in addons: `remote/` (voice-app door, [ext/remote/readme.md](./ext/remote/readme.md)), `openrouter/`, `refine/`, `local/`, `recite/` ([ext/recite/readme.md](./ext/recite/readme.md)) |
| [doc/](./doc/) | the detail; see the readme's "More" section for which exist |
| [proof/](./proof/) | end-to-end proofs too large for a single-file test |
| [fixtures/](./fixtures/) | shared test fixtures |
| [public/](./public/) | the dashboard's static assets (`http://127.0.0.1:8090/`) |
| [node_modules/](./node_modules/) | npm-installed deps (`http-proxy`, `chokidar`, `ws`); never hand-edited |
| [readme.md](./readme.md) | this module's index |
