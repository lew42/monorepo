# Clear-win fixes, ranked

Ranked by value for the effort, cheapest data-loss fixes first. Effort: S = hours, M = a day or two, L = a week. Spec ids point to failing tests already written: **F#** in [storage-compaction](../persistence-sync/lessons/storage-compaction.md), **T#** in [object-model](../persistence-sync/lessons/object-model.md) §12, **R#** in [sync-protocol](../persistence-sync/lessons/sync-protocol.md) §8. Commit the failing test first, then the fix.

1. **Newline guard before every append.** Why: a half-written last line glues onto the next good line, and both are lost on every load. **S** · F5, F10
2. **Add a per-load client id to the twin key.** Why: two tabs writing in the same millisecond lose one edit, and that tab is still told "successful". The item tool's own stamps repeat too (the flaky one-writer test). **S** · R1 (interim)
3. **Keep a reader registered through a server restart.** Why: a page opened during a restart never updates again. **S** · R5
4. **One crash-safe rewrite helper: write tmp, fsync, rename.** Why: a rewrite killed mid-save leaves a 0-byte file (5 of 5 runs). **S** · F4
5. **`add` writes the envelope `{id, type, data, <lists>}`.** Why: an added item loses its child lists, and data named `after` or `type` breaks. The reader already accepts this shape. **S** · T3, T4
6. **`unset` verb.** Why: a cleared field comes back on reload. **S** · T5
7. **Warn on an unknown verb or a missing member, and never store it as data.** Why: an edit to a removed card poisons later edits of that id. **S** · T6
8. **App-level ping every 5 s.** Why: a half-open socket shows "connected" while edits vanish. **S** · R9
9. **Hold the lock (or go through Servex) for SessionConsolidate's rewrite.** Why: it loses appends that land during it (305 of 3,000 in a race test). **M** · F1
10. **`source` tag on every change: local, replay, remote.** Why: every open tab re-writes the same Ref re-path or task auto-complete. **M** · T1
11. **`batch(fn)`: one line per item touched.** Why: `wait()` writes 7 lines. **M** · T2
12. **Line numbers: `seq` + `epoch` + `{client, n}`, ack, retry, gap check.** Why: exactly-once writes, tabs that agree with the file, and a `reset` instead of mid-line bytes after a rewrite. **L** · R1, R2, R3, R4, R6, F8, F9

## Notes for later

- Cycle guard: `a.set("x", b); b.set("y", a)` overflows the stack. Only code can do this, not a line (gap 13).
- An `add` after a removed anchor goes to the end, and `order` drops unknown ids quietly. Both are by design; write them down.
- Concurrent drags can disagree until reload (the stale-move race). This is the reason to move to fractional positions in phase 5.
- Every item-tool write reads the whole log just to count lines (`size_of`). Fix it with the seq index in fix 12.
- About 1,810 old `{"at":…}` lines still replay through a compat branch. Migrate them by script, then delete the branch.
- Schema stamp: write the contract test once a second schema version exists.
- Doc drift: Item `doc/architecture.md` and the readme say `new_id()` makes a UUID, but the code makes `short_id()`.
- With Servex down, every hook stalls about 3 s before falling back.
- Pending writes are lost on a tab reload (in memory only). Persist them per tab if this happens in real use.
- Logs of 2.7–7.6 MB already exist. The snapshot line (F2, F6, F7) is phase 2.
