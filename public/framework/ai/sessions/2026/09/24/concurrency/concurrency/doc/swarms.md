# Swarms from several angles

A swarm is several agents given the same question from different angles, side by side, with one
parent that merges what they find. This page was made that way: three minions each proposed one
angle (messaging, node, the tree), and a fourth merged them.

## How a swarm runs

1. **The parent writes one brief and several angles.** Each child gets the same brief, one angle,
   and its own file to write — `proposal-<angle>.md`, `result-<id>.md`, or code in its own
   directory. No two children share a file.
2. **Each child writes its result to its file.** The file is the result. The wake is only the
   doorbell: `done: wrote proposal-tree.md`.
3. **The parent reads the files when the last sibling is done**, not after each wake. A wake that
   arrives while siblings are still running only ticks a counter (and waiting wakes are merged into
   one turn anyway — see [messaging.md](messaging.md)). That saves a full read-and-think turn per
   child.
4. **The merge is one job.** Either the parent merges, or it hands the merge to a fork or a minion:
   "merge these three files into one page". The parent stays free while the merge is written.

## Timing

Three angles side by side take as long as the slowest one, not all three added up. For this task's
three proposals, roughly 10 minutes became about 4 (a guess). Reading on the last sibling instead of
on every wake saves about 40–80 seconds per fan-out at Opus (a guess, from the 2026-09-19 latency
runs).

## Traps

- Two children in one file. One fence per child, so results merge by reading files, never by
  resolving conflicts.
- Passing a child's full output upward. Each level summarises to one screen and links the files.

From [proposal-tree.md](../proposal-tree.md).
