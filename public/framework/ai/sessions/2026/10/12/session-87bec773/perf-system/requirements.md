# Performance: a home in the Code system, batched DOM updates, and condensing thousands of sessions (brief)

**Owner (2026-10-12, dictated):** "part of our code system should be about performance." We have thousands of items on the Sessions page.

## Done when (tick each with proof)
- [ ] **Past work first** (`past-work` skill): perf tasks, `server-perf`, `sessions-perf`, and @mastermind-data-grid's `sessions-perf/` numbers.
- [ ] **`code/performance/`:** readme plus `doc/`, linked from the Code system page. The challenges named in one line each with numbers: thousands of rows, evented properties, repaints, live streams.
- [ ] **Batched updates, measured:**
  - The owner's view: the virtual DOM is mostly about not repainting once per change. So buffer: loop through all updates, then paint once, like a debounce.
  - The owner's idea to test: clone the container (e.g. the grid), swap the clone in as a placeholder, update the 1,000 detached rows, swap back, for one paint.
  - Compare it against plain batching (one sync loop with no layout reads in between, a `DocumentFragment`, `requestAnimationFrame` coalescing).
  - A small benchmark page with paint and layout counts. Recommend one helper; land it only if it wins.
- [ ] **Condense the sessions:** many of the ~6,000 are redundant (for example, quick-fix or helper runs). Group them into buckets, each with its own index and totals, so a change recomputes one bucket, not thousands of rows.
  - Indexes from several angles: by task, by system, by role.
  - Decide whether an item can sit in more than one bucket, and how totals avoid double counting.
  - Don't delete anything; hide or roll up instead.
  - Measure the load and recompute time before and after.
- [ ] Coordinate with @mastermind-data-grid (it owns the grid and Sessions adoption: hand it the helper and the bucket index, don't fork it) and @mastermind-page-templates (lazy evented properties).
- [ ] Smoke clean; commit each step; merge.

Sonnet 5.5, Haiku for scans. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open.
