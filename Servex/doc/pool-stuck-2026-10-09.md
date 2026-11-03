# Why no worktree was ever "ready" (2026-10-09)

**Symptom:** every spawn and `quick_fix` failed: "no quick-fix worktree is ready"; six minions waited a day for a pool worktree.

**Cause, in three steps:**
1. `remove()` never discards work. A slot holding changes was *forgotten* (taken out of `.worktree-pool.json`) but left on disk. Five were: `qf-2, 4, 5, 7, 8`.
2. Two more names (`qf-1`, `qf-3`) were unmerged leftover branches, and `qf-6`, `qf-9` were still "taken" by holders the agent registry had pruned (7 and 2 days). "Not a Servex agent" kept them held forever.
3. `free_id()` skips a name with a worktree on disk or an unmerged branch, so all nine names were gone, `prepare()` returned nothing, and no slot could ever become ready.

**Fix (`Servex/Pool.js`, test `Servex/pool-heal.test.mjs`):** every sweep runs `heal()`:
- `recycle_orphans()`: a `qf-N` worktree the pool forgot is salvaged (work committed to `salvage/qf-N-<date>`, never deleted) and removed; an unmerged leftover branch is renamed to `salvage/…`. A worktree an agent still works in is left alone.
- `held()`: a holder the registry does not know, for 12 h with nothing working in the slot, releases it (a dirty slot is still salvaged, not wiped).
- `watch_queue()`: a spawn waiting for a pool worktree over 10 min logs `ALERT pool: …` in the Servex log (event `pool-alert`).

**Also fixed:** `Bad log name` for agent ids over 64 characters: `Log.safe()` shortens them to 55 characters plus a hash.

Background: [pool.md](pool.md).
