verdict: fix
1. [fix] The core/Task readme doesn't mention the new `Task.steps.js` or `Task.steps.test.mjs`, and doesn't say that `TaskView` now accepts `subject`. Item's and List's readmes both name their steps files (Item readme line 90, List readme line 48), so Task's should too (docs gap, Law 9). See `worktree/test-view:public/framework/core/Task/readme.md`, "render() and TaskView".
2. [fix] `ux/Content/Object/doc/default-view.md` "how it stays live" is now out of date. It doesn't describe the two behaviours this diff adds to `DefaultView.update`: a list created after the view was drawn now gets its own row, and a new row lands before the lists. A fresh agent would have to read the diff to learn this (docs gap). See `DefaultView.js` lines 278 and 292 in the diff.
3. [note] Step text often wraps to 2–3 lines per step, so the "one line of text per step, at most" ask (requirements 5) is only partly met. The `// the X button` comments push the code past one line at 1920. See `shots/view-Task-1920.png`, steps column: "Add two subtasks", "Finish one" and "Finish the last" each take 2 code lines.
4. [note] The tally breaks a file path in the middle of the name, "Item.steps.te / st.mjs" (wrapping). See `shots/…-Test-view/1920.png`, steps column, the tally line. Put the path in a `code` element on its own line, or shorten it.
5. [note] The click path presses buttons that the test view makes itself ("Start", "Done: The CSS"). It doesn't press TaskView's real row buttons. Requirement 3 is met as written ("a click calls a verb"), but the comment in `Task.steps.js` calls them "the buttons a task row has", which overstates it.
6. [note] In the Lines column, steps that wrote nothing still get a full card (Create, Save, Replay: "0 lines"), each about 70px of empty space (spacing). See `shots/…-Test-view/1920.png`, right column.
7. [note] `Task.clock` is pinned in step 1 and only cleared in the Replay step. If an earlier step throws, the global clock stays pinned for the rest of the page (and the node process). Clearing it in a `finally` inside `Steps.all`, or giving the test an "after" hook, would make it safe.
8. [note] Both pages log one 404 for a missing resource (`layout.json` errors at both widths). It shows on /framework/core/Test/ as well, so it probably comes from before this diff, but nobody has named it.

Widths given: 400 and 1920 for /framework/core/Test/ and /framework/core/Test/view/, plus the builder's own view-Item/List/Task shots at 400 and 1920.

## Requirements
- 1 "One test, two places, the same code" — yes — `core/Test/Steps.js` runs the `X.steps.js` arrays. `node Task.steps.test.mjs` prints PASS (7 checks) and `node Item.steps.test.mjs` prints PASS (6 checks), both run in the worktree. The view page imports the same arrays. Build C's step format is reused, and `run_steps` now hands off to Steps.
- 2 "The browser run is synchronous and steppable" — yes — `TestView.attached()` waits for `app.ready` and for the view to be on the page, and each step waits for one painted frame. `?step` stops at `debugger` after each step. Next step and Run all buttons are at `shots/view-Task-1920.png`, steps column, row 2.
- 3 "Both creation paths in one test" — yes — `t.click` presses a real button, and the Replay step rebuilds the object from the saved lines. `t.same` compares data and the drawn view text (the `.store` row left out). The shots show `fix` and `copy` drawn one under the other.
- 4 "Do it for Item, List and Task" — yes — Item 6/6, List 7/7, Task 7/7 (the tally in each shot). Task needed no new runner code. The fixes went into `DefaultView` and `TaskView`, not the runner.
- 5 "Look at it: 1920 and 400 … one line of text per step" — partly — both widths were shot. Steps wrap to 2–3 lines (finding 3).
- Class page with live instances (Steps, TestView) — yes, in effect — /framework/core/Test/view/ is a live Steps run: its `at`, its results and every Item it holds are drawn. TestView is the page itself.
- Fences — yes — the diff doesn't touch `Item.js`, `Store.js` or `List.js`. The branch is `worktree/test-view` at ea8fa024f, locked and not merged.
- Fresh agent from the folder alone — mostly — `session.jsonl` has the branch, commits, checks and shots, and `build/files.jsonl` and `plan.md` index the task. The doc gaps are findings 1–2.

