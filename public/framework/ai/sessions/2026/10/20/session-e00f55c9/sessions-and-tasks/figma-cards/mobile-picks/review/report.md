verdict: fix
1. [fix] Every review shot is Chrome's "This site can't be reached" page: the worktree server on 127.0.0.1:65118 was down when review.mjs shot it. All 8 pngs and both layout.json files are useless (`errors`: ERR_CONNECTION_REFUSED at all four widths). This review falls back on the builder's own shots in `ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/shots/` (day/nested/session/task/run-indicator at 400, day/nested/session at 1200). Re-shoot before you merge.
2. [fix] The task page (page 4) is titled with its folder slug. The panel bar and the breadcrumb read "sessions-and-tasks", and the real title appears only in the card head, cut to one line ("Sessions and tasks: the shape decided, the store o…"). `MobileTask` passes `title: segs.at(-1)`, and `this.retitle?.()` never fires (page 1, words 1). Evidence: task-400.png, bands 3–5.
3. [note] On a 400 px phone the site chrome above the content takes 215–270 px of 900 (24–30%): header, AI title, tabs, breadcrumb and the panel title bar. On the task page the breadcrumb wraps to 3 lines, and on the session page the title appears twice (bar and h1). The owner asked for a header that can scroll away; the brief says "the title scrolls away and a compact bar slides in", but a still shot cannot show that, so it is unverified. Evidence: session-400.png and task-400.png, top bands.
4. [note] Session rows say "running" twice: the amber dot, then the word "running" on the second line. The word could carry something new, such as the time or the progress. Evidence: session-400.png, Open work card.
5. [note] Not shown in any shot: an idle task's start button (a play triangle), the computed "next" mark, and the Open questions card on the task page. The code has them (`MobileRun.draw`, `MobileTask.questions`). The run buttons were never pressed (builder report, "Not verified").
6. [note] At 1200 the variant opens as Miller columns and the session column is narrow, so row titles wrap to 2–3 words a line ("Readmes / page: / Review"). There is also a large gap between the panel bar and the "VS Code tab" line. This is acceptable for a 400 px variant, but don't send anyone to it on a desktop. Evidence: session-1200.png, right column.

Widths given: 400, 1200, 1920, 3440 for /framework/ai/sessions/v/ and /v/mobile/. All failed to load, so the evidence below is the builder's 400 and 1200 shots.

