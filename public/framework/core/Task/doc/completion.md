# Completion: no ask goes unaccounted for

The owner's rule (2026-10-25): **100% completion for all sessions, tasks and prompts, and "complete" must be true, not just a mark.** The brief and the measurement that started it: [completion/requirements.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/completion/requirements.md). Rules for what counts as done: [resolution.md](resolution.md). This page is the part that is built.

## An open task has an owner who is working, or it is dropped

`Servex/Dropped.js` runs inside `TaskLoop.tick()` (every few minutes; plain node, no AI). It walks the session logs of the last 30 days (`SERVEX_DROPPED_DAYS`), follows each `path` reference to a module-homed task, and replays every log that has an `assign` line. A task is **dropped** when it is open and one of these holds:

| Code | Meaning |
|---|---|
| `never-assigned` | open (idle or running), no owner agent, log quiet for 60 min (`SERVEX_DROPPED_GRACE_MIN`) |
| `owner-gone` | its owner is not in the agent registry |
| `owner-stopped` | its owner is stopped |
| `owner-dormant` | its owner is dormant and the task is untouched for the grace time |
| `deferral-no-home` | a deferral (below) with no home |
| `deferral-overdue` | a deferral past its `decide_by` time |

Left alone: complete and stopped tasks, paused tasks, tasks waiting on the owner (TaskLoop already reminds), an `idle` task with a `priority` (it is **queued**, and the queue page lists it; alternative: flag it as "never started" after N days), and any task whose owner is working, starting, idle or queued.

For each newly dropped task, ONE line goes into its **parent's** log (`{"log":{"at","msg":"dropped: <title>: <why>","dropped":"<task url>","reason":"<code>"}}`, never written twice for the same task and reason), and the task is also **settled on its own file** (`{"stop":{"at","why":"dropped: <why>"}}`) — a dropped task leaves `running`/`idle`/`waiting` for a real terminal state with a reason, the owner's bar (2026-10-25): "node must guarantee every started task is completed, or stopped with a reason." Settling is idempotent for free: once stopped, the state check at the top of `scan()` drops the row from every later tick, so nothing re-flags it. The whole list is rewritten to `queue/dropped.json` (gitignored machine state) and shown on the [queue page](/framework/ai/queue/) under "Dropped" (`?view=dropped` for all). A revived owner clears the row at the next tick (as long as it has not already been settled). Test: `node Servex/Dropped.test.mjs` (temp store, fake clock and registry).

Not yet built: automated **parent back-off prompting** (so a dropped task's parent is nudged, with escalation to the grandparent or the owner's smart seat when the parent is gone too) and a visible "needs settling" state distinct from a plain stop. Design proposed, reported before building (core Servex surgery): [mastermind-roles-and-settling/report.md](/framework/ai/sessions/2026/10/25/session-e06424f1/mastermind-roles-and-settling/report.md).

## Deferral is a state, never a quiet stop

A deferral is a `wait` that postpones on purpose:

```json
{"wait": {"on": "/framework/core/Task/", "what": "starts after the session-is-a-task merge", "decide_by": "2026-10-28T12:00:00-07:00", "deferred": true}}
```

- `on` is its **home**: the module path, task path or agent id that will decide it. Never `"owner"`; the owner is not a home.
- `what` is the reason; `decide_by` is when the home must have decided.
- No home, or past `decide_by`, and it is dropped. `decide_by` alone also makes the wait a deferral.
- A deferral ends like any wait: the task is started again, completed, or stopped with a reason.

Code: `Task.wait({on, what, decide_by, deferred})` in `Task.js` (`data.deferred`, `data.decide_by`); replay reads the same line.

## Each session shows its deferral and stop rate

