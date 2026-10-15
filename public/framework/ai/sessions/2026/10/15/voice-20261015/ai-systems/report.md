# AI systems: are the docs current, and were tasks abandoned? (2026-10-15)

Ask c210e092, AI-systems half ([brief](../ask-c210e092.md)). Facts only, nothing was changed outside this folder. It builds on the [system map](../system-map/map.md), which already checked the doc paths and 13 behaviour claims, and does not repeat that work.

## On one screen

- **Most of the docs match the code.** Six Haiku checkers tested about 104 behaviour claims in the `framework/ai` readmes, the Servex readmes and docs, and 12 skills. 11 are stale (table 1). Add the system map's 12 contradicted claims and 107 broken paths for the full picture. The skills that tell an agent which command to run (`new-task`, `finish-task`, `minion`, `sub-mastermind`, `past-work`, `decide`) were all current.
- **Abandoned tasks: 179 real tasks from the last 14 days never wrote a landing line.** 578 task folders were found; 285 landed. Another 97 unlanded folders are test-harness runs, not tasks. A sample of 14 checked against git shows the common case is **the work was done and committed, but nobody wrote the landing line** (7 clear, 5 unclear, 2 never started). So "not landed" mostly means "not closed", not "work lost".
- **The Dashboard's stall check cannot see child tasks.** `TaskDirs.list()` only looks two folders below the day. The task stall check (`Servex/asks/tasks.js` → `ai/tasks.json`), the `TaskLoop` chase and `FollowUp` all use it, so **322 of the 578 folders (every child task, 3–5 deep) are invisible to them**, including 117 of the 179 unlanded ones. CLAUDE.md asks for child tasks inside their parent's folder, so this blind spot grows with every child task.
- **Two rules for "landed".** `Agents.js` `task_landed()` accepts a bare `{"landed_at": …}` line; `tasks.js` only accepts `landed_at` inside `assign` (which is what the `finish-task` skill says). 17 tasks landed the bare way, and the Dashboard shows them as stalled.
- **Agents that finish don't land.** 25 agents ended their turn (a `done` wake to their parent) without a landing line. That includes this voice session's own helpers, `sessions-data`, `past-work-map` and `loose-ends`: their parent wrote the landing into its own log instead.
- **Heartbeat log spam.** For an agent stopped on purpose, Heartbeat appends "not revived" to the task log on every pass: 1,574 such lines in 156 task logs this month.

Open for the owner (or the Servex owner), not built here: make `TaskDirs.list` walk nested task folders, or give the stall check its own walk; settle one landing rule (`task_landed()` in one place, both callers import it); have `close_task` or Servex write a landing when a stopped task's work is merged; log "not revived" once, not every pass. The 179 tasks can be closed in bulk by a script that writes `close_task`-shaped lines. That is only safe after a git check per task, so it was not done here.

---

## 1. Stale doc claims (beyond the system map)

Checked by Haiku. Rows marked ✔ were also confirmed by hand.

| Doc:line | Claim | What the code shows |
|---|---|---|
| `Servex/doc/task-loop.md:15` ✔ | `SERVEX_TASKLOOP_QUIET_MIN` defaults to 20 | `TaskLoop.js:33`: 10 |
| `Servex/doc/task-loop.md:16` ✔ | `SERVEX_TASKLOOP_GAP_MIN` defaults to 30 | `TaskLoop.js:34`: 15 |
| `Servex/doc/echo.md:10` ✔ | `SERVEX_ECHO_OR=none` puts Echo back on Claude | `Echo.js:137`: "SERVEX_ECHO_OR / SERVEX_OPENROUTER_PAUSED gates are gone" |
| `.claude/skills/mastermind/SKILL.md:10` ✔ | open a run task in group `ai-ops` | `ai/rail/groups.json` has no `ai-ops` group; one task log this month names it |
| `public/framework/ai/systems-map.md` (7 rows) ✔ | sizes and dates "computed 2026-10-08" | ai readme is 71 → 90 lines, Servex readme 388 → 104, mastermind skill 47 → 27 KB, cards 521 → 713, asks 258 → 279, and two last-change dates moved to 2026-10-14. No script regenerates the file, which breaks CLAUDE.md law 7 ("compute, don't recall"). |
| `.claude/hooks/readme.md:220` | hold-guard `record()` is not wired | already in the system map: `ledger.mjs:158` calls it |

