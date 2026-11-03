verdict: fix
1. [fix] Clicking a column header no longer sorts the grid. `sort_rows: rows => rows` (SessionTasksGrid.js, the `new DataGrid` options) replaces DataGrid's own `sort_rows` (ext/DataGrid/DataGrid.js:267), which is the only code that sorts, so the comment "a header click still re-sorts" is false. DataGrid's default already returns the rows untouched when no sort is set, so the simple fix is to delete that line.
2. [fix] The new CSS prefix `stg-` (SessionTasksGrid.css) is not registered in `public/framework/styles/css-scopes.txt`. `stl-` is there (line 272) and `stg` is not. The new-css-class rule (/framework/code/css/doc/rules.md#5) requires the entry.
3. [note] The tab shows its count twice: "135 tasks" in the grid's own head row and "135 rows" in DataGrid's bar below it, with a tall gap between the two rows (after-1920.png and after-390.png, the band above the table). One count is enough, either by hiding `.stg .datagrid-count` or by dropping `$count`. The Table/Rail toggle also appears, but the brief asked for one table, and Rail was never shown working.
4. [note] At 390 the Day cell wraps to "2026- / 10-25" and Kind wraps to "agent / task" (after-390.png, table band). Both rows double in height. Wider columns, or `white-space: nowrap` on those two cells, would keep each row to one line, and the box already scrolls sideways.
5. [note] after-1920.png ends at the table header, so no grid row appears at desktop width. The row check rests on after-390.png, after-day.png and the numbers in proof-out.json (135 = 135 = 21+34+28+19+2+31, scrollWidth 390, 0 page errors). Those numbers do meet the proof the brief asked for.
6. [note] "Live" works only as far as SessionWork itself is live. `on_paint` fires on load and when an approval changes (SessionWork.js:49), and the tree from ai/index.json is read once. A task created after the page opens appears in neither view until a reload. That matches the brief ("the same feed SessionWork gets"), but it is worth knowing.
7. [note] plan.md "2d. Tasks" does not link this task folder (`tasks/requirements.md`), while 2a links `overview/requirements.md`. The parent session.jsonl does index the folder. The brief asked for the findings in `task.jsonl`, but they are in this folder's `session.jsonl`. They are complete: kind derived and logged with its distinct values, Approve kept behind a Nested chip, and the three counts.

## Requirements
- 1 "A grid of tasks … title, state, day, kind, owning session (linked), cost, newest first" — yes — SessionTasksGrid.js columns. rows_of sorts by started, newest first, and walks the same subtree SessionWork paints (135 = 135).
- 2 "Filters state · day · kind, reuse the Timeline's Filters ▾" — yes — it uses SessionPopover.open with `stl-menu`/`stl-filter`. proof-out.json `menu` lists only the six days that have tasks.
- 3 "Kind: prove what exists, derive if absent, log it" — yes — the decision line in session.jsonl lists the index.json keys and the derived values (agent task 97, project 18, task 20).
- 4 "Keep Approve; Nested chip" — yes — `nest()` swaps in the SessionWork element, and the choice is logged.
- 5 "Live through the same feed, set_rows keeps sort and filters" — partly — set_rows is used, but the identity `sort_rows` override breaks header sorting (finding 1).
- 6 "Phone: page scrollWidth 390" — yes — proof-out.json `sw` 390 at 390, and `.stg .datagrid-ext` has `overflow-x: auto`.
- Class page for a new class with live instances — n/a — SessionTasksGrid is a view and holds no state the owner would watch.
- Docs current — yes — AISession/readme.md line 10 and sessions/doc/ui/classes.md both name SessionTasksGrid. One gap: the css-scopes entry (finding 2).

## Words
- Labels plain — yes — "Filters ▾", "Nested", "Task", "Session", "this session"; the button titles explain what they do.
- Counts read once — no — "135 tasks" and "135 rows" both show (finding 3).
