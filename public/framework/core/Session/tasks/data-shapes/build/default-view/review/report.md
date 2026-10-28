verdict: fix
1. [fix] At phone width the watch page's note and the one step it shows disagree (requirements 4, "get it by clicking") — shots/5-steps-400.png, band 2: the note says "Both views of apple change…" (step 5, just run) but the only step shown is 6, `root.set({ title: "Weekly shop" })`, because `.is-focus` marks the *next* step. Show the step that just ran (or both) below 70em.
2. [fix] `ux/Content/Object/doc/shape.md` is stale: it still describes the old `object()` card (header from `name`/`path`/`url`, a methods list, "the class is Object.js"). `page.js` still lists it in `notes: "shape default-view"`, and the readme no longer links it. Mark it superseded, fold it into default-view.md, or drop it from `notes`.
3. [fix] Stale comments in callers that now get the default view: `ux/Dictate/playground/objects.js:9` cites `Object.js`'s `icon_name()`, which is gone; `ai/classes/Session/SessionClassPage.js:2` loads "the card styles `inspect()` uses", which no longer apply. Repoint both to `DefaultView.js`.
4. [note] The empty state is blank (requirements 4): before step 1, "The objects, live" and "Lines written" have nothing under them at every width (shots/…-core-Item-watch/1920.png, band 2; sheet.png). One muted line ("Press Next step to make the first object") would fill it.
5. [note] Log group headers count the "no line written" note as a line: step 1 reads "1 line · 0 ms" over "no line written" (shots/9-all-1920.png, right column, first card). The same happens on step 4.
6. [note] At 1200 the three columns are about 290px each (shots/…-Item-watch/1200.png): every step's code wraps to 2–3 lines, and the four buttons wrap to two rows (also at 1920). Below about 90em, a two-column grid (steps | objects, with lines under them) would read better.
7. [note] On the Object page the open `Page` class view is a wall of about 20 field names plus 34 methods (shots/…-ux-Content-Object/1920.png, right column), while the App and This-page columns end at about 480px. Open it with `properties`/`method_names` capped, or closed. The App row's name is empty: it has only `{}` and the "App" label.
8. [note] The fence and coupling: build B edited `core/Item/Item.js` (2-line `views` getter; the decision is logged in session.jsonl). `ScratchStore` overrides Store's private `_queue`/`_flushing`, and the core test `DefaultView.test.js` imports the demo's `core/Item/watch/Box.js`. Build A may change any of these, so expect a merge conflict.
9. [note] A view built and never attached stays in `item.views` forever (it is only dropped once it was seen connected). This is documented in the readme's Watch out, but it is a slow leak for views built off-screen.
10. [note] Show the class and its live instances: Box instances are on the watch page, but no page lists live DefaultView instances or an item's `views`. Low priority: a DefaultView holds little state the owner would watch.

## Requirements
Widths given: 400, 1200, 1920 and 3440 for five pages, plus the builder's own 400/1920 step shots (0-start, 5-steps, 9-all).
- 1 "F5: merge into ONE default view, old entry points re-exported and marked deprecated" — yes — diff: Object.js and Inspect.js are about 17-line wrappers onto `view(x,{open:1})`, marked ⚠ Deprecated; InstanceTree is kept with a stated reason (default-view.md)
- 2 "collapsed: icon, id, class name as a small label, counts" — yes — shots/9-all-1920.png: `root "Weekly shop"  [Box] 2 items`
- 3 "open on click: data by type; Item/List nests lazily; a reference shows where it points" — yes — 9-all-1920.png: `.title "Weekly shop"`, `.items` nests, `.store → ScratchStore scratch.jsonl`, `.parent → Box fruit`; `build()` runs on toggle
- 4 "live: subscribes to delta, redraws only the row that changed, no flicker" — yes — 5-steps-400.png: only `.count` is flashed; DefaultView.test.js "a set rewrites its row / and leaves the others alone", "without redrawing the others"
- 5 "`views`, an array (ask 33): two places at once, a change updates both" — yes — Item.js `get views()`; step 4/5 and test "the second view changes too"
- 6 "`List.render()` draws each member through its own view" — no (fenced) — List.js belongs to build A; the request is logged in backbone/session.jsonl line 13, and `view(list)` does it today. Accepted under the fence.
- 7 "live demo under core/Item, linked from the Item readme: build a tree step by step, save to a scratch Store, replay; a log beside it" — yes — core/Item/watch/, readme More line, a 9-step ScratchStore replay with "✓ The same tree"
- 8 "get it by clicking, one line per step" — partly — one line per step, yes; at 400 the note and the shown step disagree (finding 1)
- 9 "screenshots at 1920 and phone width, headless" — yes — shots/0-start, 5-steps, 9-all at 400/1920
- ask 44 "one core test, every creation pathway, drawn on screen" — partly — 16 checks shown on the watch page, plus a replay pathway compared by JSON; no UI-click pathway (out of scope for B)
- Class with live instances page — no — finding 10 (note)
- Docs: is anything stale or unindexed? — yes, stale — shape.md and two caller comments (findings 2, 3); new files are indexed (Item readme lists `watch/`, the Object readme indexes DefaultView.css/test, css-scopes has `core-item-`)
- Could a fresh agent continue from the task folder? — yes — session.jsonl has the worktree, branch, server url, 3 decisions with alternatives, the commits and the shots

