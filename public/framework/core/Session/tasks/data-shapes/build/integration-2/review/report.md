verdict: fix
1. [fix] The two-tab check's "each change shown once" is not met for the edit, and report.md's table says it is. proof/twotab-new.txt and twotab-old.txt both give `edit: shown_in_B 0, shown_in_A 0`; the text only appears after the next move. The "Left" section admits it, but the table cell claims "each change shown once in both tabs". Make the table say "add and move shown once; an edit shows only at the next list change (same on michael/dev)", so the owner's post-merge two-tab check doesn't look like a regression.
2. [fix] The landing report isn't committed or indexed. `report.md` and `review/` are untracked (`git status`: `?? …/integration-2/report.md`), and the task's `files.jsonl` doesn't list `report.md`. The committed repo is the source of truth (law 5), and anything unindexed is forgotten (law 10). Commit both and add `{"file":"report.md"}`.
3. [fix] The worktree has 39 uncommitted `files.jsonl` edits that only add `"gone":true` lines (e.g. `public/framework/ai/files.jsonl`: usage.json, page-work.json, state.json … gone). They're dev-server listing noise: those files are gitignored and absent in a worktree. If they get swept into a commit or the merge, real listings on michael/dev get marked gone. Revert them (`git checkout -- '*files.jsonl'`, keeping the task's own `session.jsonl`) and say so in the merge note.
4. [fix] The voice check's "each redraw cheap" is not met: proof/voice.txt shows 40 redraws with median 94 ms and max 154 ms, plus long tasks up to 376 ms while streaming. report.md says this honestly and filed it on core/Session. It's still a "no" on an owner check, so the merge note should list it as a known gap. The new `"read"` listener also re-walks every DefaultView subject under the tree's top on each batch (`DefaultView.listen_read`), which adds to this cost on long session pages.
5. [fix] plan.md isn't updated with the outcome. Its integration-2 row (plan.md:119) still reads "spawned 22:13" and doesn't link to report.md or give the branch's state. A fresh agent starting from plan.md wouldn't learn that integration 2 landed, is ready to merge, or which gaps it left.
6. [note] `item.move_to({url, path})` doesn't move anything itself. It only sets the forward (Item.js `move_to`), and `move_item` in page_tools.js still does the file move, then calls `kid.move_to()` to build the forward line. The handoff does use it, as asked, but "one verb that moves, re-paths and forwards" holds only for a move inside a file (`move_to(list)`). Say this in the Item.move_to comment or in doc/ref.md.
7. [note] The arrival fix (`f66776eef`, Ref.settle `next === hit`) also treats a genuinely self-pointing forward (bad data) as arrival instead of an error. That's fine for now; worth one line in doc/ref.md's Forwards.
8. [note] `ux/Content/Object/doc/default-view.md` doesn't mention the `"read"` redraw. Only the readme's Watch out line has it.
9. [note] No shots were given. `shots/` is empty, although session.jsonl logs a shots line with 11 pages and widths 400/1200/1920/3440, and no layout.json exists. The page systems below are judged from two headless shots of my own (`/framework/core/Test/view/?test=Task` at 1200, `/framework/core/Item/` at 400). Every `[measured]` answer is `not measured`. This is a review.mjs fault to log; it is not this task's fault.

