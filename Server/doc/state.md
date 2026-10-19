# State: one structure for every task, from both stores, with a check that fails loudly

`class State` (`Server/State.mjs`) reads every task there is, folds each one through the one set of rules in `core/Task/Task.js`, and writes the result to `public/framework/ai/state.json`. Every surface, a page or a model, reads that file (or the `state.jsonl` stream beside the tasks dashboard) instead of working out the counts itself. The owner's ask and why it was needed: [`ai/doc/one-state.md`](../../public/framework/ai/doc/one-state.md).

## Where it reads

| Store | Which files are tasks |
|---|---|
| The sessions store, `public/framework/ai/sessions/**` | every folder whose log is `task.jsonl` or `session.jsonl` (`SessionRecord.is_log_entry`), except a folder that has a `{"home": …}` line: that task moved to a module home, so it is counted there, once, and listed in `check.aliases` |
| The module homes, `public/framework/**/tasks/<slug>/task.jsonl` | every task folder below a `tasks/` folder (not the `tasks/task.jsonl` list file itself) |

## The one rule set

Each task's lines go through `Task.replay` (`core/Task/Task.js`), with `Task.resolver` reading a child's own file from disk. The state it gives decides the bucket. State adds no rule of its own. The three edits in the `decision` line below are in `Task.js` (2026-10-18, `task-rules`), each with a test: the input workaround State once had for `ts` is gone, because replay itself reads `at ?? ts`.

| Task state | Bucket |
|---|---|
| `complete` | `landed` |
| `running`, `paused`, and a working agent in Servex's registry holds the folder | `in_flight` |
| `running`, `paused`, and no agent holds it | `stale` (started, never landed, nobody on it) |
| `idle`, and a queued agent holds it | `queued` |
| `idle` otherwise | `idle` |
| `waiting` | `waiting` |
| `stopped` | `stopped` |

## The structure (`state.json`)

