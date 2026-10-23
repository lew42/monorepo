verdict: fix
1. [fix] Requirement 4 ("If the page can fail silently, make it show an error instead of Loading forever") is not in the diff. The change edits the test, the readme and one page.jsonl line. TasksPage.js and the Task.js replay path are untouched, so a throw in replay can still leave a page at "Loading" (diff.patch, whole).
2. [fix] The test was rewritten to match the new behaviour rather than the page being repaired. It now asserts that /tasks/ forwards away from TasksPage. If the cause was a duplicate page.jsonl declaration (the old TasksPage line sat after the SavedFilter line), that is a fair fix. The diff does not record that cause, and requirement 1 asks for it to be recorded (diff.patch, public/tasks/page.jsonl).
3. [fix] The /tasks/ shot shows the AI Inbox titled "AI". It lists sessions (chips All, Voice, Servex, Scheduled, Live) and a "Today" date rail. The page.jsonl description says the Inbox opens with the "Tasks and Home chips on" (preset all-tasks). Neither chip is visible, and no task rows are shown (shots/monorepo-localhost-tasks/1920.png, main band). The forward lands on the right module, but the saved filter does not appear applied. Either the preset is not honoured or the shot caught it before it applied.
4. [note] The readme edit repeats itself: "(…the /live/ Tasks card counts from it):  `public/tasks/task.jsonl` holds one reference per home…" restates the index sentence, and there is a double space after the colon (Task/readme.md, TasksPage paragraph). Law 1 and law 2 prefer one clear sentence.
5. [note] The 400 shot shows "✦AI" and "☰Menu" rail buttons reported as wrapping at 3.2 lines (layout.json 400 wraps). The icon sits above the label, so this is probably a stacked layout and not a real wrap. It is not part of this diff.
6. [note] Requirement 6 (answer every review finding in the task log, `--status` passes) cannot be checked from the diff. The report covers shots and the patch only.

## Requirements
- 1 "Find the cause, fix it, and record what the cause was" — no — the diff shows a fix by removing the TasksPage line from page.jsonl and updating the test. No cause is recorded in the patch; the readme only describes the new state.
- 2 "Run the test until it passes" — not verifiable here — the test output is not in the task folder, only the rewritten test.
- 3 "Make the page show an error instead of Loading forever" — no — nothing in TasksPage.js or Task.js (finding 1).
- 4 "Commit in the worktree" — not verifiable from the patch.
- 5 "Run review.mjs and answer every finding" — in progress; these findings are the input.
- Widths given: 400 and 1920 (sheet.png). The 1200 and 3440 shots were not taken.

## Page structure
- Title says what the page is — no — shots/.../1920.png, top band: the title is "AI", not "Tasks", although the URL is /tasks/ (page.jsonl title is "Tasks"). The Inbox title wins after the forward.
- One clear primary thing — yes — the session list, 1920.png main band.

## Navigation
- Techniques: sidebar tree, a date rail, filter chips, a right drawer (AI), and at 400 a bottom rail and a hamburger.
- Active page is marked — no — the sidebar highlights "AI". /tasks/ has no entry of its own.
- Chips do not wrap at 1920 — yes — 1920.png, chip row. At 400 the chip row is clipped at the right edge ("Scheduled 11 · $4…") — 400.png, chip row (note).

## Layout
- Content is anchored and aligned — yes — 1920.png, a left-aligned column with the date rail beside it.
- Wasted space — note — empty 0.60 at 1920, with the content column narrow and the title floating. 400 empty 0.374.

## Sizing
- Nothing overflows horizontally — yes — layout.json 400 overflow_x false.
- Widest text fits — yes — widest_text 316 at 400 (viewport 400).

## Wrapping
- No unintended wraps — note — the two rail buttons report 3.2 lines (finding 5); everything else is single line.

## Spacing and padding
- Bands are padded evenly — yes — layout.json 400 bands: page-title 0.04 share, ad-dash 0.758 share, neither flagged big_empty.
- Left gutter is consistent — yes — layout.json left_stack h1 total 12 at 400.

## Colour and contrast
- Text is legible against its background — yes — 1920.png main band. The grey meta lines under each row are small but readable.
- Accent colour marks only the active state — yes — "Today", "All" and "Send" use the orange accent.

## Flow
- Reading order runs title, usage bars, date, chips, list — yes — 400.png and 1920.png.
- Old Inbox link at the end — yes — 1920.png, bottom of the column.

## Words
- Page and readme wording is plain — no — the repeated clause in the readme (finding 4).
- The test's own comment is clear — yes — it says what /tasks/ is now and where it forwards.
