verdict: pass
1. [note] The hold applies to every data line in a browser, not just typing (`core/Item/Store.js` `typing()`).
   - A single `set()` from a click now reaches the file up to 300 ms later.
   - A button that sets a field and asks an agent to read the file at once could see old state.
   - No caller waits on `store.pending` or `flush()`, so nothing breaks today.
   - Alternative, recorded in `doc/batch.md` Caveat: send the first keystroke at once.
2. [note] On page hide, typing is flushed through `end_typing()`, which queues the flush on a microtask. `send_held()` instead calls `flush()` synchronously (`Store.js` `listen_for_hide`). Both should run before unload, but making `flush_typing` call `flush()` directly, as `send_held` does, would put both on the same path that the batch review fix already chose.
3. [note] The first test is titled "ten keystrokes" but types "hello there", which is 11 (`coalesce.test.mjs:30`). `doc/batch.md` correctly says 11.
4. [note] `batch.test.mjs` sets `Store.coalesce = null` for the whole module and never restores it. That's fine while each test file opens as its own page. If two files ever share one browser page, the setting leaks into the second one.

## Requirements
- 5 "Merging keystrokes while typing" — yes. `Store.typing`/`end_typing` with `focusout`, idle and max timers, and "any other line" in `append()`.
  - `coalesce.test.mjs` in the worktree: 5/5 pass, including "blur sends at once".
- 5 "a failing test first" — yes. Commit 5856ad568 says "11 keystrokes saved 11 lines" before the fix da0e1d5fe.
- 6 "ReplayCompare … identical; then run-all" — yes. The session.jsonl gate line for merge 5 reports 4048/4048 identical. `batch.test.mjs` still passes 6/6 after the change, which I re-ran.
- 7 "Update core/doc/status.md and the Item/List readmes" — yes. The status row and Next-steps item 4 are struck through and linked. `core/Item/readme.md` has a feature line and a test link, and `doc/batch.md` has a "Typing" section with its caveat and the alternative.
- Fences — yes. Worktree only (`worktree/item-phase1`); `Store.marked_lines` is untouched; no on-disk migration.
- Class page for new state — n/a. No new class. `Store.typists` is a static Set like `Store.holders`.

## Words
- content — yes. The `doc/batch.md` Typing section opens with the plain problem ("each one used to be a saved line"), lists when the line is sent, and names the caveat and the alternative not taken.
- index — yes. `coalesce.test.mjs` is linked from the readme's test list, and `run-all` picks it up by glob. Nothing new is unindexed.
- stale — no stale text found. Phase-1 design §11 (`store.coalesce = {idle: 300, max: 2000}`) matches what was built, except that it is now a static on Store.
- continuation — yes. `plan.md` item 5 and the session.jsonl gate lines are enough for a fresh agent to land merge 5.

Widths: none (no page changed; a light review).
