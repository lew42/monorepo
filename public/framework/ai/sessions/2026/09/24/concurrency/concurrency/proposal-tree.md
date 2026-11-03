# Proposal — the tree: masterminds that spawn masterminds

## 1. The rule

**Every agent knows its parent. Money and results flow up that one link, and a strict budget
comes down it. No agent may spawn more children, or deeper, than its parent allowed.**

## 2. The design

### The link exists; give it three more fields
`spawn_agent({parent})` already records `parent` in `registry.json`, and `wake_parent` already
carries a child's last words up one level. Nothing new is needed for the shape of the tree.
Three fields are added to the spawn call and to the registry row:

| field | set by | meaning |
|---|---|---|
| `depth` | Servex, never the caller | parent's depth + 1. The owner-facing top mastermind is 0. |
| `budget_usd` | the caller | the most this child **and everything under it** may spend. Must be ≤ what the caller has left. |
| `max_children` | the caller | how many children this child may have alive at once. |
The `spawn_agent` handler (plain node inside Servex) checks all three before it starts anything:

- `depth` above **3** → refused (`0` top · `1` sub-mastermind · `2` minion · `3` a minion's
  fork or helper). The refusal is text the caller reads: "depth limit: do this yourself".
- the caller already has `max_children` live children → refused, "wait for one to finish".
  Default: **3** for a mastermind (the owner's "three sub-masterminds"), **2** for a
  sub-mastermind, **1** for a minion (its own `fork_self`).
- `budget_usd` larger than the caller's remaining budget → refused, with the number left.
Because the checks live in the tool, no prompt can talk its way past them.

### Money rolls up by adding, not by asking
Each agent already keeps `cost` (the SDK's `total_cost_usd`, updated on every `result`). Two changes:

1. `registry.js` also writes `cost` on every result, so the number survives a restart.
2. A new `Agents.spent(id)` = own `cost` + `spent()` of every registry row whose `parent` is `id`.
   A walk over one small JSON file, microseconds. **Nobody sends a cost message.**

After every `result`, Servex walks up the parents: if any ancestor's `spent()` is over its
`budget_usd`, that ancestor's whole subtree is `interrupt`ed (not stopped: sessions stay
resumable), and the ancestor gets a wake: `blocked: budget — $4.10 of $4.00 spent by 5 agents`.
The ancestor decides whether to raise the limit, resume one branch, or land what it has.

### How the dashboard shows the tree
`registry.json` rows with `parent` are already a tree, and `card()` already carries `parent`. The
AI board draws each task as an indented list, one row per agent, read straight from the registry:

```
▾ mastermind-concurrency      working   $0.42  ($3.10 tree / $5 budget)
  ▾ mastermind-tree-a         idle      $0.20  ($1.05 tree)
      minion-a1               done      $0.40
      minion-a2               working   $0.45
  ▸ mastermind-tree-c         blocked   $0.73 tree   ← "budget"
```

`task.jsonl` stays **one per task, written by the top agent only**: one `log` line per child
spawned (`{"spawned": id, "angle": …, "budget_usd": …}`) and one per child landed. Children
write their own `agent-<id>.jsonl`, so no ledger ever has two writers.

### Results merge up in three steps

1. **Each child writes its result to a file** in its own fence: `proposal-<angle>.md`,
   `result-<id>.md`, or code in its own directory. The file is the result, and the wake is only
   the doorbell: `done: wrote proposal-tree.md`.
2. **The parent reads the files when the last sibling is done**, not after each wake. A wake that
   arrives while siblings are still running only ticks a counter. That saves a full read-and-think
   turn per child.
3. **The merge is one job.** Either the parent does it or it asks one `fork_self`: "merge these
   three files into one page". The fork already has the brief in its context from the cache, so it
   only pays to read the three files. The parent stays free to answer messages while the fork writes.
A sub-mastermind reports **one screen upward**, never its children's raw output. Each level
shrinks what it passes up, so the top reads three screens rather than nine.

## 3. Timing

- **Lost today:** a mastermind that spawns three and then reads each wake the moment it lands
  spends three full turns re-reading context. That is roughly 20–40 s each at Opus (a guess, from
  the 2026-09-19 latency runs). Batch-on-last-sibling saves two of the three: **about 40–80 s per
  fan-out**, and more at depth 2.
- **Lost today:** nothing stops a runaway. One uncapped mastermind that spawns 3×3 Opus agents
  is nine sessions at roughly $1–3 each, found out only afterwards. The budget check turns that
  into a refusal at spawn time, costing **0 s**.
- **Parallel win:** three angles side by side take as long as the slowest one, not all three
  added up — for this task's three proposals roughly **10 min → 4 min** (a guess).

## 4. The picture

```
                 ┌───────────────────────┐
     budget ↓    │  mastermind (depth 0)  │   ↑ $ tree total, ↑ one-screen report
                 └──┬─────────┬────────┬──┘
          $2 ↓      │   $2 ↓  │  $1 ↓  │          ↑ "done: wrote proposal-*.md"
          ┌─────────▼┐  ┌─────▼────┐ ┌─▼────────┐
          │ sub-MM A │  │ sub-MM B │ │ sub-MM C │   (depth 1, ≤2 children each)
          └──┬────┬──┘  └────┬─────┘ └────┬─────┘
             ▼    ▼          ▼            ▼
          minion minion    minion       minion      (depth 2, ≤1 fork each)
             │                                       depth 4 = refused
          fork_self
```
Arrows pointing down carry `budget_usd` and `max_children`. Arrows pointing up carry cost sums and
wakes. Each box is a registry row with a `parent` pointer, and the whole picture is `registry.json`.

## 5. What to build next

1. **The spawn guard:** `depth`, `max_children` and `budget_usd` checked in the `spawn_agent`
   handler and written to the registry row. About 40 lines in `tools.js` + `registry.js`. It stops
   the runaway before anything else.
2. **`spent(id)` and the budget interrupt:** walk the registry after each `result`, interrupt the
   subtree and wake the ancestor. About 40 lines in `Agents.js`.
3. **The tree view on the AI board:** indent by `parent`, show own `$` and tree `$`, from `/agents`.

## 6. What NOT to do

- **Don't let a child set its own depth or budget.** Servex computes depth, and a budget can only
  shrink on the way down. Otherwise one confused prompt recurses until the money runs out.
- **Don't have children append to the parent's `task.jsonl`, or to the same file as a sibling.**
  One writer per ledger and one fence per child, so results merge by reading files, never by
  resolving conflicts.
- **Don't pass children's full output up the tree.** Each level summarizes to one screen and links
  the files. Otherwise the top mastermind's context fills with nine minions' transcripts.
