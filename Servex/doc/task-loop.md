# The task loop

![A task's life: open, quiet, chased twice, then Waiting on you](task-loop.svg)

Nobody has to remember to land a task. [`TaskLoop.js`](../TaskLoop.js) checks every open task on a
timer, wakes its agent when it has gone quiet, and — if that gets no landing — puts the task where
the owner will see it. Design: [`skills-as-a-workflow-tasks-chased-by-nod`](/framework/ai/2026/09/28/skills-as-a-workflow-tasks-chased-by-nod/design.md).
Interfaces it agreed with its siblings: [`interfaces.md`](/framework/ai/2026-09-28/task-loop/interfaces.md).

## The timers

| variable | default | what it does |
|---|---|---|
| `SERVEX_TASKLOOP_EVERY_MIN` | 5 | how often the loop looks at every open task |
| `SERVEX_TASKLOOP_QUIET_MIN` | 20 | a task's log has not been touched this long — first sign it needs a chase |
| `SERVEX_TASKLOOP_GAP_MIN` | 30 | how long between chase 1 and chase 2, and between chase 2 and escalating |
| `SERVEX_NO_TASKLOOP` | unset | set to `1` to stop the ticking; `close_task` and `task_loop_status` still work |

A task is **open** when its `task.jsonl` has no `landed_at` carrying a non-empty `outcome`, and no
`closed_by`. The loop reads today's and yesterday's task dirs under `public/framework/ai/`,
starting from Servex's own repo root — a worktree's Servex chases the worktree's own tasks, never
the live site's.

## Chase

Only a task that opted in is chased (the heartbeat's own `opted_in()` test, so a first live boot
never wakes an old task), and chase itself never revives a stopped/gone/errored agent — it leaves
that to the heartbeat's own rationed, gated triage, and just logs "left to heartbeat".

Once a task is open and either quiet past the timer or its owning agent has stopped or is gone
(the registry row for the agent named on the task's own line 1, or found by matching session id),
the loop sends that agent one neutral message, the same status check the heartbeat sends: *"Status
check: where are you at? No change of plan needed; just a line on what you're doing."* It never
says "land it": a check must not steer the work (the owner, 2026-09-29). It logs what happened —
`woke <id>` or `could not wake: <why>` — as a `{"log": {"chase": 1}}` line on the task's own
`task.jsonl`, never anywhere else. A second chase follows 30 minutes later if the task is still
open, whatever the agent replied in between: only a real landing, or `close_task`, stops the loop —
a reply that is not a landing keeps the clock running.

## Escalate

Another 30 minutes with still no landing, and the task goes on the owner's own list instead of
staying invisible. The loop calls `card_ask` — the tool `waiting-on-you` registers in-process, once
it exists — asking the owner to close the task or keep chasing it, addressed to the task's own
agent. Until `card_ask` is registered, it posts a plain message on the task's card instead (its
line-1 `card`, or `"live"`). Either way this is logged as `{"chase": "escalated"}`, and an escalated
task is never chased or escalated again — it stays open, visible, and waiting, until it lands or is
closed. At most 5 escalations happen in one tick; a bigger backlog spreads over the next ones.

## Close

A task can leave the loop two ways: it lands (`landed_at` with a real `outcome`), or the owner
closes it without landing. `close_task({dir, why})` is that second door — it appends
`{"assign": {"closed_by": "owner", "closed_at", "closed_why"}}` to the task's own log, the only
other line that stops the chase for good. `task_loop_status()` answers `{open, quiet, chased,
escalated, last_tick}` — the last two are how many this Servex process has done since it started;
the file itself, not memory, is what survives a restart.

## The heartbeat

The task loop looks every few minutes at every open task; the heartbeat
([`Heartbeat.js`](../Heartbeat.js)) watches the *agent* that owns each one, from the events it
already emits (a message, a tool call, a turn ending), with a one-minute tick as the backstop. It is
plain node over `agents.watch` and `agents.send`, so any harness can feed it. The rules:

- **Who is watched:** the agent on line 1 of an open task's `task.jsonl`, only for tasks opened after `SERVEX_HEARTBEAT_SINCE` (or whose line 1 says `heartbeat: true`), so a restart never wakes old tasks.
- **Silent 5 minutes** (`SERVEX_HEARTBEAT_SILENT_MIN`) → the neutral status check, queued behind its turn, never while a tool is running. Once per silence; each answered check doubles the wait before the next.
- **It answers** → the answer goes on the task's card, and nothing else happens.
- **No answer in 5 more minutes, or its agent stopped, failed or is gone** → triage: queued at the spawn gate (say so), paused or stopped on purpose (say who stopped it; never revived), otherwise revive it from its session id, with its unread `inbox.jsonl` in the prompt.
- **Revives are rationed:** at most 2 per task per hour and 5 per day, through the spawn gate, one every 30 s, from a queue kept in a file (`heartbeat-queue.json`) that survives a restart.
- **Escalate only when the fix fails:** the revive threw, the ration is spent, or a tool has run for 3x the silence. That goes on the card (`card_ask` when registered, else a card message) and the heartbeat stops chasing that task.
- **A minion stuck at the spawn gate** for 5 minutes, or dropped from its queue without starting, wakes its parent once, naming the minion, the wait and the gate's reason.
- **A child's result is never lost:** `wake_parent` revives a stopped parent through the host's `send()`, and also appends the result to the parent task's `inbox.jsonl`.
- Every check, answer, revive and escalation is one `{"log": {"heartbeat": …, "msg"}}` line in the task's own log. `heartbeat_status` lists who is being watched and how long each has been silent; `SERVEX_NO_HEARTBEAT=1` turns it off.

## Worktree servers

A task built in its own worktree (`Server/worktree-up.mjs`) also has its own private dev server,
and on 09-28 nothing ever took one down: 24 pairs (about 2.1 GB) were still running for tasks that
had landed days before. `landed_at` alone isn't proof it's safe, though — the same day,
collab-rounds had a `landed_at` while its branch wasn't merged and its minion was still fixing a
bug, and something stopped its server on that one signal anyway. So
[`Server/worktree-sweep.mjs`](../../Server/worktree-sweep.mjs)'s `can_stop(entry)` checks all
three before anything is stopped: the worktree's own task (found by its task.jsonl line 1
`worktree` field) has `landed_at` **and** a real `outcome`; its branch is fully merged into
`michael/dev` (`git merge-base --is-ancestor`); and no live agent is still working there — the
task's own mastermind, one of its minions, or any agent whose recorded `cwd` sits inside the
worktree. All three true and it calls `Server/worktree-down.mjs`, which already refuses to remove
a dirty tree.

Two things call it: `Server/on-landing.mjs` runs `can_stop` for the task's own worktree the moment
it lands — stops it if that's ok, else posts one line on the task's card naming why, with any
untracked files named too, since those may be work that never merged. And this loop's own `tick()`
runs `sweep()` once a tick, in a hidden child process: it walks every worktree Servex knows about
(`.worktrees.json`) and stops any whose directory is simply gone, or whose `can_stop` now reads ok
— a safety net for whatever `on-landing.mjs` missed (Servex was down, or an agent was still
working at landing time and has since finished). Neither one ever touches the main tree's server
or Servex's own — those are never in that registry. `node Server/worktree-sweep.mjs --dry` prints
what a real run would do without stopping anything.