`Task.rates()` (a query: `item({path, delta: {rates: {}}})`, also inside `summary`) counts every task below a session (a child session's own tasks are its own): `{total, deferred, stopped, fair, rate, owner: {total, deferred, stopped, fair, rate}, red}`. **Owner asks** are the tasks filed from a prompt: `source` is `{session, line, part}`, `"prompt:<id>"`, voice-app, vscode or dictate; never `servex:<agent>`. **`red`** = at least 5 owner asks (`Task.RATES.min`) and more than 20% of them deferred or stopped (`Task.RATES.red`). A stopped task with a `fair` field (one of `Task.FAIR_KINDS`: duplicate, noise, standing, filler, superseded; any other value, or an empty one, counts as no reason) is no miss: `Task.is_fair_stop` leaves it out of the count and the total, and `rates()` reports how many as `fair`. Any other stopped task still counts. The limit is a smell test: the owner reads the numbers, and a red session is one to walk.

`Dropped.tick()` reads every session log of the last 30 days (a log with no `assign` and at least 5 filed tasks is a session), writes ONE `{log:{red:"rate"}}` line into a red session's own log, and lists it in `dropped.json` `red`; the queue page shows it above the dropped tasks. On 2026-10-25 the session this brief came from read 77 of 379 owner asks stopped (20.3%): red, just.

## A completed owner ask has proof, and can be reopened

`complete()` already refuses without evidence (`Task.completion_problem`). Two checks catch what slips through:

- **By code, every tick:** `Task.proof_problem(task)` and `session.unproven()` list every completed owner ask with no outcome or no evidence; `Dropped` writes them to `dropped.json` `unproven` and the queue page shows "completed owner asks with no proof". On 2026-10-25 the session had 2 completed tasks without evidence, none of them owner asks.
- **By Haiku, on demand:** `node Server/DoneCheck.mjs` (`--dry` first: about 80 asks, 4 calls, $0.16). Per ask: code checks that each repo path or commit in the evidence exists (module-relative paths are not checkable and are skipped), then one call per 25 asks asks whether the outcome answers the ask (the task title and its `expected` lines). `not-done` or missing evidence gets ONE `{log:{done_check:"not-done"}}` line in the log holding the task and a row in `queue/done-check.json` ("marked done, not done" on the queue page). A verdict is kept per ask and outcome, so a rerun checks only new ones. It never reopens anything: Haiku can be wrong. Test: `node Server/DoneCheck.test.mjs`.
- **Reopen:** `start` is allowed from `complete` (`CAN.start`). It sets the task running, stamps `reopened_at` and counts `reopen_count`. `TaskView` shows the Start button on a complete task as **Reopen**; any item-tool caller does `{start: {}}`.

## The completion value of every item type (item 5)

No new code. Prompt's `completion` is computed from its parts and Question inherits `Task.completion` (prompt-extends-task), so one `item({path})` call reads the number for a session, task, prompt, question, process or project.

## Closing a session (item 6)

`node Server/CloseoutWalk.mjs <session-id>` walks the open owner asks of one session record, grouped by the prompt they came from. Per prompt one Haiku call (it may read the repo) gives each ask a verdict: `done` (with repo paths or commits as evidence), `duplicate` (of a named ask), `noise`, or `open` (with the module that owns it). Code settles each verdict: a `done` whose evidence does not exist becomes `open`, a home that does not exist becomes `/framework/ai/`. Steps: `--dry` (groups and cost estimate), the run (writes `closeout-walk.jsonl` beside the session record), `--counts`, `--apply` (one pass of lines by `closeout-walk`: done is `complete` with evidence, duplicate and noise are `stop` with the reason, open is a deferral `wait` with its home and a decide-by 7 days out). Tasks with a working owner are left alone. Test: `node Server/CloseoutWalk.test.mjs`.

## An honest score, and no silent endings (2026-11-06)

**No score is not 0 and not 1.** A session with nothing to score (no tasks, no child sessions, no counted prompts) reads `completion_score() === null`, shown as "needs review" by `Task.show`. A plain leaf task keeps 1 (complete) or 0. A parent's mean counts a child session with nothing to score of its own as 1 if complete and 0 if not (`part_score`), so a session whose children carry the work keeps its number; only a session with no parts at all is null; `tally().unscored` counts them. The session page's Score stat, the dashboard rows and `Server/session-query.mjs --report` all show it through `Task.show`.

**Closing under 100% files one waiting task. PROPOSED and OFF BY DEFAULT (the owner, 2026-11-06: a change to what gets auto-filed is proposed with a dry run first).** The filing happens only when the environment variable `SERVEX_OPEN_ITEMS=on` is set; unset, `OpenItems.after_write` works out what it would file, returns it and writes nothing. To see what it would file over the session store: `node Servex/OpenItems.mjs --dry-run [--days 7] [--out <file>]` (counts of settled records scored under 1 or not at all, how many tasks it would file, five examples; the full list goes to `--out`, default the OS temp folder). The rule itself (`Task#closeout_line`) is unchanged. `Task#closeout_line` builds it (a task `open-items`, or `open-items-2` once the first is settled, waiting on the owner, listing each open item's title, id and state). `Servex/OpenItems.js` appends it right after any closing line, by comparing the replay before and after, so a doubled close or a replay files nothing; a close with nothing open (an empty tab) files nothing, since its score already reads "needs review". The closeout task is left out of the score and the open-child check. `list_waiting` shows these tasks beside the card needs. Tests: `completion.test.mjs`, `Servex/OpenItems.test.mjs`.

**Known gaps in the closing rule.** It runs from the two append functions of Servex (`page_tools.js write_line`, `TaskLoop.js write_line`). Writers that append straight to a record do not pass through it and file nothing: `Server/PromptRecords.mjs`, `Server/CloseoutWalk.mjs --apply` (its `stop` lines), and `RecordWriter.append_once` (what `append.mjs` and StaleClose use when Servex is down). Cost: a closing line replays its record once (about 0.5-0.7 s on the 3.7 MB `session-e00f55c9` record, measured; a few ms on a normal one), and a second time only when a filing is due.