## Requirements
- 1 "A new worktree from michael/dev … then lock it" — yes — report.md: `C:/Code/lew42/worktrees/data-shapes-2` (locked), branch `integration/data-shapes-2`
- 2 "Merge in the cross-review's order, testing after each step" — yes — `git log`: fa4441ff1, dfc12512b, 5febf72bd, a2184fe9a, 3e7b91e34, ae47f29a5 in order; proof/tests.txt rows m1–m6
- 2 "Check each branch's tip first" — yes — report.md: "No tip was a 'worktree closed' commit"
- 3a "one id maker: new_id() returns short_id()" — yes — cd08130d0, Item.js `static new_id(){ return this.short_id(); }`
- 3b "one path walker: root.get(path) once, member() only for old id-only hops" — yes — 4abb2ae48 page_tools.js `walk()`; Ref.lookup is still a third walker, logged in report.md "Left"
- 3c "item.move_to(dest) … moves, re-paths, leaves a moved_to forward; the handoff uses it" — partly — 6f9177729: move_to(list) moves and re-paths; move_to({url}) only writes the forward; move_item uses it for the forward (finding 6)
- 3d "the default view also redraws on read" — yes — b6a4e0f54; proof/default-view-read.txt: title changes with the listener, stays stale without it
- 3e "the two duplicates" — yes — 01679e306 (TaskView.STAGE = RefView.STAGE); same-title already one (`Task.same_title`, affb90aed)
- 3f "build F's task.jsonl appends go through the one writer" — yes — a8648224e, on-landing.mjs `record()` → RecordWriter.write
- 4 "full node suite, no new failures" — yes — proof/tests-final.txt 172/174; the 2 failures (jsonl-schema, PromptLines) also fail on the base (tests.txt base 158/161)
- 4 "two-tab page edit, exactly one line per change, each change shown once" — no — one line per change yes (total_added 3), but the edit was shown 0 times (finding 1)
- 4 "a hook timed with the entry point down (≤ about 3 s, one line)" — yes — proof/hook.txt stalled 3064 ms, 1 line; refused 73 ms
- 4 "a task redrawing in the default view when the item tool changes it" — yes — proof/default-view-read.txt `with_after.root_title` renamed
- 4 "a handoff while the parent shows the task through a Ref (follows, never gone)" — yes — proof/handoff.txt `after_live.gone false`, new url
- 4 "one Ref object shared with the item tool's live root" — yes — proof/oneref.txt `one_object true`; the stale-after-cap case is documented in doc/ref.md (a6f813ae7)
- 4 "a long voice session page while lines stream (each redraw cheap)" — no — proof/voice.txt median 94 ms, long tasks to 376 ms (finding 4)
- 4 "smoke on Item, List, Test view (Task) and one session page with child sessions" — yes — proof/smoke.txt lines 25, 32, 36, 40 ok; one followed link fails (process-system, the same on michael/dev)
- 4 "Servex-side checks import this worktree's page_tools.js; never restart the live Servex" — yes — proof/handoff.mjs, oneref.mjs run in node; no restart in the log
- 5 "Keep the folder and its dev server up (locked), log the url" — yes — http://data-shapes-2.localhost/ answered my shots; url in report.md
- 6 "Land: branch and url, test counts, each fix with its commit, each check with its proof, one merge note" — yes, but not committed — report.md has every part (finding 2 for the untracked file)
- Fence "never merge into michael/dev" — yes — the branch is unmerged
- Class question (Item gains `move_to`, DefaultView gains `listen_read`): can you open a page that shows live instances? — yes — /framework/core/Item/ "A live one" (my shot, 400) and /framework/core/Test/view/ "The objects, live"

## Page structure
- page 1 (title says what it is) — yes — my shot Test view 1200: "Watch a test run"; Item 400: "{} Item"
- page 2 (one takeaway, first screen) — yes — Test view: steps on the left, the live object on the right
- rest — n/a — the diff changes only padding on existing pages, no structure

## Navigation
- navigation 1 (identify) — a sidebar, tabs (Item: Overview · Methods · Live list · Watch · Dated), a bottom rail at 400
- tabs fit — no — Item at 400: the tab row clips "DATE…" at the right edge; it's a scroll strip and was there before this diff (note only)
- rest — n/a

## Layout
- columns fit the content — yes — Test view 1200: steps column ~360 px, live tree wider; both full
- not measured (no layout.json)

## Sizing
- sized to content — yes — Item 400 cards fill the width; step code blocks hug their text
- not measured

## Wrapping
- nothing wraps that shouldn't — yes, mostly — Test view 1200: step code wraps (`store.attach(fix); fix.set({ title: "Fix the tab bar" })` on two lines) inside a ~340 px column; acceptable for code
- not measured

## Spacing and padding
- text never touches its box — yes — 221db2908 adds padding to the class chip, change wash and step number; Test view 1200 chips ("Task", "TaskList") have room
- the wash doesn't move the row — yes — negative margin matches the padding (DefaultView.css)

## Colour and contrast
- contrast holds — yes — Test view 1200: the salmon change wash under dark mono text stays readable; orange `→ ScratchStore` link is lighter but legible
- one meaning per colour — yes — the wash marks what changed, and only that

## Flow
- top to bottom, the reader's order — yes — Test view: choose a test → steps → objects → "Lines written"
- n/a otherwise

## Words
- content 1 (says what it is first) — yes — report.md headline names the branch and that it isn't merged
- content 2 (plain words, no undefined jargon) — mostly — "warm", "cold", "the cap" in the oneref row need the doc/ref.md link to make sense (they have it)
- content 3 (claims match the proof) — no — the two-tab row overstates (finding 1)
- commit messages give a reason — yes — each fix commit names its cross-review finding
