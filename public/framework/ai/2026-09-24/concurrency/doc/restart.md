# Agents survive a Servex restart

Servex holds every agent in its own process, so restarting Servex used to end every agent's session.
Now an agent comes back.

## What happens at boot

1. Servex reads `registry.json` and finds the agents the previous boot was running.
2. Each one that was active recently (the last 30 minutes) is spawned again with
   `resume: <its recorded session_id>`, **under the same id and the same parent**. Its conversation
   is intact, the board shows the same card, and its children's wakes still find it.
3. An agent that was **mid-turn** when Servex stopped gets one message first: "Servex restarted
   while you were mid-turn — check where you were and continue."
4. The rest are marked `gone`, so they stop showing as idle.

## Why this is the choice

**Chosen:** revive in process — at boot, resume each agent from its `session_id`.
**Alternative:** run each agent out of process, one node child per agent that reconnects to Servex.
That is more robust to a crash, but a far bigger change.

## What it means for the rest of this design

- A restart no longer loses a tree: depth, budget and `cost` are all on the registry row, so the
  spawn guard and the `spent()` roll-up carry on where they were.
- A fork or a node job that was running when Servex stopped is lost; its caller simply asks again.
  Both are cheap, and neither writes files, so nothing is half-written.

## Proven

[revive-proof.txt](../revive-proof.txt), 2026-09-24: an agent was killed halfway through a 20-second
command. The next Servex boot revived it under the same id and the same session, told it it had been
cut off mid-turn, and it ran the command again and finished — 34 seconds end to end.

Decision logged by the task mastermind, 2026-09-24 17:30, as deliverable 1b of this task.
