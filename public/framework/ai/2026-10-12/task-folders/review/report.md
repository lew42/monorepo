verdict: pass
1. [note] The diff shows `public/framework/ai/doc/task-folders.md` as deleted. The decision doc was committed in the main tree (fb3f98bff) and never on the branch, so this is how a two-dot diff displays it; a three-way merge keeps the file. Check after the merge that `/framework/ai/doc/task-folders.md` still loads (Requirements 1).
2. [note] Moving the old folders, rewriting the links, the crawl, the Servex restart and telling the other masterminds have not happened yet. STATE.md lists them as ⬜, after this code merges. This diff is the code step only, so they are not failures here (Requirements 3–5).
3. [note] `AITask.has()` and `StoreFolder.moved()` use synchronous XHR. Each folder hop in `route()` waits on one blocking HEAD, so a deep store URL costs one round-trip per level. It works, but it is a seam to stream or cache later (code).
4. [note] The diff also carries `2026-10-12/data-grid/*` STATE and requirements files, which belong to another task. They are harmless, but make sure the merge does not overwrite that task's newer lines.
5. [note] At 400, the drawer-rail buttons "✦AI" and "⋯More" wrap to 3.2 lines (layout.json wraps). This was already there before the diff, which does not touch them (wrapping).

Widths given: 400, 1200, 1920, 3440 of `/framework/ai/` (sheet.png).

## Requirements
- 1 "Past asks first … into `ai/doc/task-folders.md`; settle conflicts; decide … Record the alternative" — yes — the doc (main tree, fb3f98bff) has the decision, the rejected `ai/tasks/YYYY/MM/DD/` alternative, and a history table from 09-24 to 10-12 that settles the 10-10 `task/` naming conflict
- 2 "New writes go to the new place … One path helper (a class) that every writer uses" — yes — `class TaskDirs` (`Server/TaskDirs.mjs`: `dir/make/normalize/list/find/follow/redirect`). It is used by `new-task` (`--new <slug>`), `finish-task` (`--day`), `append.mjs` (follows old paths), Servex `Agents.js` (`normalize`), `Worktrees.js`, `asks/tasks.js`, `ai2-overview.mjs` (`list`), and the dashboard routes (`StoreFolder`)
- 3 "Move the old ones by script … dry run, manifest … old URLs redirect" — partly — the redirects are built (`TaskDirs.redirect`, `StoreFolder.moved/redirect`, the `ai/page.js` route) and the move-log format is set (`task-moves.jsonl`), but `TaskMove.mjs` and the move itself are still ⬜ in STATE.md
- 4 "Smoke clean; crawl 0 new 404s; hold.mjs; Servex restart on a private port; merge" — not yet — STATE.md ⬜; the redirect was proven headless on private port 3112 (STATE.md)
- 5 "Coordinate: tell running masterminds … before the move" — not yet — it comes before the move, which is ⬜

## Page structure
- page 1 — yes — shots/…/1920.png: the "AI" title and the Inbox/Dashboard/Log/System tabs say what the page is; the diff changes no visible content
- page structure, other — yes — the layout matches the ai2 board as before; the only change to this page is a shorter `children:` list (day folders now route in `route()`)

## Navigation
- nav 1 — tabs (top), a sidebar (page tree), a bottom bar (assistant)
- tabs fit one row — yes — layout.json tab_rows 1 at every width
- back/reload — yes — old day and task URLs get `location.replace` to the new store URL, so back does not loop; every store folder has its own path URL (`StoreFolder` routes by path)
- sidebar — yes — the tree is unchanged; the 37 day folders are gone from `children:`, so they no longer clutter it

## Layout
- layout — yes — the ai2 board has a centre column and a live rail; it is unchanged by this diff (sheet.png)

## Sizing
- sizing — yes — overflow_x false at all four widths; empty 0.41/0.38/0.46/0.61. The empty space at 3440 is the existing board's, not this diff's

## Wrapping
- wrapping — no (pre-existing) — at 400, drawer-rail-ai and drawer-rail-menu wrap 3.2 lines; at 1200, mode-btn 1.7 lines (layout.json wraps). Not introduced by the diff

## Spacing and padding
- spacing — yes — h1 left_stack 14/19/33 px across 400/1200/1920, from doc-well only; nothing changed

## Colour and contrast
- colour — n/a

## Flow
- flow — yes — bands run back, then full, then the assistant bar, top to bottom (layout.json bands); unchanged

## Words
- words 1 — yes — the doc and the skill edits use plain sentences ("Never type the path: `node Server/TaskDirs.mjs --new <slug>` makes it and prints it")
- words 2 — yes — the readme's line for the sessions store names the new home in one line and links `../doc/task-folders.md` as a file path
- words 3 — note — the `TaskDirs.mjs` header comment runs about 12 lines; CLAUDE.md says comments should be one line or a pointer to a doc, and most of it is already in `ai/doc/task-folders.md`
