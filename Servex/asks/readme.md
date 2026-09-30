# Asks

The owner (2026-09-30): "a lot of tasks are getting kind of left in limbo." Every owner ask is
routed to an agent and written as one line in `public/framework/ai/asks.jsonl`. This is the part
of Servex that notices when that agent stops, goes quiet, or lands — so a stalled ask never just
sits there unseen.

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
- **This worktree's own `public/framework/ai/asks.jsonl` doesn't exist yet** — this branch was
  cut before the main tree's ledger file was created, so a fresh checkout here reads as empty.
  That's expected: `Asks.read()` and `mark.mjs --list` both handle a missing file as "no asks",
  not an error. The test embeds the real 16 lines as a fixture instead of reading them off disk.
