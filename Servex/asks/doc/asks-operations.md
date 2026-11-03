# asks — how asks run (moved from the readme)

<!-- moved verbatim from readme.md lines 8-46, 2026-10-12 readme audit -->
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