Clean: `Servex/readme.md`, `Servex/agents/readme.md` (apart from the system map's two rows), `sdk.md`, `budget.md`, `steps.md`, `tool-process.md`, `restart.md`, `skills.md` (apart from the system map's row), `pool.md`, `never-lose-a-wake.md`, `lifecycle.md`, `follow.md`, `dormant.md`, `processes.md`, `fixer.md`, `readme-chain.md`, `ai/readme.md`, `ai/sessions/readme.md`, and the six task-lifecycle skills: every command and flag they name exists.

## 2. Unlanded tasks, last 14 days

Computed by [abandoned.mjs](abandoned.mjs). It reuses `Servex/asks/tasks.js` (the Dashboard's own state rule) and `Agents.js` `task_landed()`, and reads Servex's `registry.json`. Raw rows: `abandoned.json`, `abandoned-real.json`. Re-run: `node <this dir>/abandoned.mjs 14`.

| Measure | Count |
|---|---|
| task folders (any depth) | 578 |
| landed | 285 |
| not landed by either rule | 276 (97 are harness `runs/` folders; **179 real**) |
| invisible to the Dashboard / `TaskLoop` (deeper than 2 below the day) | 322 folders; 117 of the 179 |
| landed by `Agents.js`, "stalled" on the Dashboard | 17 |

The 179 real ones, by what happened to their agent:

| Category | Count | Example |
|---|---|---|
| Agent asleep (dormant), task silent over 24 h | 53 | `10/02/drawer-close` (`task-mastermind-one-dictation`, 313 h) |
| No agent on record (VS Code or manual task) | 43 | `10/01/never-lose-a-wake` |
| Stopped by its parent or by Servex | 34 | `10/01/openrouter-harness/.../models-page` |
| Ended its turn ("done") but wrote no landing | 25 | `10/12/session-87bec773/page-templates/build`; today's helpers |
| Stopped by the owner, never closed | 17 | `10/01/chat-autoscroll` |
| Still live now | 4 | this task, `page-system`, both voice masterminds |
| Host died or stopped with no reason | 2 | `10/05/local-ctx-fix` |
| Other | 1 | `10/12/.../refine-haiku-live/one-input` |

By day: 10/01 112 (mostly the openrouter harness), 10/12 64, 10/03 26, 10/13 17, 10/02 14, 10/09 12, 10/08 11, 10/15 8, the rest 1–5.

## 3. Sample: done, or really abandoned?

Haiku read 14 of them against `git log`. I re-checked two: `chat-autoscroll` and `framework-home-grids` only show a log-sweep commit, so they are "unclear", not "done".

| Verdict | Count | Tasks |
|---|---|---|
| Done and committed, no landing line | 7 | `architecture-md-4/layers` (339a570b9), `openrouter-harness` (4d3d77a62), `models-page` (bfbf15fa6), `drawer-close` (f0c190a78), `kit/ds-diagrams` and `kit/lists` (3aa63d4f2), `never-lose-a-wake` (e74f4d8a8) |
| Unclear (only a log-sweep or review commit) | 5 | `page-templates-binding-merge`, `page-templates-merge`, `chat-autoscroll`, `framework-home-grids`, `message-cost/minion-cost-model` |
| Never started (queued, no commits) | 2 | `10/03/pool-unstick`, `system-architect/oo-census/edit-mode-class` |

## 4. Root causes, from the code

- `Server/TaskDirs.mjs:75` `list()`: the loop pushes `<day>/<a>` and `<day>/<a>/<b>` only. Its callers are `tasks.js:43`, `TaskLoop.js:121`, `Worktrees.js:224`, `FollowUp.mjs:23`, `Ai2Overview.mjs:75`, `landing-audit.mjs:10` and `on-landing.mjs:23`.
- `Servex/asks/tasks.js:103` reads only `line.assign?.landed_at`; `Servex/agents/Agents.js:821` also reads a top-level `landed_at` and `closed_by`. These are two copies of one rule (CLAUDE.md law 6).
- A minion's "done" wake goes into its parent's `inbox.jsonl` (see [loose-ends](../loose-ends/answer.md), steps 2–4); nothing writes the child's landing when its parent accepts the work.
