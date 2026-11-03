verdict: fix
1. [fix] Asks 3 and 4 say "re-path refs on a move" and "a forward on a move across files", but nothing that moves an item calls `Ref.repath` or `Ref.forward` (List.move, the item tool's `move`, `Server/TaskDirs.mjs`). Only the tests call them by hand (`core/Item/Ref.test.mjs:321`, `:346`, `:364`). `core/Item/doc/ref.md` "Backlinks" and "Forwards" read as if a move does this already. Either wire them into the move path or say plainly in doc/ref.md, under each heading, "not called by any mover yet; plan step 4 wires it", so a fresh agent knows what is left.
2. [note] `Item.open` caches `store.rooting` and `Store.open` caches `store.opening` (diff `core/Item/Item.js:13`, `core/Item/Store.js:466-470`). A rejected first open (for example the dev server restarting mid-fetch) is cached for good, so every later open of that url fails until the page reloads. Clearing the promise on a rejection would fix it.
3. [note] Each line a child file reads makes every Ref watching that root run `settle()` and emit `"target"` again, even when nothing changed (`Ref.js` `watch`/`found`). That is 100 RefView redraws, and then `SessionTasks.follow` redraws the whole box 200 ms later anyway. It was measured fast (7 to 19 ms), but only emitting when the target or its title or state changed would halve the work.
4. [note] The demo goes round in a circle. `SessionTasks.child_refs` lists each row from the child stub's own `c._tasks` (which `Task.open_ref` already keeps live), and the Ref then resolves back to that same object, because `Item.open` returns `store.host`. The row would be just as live without the Ref. This proves the wiring, not that a Ref alone keeps a row live. The Ref test covers the standalone path, but not the live tail.
5. [note] The "where" half repeats one long child title on every row: "AI system: task resolution model, where task…" eight times in `doc/live-after-1920.png`. At 400 (`doc/live-after-400.png`) it is a small orange link above every title. Grouping the rows under one child-session heading would drop seven of the eight repeats.
6. [note] Ask 3 says the backlinks are "built during replay". They are built by one walk on first ask instead. The builder recorded this as a decision, with the alternative (session.jsonl, `doc/ref.md` "Decided"), so it is a fair call, not a miss.
7. [note] `review/diff.patch` is older than branch HEAD `f03ecf489`, which removed `Ref.resolver`/`open_sync` and reworded doc/ref.md's Node paragraph. I reviewed HEAD for those lines. Regenerate the patch before landing.

## Requirements
- 1 "The browser resolves a reference to another file … lazy … live … gone row … node path keeps working" — yes — Ref.test 24/24 (run here); live seen in `doc/live-before-1920.png` vs `doc/live-after-1920.png` (the "LIVE …" row); gone row in `doc/gone-1920.png`; `Task.resolver` untouched
- 2 "An id fallback … index built on the first miss and never saved" — yes — Ref.test section 2 (`tasks.t1.tasks.t3` finds t3; file unchanged)
- 3 "Backlinks in memory … re-path refs on a move" — partly — `Ref.shown`/`Ref.repath` work and are tested; built by a walk, not during replay (finding 6); no move calls repath (finding 1)
- 4 "A forward on a move across files" — partly — followed (loop-safe, one line written), but no mover writes it (finding 1)
- 5 "On a real session page … session › task, live … 1920 and 400" — yes — session-e00f55c9, `doc/*-1920.png`, `doc/*-400.png`
- 6 "Tests for each of the four, through a real Store and real files" — yes — `core/Item/Ref.test.mjs`, temp files served over http
- New class, live instances page — no — no page lists live Refs; they hold no state the owner would watch (an address plus a resolved target), so it is a note, not a fix
- Fences — yes — no session-shape change (Refs are in memory only), not merged, task folder indexed in `build/files.jsonl`

## Page structure
- Shots given: doc/ live-before, live-after and gone at 1920 and 400 (no review.mjs `shots/` folder). The page is the existing session page; this diff adds one block to it.
## Navigation
- techniques: tabs (the existing page); the new block is a `<details>` with "+ N more" — no change to navigation
## Layout
- yes — one row per Ref under the own tasks, in the existing column (`live-after-1920.png`, middle band)
## Sizing
- yes — "where" is capped at 24em with an ellipsis; the title fills the rest (`live-after-1920.png`)
## Wrapping
- yes — at 400 it stacks where over what, and the title clamps to two lines (`live-after-400.png`)
## Spacing and padding
- yes — the rows match the existing session-task rhythm; the gone row is aligned with them (`gone-1920.png`)
## Colour and contrast
- yes — "where" at .75 opacity, the gone row in italic with a link_off icon; it is readable in both shots
## Flow
- note — the repeated "where" (finding 5)
## Words
- yes — "In child sessions · 100 open", "+ 92 more", and "gone: nothing at "tasks.no-such-task" in /…/process-system/" are plain and say what happened
