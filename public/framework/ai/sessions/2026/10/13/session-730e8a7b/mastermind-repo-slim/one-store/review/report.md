verdict: fix
1. [fix] Asks 3–7 are not in this diff (requirements 3–7): `public/framework/ai/2026-10-12/` and `2026-10-13/` are still on disk, and there is no tree decision, no readme pattern, no owner note and no card report. `ai/readme.md` line 3 still says "one folder per day". This diff is step 2 of 7, so the task cannot land on it.
2. [fix] `ai/page.js:115` sends every `/framework/ai/<day>/<slug>/` without its own page.js to `StoreFolder.lookup`, and drops the `AITask` fallback. The 2026-10-12 tasks still sit in the flat folder until step 3, so if this merges first their pages depend on the `tasks` query index finding them. On the static site that index does not exist, so they show "not in the index". Either merge only together with step 3, or keep `AITask` when the old folder still exists.
3. [note] Step 2 asked for proof "on a private Servex from a worktree"; it was proved with stub calls instead (`Start.scaffold` in a scratch repo, `TaskDirs.test.mjs`). The `decision` line in task.jsonl records why and names the alternative, so this is acceptable, but it is not what the brief said.
4. [note] Small code leftovers: `Start.js` declares `day` and never uses it. `crawl.mjs:352` has its `;` inside the trailing comment. `CardAnswer.js` keeps an empty `{ … }` block from the old inner loop. `merge.mjs` repeats `TaskDirs.locate` inline instead of calling it (law 6, one of everything).
5. [note] `TaskDirs.refuse` only guards `append.mjs`. A script that calls `fs.mkdirSync` directly is caught only by the `--census` regex, which is a heuristic. The audit doc says so, and that is honest.

Widths given: 400, 1200, 1920, 3440 for `/framework/ai/`. The diff does not change this page's layout (only the routing of unknown day urls), so the layout answers below describe the page as it is today, not regressions.

## Requirements
- 1 "Mistake audit, one screen" — yes — doc/why-the-day-folder-came-back.md names the writers with file:line, who ran them and when, why 10-12 missed them (three reasons), and the one change (`TaskDirs.refuse` + `--census`)
- 2 "Fix the writers… every path goes through TaskDirs" — yes, partly — diff: Start.js, council.mjs, crawl.mjs and on-landing.mjs now use `TaskDirs.dir/make/find`; Servex.js, Sessions.js and Cards.js were cleared by the census (task.jsonl decision 17:56); the private-Servex test was swapped for stub tests (finding 3)
- 3 "Move the two flat day folders into the store… --undo proven once" — no — both folders are still on disk (`ls public/framework/ai/20*-*-*`); only the run-scoped `--undo/--verify` in TaskMove.mjs landed, which is groundwork for this step
- 4 "One tree, the decision… DRY-RUN manifest and relink count" — no — not in the diff; only `one-tree-census.mjs` was started (task.jsonl 17:59)
- 5 "The pattern in the readme… three skill lines" — no — `ai/readme.md` still opens "one folder per day"; no skill lines in the diff
- 6 "Owner note (kind decision)" — no — not posted yet
- 7 "Report on your card" — no — not yet
- "I don't like having that date directory right in the AI folder" (owner) — no — still there; the guard stops new ones

## Page structure
- page 1 — yes — shots/…/1920.png: the title "AI" with the Inbox tab active says what the page is
- the rest — n/a — the diff changes no page structure

## Navigation
- navigation 1 — tabs (Inbox · Dashboard · Log · System · Sessions · Tests), a left sidebar, a bottom rail at 400
- tabs wrap — no — tab_rows 2 at 400 (1 at 1200, 1920 and 3440); this predates the diff
- back/reload — yes — the diff keeps old urls answering: `TaskDirs.redirect` and `StoreFolder.lookup` use `location.replace`, so the back button skips the hop

## Layout
- columns fill the screen — no — empty 0.62 at 3440 (0.43 at 1920); the Live columns leave a wide right gutter in shots/…/3440.png; this predates the diff
- the rest — n/a — unchanged

## Sizing
- nothing overflows — yes — overflow_x false at all four widths
- a too-wide line of text — no — widest_text 3796 to 4580 at 1200 and up (a single unwrapped line, probably the processes/storage line); this predates the diff

## Wrapping
- wraps that shouldn't — no — drawer-rail-ai and drawer-rail-menu break to 3.2 lines at 400; mode-btn and drawer-menu to about 1.8 at 1200 and up; this predates the diff

## Spacing and padding
- h1 left stack — yes — 14 / 19 / 33 / 54 px at 400 / 1200 / 1920 / 3440 grows with the width
- big empty bands — n/a — no band is marked big_empty

## Colour and contrast
- n/a — the diff changes no colour; the shots match the current theme

## Flow
- bands in order — yes — at 1920: head 0.035, live section 0.176, run column 1.63, tasks 0.30, assistant 0.04; the running work comes first

## Words
- audit doc in plain sentences — yes — doc/why-the-day-folder-came-back.md: one screen, a table, three numbered reasons, one fix
- the refuse message names the right place — yes — TaskDirs.mjs `refuse()`: it gives the `--new <slug>` command, the store path and a link to the why-doc
- the AI readme states the one tree — no — readme.md line 3 is stale ("one folder per day") (requirement 5)
- `StoreFolder.lookup` fallback text — yes — "<slug> is not in the index; the <day> tasks are in the sessions store →", a link
