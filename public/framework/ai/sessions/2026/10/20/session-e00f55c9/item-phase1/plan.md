# Plan: Item/List, finish Phase 1

Brief: [requirements.md](requirements.md). Design: [phase-1.md](/framework/research/2026/10/29/persistence-sync/design/phase-1.md). Specs: T1, T2, T5, T6 in [object-model.md](/framework/research/2026/10/29/persistence-sync/persistence-sync/lessons/object-model.md), R4 in [sync-protocol.md](/framework/research/2026/10/29/persistence-sync/persistence-sync/lessons/sync-protocol.md).

Worktree `C:\Code\lew42\worktrees\item-phase1` (branch `worktree/item-phase1`), one merge per item. Baseline for `ReplayCompare`: the main tree (`michael/dev`).

1. **`unset`** — `Item.unset(...keys)` deletes data keys and saves `{"unset":["k"]}` (`unset()` when marked lines are on); `set({k: undefined})` becomes an unset; a key never set writes nothing. Hooks (`set_<key>`) are not run by unset (alternative: run the hook with `undefined`; not taken, a hook's own save would write a junk `{"set":{}}`). `Task.replay_line` reads a top-level `unset`.
2. **Unknown bare key warning** — warn, never refuse; the key is still stored, so replays stay identical (T6).
   - Warns on a List key that is no member and carries a plain object.
   - Warns on a key under a list hop that is a plain object and names no method, field, child or data.
   - Counted in `Item.unknown_keys`, printed in node only (as `old_hops`): a browser warning would fail the merge smoke.
3. **`source` + `batch()`** — `Store.flush` merges the queued data lines (`set`/`unset`) that name the same item into one line; a verb line on that item, its ancestor or descendant closes the merge (order kept). `item.batch(fn)` holds the store's flush until `fn` (sync or async) ends. Every `change` event gets a last argument `{source: "local" | "replay" | "remote"}`.
4. **`reset`/`epoch` + gap check** — minion `minion-item-reset`, brief [reset-epoch/requirements.md](reset-epoch/requirements.md), worktree `item-reset`.
5. **Typing coalesce** — in the browser only, a lone data line is held (300 ms idle, 2 s max) and replaced in place by the next set of the same keys; flushed early by any other line, `focusout`, `pagehide`/hidden. Off in node (`Store.coalesce = null`), so tests that wait one tick keep working.
