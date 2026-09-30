# Asks

The owner (2026-09-30): "a lot of tasks are getting kind of left in limbo." Every owner ask is
routed to an agent and written as one line in `public/framework/ai/asks.jsonl`. This is the part
of Servex that notices when that agent stops, goes quiet, or lands — so a stalled ask never just
sits there unseen.

## When an ask is marked stalled

An ask that is not yet landed or dropped is **stalled** when its owner agent is stopped or gone
(or never registered), or dormant with nothing queued to wake it, or has been silent — no turn
and no new line in its task.jsonl — for more than 2 hours. Servex checks every 60 s, starting
10 minutes after it boots (so agents a restart orphaned get a chance to be revived first), and
marks each change once. An owner that speaks again moves the ask back to `building`; an owner
whose task lands (or is closed with `close_task`) marks it `landed`. A stalled ask shows up for
the owner as a row near the top of the AI 2 Inbox (`/framework/ai2/inbox/`), and on
[`/framework/ai/asks/`](/framework/ai/asks/).

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
- **Servex writes to the main tree's `asks.jsonl`.** The file is committed, but the ticker
  appends to the live copy, so a worktree's copy goes stale. Mark asks from the main tree.
- **Not `ai/council/asks.jsonl`.** That older file is the council's verdict log; same name,
  unrelated.
