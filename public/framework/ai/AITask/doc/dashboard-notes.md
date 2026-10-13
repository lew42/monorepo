# dashboard.js — history and design notes

## File overview
The day dashboard and the ai index rail, over the same rows. A task directory speaks through its files: requirements.md alone is PROPOSED, a manifest with no landed_at is RUNNING, landed_at is LANDED. Enumeration comes from the dev server's directory manifest (declared children on static hosting); a NEW task dir arrives when that manifest rebuilds, while appends to a log already on the board stream in over the socket.

## manifest() and caching behavior
task.jsonl is the log-native manifest; session.json the legacy snapshot. `files` is the directory listing when we have one — a blind fetch would 404 the console. `live` (a redraw callback) streams the log instead of fetching it once.

Per-day file listing, from directory.json. Two tiers: warm() (async, fired at module-eval time by ai/page.js and ai/sessions/2026/08/17/page.js, plus again by dashboard()) usually wins the race for an in-app click. A COLD deep link — the owner opening a task url straight in VS Code's Simple Browser — has no head start at all, so route() cannot just guess: has_page_js() below blocks with ONE synchronous XHR the first time it's asked cold, before warm() has landed, answers correctly, and every later call (same date) reuses the cached value. The block is a small same-origin JSON file, once, only on a cold task nav — never on a click from an already-warm day page.

## Performance: directory.json reload history
A NEW TASK DIR USED TO RELOAD THIS PAGE, and that was 203 of the 215 reloads an /framework/ai/ tab took on 2026-09-22 — every file any agent created anywhere under public/ rebuilds directory.json, this board fetched it, and a fetched path counted as stale. It is DATA: the dev socket now says `data` instead of reloading (dev/Socket/Socket.js), and these boards re-read the manifest in place.

## sync xhr in fetch_sync()
A blocking GET, same-origin, tiny file — the one place this module trades a brief main-thread freeze for a synchronous answer, because route() must return NOW (Page.child() checks its result with a plain `if`, never awaits it — core/new/1's own deep/errors demo names returning a Promise here as a documented failure mode).

## timeline — history of a defect
The day's own log, newest first, BEHIND A CLICK and below the board. It was the page's header for one build (ai-board-fix) and that was the defect: twelve grey lines, every one naming a task, none of them a link, filling the whole first screen at 1440 before a single card. `ux-v1` read them AS the task list at every width and called the missing affordance the top `broken` finding. Each line is its task's link now, and the whole thing is one fold at the foot: the timeline is the day's receipt, not its answer. Outside the board's redraw — day.jsonl is history, and a reopened fold that snapped shut every time a running task appended would be its own defect.

## Timezone traps in addDays() and todayStr()
Never use `new Date("2026-10-04")` + `setDate()` — that parses as UTC midnight but mutates in the BROWSER's own timezone, which is a day off for anyone west of it. The previous version read `new Date().toISOString()`, the UTC day, which disagreed with `addDays()`'s own meaning after 7pm Central and showed tomorrow's arrow a day early (review, 2026-10-04).

## Timezone in monthPage()
The local 3-argument `Date(year, monthIndex, day)` constructor, never `new Date("2026-10-01")` — that string form parses as UTC midnight, so west of UTC this showed "September 2026" for October, and day 1 along with it — the exact bug `addDays()`'s own doc comment already warns against, just hit a second time in this same file (review, 2026-10-04).

## Deliverables
day_nav: deliverable 1, "a little navigation for focusing on a specific day"
monthPage: deliverable 5, "a stub only — title + month cost total". Sums whichever days of the month already have a `spend.json` (`Server/day-spend.mjs`, same two-currency numbers the day page itself reads — never recomputed here, law 7); a day with no file yet is silently skipped, and the total says so. Moving a multi-day task's own page under this path is a To-do, not built here — see `public/framework/ai/readme.md`.

## active_strip and rail
What is running right now, above everything else — and `rail()` subtracts these rows from the spine below, so a task is listed once. These few logs re-read through `live()`, so their bars and `now` lines move in place and a task that lands drops out of the strip on its next append; every other task on the board stays on `all_tasks()`'s fetch.

## rail() — design: "the archive is not an answer"
The ai index — what is running right now, the usage windows, then the HIGHLIGHTS: the work worth going back to, newest first, one card each.

It used to end with `dated()` — every task of every day, 572 rows on one page. That is the archive, and an archive is not an answer: the owner came here to find the controls study they asked for weeks ago and could not. The whole spine moved to `/framework/ai/log/` (`log_board()` below), which this page names in one line, and the front now holds only what a reader scans in ten seconds. `compose()` — start work from the board — went with it: starting work is a working action, and the log is the working surface. Returns the element synchronously (catalog's previews() has no time to await) and fills it inside a callback, which re-establishes the captor the first await dropped.

## merge_usage()
openrouter-usage.json (Servex/ext/openrouter/provider.js's spend guard): the same {utilization:{limits:[...]}} shape usage.json already carries, just one more entry — merged in here so usage_rail() draws both the Claude windows and OpenRouter spend as ONE list of meters, never a second rail. Missing file (OpenRouter never used, or Servex not running) is silent: `json()` already returns null for a 404.

## paged()
The spine, a page at a time. `shown` lives in this closure only: a refresh starts over at 40, which is the honest default for a log nobody asked to keep a place in. `dated()` re-sorts what it is given, so the slice has to be sorted FIRST or page two would draw rows page one already showed.

## log_board()
Everything, in-flight first, then newest first, `PAGE` at a time. The same rows the front used to end with, and the same compose box: this is the working surface the board always was.

## mark_read()
The localStorage key and function here duplicate ai2/rules.js's own `mark_read()` (review, 2026-10-04: importing that function instead would pull a module under `ext/` from a PAGE folder, backwards — "imports flow down"). Six lines, duplicated on purpose rather than imported, same choice `engine.js`'s own top comment makes for the same reason.