## Requirements
- 1 "Day list … grouped by what needs you: Needs you, Running, Done (with the outcome line), then the rest folded; a day header with the count and the cost" — yes — day-400.png: "Thursday, October 22 · 49 sessions · $334", Needs you 1, Running 13; day-1200 (middle column): Done with outcome lines; `MobileHome.folded` folds "Everything else"
- 2 "A child session sits inside its parent, collapsed with a count ('+6 minions'); each row tagged VS Code tab, voice, mastermind, minion" — yes — nested-400.png: "Figma cards … +1 minion", rows tagged mastermind / VS Code tab / minion
- 3 "Session page, design B: open work first; tabs Overview, Tasks, Chat, swipeable; the existing session menu" — yes — session-400.png: Open work first, three tabs, ⋮ menu (`head_tools()`); swipe is `SwipeTabs` (scroll-snap), not provable from a still
- 3b "The title scrolls away and a compact bar slides in" — not measured — a still shot cannot show it; the bar and the h1 are both on screen at the top (finding 3)
- 4 "Task detail: content first, subtasks as flat rows (one indent), open questions; status and a segmented bar at the top" — yes — task-400.png: status "Running 23 of 26 done" and bar, Content, Subtasks 26; Open questions is below the fold (finding 5)
- 5 "Every row taps through: day list → session → task, and back" — yes — chevrons on every row, back arrow on the task card (task-400.png); breadcrumbs lead back
- 6 "Wrapper card, 8 px margin, radius 4, no padding of its own; header set off by a light grey line; never pad twice" — yes — day-400.png: rows run edge to edge inside the cards, a grey rule under each card head, white on light grey
- 7 "Status: green done, amber pulsing running, red stalled/blocked/question, grey open, dropped not counted" — yes — red dot under Needs you, amber dots under Running (paler in run-indicator-400.png, mid-pulse), green checks on subtasks (task-400.png); `MobileData.states` drops stopped tasks
- 8 "One segment per child up to 12, past that a stacked meter; ONE bar" — yes — `TaskView.draw_bar` is now static and shared; task-400.png shows the stacked meter, green plus an amber slice, "23/26"
- 9 "A small run indicator; pause and stop beside it while running; idle gets start; queued shows 'next'" — partly — the dot, pause and stop are shown (run-indicator-400.png); start and next are code only (finding 5)
- 10 "Each button writes one log line using the existing verbs; no second state machine" — yes (code) — `MobileRun.press` → `task.act(verb)`; `Task.can(state, verb)` is the same CAN map; not pressed live
- 11 "route() hands `v` to the variant, said in the report; link once from mobile-cards.md; readmes current" — yes — diff: `AISessionsPage.route`, sessions/readme.md "Variants", mobile-cards.md "Built:", core/Task/readme.md bar states
- 12 "A 400 px shot of each page; smoke passes; unmerged" — yes — five 400 shots in the task's shots/; builder report: smoke passes, branch unmerged
## Page structure
- page 1 (title says what it is) — no on page 4 — task-400.png: the bar reads "sessions-and-tasks" (finding 2); yes on pages 1–3
- page 2 (most important first) — yes — day-400.png: Needs you first; session-400.png: Open work first
- page 3 (one takeaway per screen) — yes — each page is one list
## Navigation
- nav 1 (identify) — site tabs (they scroll, no wrap), a breadcrumb, a Day | Nested switch, swipe tabs Overview/Tasks/Chat, a ⋮ menu, a bottom rail, day arrows
- tabs wrap — no — day-400.png: INBOX…SYSTEM on one row; tab_rows not measured (failed shots)
- breadcrumb — note — task-400.png: wraps to 3 lines (finding 3)
- back — yes — task card back arrow → session (task-400.png)
- persistent vs switching — yes — the Day/Nested switch marks the current one with an underline (nested-400.png)
## Layout
- one column at 400 — yes — every 400 shot
- right layout for the width — yes at 400; note at 1200 (finding 6)
## Sizing
- content uses the width — yes — cards are 384 of 400 px, 8 px margins (day-400.png)
- chrome share — note — 24–30% of the 400 screen is chrome (finding 3); not measured
## Wrapping
- titles wrap where they should — yes — "Session management and task system / architecture" wraps to 2 lines (day-400.png)
- unwanted truncation — no — the task card head cuts the task title to one line (task-400.png, finding 2)
- content clamp — yes — task-400.png: Content is clamped by height with "More"; the cut runs through a line of text, which is acceptable behind a More button
## Spacing and padding
- double padding — no double — card heads and rows pad themselves; the card has none (day-400.png)
- even rhythm — yes — rows ~62 px, card gap ~16 px (day-400.png)
- wasted space — note — session-1200.png: a gap of ~60 px between the bar and the eyebrow
## Colour and contrast
- status colours readable — yes — red/amber/green dots on white (day-400.png, task-400.png)
- secondary text contrast — yes — grey meta lines are legible at 400
- pause/stop glyphs — yes — dark grey on white (session-400.png)
## Flow
- reading order — yes — header → switch → groups by urgency (day-400.png)
- tap targets — note — the pause/stop buttons look ~20 px at 400 (session-400.png); core rows use 44 px
## Words
- words 1 (owner's names) — yes — "Needs you", "Running", "Done", "Nested", "+1 minion", kind tags as briefed
- words 2 (no jargon or slugs) — no — "sessions-and-tasks" as the page title (finding 2)
- words 3 (no repeats) — note — "running" repeats the dot (finding 4)
