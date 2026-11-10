# core/List: `add()` of an item another list owns makes a Ref

Budget: $3. Load the `minion` skill first, then the `code` skill.

**The ask.** voice-app relayed it on 2026-11-09, under the owner's rule: "make the best decision you can, as long as it's not destructive." Audit item 15, F7: when `list.add(x)` gets an `x` that a *different* list already holds, it adds a Ref to `x` instead of re-parenting it. The census says no caller relies on the move. The owner's sign-off, which the 11-02 note was waiting for, is this decision.

**Read first:**
- `public/framework/core/Item/doc/ref.md`, the section "Made by `List.ref()` and `Chat.resurface`", where the 11-02 rewording explains why `add()` was left unchanged.
- `public/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-model/plan.md`, decision 2 (lines 18–35). It has the census of every caller.
- `public/framework/core/List/List.js:286` (`add`) and `:319-330` (`ref`).

## Build (worktree: `take_worktree`, or `node Server/worktree-up.mjs list-add-ref`)

1. **Re-check the census on today's code.** It was taken 2026-11-02. Run `git grep -n -E "\.add\(|\.adopt\(|adopt_slot\(" -- public/framework Servex ':!*/sessions/*' ':!*/old/*' ':!*/archive/*'`. Look for any caller that passes an item that is already parented and *relies on it moving*: the first list losing it, or `x.parent` changing. Log the count and every such caller in your task log. If one does rely on it, switch that caller to `x.move_to(dest)` first, which is the real move. If that is not safe, stop and log why.
2. **In `List.add`:** when `x` is an Item whose `parent` is a List other than `this` (and not a Ref), `return this.ref(x)`. Keep these unchanged:
   - an item with no parent;
   - an item already in this same list (today's behaviour);
   - a plain object;
   - the replay/quiet path (`insert`, line ~234). Loading must never turn into Refs.
   - `move_to`, which must still move. Check that `move_to` does not go through `add()` with the item still parented; if it does, detach first so it still moves.
3. **Tests, in `public/framework/core/List/List.test.mjs`:**
   - adding an item owned by list A to list B gives a Ref in B, A still holds the item, and `x.parent` is still A;
   - the same thing across two files gives a Ref with `url`;
   - adding an unparented item is unchanged;
   - `move_to` still moves.
   Run every test that touches List/Item/Ref/Chat/Session: `node Server/test.mjs --changed` (or the core/Test readme's command). Every one must pass. Compare against the main tree's pass count before your change.
4. **Docs, in the same commit:**
   - `core/Item/doc/ref.md` and `core/List/readme.md:91`: say `add()` now makes a Ref for an owned item (2026-11-09, decided under the owner's rule), and that `ref()` stays as the explicit form. Keep the 11-02 paragraph as history; one line saying it is superseded is enough.
   - `chat-model/plan.md` decision 2: add one line saying it was done.
5. Commit by exact path in the worktree. Run `node Server/smoke.mjs` against your worktree server: no FAIL. Do not merge; the mastermind merges.

**Fence:** core/List/List.js, List.test.mjs, core/Item/doc/ref.md, core/List/readme.md, that plan.md line, and any caller you must switch to `move_to` (log each one). **Not** core/Item/Item.js, core/Item/Store.js or core/Page/*: mastermind-live-page is editing those now. If you need a change there, stop and log it.

Never kill or restart the dev server or Servex. Never drive the owner's tabs. Never `git stash`. rg is not installed; use `git grep`.

## Report

Write `{"log": …}` lines on your task (`list-add-ref` in the session `/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/`) through the item tool. Then reply in under eight lines: the census count, the callers changed, test counts before and after, the worktree, and the commit.
