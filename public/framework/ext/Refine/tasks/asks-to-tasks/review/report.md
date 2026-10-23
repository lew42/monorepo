verdict: fix
1. [fix] All 232 page shots are a 404 "Page Load Error", so none of the new task pages could be checked. The new task folders exist only in the worktree `task/asks-to-tasks` (`C:/Code/lew42/worktrees/asks-to-tasks`), and the shots were taken from the main site. Every layout.json has `widest_text_sample` "404 — nothing matches …" at 1200, and `shots/…AIDashboard-tasks-make-the-dashboard-more-compact/sheet.png` shows the error at all four widths. Re-shoot the pages after the merge, or from a server running the worktree.
2. [fix] The sort pass filed the same ask twice as two tasks: `ui/icon/tasks/explore-icon-size-matched-to-title-size/` and `ui/icon/tasks/explore-icon-sizing-that-matches-the-tit/` both ask for icon size matched to title size. The owner gets one Approve per duplicate. Before the 233 proposals reach the owner, merge proposals with the same wording in the same module.
3. [note] The written notes repeat each other. `styles/doc/notes-from-asks.md` has two "version two is built beside the current site" lines and two "token set stays minimal and reused everywhere" lines (Words: one point once).
4. [note] Task titles are cut off mid-phrase with "…", for example "Explore icon size matched to title size and icon position relative to text in…". A title should be a whole short sentence (Words).
5. [note] Four "Develop a YouTube content idea on …" tasks were filed under `ai/tasks/`. They are not framework work. The `ai` module is acting as a catch-all here; closing them or giving them a non-framework home would fit the owner's asks better.

Widths given: 400, 1200, 1920, 3440 for each of the 232 pages. All of them show the 404 page, so every page system below is answered `not measured`.

## Requirements
- 1 "A live proposal with no module_hint gets a default home" — yes — `PromptTasks.sweep()` now takes the module from `module_hint`, else from `module_of(file_hint)`. With neither, the task stays in its session record, documented in `core/Session/doc/prompt-tasks.md` step 7. `accepted()` also lets approved idle tasks move.
- 2 "One Haiku pass over the backlog: still wanted → task, done/obsolete → closed with a reason, a note → a line in its module readme" — yes, with defects — the worktree `ai/asks/undone.json` totals are done 70 + tasked 498 + closed 467 + noted 132 = 1167, with undone 0, unroutable 0 and `agree` true. The notes landed as readme lines and `notes-from-asks.md` files. The defects are the duplicate tasks (finding 2) and the duplicate notes (finding 3).
- Crack 2 in `core/Task/doc/cracks.md` updated with the before and after numbers — yes — the row is marked closed and says "233 proposals wait for your Approve".
## Page structure
- not measured — every shot is the 404 page (finding 1)
## Navigation
- not measured — 404 page
## Layout
- not measured — 404 page
## Sizing
- not measured — 404 page
## Wrapping
- not measured — 404 page (layout.json wraps only cover the error page's h1)
## Spacing and padding
- not measured — 404 page
## Colour and contrast
- not measured — 404 page
## Flow
- not measured — 404 page
## Words
- Plain, full sentences in the docs — yes — the prompt-tasks.md step 7 and asks/readme.md additions read clearly
- Each point said once — no — duplicate notes in `styles/doc/notes-from-asks.md` (finding 3)
- Titles say what the thing is — partly — titles are cut off with "…" (finding 4)
- Links to the owner's words — yes — every note ends with "(your words)" linking to its session line
