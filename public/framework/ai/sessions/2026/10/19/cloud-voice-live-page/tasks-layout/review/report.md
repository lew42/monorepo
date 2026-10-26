verdict: fix
1. [fix] The shot of /framework/ai/tasks/ at 400 shows the INBOX tab highlighted and an empty grey body (empty 0.776, items 14) — shots/127-0-0-1-50353-framework-ai-tasks/400.png. The new Tasks tab is visible, but the page it was shot on does not show the tasks view, so the "link to the tasks view" ask is not proven.
2. [note] requirements.md is missing from the task folder; the asks were taken from task.jsonl's title (compact header, no giant sticky toolbar, no scroll-in-scroll, link to the tasks view) and the diff's doc.
3. [note] At 400 the chip row is clipped at the right edge ("Today 0" then a cut chip) and scrolls sideways with the scrollbar hidden — nothing says it scrolls; the bottom half of the screen is empty (400.png, below the "views / lanes" band).
4. [note] The rest of the AI page is not tested in the shots: only the tasks URL was shot, and the 1200/1920/3440 shots are dominated by the live/dashboard view (ai2-full share 1.41–1.51 at 1200/1920, i.e. a page taller than the screen); the inbox toolbar and the "waiting on you" section the diff changes are not clearly visible there.
5. [note] Widths given: all four (400, 1200, 1920, 3440); the 1200–3440 wrap list names only buttons (mode-btn 1.7–1.8 lines, chatbox-compose-more 2.4 lines) that this diff did not touch.

## Requirements
- 1 "compact header" — yes — 400.png: header, tabs and toolbar take about 27% of the screen (bands inbox-head 0.073 + browse 0.148)
- 2 "no giant sticky toolbar" — yes — 400.png: toolbar is two short rows and scrolls away; not measured at the wide widths
- 3 "no scroll inside a scroll" — not shown — the "waiting on you" box is never visible in the shots (no inbox rows at 400); the CSS removes the 45vh box
- 4 "link to the tasks view" — yes — TASKS tab at 400.png, 1200.png, 1920.png, 3440.png sheet, backed by tasks/page.jsonl tab:true
## Page structure
- page 1 — yes — each shot has the AI title and a tab bar
- page 2 — no — 400.png: the Inbox tab is active on the tasks URL, and the body is empty
## Navigation
- techniques: tabs (one line at every width, tab_rows 1), a sidebar (1200+), a bottom rail (400)
- tabs wrap — no wrap — layout.json tab_rows 1 at 400, 1200, 1920, 3440
- bottom rail — yes — 400.png: three clear icons, though two (✦AI, ☰Menu) are 3.2 lines and have no label at 400
- tab shows the current page — no — 400.png: INBOX highlighted on /tasks/
## Layout
- ai2 layout — yes — layout.json "ai2" at 400
- two scrollbars — n/a
## Sizing
- widest text — yes — 160 px at 400, 466 at 1200, 563 at 3440: narrow readable columns
- empty space — no — empty 0.776 at 400 (the shot), 0.58 at 1920, 0.63 at 3440 — not measured against the previous layout
## Wrapping
- overflow_x — yes — false at all four widths
- chips on one line — yes — 400.png: the chips run in one line and scroll sideways (clipped at the right edge)
- wraps — no — drawer-rail-ai and drawer-rail-menu at 3.2 lines at 400; mode-btn 1.7 and drawer-menu 1.8 at 1200 (pre-existing controls)
## Spacing and padding
- toolbar padding — yes — 400.png: the padding is tight and even, with no dead band
- left_stack — yes — h1 over doc-well 14 px at 400
## Colour and contrast
- chips — yes — 400.png: orange filled and outlined chips read; the grey body is low-contrast but empty
## Flow
- reading order — yes — title, tabs, toolbar, list
- scroll model at 400 — not shown — the page is not tall enough to scroll in this shot, so the "one normal page scroll" claim is untested
## Words
- doc/dashboard-layout-asks.md — yes — plain, linked, owner's asks listed with dates
- the readme.md lines — yes — one line each, linked
