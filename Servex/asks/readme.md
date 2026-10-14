# Asks

The owner (2026-09-30): "a lot of tasks are getting kind of left in limbo." Every owner ask is
routed to an agent and written as one line in `public/framework/ai/asks.jsonl`. This is the part
of Servex that notices when that agent stops, goes quiet, or lands — so a stalled ask never just
sits there unseen.

- Moved verbatim to [doc/asks-operations.md](./doc/asks-operations.md): how asks run.
that is the whole point of "re-prioritise."

## What

- [`AskFold.js`](/framework/ai/asks/AskFold.js) (pure, node + browser) — turns the ledger's lines into
  one object per ask: `AskFold.id(ask)` and `AskFold.fold(lines)`. This is the one vocabulary; nothing
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

Reading the ledger from code (Servex or a page) goes through `AskFold.fold` — never hand-roll a
fold, it will disagree with this one the moment the ledger grows an update line.

## Watch out

- **The ledger is append-only.** `Asks.mark()` and `mark.mjs` only ever add a line; nothing here
  ever rewrites `asks.jsonl`. A status is the LATEST line for that id, which is what `AskFold.fold`
  computes — read the file yourself and you'll see every line still there, including old ones.
- **`stalled` is a pure judgment, not a side effect.** It never marks anything; `Asks.tick()`
  reads the verdict and decides whether a mark is actually new (stalled once, not every tick).
- **`owner_row` isn't just the registry row.** `Asks.owner_row()` adds `last_task_line_at`,
  `task_landed` (both read from the owner's task dir — `Registry.js`'s own `task_dir` field) and
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
