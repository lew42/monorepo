# queue-and-follow

The owner's words (voice, polished by session-smart-v-sq8y7db, 2026-10-25):

1. Servex dropped `ai-system-mastermind` from the spawn queue after 1.5 min "because only 2.3 GB RAM was free". A queued task must not be abandoned for lack of RAM: it stays queued until it can start, or the parent is told and it re-queues; never silently lost.
2. Agents that follow() the smart seat's file answer every followed line with a `[from: X · reply to: log agent-session-smart…]` message that wakes the seat, even for a thumbs-up. Find who tells them to reply; followers should read silently and message only with something to say.

## Findings and fixes

- Queue: no RAM timeout exists. The drop reason was "its task ai-system-mastermind has landed": `Servex.stale` let `Agents.blocked` match an OLD landed task by id. Now "landed" counts only against `spec.task.dir`; a drop messages the parent. Docs: [Servex/doc/dormant.md](/Servex/doc/dormant.md). Test: `node Servex/Gate-stale.test.mjs`.
- Follow: delivery is `agents.send` (the message queue). Nothing tells followers to reply; `Agents.wake_parent` sends every child turn's last words to its parent. A turn that answers a followed line and ends under 200 characters (not BLOCKED, not stopped) now skips the message to the parent only. Docs: [Servex/doc/follow.md](/Servex/doc/follow.md). Test: `node Servex/agents/Follow-ack.test.mjs`.

## Not built

- Auto re-queue after a drop: the only drop was the wrong "landed" match, now removed; a real drop (cwd gone, stopped on purpose, a named task already landed) means the spec cannot run, so re-queueing would loop. The parent is told and spawns again if it still wants it.