## Page structure
- page 1 (the title says what it is) — yes — `…-Test-view/1920.png`, top band: "Watch a test run".
- page 2 (one takeaway) — yes — pick a class, watch the steps pass, and see the objects and lines beside them.
- page 3 (reachable from its parent) — yes — the Test page has `children: "view"` and a "Watch a test run" link in its first band (`…-Test/1920.png`, band 2, share 0.09). The sidebar lists "Test view" under Test.
- page 4 (most important first) — yes — the class picker and controls come first, then the steps, the objects and the lines.

## Navigation
- navigation 1 — a sidebar (1920), a bottom rail (400), and a three-button class picker that works like tabs.
- tabs: the picker has 1 row at both widths, the current class is filled with the prime colour, and `?test=` keeps it across a reload — yes — `…-Test-view/400.png` and `1920.png`, top band. `tab_rows 0` because it isn't a page-tabs strip.
- sidebar/rail — yes — standard shell, unchanged by this diff.
- sheet, modal, full screen — n/a

## Layout
- layout 1 (the layout fits the content) — yes — three columns at 1920 (steps | objects | lines), one column at 400. `layout: standard` at both.
- layout 2 (nothing overflows) — yes — `overflow_x false` at 400 and 1920.
- layout 3 (the narrow view keeps the essentials near the top) — yes — at 400 only the step that just ran shows, so the objects start at about y 400 (`…-Test-view/400.png`).

## Sizing
- sizing 1 (column widths suit their content) — yes — `minmax(18em,1fr) / 22em / 20em`. The widest text is 420px at 1920, which is the title.
- sizing 2 (empty share is reasonable) — yes — `empty 0.519` at 1920 and 0.411 at 400. The test band takes most of the height (share 0.823 at 1920, 1.496 at 400, so the page scrolls on a phone, which is expected).

## Wrapping
- wrapping 1 (nothing wraps that shouldn't) — no — the file path in the tally breaks mid-name (finding 4), and step code wraps to 2–3 lines (finding 3).
- wrapping 2 (`layout.json` wraps) — yes — the only wraps listed are shell buttons (`drawer-rail-ai`, `mode-btn`), not from this diff.

## Spacing and padding
- spacing 1 (left edge lines up) — yes — `left_stack` h1 and p are both 16 at 400 and both 54 at 1920.
- spacing 2 (gaps are even) — yes — `var(--gap)` between columns, and 0.4em between steps.
- spacing 3 (no wasted space) — no, minor — the cards for steps with 0 lines are empty (finding 6).

## Colour and contrast
- colour 1 (tokens, not raw colours) — yes — `--prime`, `--subtle`, `--green` and `--red`, each with a fallback.
- colour 2 (contrast is readable) — yes — the pass ticks are green and the muted text is subtle grey on white. In `view-Task-1920.png` the whole `fix` tree and the Done buttons are still peach from the flash highlight; the text on it stays readable.
- colour 3 (state isn't shown by colour alone) — yes — ✓ and ✗ markers come with their colour.

## Flow
- flow 1 (reads in order) — yes — choose, run, the steps tick, the objects change, the lines appear.
- flow 2 (each step shows before the next) — yes — one painted frame plus 150ms per step in Run all.

## Words
- content 1 (plain words) — yes — "The objects, live", "Lines written", and "Nothing yet: step 1 makes the first object."
- content 2 (one line per step) — partly — finding 3.
- content 3 (the readme explains it) — yes for core/Test (the new "One test, node and the browser" bullet). No for core/Task and the DefaultView doc (findings 1–2).
