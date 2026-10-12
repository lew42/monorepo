# Who may message whom

A message is a doorbell. What was done, and why, lives in the logs. The message only says "look".

## The rule

Orders go down the tree, wakes come up it, and nothing goes sideways. Each agent talks to its own
parent and its own children. Two siblings never message each other. If minion A needs something
from minion B, A ends its turn with `blocked: need B's X`, and their shared parent decides. A tree
cannot loop, so no two agents can end up waiting on each other.

| sender | may message | how |
|---|---|---|
| The owner | the fast assistant, always first | a `prompt` line in the prompts log |
| Fast assistant | the agent whose `topics` or `page` match in `registry.json`; with no single match, the mastermind | `send_to_agent`, priority `next` |
| Mastermind, sub-mastermind | its own children; the master assistant for an opinion | `send_to_agent` |
| Minion | only its parent, and only by ending a turn | `wake_parent` (`done`, `blocked`, `error`), automatic |
| Fork | only the agent that forked it | the same wake, `from: fork-<caller>-<n>` |
| Node job | only the agent that started it | the same wake, `from: job-<n>` |
| A VS Code tab (not held by Servex) | anyone, like the fast assistant | `send_to_agent`, then `wait_for_agent(id)` in the background |

A VS Code tab has no queue that Servex can push into, so it pulls: it runs `wait_for_agent` in the
background and gets a direct "done". That is the only place `wait_for_agent` belongs. A Servex agent
never waits on anything, because the wake arrives by itself.

## Three priorities

The SDK already takes `priority: 'now' | 'next' | 'later'`, and `Agent.send()` passes it through.
Each one gets one fixed meaning:

- **`now`** means stop. It cancels the turn in progress (measured 2026-09-22), so only the owner
  saying stop, or a parent cancelling a child that is doing the wrong thing, uses it.
- **`next`** means a person is waiting: the owner's words relayed by the fast assistant, a question
  from a VS Code tab, or a child that is `blocked`. It jumps ahead of the queue but does not cut off
  the current turn.
- **`later`** is for `done` wakes, fork answers and node-job results. Nobody is waiting on these in
  real time.

The choice is made in code, in `Agents.wake_parent` and the fast assistant's send, not in each
agent's head: `blocked` → `next`; `done`, `error`, fork and job answers → `later`; owner words → `next`.

## One turn for many wakes

When three children finish while the mastermind is busy, it should not pay for three turns. Before
the queue hands them to the SDK, waiting `later` messages are merged into one envelope:
`[from: minion-a, minion-b, fork-mastermind-3]` with one line each. `next` and `now` are never
merged, because a person is waiting on each one. Three minions finishing together save two turns.

## Keeping the mastermind's own session free

A message only lands when the current turn ends. So what makes a mastermind slow to answer is its
own tool calls: a sweep of reads, a build, a sleep loop. The fix is in `roles.js`: a mastermind
and a sub-mastermind get only coordination tools — `spawn_agent`, `send_to_agent`, `fork_self`,
`start_job`, `list_agents`, `interrupt_agent`, `stop_agent`, `append_log` — plus `Read` for a brief
or the tail of a log. No `Bash`, `Edit` or `Write`. If it cannot run the slow thing, it cannot get
stuck in it.

## Timing

Today a message to a busy mastermind waits for the whole turn to end, one to five minutes when the
turn reads files or runs a build (a guess, not measured). A turn made only of coordination tools is
one model call, about 10–30 seconds for Opus (also a guess). So a relayed question is answered in
about 30 seconds instead of several minutes. The fast assistant still answers first, in about 2
seconds (measured, [prompt-lifecycle](/framework/ai/2026-09-22/prompt-lifecycle/)).

Every message is already an `agent_msg` line (`from`, `reply_to`, `priority`) in the receiver's
log, so none of this adds a new log.

## Traps

- `wait_for_agent` inside a Servex agent blocks the very session this design frees.
- `now` for anything but "stop" throws away the turn in progress.
- Siblings messaging siblings: the number of possible conversations grows with the square of the
  team, and each message costs the receiver a turn.

From [proposal-messaging.md](../proposal-messaging.md).
