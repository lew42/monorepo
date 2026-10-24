verdict: fix
1. [fix] The brief says "no console errors", but layout.json `errors` lists a 404 "Failed to load resource" at both 400 and 1920. The diff does not say which URL it is; name it (or show it is unrelated, e.g. a favicon) before landing.
2. [note] one-dashboard.md still says "`TasksPage.js` is gone" in the same sentence that now says `/tasks/` draws `core/Task/TasksPage.js`. The two clauses contradict each other; drop the old clause.
3. [note] The brief asks for the decision and its alternative (Inbox forward vs TasksPage) to be recorded in the task log. The diff holds no log line, so I can't confirm it. Written in the task log, not seen here.
4. [note] At 400 the page is 24195px tall (254 items, band share 24.2), a very long scroll; at 1920 it is 7824px in three columns. It works but is heavy on mobile (shots/127-0-0-1-62182-tasks/400.png).
5. [note] A long row title, "document-all-the-moving-parts-of-the-sys", is cut mid-word at both widths (a slug used as a title). That is a data issue, not this diff.

Shots given: 400 and 1920 of /tasks/ (sheet.png first); no 1200 shot, though the brief asked for one. I judged from these two.

## Requirements
- 1 "smallest working fix; drop the forward for /tasks/ and draw TasksPage, change in that file only" — yes — the diff changes `public/tasks/page.jsonl` to class `/framework/core/Task/TasksPage.js`
- 2 "Update the test to prove tasks are listed (count of task rows > 0)" — yes — TasksPage.test.mjs now asserts `top.cls === "TasksPage"` and the row sum is above 0
- 3 "one-line note in one-dashboard.md if the forward changes" — yes, but see finding 2
- 4 "record the decision with its alternative in the task log" — not seen in the diff, see finding 3
- 5 "check_page shot of /tasks/ at 1200 showing task rows" — partly — shots show task rows at 400 and 1920, no 1200 shot
- 6 "no console errors" — no — layout.json errors: a 404 at 400 and at 1920
- 7 "check the other preset (`tasks`, /framework/ai/tasks/) still lands on a working list" — not shown, no evidence in the diff or shots
## Page structure
- Title says what the page is — yes — shots/…/1920.png, top band: "Tasks"
- One clear purpose — yes — the page is a grouped task list
- Content grouped by module headings — yes — folders ai, core/Task, ext/toc and others
## Navigation
- Techniques used: the site rail and a bottom rail at 400; the AI drawer at 1920. The page adds none of its own.
- Page-level tabs — n/a
## Layout
- yes — three columns at 1920 (sheet.png), one column at 400
## Sizing
- yes — rows fill their column; `overflow_x` false at both widths
## Wrapping
- yes, with a note — titles wrap to two or three lines at 400 (`widest_text` 307); layout.json `wraps` flags only the shell buttons (`drawer-rail-ai` 3.2 lines at 400). The "✦AI" and "☰Menu" labels wrap inside their buttons; this is shell chrome, not part of this diff.
## Spacing and padding
- yes — `empty` 0.43 at 400 and 0.41 at 1920; no `big_empty` band; the title band takes 0.04 to 0.05 of the page
## Colour and contrast
- yes — dark text on a white page; the done tick marks and row icons are readable (1920.png)
## Flow
- yes — title, then module groups in order; each group ends with "+N more open · +M done"
## Words
- yes, with a note — row titles are readable; the one slug title is finding 5