## Page structure
- page 1 (title says what it is) — yes — Item-watch/1920.png: "Watch a tree being built"
- page 2 (one takeaway) — yes — steps → objects → lines
- page 3 (most important first) — yes — the buttons and steps sit at the top left
- Object page structure — yes — Content-Object/1920.png: one intro paragraph and a link to the watch page

## Navigation
- techniques — tabs (Item's tab bar gains WATCH), a sidebar
- tab rows — yes — layout.json tab_rows 1 on Item-watch, Item and Object at every width; Page-ai and ai/agents show tab_rows 6 at 1200+, which is the existing vertical side tabs, not this diff
- new page reachable — yes — Item tab bar and sidebar "Watch"; links from the Object page and code/objects readme

## Layout
- columns fit the content — partly — 3 columns at 1200 are cramped (finding 6); at 1920 they fit (9-all-1920.png)
- the phone stacks to one column — yes — 400.png; the step list collapses to the step in focus
- overflow — no overflow — layout.json overflow_x false on all pages and widths

## Sizing
- bands sized right — yes — Item-watch watch band share 0.73 at 1200 and 0.76 at 1920; the title is 0.05
- empty share — high at the start — empty 0.64/0.65/0.74 at 1200/1920/3440 before any step (finding 4)
- the Page class view is oversized — finding 7

## Wrapping
- unwanted wraps — some — the code wraps to 2–3 lines at 1200 and the buttons wrap to 2 rows at 1200/1920 (finding 6); the h1 wraps to 2 lines at 400 (layout.json, fine)
- tree rows — no wraps — values are cut with an ellipsis (DefaultView.css `.item-end` nowrap); 9-all-400.png

## Spacing and padding
- rhythm — yes — rows are evenly spaced (9-all-1920.png); the log cards keep the gap
- left stack — yes — layout.json left_stack h1/p 16 at 400 and 38 at 1200

## Colour and contrast
- the class label is quiet, never louder than the id — yes — `--fill-a08`/`--subtle` pill (9-all-1920.png)
- references read as links — yes — `--prime` "→ Box fruit"
- flash — yes — a prime wash at 30% that fades (5-steps-400.png, `.count`)
- muted text contrast — yes — `.title` values are readable at 400

## Flow
- each click shows its effect — yes — the note changes, the new row flashes and a log group is added (9-all-1920.png)
- Back / Start over — yes — they rebuild from step 1; the reason is in a Watch.js comment
- phone flow — partly — finding 1; the log is below the objects, so on a phone you scroll to see what a step wrote

## Words
- content 1 (plain, one line per step) — yes — Watch.steps notes are one sentence each
- content (accurate) — partly — "1 line" over "no line written" (finding 5)
- readmes in plain sentences — yes — Object readme intro, default-view.md "One view, not three"
- stale words — shape.md and two comments (findings 2, 3)
