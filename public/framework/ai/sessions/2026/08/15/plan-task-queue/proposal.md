# The task queue — asks that wait, on the rails that exist

Today the board has one verb: **start now** (compose → `Start.js` → a spawned
session). Everything else Mike wants done lives in his head until a session is
free. The queue adds the missing verb: **queue it** — an ask parked as a real
task dir that any session, spawn, or scheduled run can later claim. The board
becomes a pipeline: **queued → running → landed**, all three visible, all three
streaming.

## It is a task dir, not a new store

A queued task is `ai/<date>/<slug>/` with `requirements.md` and a `task.jsonl`
whose launch `assign` carries `queued_at` and **no `session_id`**. Absence of a
session IS the queued state — nothing owns it yet. Claiming appends
`{"assign": {"session_id": …, "claimed_at": …}}` and the card flips to RUNNING.
No parallel queue file, no database; `ext/JSONL` replays it like every other
task, and the streaming stack broadcasts every transition live.

One rule bends: the `new-task` skill says `session_id` is "not optional". The
queue amends that to *"not optional once claimed"* — a queued line is the one
legal sessionless state, and the skill/docs say so explicitly.

## Three doors in, three doors out

**In:** the compose box gains a "queue" toggle beside "start" (`Start.js`
scaffolds, skips the spawn); a terminal session runs `new-task --queue`-style
scaffolding for asks it defers; Mike edits a `requirements.md` by hand and a
sessionless launch line makes it real.

**Out:** a **Claim** button on the card (spawns via the existing `Start.js`
path, model picker included); an idle session asks "anything queued?" and
claims the top card; a **scheduled routine** (the `schedule` skill exists
today) drains the top N per night at a chosen model/budget — programmatic
control, literally.

**The claim must not race.** Two sessions claiming one task is the corruption
case, so claiming goes through the dev server (`rpc:claim`): the server is the
single writer that checks-then-appends, and a second claimer gets "already
claimed by <session>". Terminal sessions claim through the same RPC via the MCP
`site` server — which is why phase 3 mattered.

## Ordering: FIFO plus one bit

`queued_at` orders the rail; `priority: true` floats a card to the top. That is
the whole scheme. Weights, deadlines, dependencies — all deferred until a real
week of use demands one of them (an option is API surface forever).

## Companion feature: steering through the Stop gate

Every task already has a chat thread (`ext/Ask`), but a running session never
reads it. One hook closes the loop: the Stop gate (already built, awaiting the
settings paste) additionally checks the task log for **chat lines newer than
the session's last log line** — and blocks with "Mike said: <line> — address it,
log the decision, then land." Steering becomes: type into the thread you
already have; the session cannot end without answering. No new UI, no new
protocol, ~20 lines in `ledger.mjs`.

## Build estimate and order

1. Queue state + board rail + compose toggle (one opus agent, ~a day-task):
   `Start.js` queue mode, `stats.js`/`card.js` QUEUED state, dashboard rail.
2. `rpc:claim` + Claim button (same agent or a sibling, small).
3. Stop-gate steering (~20 lines + fixtures) — after Mike pastes the hooks
   block.
4. Scheduled draining — a `schedule` routine, config not code; needs Mike's
   call on budget and cadence.

## The three decisions that are Mike's

1. **Bless the sessionless launch line** (the one schema change everything
   rides on).
2. **Where the queue renders**: a third board column, or a rail above Active.
3. **Whether scheduled draining is wanted at all**, and its nightly budget —
   it spends tokens while you sleep, which is either the point or a bill.
