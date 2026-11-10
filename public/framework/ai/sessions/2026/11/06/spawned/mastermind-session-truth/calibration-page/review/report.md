verdict: fix
1. [fix] calibration/readme.md is now out of date. Its last bullet still says "Suggestions for the owner: /live/calibration/", but the page now shows each prompt's input and output. The old log, moved aside to `calibration/live-page-2026-11-07.jsonl`, is listed nowhere (Law 10: index everything).
2. [fix] calibration/results.md line 3 still says "The suggested tasks are on /live/calibration/". Those cards are gone (ask 3), so this sentence now sends a reader to something that no longer exists.
3. [fix] A fresh agent could not continue from this task folder alone. `task.jsonl` holds only the `shots` line: no opening line, no log, no worktree name (`worktree/calibration-page`) and no outcome. Only `requirements.md` explains the task.
4. [fix] /live/readme.md does not mention /live/calibration/ at all. That folder now holds a page.js and a stylesheet rather than a live log, so it differs from the pattern the readme describes and needs a line in Files (Law 11: readmes are the index).
5. [note] Ask 1 wants "one line" at the top. It is a full paragraph: 4 lines at 1920 and 7 at 400 (shots/…/400.png, top band). Both links are there. A shorter sentence would do it.
6. [note] Ask 2 wants the matched tasks linked. Every task link goes to the same session record (`SESSION`), not to the task itself. The links work, but none of them points at its own task.
7. [note] At every width the console shows a 404 for a resource it does not name (layout.json `errors`). The page draws fine, but the missing file should be found.
8. [note] At 3440 the content stops at 90em on the left and leaves the right of the screen empty (empty 0.779). That is fine for reading text, but it wastes the wide screen.

Widths given: 400, 1200, 1920, 3440 (all four, a page layout).

## Requirements
- 1 "Top: one line, linking the session record and results.md" — partly. Both links are there (shots/…/1920.png, top band), but it is a 4-line paragraph, not one line.
- 2 "One section per prompt (4): 'Prompt #95 of 162' with what the number is; raw words (collapsed if long); Sonnet and Haiku side by side: tasks matched (linked), new asks, questions; then the verdict" — yes. The heading reads "Prompt #27 of 162: …" with the note "not a task number". The words are collapsed when longer than 6 sentences. The two models sit in columns at 1200 and up and stack at 400. The verdict comes last (1920.png). The task links all go to the session record (note 6).
- 3 "The five floating suggestion cards are gone; their content lives under its prompt. No emoji titles, small headings" — yes. page.jsonl is moved out of /live/calibration/ (diff). The h2 is 1.15em and there are no emoji (1920.png).
- 4 "Last line: only 4 of ~162 prompts were checked; the full review is the retro run" — yes. `calib-foot` in page.js draw(). It is below the fold in every shot, so this is checked from the code only.
- 5 "Phone first" — yes. At 400 there is one column, no sideways scroll (overflow_x false) and the text is readable (400.png).
- Class: does the page show a class's live instances? n/a. The diff adds no class: page.js is a Page instance.

## Page structure
- page 1 (the title says what it is) — yes. "Prompt calibration", plus the opening sentence (1920.png, top band).
- page 2 (the most important thing comes first) — yes. The summary line, then the prompts in order.
- page 3 (one takeaway) — yes. Sonnet won, and each prompt shows its input and output.

## Navigation
- navigation 1 (techniques) — none on the page itself. It has a disclosure (`details`) for long words, plus the site's drawer rail.
- disclosure — yes. "▶ Your words (10 sentences)" opens and closes, and its label gives the count (400.png).

## Layout
- the layout fits the content — yes. A standard page, layout "standard" at every width (layout.json).
- columns where they help — yes. Sonnet and Haiku side by side from 1200 up and stacked at 400 (sheet.png).

## Sizing
- content width is capped — yes. Text is capped at 45em: widest_text is 710 at 1920 and 799 at 3440.
- the space is used — partly. empty is 0.779 at 3440 (note 8). 0.285 at 400 is fine.

## Wrapping
- nothing wraps that shouldn't — yes. At 400 the h2 headings wrap to 2 lines, which is acceptable for long titles. The rail buttons' wraps come from the site's own chrome (layout.json wraps).
- no sideways scroll — yes. overflow_x false at every width.

## Spacing and padding
- left edges line up — yes. left_stack h1 and p match at every width (16/48/65/90).
- the gaps are even — mostly. Below "Verdict" and "None." the gap is larger than the .2em the CSS gives, because the p's own margin adds to the grid gap (1920.png, middle band). Minor.
- page padding grows with width — yes. 16 → 90px.

## Colour and contrast
- text contrast is sufficient — yes. The muted lines (`calib-note`, `calib-id`) are 70% opacity on a light grey background, still readable (1920.png).
- tokens, not raw colours — yes. Every colour is a currentColor mix (calibration.css).

## Flow
- it reads top to bottom: summary, prompts, footer — yes (code and shots).
- the verdict follows its evidence — yes (1920.png).

## Words
- plain sentences, the owner's own names — yes. "Its place among your turns in that chat, not a task number." answers the owner's confusion directly.
- no jargon — yes. "Tasks it matched", "New asks it found" and "Questions" say plainly what each list holds.
- the opening is brief — no. It is 4 sentences where one line was asked for (note 5).
