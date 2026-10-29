# Cross-review: the nine build branches fit together, with one real break (build I's ids)

All seven branches merge cleanly onto `michael/dev`, in any order. But with all of them in, two tests that pass today fail, both because of build I. Read-only review, 2026-10-28 ~20:10. Build I was still committing; its head here is `b2649a4aa`.

**How it was checked.** `git merge-tree` (writes no files) for every branch in two orders: no conflicts in either. Then the fully merged tree was extracted to a temp folder, and the node tests of the touched modules were run on it (125) and on `integration/data-shapes` alone (118). The live Servex was blocked off (`RECORD_ENTRY` pointed at a dead port), so nothing was written to the live repo.

| | merged tree | integration alone |
|---|---|---|
| tests run | 125 (118 shared, plus 7 new ones, all passing) | 118 |
| failing | 10 | 8 (the same 8 also fail in the merged tree; my temp folder has no git) |
| new failures | **2, both build I's**: `core/Item/persistence.test.mjs`, `Server/AskIndex-tasks.test.mjs` | — |

## Findings, most important first

1. **Build I breaks two tests that pass today** (confirmed: they fail on `worktree/item-generic` alone and pass on D). Build I changed ids: a string add now gets 8 random characters instead of a slug of its title (`core/Task/Task.js:64`). Two older tests still look a task up by its slug: `persistence.test.mjs:152,157` adds "First" and then removes `"first"`, and `AskIndex-tasks.test.mjs:28` expects `make-the-mic-dot-bigger`. Only the tests are stale; no live code was found looking up a task's id by its title (`Task.slug` is now used only for folder names). → **Fix both tests on build I before integration 2.**
2. **Don't merge build D without build I.** On D alone, a browser `page.jsonl` line that Servex's own copy of the page cannot apply is refused, so the click is lost. I fixed that (`page_tools.js:1103`, commit `dcace4b9e`). I is built on D, so merging I brings D with it: merge them as one step.
3. **Two id makers** (goes against "short random ids"): `Item.short_id()` (`Item.js:361`) is used only by string adds and the item tool. Every other new Item still gets a 36-character UUID from `Item.js:43` → `new_id()` (`Item.js:357`), for example `tasks.add({title})` with an object, or a `new Ref(...)`. → Make `new_id()` return `short_id()` (Page keeps its own `new_id`). Also, the comment at `page_tools.js:518` is now stale: a browser add no longer gets the same id as the slug.
4. **Two path walkers** (goes against "each level's `get` takes the rest of the path"): `Item.get` hands the rest of a dotted path to the next level (`Item.js:233`, from A). The item tool splits the whole path into single hops first (`page_tools.js:936-944`, from I), so a class whose `get` reads the rest its own way is skipped by the tool. A third, partial walker is `Ref.lookup` (`Ref.js:96`). → The tool's `walk` should call `root.get(path)` once and fall back to `member()` only for old id-only hops.
5. **`item.move_to` is built nowhere.** E built the pieces: `List.move` re-paths Refs, and `Ref.forward` (`Ref.js:152`) writes a forward. But the one mover across files, `move_item` (the handoff in `page_tools.js`), writes no forward. E's own commit says so: "no mover writes a forward yet". So after a handoff, a Ref to the old place shows "gone". → `item.move_to(dest)` becomes the one verb: move, re-path, forward. It is needed before F2.
6. **Two live-update signals.** E added a `"read"` event (`Store.js:117`) because `Task.replay_line` changes fields with `put()`, which sends no `"delta"`. B's `DefaultView` listens only for `"delta"` (`DefaultView.js:251`). So, likely: a task drawn in the default view does not redraw when an agent changes it. → Have DefaultView listen for `"read"` too. Integration 2 should test it (list below).
7. **Small duplicates** (law 6, one of everything):
   - the same-title rule is written twice: `page_tools.js:516` and `Improvements.js:23`;
   - the state-icon map is copied word for word: `RefView.js:11` and `TaskView.js:10`;
   - build F adds two more direct appends to `task.jsonl` (`on-landing.mjs:38`) that bypass build D's one writer. → Point them at `LogLine.raw`.
8. **Holding up:**
   - paths are written nested and never dotted (item-generic test 3);
   - there is no `SessionRef` anywhere;
   - views are never stored (Ref rows live only in memory);
   - backlinks are kept in memory and forwards go across files (E);
   - every one of G's 13 deprecation marks is still found by `Server/Deprecated.mjs` after the merge.

## The riskiest change for the live site

**Build D sends every browser page edit through Servex.** Before D, only task, session and improvements lines did; now `page.jsonl` does too (`RecordWriter.js:19`, `Store.js:196`). So every page edit made in a tab now depends on Servex being up and quick, and on Servex's own copy of the page accepting the line. D also has the hooks post to Servex on every record write (`ledger.mjs`). A stalled Servex costs each such hook up to 3 s (`RecordWriter.js:103`). These hook changes take effect the moment the merge lands, before any restart. An old Servex answers 400, and the hooks then fall back to writing the file themselves, which is safe.
**The check:** restart Servex and the dev server, then in one tab add, edit and move a part on a page. The file should gain exactly one line per change, and a second tab should show each change once. Then stop Servex, run one hook, and time it: it should take at most about 3 s and write one line.

## What integration 2 must test, beyond each branch's own tests

1. The full node suite on the merged tree against `michael/dev`, with no new failures (after finding 1).
2. The page-edit and hook check above, in both states: before the restart (old Servex) and after it.
3. A task open in a tab while an agent changes it through the item tool: does the default view redraw (finding 6)?
4. A handoff (`spawn_agent` with `task: {from, id}`) while the parent session page shows that task through a Ref: does it say "gone", or follow the move (finding 5)?
5. In Servex, a Ref resolved in node on a file the item tool also keeps live: is it one object, and still one after the 1,000-file cap drops it (`page_tools.js:770-774`; the cap deletes from the same `Store.instances` map)?
6. The session page of a long voice session while it is being dictated: E redraws the task list on every `"read"`, at most once per 200 ms. Is each redraw cheap?
7. `Server/smoke.mjs` on `/framework/core/Item/`, `/framework/core/List/`, `/framework/core/Test/view/?test=Task`, and one session page with child sessions.

## Merge order

All orders merge clean, so the order is chosen to keep risk low: lowest risk first, the tests after each step, so a failure points at the branch just merged.

1. `integration/data-shapes` (A, B and C; never separately)
2. `worktree/deprecate` (G: comments and docs only)
3. `worktree/test-view` (H: adds files, plus small step-file edits)
4. `worktree/browser-refs` (E)
5. `worktree/item-generic` (I, which contains D), with finding 1's two tests fixed first
6. `worktree/worktree-preview` (F: Servex only)
7. Then `node Servex/sustain.mjs --restart` and a dev-server restart (D changed `Append.js`), never during a voice call.

None of these branches has a leftover "worktree closed" commit: I reverted its `files.jsonl` noise in `b2649a4aa`.
