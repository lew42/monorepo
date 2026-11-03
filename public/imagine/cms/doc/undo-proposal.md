# Undo for the delta stream — a proposal

**The question.** `set` / `del` / `append` append one `{at, op, path, value}` line and the state
moves forward. Nothing in that line says what the value *was*, so nothing can move it back. The
roadmap called this "a contract change". **It is not** — one of the three shapes below needs no
contract change at all, and it is the one that wins.

Measured on a synthetic 200-op session over the real
[`page.json`](/imagine/cms/json/page.json) (4,598 B, 7 nodes; mix 85 scalar `set`, 39 block-text
`set`, 2 whole-node `set`, 54 `append`, 18 block `del`, 2 child-node `del`). Script ran in the
session scratchpad, not the repo; every number below is from that run.

## The three shapes

| | **(a)** `prev` in every line | **(b)** inverse journal in RAM | **(c)** replay the log minus the last op |
|---|---|---|---|
| bytes per line | 289 → **438 B (+52%)** | 289 B — unchanged | 289 B — unchanged |
| log after 200 ops | 57.8 → **87.7 kB** (19× the snapshot) | 57.8 kB, plus 42 kB of RAM | 57.8 kB (12.6× the snapshot) |
| worst single op | `del` a child node 85 → 1,482 B (**+1,643%**) | — | — |
| undo one op | 0 replays; the line is already in hand | 0 replays, 0 bytes read | 199 replays + one snapshot parse = **115 µs** |
| ten undos in a row | 0 replays | 0 replays | 1,945 replays = 1.15 ms |
| after `compact()` | **history gone** — `prev` lived in the truncated lines | **survives** — 176 of 200 restore, compacted or not | **history gone** — undo *is* the log |
| two tabs | *my* last edit; the carried `prev` is stale **85%** of the time by end of session | same 85% | the *last line*, whoever wrote it — nothing follows it, so **never stale** |
| migration | **0 of 200** existing lines carry `prev` | nothing to migrate | nothing to migrate |

## What the numbers say

- **(a) charges every edit for an undo almost nobody presses.** +52% on the mean is the polite
  number; the tail is the real one. The ops that cost the *fewest* bytes today pay the most:
  `del` a block 88 → 417 B (+375%), `del` a child node 85 → 1,482 B (+1,643%) — and `del` is the
  one op whose undo actually matters, because you notice a deleted page. `append` grows 1.4%,
  because its inverse wants an index, not a value.
- **(c) is free until the log is enormous.** 115 µs to replay 199 ops. A single undo does not
  reach **1 ms until roughly 1,600 ops** sit in one log — and `compact()` exists precisely so a
  log never gets there. The cost is a rounding error against the 9 ms an edit already takes to
  cross the wire.
- **A carried `prev` rots.** Undo your edit one op later and 6% of undos clobber someone's work;
  five ops later 25%, twenty later 53%, at end of session 85%. 65% of `append` inverses point at
  the wrong array index by then. **(c) cannot rot** — it only ever undoes the last line, and
  nothing follows the last line.
- **Undo is an append in all three.** You cannot remove a line from an append-only log, so undo
  writes a normal inverse delta. Free consequence for (c): **redo is undo again.**
- **(a) needs (c) anyway.** Zero already-written lines carry `prev`, so (a) ships with replay as
  its fallback or it cannot undo anything written before the day it landed. (a) costs a + c.

## The thing that bites all three

**24 of 200 ops (12%) cannot be inverted with `set` / `del` / `append` at all.** This is a
property of the *vocabulary*, not of where `prev` is kept — no shape escapes it:

- **14** — `del` at an array index. Its inverse is *insert at index*; `set` at that index
  overwrites the neighbour that shifted down. Needs a fourth verb.
- **8** — the op's path walk auto-created a container (`box[key] ??= {}` / `??= []`). The
  inverse leaves an empty `blocks: []` behind where there was no key.
- **2** — `del` a child key. `set` puts it back, but **last** in the object, and key order *is*
  the rail order, so the page returns in the wrong place.

## Recommendation — (c), replay, undo the last line only

**No contract change, and every log ever written becomes undoable today.** The two numbers that
decide it: **115 µs** to replay a 199-op log, against **+52% on every line forever** for (a) — a
cost paid by every edit whether or not anyone ever undoes. (b) is the interesting loser: it is
free on disk and the only shape that survives `compact()`, but its journal dies with the tab, it
cannot undo the other window's edit, and it rots at the same 85%.

**What `compact()` does to it: undo depth goes to zero.** That is the honest cost and it is
acceptable — `compact()` is already a button somebody chooses, never a timer, so
*"compacting ends the undo history"* is one sentence beside it and the same bargain every editor
makes with Save.

**Smallest honest first version** — one button, *Undo last change*, on
[`json/edit`](/imagine/cms/json/edit/) and the [stream](/imagine/stream/) demos:

1. Read the last line of the log (already in memory — `Source.deltas` / `Stream.text()`).
2. Replay snapshot + log-minus-that-line to get the prior value at its `path`.
3. Append the inverse as an ordinary delta. Every window redraws through the one existing path.
4. **Refuse, greyed, with the reason**, for the 12% the three verbs cannot express.

Then, only if someone actually deletes a block and wants it back *in place*, add `insert` as a
fourth verb — one branch in `apply()`, and it retires 14 of those 24.

## Not chosen, and why it is written down

`prev` in the line is the shape everyone reaches for first, and this doc exists so it is not
reached for twice. Revisit (a) if undo ever has to work **across a reload and after a compaction
and out of order** — that is the one job replay cannot do, and it costs +52% of every byte.