- `at`: when it was computed. `today`: the owner's local calendar day (`YYYY-MM-DD`, this machine's clock). `tz`: the offset.
- `tasks`: one row per task: `id` (the dashboard's route id; `~` for `/`), `home` (`session` or `module`), `dir` (repo path), `url` (its page), `title`, `state` (the Task state), `bucket`, `started` and `landed_at` (ISO stamps from the lines, never the clock), `day` (the local day it landed, else the day it started), `agent`, `session`, `module`, `line` (one sentence, 200 characters at most: when landed, `assign.outcome`, else the finish/complete line's first non-empty of `outcome msg text summary merged checked`, else the last `log` msg, else the brief's first heading, else "Completed; the log records no summary."; in flight, the latest `now`).
- `sessions`: one row per session id: how many tasks, how many landed, the last landing.
- `agents`: Servex's registry as it was read (`id state task_dir model cost`).
- `counts`: `tasks` (each bucket), `landed_by_day` (the last seven local days), and the dashboard's own four (`in_flight queued waiting landed`).
- `check`: `ok`; `total` (rows) and `sum` (all buckets added up), which must be equal; `files` (task logs found) = `total` + `aliases`; `landed_today`: `{state, walk, only_state, only_walk}`, today's landed tasks counted a second way and the ids each count has that the other does not; `unbucketed` (ids whose state has no bucket). Any mismatch sets `ok: false`.
- The tasks dashboard's keys stay as they were: `in_flight queued waiting landed counts today`, in each line of `ai/tasks/state.jsonl` (the stream it tails). That line carries `check` too, and the page draws `check.ok === false` in red with the two numbers.

## The second count

`State.walk_landed(day)` shares no code with the fold (only `SessionRecord.log_file`, which picks a folder's log file). It walks the sessions store with a plain `readdir`, and finds the module homes from the `/tasks/task.jsonl` index, following each `{"task": …}` line. For each file it reads the landing straight from the lines: the last state verb is `complete` or `finish` (its time is the line's own), or there are no verb lines and the task has `landed_at` and an outcome. Two counts that use different discovery and different code agreeing is the proof; when they differ, the ids say exactly where.

## Cards and asks (2026-10-19, the one dashboard)

`state.json` also carries `cards` (`ai/cards.jsonl`, the latest line per id) and `asks` (`ai/asks.jsonl`, folded by `AskFold`), each already in the dashboard's one row (`ai/rail/DashRow.js`: `kind id title state bucket when day who home url line needs`). Tasks and sessions become the same row in the browser, from `tasks` and `sessions`. Plan: [one-dashboard task](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard/plan.md).

Three more checks, each counted two ways, feed `check.ok`:

- `check.cards`: rows = the five buckets added up = distinct ids found by a plain text scan of the file.
- `check.asks`: rows = the six buckets added up = distinct ids/titles found by a text scan.
- `check.sessions`: tasks counted inside `sessions` = task rows that carry a session.

Real numbers (2026-10-19): 751 = 751 = 751 cards, 87 = 87 = 87 asks, 1,965 = 1,965 tasks in sessions. `node Server/State.mjs` prints all three.

## Speed of a change (the 1 s dashboard)

An `fs.watch` change to a log, `cards.jsonl` or `asks.jsonl` wakes the loop after `WAKE_MIN` (250 ms), not at the 5 s beat; a change that lands while a write is running flags the next sleep short instead of being lost. The second count (`walk_landed`) used to re-read every log (2 s); after the first walk it re-reads only the files fs.watch marked (`walk_dirty`), and the full walk repeats every ten minutes as the safety net. Measured: a `finish` line appended to a log reaches the Inbox's Recent chip in 0.65 s (was 2.4 s). A state write is whole, then one `state.jsonl` line points at it; `DashState` refetches on that line.

## Speed

A full build walks both stores and replays every file (5.7 s for 2,276 files on 10-17). After that, `fs.watch` marks a changed file and a tick re-folds only that file, plus the registry read: milliseconds. Each file's fold is cached by its size and mtime. A full re-walk runs every ten minutes as a safety net. Both times are printed by `node Server/State.mjs --time`.

## What it replaces

- `Server/TaskState.mjs` keeps its name and flags (`--watch`, `--once`, `--print`, so `Servex/TaskLoop.js` is unchanged), but its snapshot is now `State`'s.
- `SessionIndex.reduce` and `SessionIndex.read` keep their metadata fold (files, modules, links, chats) for `PastWork`, `FollowUp`, `ModuleLog`, `LandingCheck`, the Sessions grid; whether a task landed, and when, now comes from `State.fold`.
- `TaskHomes.sync` finds the homes with `State.homes()` (the disk walk) instead of walking `files.jsonl` listings.
- `Task.js` stays the rules. The browser keeps replaying a single task through it; counting across tasks is `State`'s job only.

## Decision

`{"decision":"one class, State, in node, folding every task through Task.replay; its output is the only place a count comes from","rejected":["keep the three readers and reconcile them: three rule sets drift (they already disagreed on 71 tasks), and a reconciler is a fourth","put the structure in the browser only: a model, a script and the handover cannot read a browser, and every tab would walk 2,300 files","keep SessionIndex.reduce as the rule set: it has no state machine (no stopped, waiting, idle), so it cannot bucket a task; it becomes a caller"],"task_js_edits":["Task.replay_line: rp.at = line.at ?? line.ts ?? … (the item tool writes ts; today completed_at falls back to the wall clock)","Task.replay_legacy: landed_at alone means complete, without requiring an outcome (33 old session tasks have assign.landed_at and no outcome; today they replay as running and count as stale)","Task.complete: during a replay (this._rp set) a recorded complete/finish line is a fact, so it is not refused for an open subtask; the refusal stays for live calls. A session task that files a module task writes a {task: ref} line, replay makes that filed task its subtask, and the worker’s own finish line is then refused (sheet-handoff-proof, 10-17: the only disagreement in the real check)"]}`

## The real numbers (2026-10-17, 23:05)

| Day | Landed (State) | Landed (plain walk) |
|---|---|---|
| 10-17 (today) | 43 (25 session, 18 module) | 44 |
| 10-16 | 52 | 52 |
| 10-15 | 19 | 19 |
| 10-14 | 18 | 18 |
| 10-13 | 66 | 66 |
| 10-12 | 71 | 71 |
| 10-11 | 0 | 0 |

All 2,065 tasks: 1,310 landed, 1 in flight, 275 idle, 37 stopped, 442 stale, 0 queued, 0 waiting (sum 2,065); 2,276 log files = 2,065 tasks + 211 moved to a module home. **The check fails today by one task**, `sheet-handoff-proof` (session-730e8a7b): it wrote `finish` twice, but it also filed a module task (`ext/drawer/tasks/readme-links-the-architecture-doc`) with a `{"task": …}` line, and `Task.replay` refuses a finish while that "subtask" is idle. The plain walk counts it landed. The fix is the third `Task.js` edit above; until it lands, the dashboard says so in red, which is the point. Full build 5.7 s, a tick 4.6 ms.

**After the three `Task.js` edits (2026-10-18):** the check is green. Landed today, State 45 and the plain walk 45, no ids on either side only. `State.test.mjs` now breaks a copy on purpose with a `start` line after a `finish`.

## Run it

```
node Server/State.mjs            write state.json and append state.jsonl when the picture changed
node Server/State.mjs --print    the counts and the check, to stdout
node Server/State.mjs --time     a full build and a tick, both timed
node Server/State.test.mjs       six planted tasks, every bucket, then one broken on purpose
```
