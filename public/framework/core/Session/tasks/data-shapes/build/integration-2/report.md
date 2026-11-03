# Integration 2: all nine data-shapes builds on one branch, fixed and tested together (not merged)

**Branch:** `integration/data-shapes-2` · **worktree:** `C:/Code/lew42/worktrees/data-shapes-2` (locked) · **site:** http://data-shapes-2.localhost/ (port 53219)

## Tests

The full node suite, `node public/framework/core/Test/TestRunner.mjs`, run with the live Servex blocked off (`RECORD_ENTRY` at a dead port):

| | passed | failed |
|---|---|---|
| michael/dev (3f18c92cf) | 158 of 161 | 3: `jsonl-schema`, `PromptLines`, `layers` |
| this branch | 172 of 174 | 2: `jsonl-schema`, `PromptLines` (both fail on michael/dev too) |

No new failures. After each merge: [proof/tests.txt](proof/tests.txt). One break showed up at merge 5 (`Servex/ProcessRunner.test.mjs` still expected title-slug ids); it failed on `worktree/item-generic` alone too, and was fixed.

## Merges (the cross-review's order, all clean)

1. `integration/data-shapes` (A, B, C) · 2. `worktree/deprecate` (G) · 3. `worktree/test-view` (H) · 4. `worktree/browser-refs` (E) · 5. `worktree/item-generic` (I with D) · 6. `worktree/worktree-preview` (F). No tip was a "worktree closed" commit.

## Fixes (one commit each)

- **One id maker:** `Item.new_id()` returns `short_id()`; Page keeps its own. `cd08130d0`
- **One path walker:** the item tool asks `root.get(path)` once; `member()` only for old id-only hops. `4abb2ae48`
- **`item.move_to(dest)`, the one move verb:** a List moves it inside the file (Refs re-path); `{url, path}` leaves `{moved_to}` at the old place. The handoff (`move_item`) writes that forward after its reference. `6f9177729`, plus `f66776eef`: a forward that leads back to the same item is arrival (the browser's reference child is the moved task itself; without this the row said "gone: the forwards loop").
- **The default view redraws on `"read"`**, so an agent's change shows. `b6a4e0f54`
- **The two duplicates:** the state-icon map is RefView's, TaskView uses it (`01679e306`); the same-title rule was already one (`Task.same_title`, `affb90aed` on item-generic).
- **Build F's `task.jsonl` lines go through the one writer** (`RecordWriter.write` in `Server/on-landing.mjs`). `a8648224e`
- **What integration broke:** `ProcessRunner.test` (`3ba91f824`); smoke's text-touching-box on the default view and ClassDoc (`221db2908`); two stale Doc member names that failed smoke's console budget and would refuse the merge (`848c4fb3d`).

## The seven checks

| Check | Result | Proof |
|---|---|---|
| Full suite against michael/dev | no new failures (above) | [tests.txt](proof/tests.txt), [tests-final.txt](proof/tests-final.txt) |
| Two-tab page edit, this worktree's server | add, edit, move = exactly 3 lines, one per change. The add and the move show once in both tabs; the edit shows only at the next list change (here, the move), the same on michael/dev. Same with the old Servex (it stubs a worktree page, the tab falls back to its dev server) and with this branch's entry point (3 posts) | [twotab-old.txt](proof/twotab-old.txt), [twotab-new.txt](proof/twotab-new.txt) |
| A hook with the entry point down | refused: 73 ms, 1 line; stalled: 3,064 ms, 1 line | [hook.txt](proof/hook.txt) |
| Default view redraws on an item-tool change | the agent's title change shows; with the `"read"` listener stubbed out it stays stale | [default-view-read.txt](proof/default-view-read.txt) |
| Handoff while a parent shows the task through a Ref | follows the move and takes the new address, never gone | [handoff.txt](proof/handoff.txt) |
| One Ref object with the item tool's live root | one object while warm; after the 1,000-file cap drops it, an existing Ref is stale until it resolves again (documented in core/Item doc/ref.md; nothing resolves Refs in node today) | [oneref.txt](proof/oneref.txt) |
| Long voice session while lines stream | v-sq8y7db (8,360 lines, 664 task rows), 40 chat lines at 4 a second: 40 list redraws, median 94 ms. Cheaper than michael/dev, which also replays the whole record per batch (+130 ms), but not cheap: filed on core/Session's improvements | [voice.txt](proof/voice.txt), [replaycost.txt](proof/replaycost.txt) |
| Smoke on Item, List, Test view (Task), session-e00f55c9 | the four pages and 54 of their links ok; 1 followed link fails (a child session page: the old JSONL viewer's unknown verbs, the same on michael/dev) | [smoke.txt](proof/smoke.txt) |

## To merge (the owner's one decision)

1. From the main tree: `MSYS_NO_PATHCONV=1 node Server/merge.mjs C:/Code/lew42/worktrees/data-shapes-2 --review-dir public/framework/core/Session/tasks/data-shapes/build/integration-2` (`--review-dir`: this task sits under core/Session, outside the dated session folders the review gate scans). The dry run passes the review gate and every file merges cleanly ([merge-dry-run.txt](proof/merge-dry-run.txt)); smoke on all 11 changed pages and their links: 60 ok, 0 fail ([smoke-changed-pages.txt](proof/smoke-changed-pages.txt)). The shots the gate reads sit in `shots/` in the worktree (gitignored), so merge from this worktree.
2. Then, never during a voice call: `node Servex/sustain.mjs --restart` (it waits while agents work), and restart the dev server (Servex `restart_server`, project monorepo), because build D changed `Append.js`.
3. Straight after, the two-tab check: open /framework/core/Page/tool/ in two tabs; in one, add a part, edit it, move it. The page's `page.jsonl` should gain exactly one line per change, and the other tab show the add and the move once each. The edited text shows only after the move: that is michael/dev's behaviour today, not a regression.

**Known gaps the merge brings with it** (none is new breakage):
- A long session page redraws its whole task list on every streamed line (v-sq8y7db: median 94 ms each, long tasks up to 376 ms while dictating). It is cheaper than michael/dev today; the fix is filed on core/Session's improvements.
- A part's edited text redraws only at the next list change (the same on michael/dev).

The worktree's dev server keeps adding `"gone"` lines to `files.jsonl` listings (files a worktree never has, such as `usage.json`). They are noise: never committed on this branch, and reverted before each commit.

## Left, with reasons

- `Ref.lookup` is a third, partial path walker (cross-review finding 4); not in the plan's list.
- The session task list redraws on every streamed batch (above); filed, not built.
- A part's text edit does not redraw the part until the list changes; the same on michael/dev.
- `Server/review.mjs` took no screenshots: run from a worktree, its shots folder (inside the worktree) was refused by `OutPath` ("output must be inside the repo", the main checkout). The reviewer took its own two. Logged for Server.

## Review

A fresh Opus read the combined diff: [review/report.md](review/report.md), verdict fix, 5 fixes and 4 notes, each answered in the task log.
