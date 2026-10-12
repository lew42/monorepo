verdict: fix
1. [fix] The Today page shows none of the owner's prompts ("all the prompts from today should go into that card"). In my own headless shot of /framework/ai/sessions/2026/10/04/ at 1200, it reads "No prompts logged for this day yet." Two reasons in `day-prompts.js`. First, `readPrompt()` keeps only the LAST Prompt in a session: `session-60d9def6` (in the 2026/10/03 folder) holds 66 owner prompts, so 65 are dropped. Second, `sessionsFor(date)` walks only the folder of the day the session started, but all 66 of those prompts are stamped 2026-10-04, so they show on neither day. The day should be read by each prompt's own `ts`, every Prompt in a session should be kept, and the search should cover the session folders of the day before as well.
2. [fix] Deliverable 3, "a confidence 0–1 per sentence → section in `structure()`", was not built. The diff never touches `ext/Refine/structure.js`. The "Check these" block lists `clean()`'s mishearing flags instead, which measure something different: how sure the model is that it heard a word right, not how sure it is that the sentence belongs in its section.
3. [fix] The dates break west of UTC. The Today card's corner says "Oct 3" above "Sunday, Oct 4", and Yesterday's says "Oct 2" above "Saturday, Oct 3" (shots/…-framework-ai/1920.png, pinned rows): the `at: "2026-10-04"` value is read as UTC midnight. `monthPage()` has the same bug, from `new Date(month + "-01")` and `new Date(d).getMonth()`: /framework/ai/2026-10/ would be titled "September 2026" and skip the 1st of the month. `todayStr()` uses the UTC date while the rail uses the local date, so after 7 pm Central the "next day" arrow links to tomorrow.
4. [fix] The prompts header wraps badly at 1200 (my headless shot). "Your prompts, refined" breaks onto 2 lines, "by time" and "by system" each break onto 2 lines, and "condense" is a large gray button. A stray "0" sits under "Proposed — 8 not started".
5. [note] Deliverable 2 asks for the day's cost, but at 1200 the page shows "Spend not computed yet — run node Server/day-spend.mjs 2026-10-04." The day summary reads cost but never produces it, so Today's card has no cost until someone runs that script.
6. [note] None of the given shots shows a page this diff builds: the day page, by-system or the month stub. They show /framework/ai/, the 2026 and 2026/09 folder pages, 2026/10/02, and five unrelated ai2 cards whose only change is `"gone"` file lines. The diff also carries about 1,600 `"gone"` lines in `2026/10/02/page.jsonl` and churn in many `files.jsonl` files that this task did not ask for.
7. [note] `ext/AITask/dashboard.js` now imports `mark_read` from `/framework/ai2/rules.js`, which means a module under `ext/` imports from a page folder. That goes against "imports flow down".
8. [note] An orphan doc comment ("A day's own tasks…") now sits above `addDays`, and the same comment repeats above `dashboard()`. The by-system docblock sits directly above `monthPage`'s docblock, so each one reads as if it described the other function.

Widths given: 400, 1200, 1920 and 3440 for each of the nine pages. I added one headless shot of /framework/ai/sessions/2026/10/04/ at 1200, because no given shot shows the day page.

## Requirements
- 1 "a card on the AI dashboard called today and yesterday … a little navigation for focusing on a specific day" — partly — the pinned Today and Yesterday rows are there (1920.png, rail), and the day page has ‹ prev and next › arrows, each day with its own URL. But the dates on the cards are wrong (finding 3).
- 2 "all the prompts from today should go into that card in a refined way … total cost for each day accurately" — no — the page shows no prompts and no computed spend (my headless shot of the day page at 1200; findings 1 and 5).
- 3 "every sentence is accounted for … a weighting or a confidence interval … lower confidence would … trigger part of the review" — no — there is no confidence per sentence → section in `structure()` (finding 2). `day-prompts-refine.mjs` exists, chunks long prompts, and writes the same line Echo writes. 63 refined deltas sit in session-60d9def6, so the refining itself did run.
- 4 "making that yesterday card unread, if I haven't taken a look at it" — yes — Yesterday has the unread dot in 1920.png, its id carries the date, and `dashboard()` calls `mark_read` when the day page opens.
- 5 "a card for each month … calculate the cost that month" — partly — the stub route and the To-do line in the readme exist, but the month title and the month's day list are off by one (finding 3), and there is no month card in the rail (the brief allowed a stub).
- 6 Worktree, then check_page at 400 and 1920, then merge — yes — the shots come from a worktree server on port 56311.
## Page structure
- page 1 (the title says what it is) — no — the day page's title is the bare "2026-10-04", with no weekday and no "Today".
- page 2 (level 1 above the fold) — yes — at 1200 everything fits on one screen, but most of it is empty or placeholder lines.
- page 3 (most important first) — no — the tree link and the spend placeholder sit above the prompts, which the owner asked for first.
## Navigation
- nav 1 (techniques used) — pinned rail rows, prev/next links, text links for by time / by system.
- nav 2 (every view has its own URL) — yes — `<date>/`, `<date>/by-system/` and `<YYYY-MM>/` are all routes.
- nav 3 (links point where they say) — no — the rail's corner dates contradict the date under the card name (finding 3).
## Layout
- layout 1 — yes — at 1920 the inbox keeps its two-column layout, and layout.json shows `overflow_x` false at every width.
- layout 2 — no — at 1200 the day page's prompts header is a cramped flex row with columns broken inside it (finding 4).
## Sizing
- sizing 1 — yes — the pinned rows are the same height as Now and Your prompts (1920.png).
- sizing 2 — no — the "condense" button is about 60px tall, out of scale with the text links beside it (my 1200 shot).
## Wrapping
- wrap 1 — no — the header wraps at 1200: the title takes 2 lines and "by time" and "by system" each take 2 lines (my 1200 shot).
- wrap 2 — yes — in layout.json the only `wraps` entries are the drawer buttons ✦AI and ⋯More, which are there on every page before this change, not new.
## Spacing and padding
- spacing 1 — yes — the pinned rows share the Now card's padding (1920.png).
- spacing 2 — no — a stray "0" with no label sits below the Proposed band (my 1200 shot).
## Colour and contrast
- colour 1 — yes — Yesterday's unread dot uses the same accent colour as the other unread rows, and the muted text is readable.
## Flow
- flow 1 — no — the view links are a dash and dot-separated text, not a familiar tab pair, and condense sits beside them as a button.
## Words
- words 1 — no — "No prompts logged for this day yet" is false on a day with more than 66 owner prompts.
- words 2 — no — "Spend not computed yet — run node Server/day-spend.mjs" tells the owner to run a command; the work should run it instead.
- words 3 — yes — "Check these — low confidence" and "← back to <topic>" are plain words.
