# Asks

The owner (2026-09-30): "a lot of tasks are getting kind of left in limbo." Every owner ask is
routed to an agent and written as one line in `public/framework/ai/asks.jsonl`. This is the part
of Servex that notices when that agent stops, goes quiet, or lands — so a stalled ask never just
sits there unseen.

## When an ask is marked stalled

An ask that is not landed, dropped, parked or queued is **stalled** when its owner agent is stopped or gone
(or never registered), or dormant with nothing queued to wake it, or has been silent — no turn
and no new line in its task.jsonl — for more than 2 hours. Servex checks every 60 s, starting
10 minutes after it boots (so agents a restart orphaned get a chance to be revived first), and
marks each change once. An owner that speaks again moves the ask back to `building`; an owner
whose task lands (or is closed with `close_task`) marks it `landed`. A stalled ask shows up for
the owner as a row near the top of the AI 2 Inbox (`/framework/ai2/inbox/`), and on
[`/framework/ai/asks/`](/framework/ai/asks/).

## Tasks, not just asks (2026-10-02)

The same idea, for every task dir, not just the ones the owner was asked about. The owner
(2026-10-02): "stalled tasks are top priority" and "every brief carries a budget, the card shows
estimate vs actual." [`tasks.js`](tasks.js) walks every `public/framework/ai/<date>/<slug>/
task.jsonl` from the last 7 days and writes the ONE file the Dashboard reads:
[`public/framework/ai/tasks.json`](/framework/ai/tasks.json) — regenerated every tick, never
hand-edited (law 7: a computer computes it, nobody types it). Run it yourself any time: `node
Servex/asks/tasks.js --print` lists today's stalled tasks with reasons, same as this ticks every
minute.

A task's owner is the agent on its `task.jsonl`'s own first line — stalled is the exact same
`stalled()` rule above, fed that agent's registry row. A task is also `landed` (a `landed_at`
line exists), `snoozed` (a `{"snooze":{until}}` line whose time hasn't passed yet — held off the
stalled check on purpose) or `killed` (a `{"kill":{why}}` line — closed for good, like landed,
and a kill also stops the task's owner agent if it's still live). These three are VERB LINES
appended through `append.mjs`, never a hand edit to an existing line — the three Servex tools
`snooze_task`, `kill_task`, `reprioritise_task` (`Servex/agents/tools.js`) write them, so the
Dashboard's buttons and any agent call the exact same code.

**The Dashboard's order — one line per band:**
- **100 — stalled.** No agent owes it a turn; shown at the very top.
- **90 — over budget.** Still being worked, but `spent / budget > 1` — the owner's other ask.
- **50 — building.** Normal, in-progress work; ordered by its own last log line, newest first.
- **10 — snoozed.** Held off on purpose; still listed, just not urgent.
- **0 — landed or killed.** Closed. Folded out of the way.

An owner's own `{"priority":{score}}` line always overrides the computed band for that task —
that is the whole point of "re-prioritise."

## What

- [`fold.js`](/framework/ai/asks/fold.js) (pure, node + browser) — turns the ledger's lines into
  one object per ask: `ask_id(ask)` and `fold_asks(lines)`. This is the one vocabulary; nothing
  else folds the ledger a different way.
- [`stalled.js`](stalled.js) — one pure function, `stalled(ask, owner_row, now)`, that says
  whether an ask's owner has gone quiet. The rule is written in full at the top of the file.
- [`Asks.js`](Asks.js) — the class Servex mounts as `servex.asks`: reads the ledger, appends
  status marks, and ticks every 60 s to catch a stalled or a landed ask. Also wraps
  `task_loop.close_task` so closing a task lands the asks its agent owned.
- [`mark.mjs`](mark.mjs) — the CLI: `node Servex/asks/mark.mjs <id-or-title-words> <status>
  "<why>" [--by <agent>]`, or `--list` to see every ask's id, status and owner.
- [`asks.test.mjs`](asks.test.mjs) — `node Servex/asks/asks.test.mjs`. No framework; prints
  pass/fail and exits non-zero on a failure.
- [`tasks.js`](tasks.js) — the task check above: `build_tasks()` and `write_tasks_json()`, wired
  into `Asks.js`'s own tick. `node Servex/asks/tasks.js --print` to run it by hand.
- [`tasks.test.mjs`](tasks.test.mjs) — `node Servex/asks/tasks.test.mjs`, a fixture tree (never
  the real `ai/`): landed, building, stalled and snoozed tasks, plus budget vs. actual.

## Use

Land your own task and want its ask marked? Run the CLI by hand — you don't need the full id,
just enough of its title or id to be unique:

```
node Servex/asks/mark.mjs "asks ledger" landed "shipped, merged" --by your-agent-id
```

Reading the ledger from code (Servex or a page) goes through `fold_asks` — never hand-roll a
fold, it will disagree with this one the moment the ledger grows an update line.

## Watch out

- **The ledger is append-only.** `Asks.mark()` and `mark.mjs` only ever add a line; nothing here
  ever rewrites `asks.jsonl`. A status is the LATEST line for that id, which is what `fold_asks`
  computes — read the file yourself and you'll see every line still there, including old ones.
- **`stalled` is a pure judgment, not a side effect.** It never marks anything; `Asks.tick()`
  reads the verdict and decides whether a mark is actually new (stalled once, not every tick).
- **`owner_row` isn't just the registry row.** `Asks.owner_row()` adds `last_task_line_at`,
  `task_landed` (both read from the owner's task dir — `registry.js`'s own `task_dir` field) and
  `queued` (messages waiting in its live send queue). Passing a bare registry row to `stalled()`
  works for the state checks but will always look "never seen" for the silence check.
- **`dormant` is a string, not a feature this file owns.** Another task (2026-09-30) is adding
  that agent state; `stalled()` just accepts the word. If that state's exact meaning changes,
  `stalled()`'s dormant branch is the only place to update.
- **Servex writes to the main tree's `asks.jsonl`.** The file is committed, but the ticker
  appends to the live copy, so a worktree's copy goes stale. Mark asks from the main tree.
- **Not `ai/council/asks.jsonl`.** That older file is the council's verdict log; same name,
  unrelated.
- **`tasks.json` is derived, like a build artifact.** `tasks.js` overwrites the whole file every
  tick (temp file + rename, so a reader never sees a half-write); a hand edit is gone within a
  minute. Change a task's state with `snooze_task` / `kill_task` / `reprioritise_task` instead —
  those write the one line `tasks.js` reads back.
- **Servex writes to the main tree's `tasks.json` too**, same as `asks.jsonl` above — a
  worktree's own copy goes stale the moment Servex ticks in the main tree instead.
