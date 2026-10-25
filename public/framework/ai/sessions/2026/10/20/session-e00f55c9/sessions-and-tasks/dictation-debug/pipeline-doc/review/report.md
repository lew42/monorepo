verdict: fix
1. [fix] Requirements 2/check: the Docs tab screenshot at 1200 was not taken. shots/ holds the Dictate Overview at 400 and 1920, not the drawer's Docs tab, so nothing shows pipeline.md first in the list (sheet.png; session.jsonl shots line).
2. [fix] Stale doc: `ux/Dictate/doc/docs-tab.md` line 3 still says the row holds "settings, architecture, Whisper, the Debug tab, the voice architecture". DictateDocs.DOCS is now pipeline, map, voice architecture, wake policy, debug tab, settings. architecture.md and whisper.md were dropped, and the task folder says nothing about why (requirement 2: "say what you dropped and why").
3. [fix] No dropped-docs record: nothing in session.jsonl, the readme or the diff says which docs were dropped or demoted and why. The readme still links `doc/architecture.md` ("the decisions that hold today") without noting it left the Docs tab.
4. [fix] Unindexed task folder: `pipeline-doc/` has no summary or report for mastermind-dictation-2 and no findings `log` lines. session.jsonl holds only assign, commit and shots. A fresh agent cannot tell what was checked or what is left, such as the "line numbers read 2026-10-25" claim or whether the pipeline's file:line pairs were verified. The card path in requirements.md (`2026/10/25/cards/chat-show-when-your-words-reach-the-assi`) does not resolve in this tree.
5. [fix] The new overview card links `md/doc/pipeline/`, but both shots log a 404 (layout.json `errors`). The log does not say which URL failed, and the shots were taken before pipeline.md was committed to the served tree, so the card's link is unverified.
6. [note] Overview card at 400 and 1920 reads well, but the new card sits first in a grid of six and pushes Decisions to the end. Fine, since the owner asked for it first.

## Requirements
- 1 "ONE short doc: pipeline diagram with file:line, two views side by side, class sketch ✅/⬜, colour states, item tool, how each item is logged" — no — pipeline.md has pipeline, two views, class sketch, colours and item tool, but there is NO "how each item is logged" section with one example line per Prompt, reply, Question and task, and no V1-vs-V2 note on how each reads them. The deliverable names it explicitly ("the owner asked to confirm"). At 111 lines the doc is short enough.
- 2 "Docs tab shows the real docs, pipeline.md first; say what you dropped and why" — no — DictateDocs.js puts pipeline.md first (diff), but there is no screenshot of the tab and no stated reason for dropping architecture.md or whisper.md.
- 3 "Readme links pipeline.md near the top, ⬜ goal line, matching line in Chat v2 readme, UX page links the doc" — yes — the diff shows the readme top link, both ⬜ lines and the page.js card.
- 4 "Check and land: one screenshot at 1200 of the Docs tab" — no — see finding 1; the widths given were 400 and 1920 of the Overview.
- Extra: a page showing the live instances of any new class — n/a (no class added; doc only)
## Page structure
- page 1 — yes — shots/…/1920.png: title "Dictate", one tab row, cards give the takeaway
- the new doc's own page was not shot — not measured
## Navigation
- techniques: tabs, sidebar, rail, bottom rail, sheet, drawer
- tab_rows 1 at 400 and 1920 — yes — layout.json
- the Overview tab bar scrolls at 400 (OVERVIEW, WORKSPACE, SEND MODES, PLAYGRO… clipped) — yes, intended scroll
## Layout
- yes — 1920: sidebar, content, drawer, cards in a 3-column grid; 400: single column
## Sizing
- yes — layout.json overflow_x false at both widths; widest_text 364 at 400
## Wrapping
- no — layout.json wraps at 400: `drawer-rail-ai` 3.2 lines and `drawer-rail-menu` 3.2 lines, `chatbox-compose-more` 2.4 (pre-existing chrome, not in the diff); note only
## Spacing and padding
- yes — layout.json left_stack h1 16 at 400; empty 0.32 at 400, 0.49 at 1920; shots/…/1920.png: the card grid breathes evenly
## Colour and contrast
- yes — shots/…/sheet.png: dark text on light cards, orange accent only on actions
## Flow
- yes — sheet.png: the new card is first in reading order, then Workspace and Mic
## Words
- yes — the card title and blurb say what the doc is ("mic to screen … with the file that does each step"); the pipeline.md sections use plain headings and short sentences between blocks
